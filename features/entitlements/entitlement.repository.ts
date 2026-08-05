import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../lib/supabase/database.types";
import { requireSupabaseClient } from "../../lib/supabase/client";
import {
  mapAppRoleRow,
  buildActiveCapabilitySet,
  isEntitlementActive,
  mapEntitlementHistoryRow,
  mapEntitlementRow,
} from "./entitlement.mapper";
import type {
  ActiveEntitlements,
  AppRole,
  Entitlement,
  EntitlementCapability,
  EntitlementGrantInput,
  EntitlementHistoryEntry,
  EntitlementRenewInput,
  EntitlementRevokeInput,
  OwnerRole,
} from "./entitlement.types";

export type EntitlementOperation =
  | "grant"
  | "revoke"
  | "suspend"
  | "renew"
  | "list"
  | "history"
  | "lookup";

export class EntitlementRepositoryError extends Error {
  readonly operation: EntitlementOperation;
  readonly causeCode?: string;

  constructor(operation: EntitlementOperation, message: string, causeCode?: string) {
    super(message);
    this.name = "EntitlementRepositoryError";
    this.operation = operation;
    this.causeCode = causeCode;
  }
}

async function requireUserId(
  client: SupabaseClient<Database>,
  expectedUserId?: string,
): Promise<string> {
  // AuthProvider obtained this ID from the Supabase session. The following
  // PostgREST request still has to pass the current JWT and RLS, so repeating
  // getUser() here adds a network race without weakening data access.
  if (expectedUserId) return expectedUserId;

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new EntitlementRepositoryError(
      "lookup",
      "Your session could not be verified. Sign in again and retry.",
      error?.code,
    );
  }
  return data.user.id;
}

function databaseFailure(
  operation: EntitlementOperation,
  fallbackMessage: string,
  error: { code?: string } | null,
): EntitlementRepositoryError {
  return new EntitlementRepositoryError(operation, fallbackMessage, error?.code);
}

/**
 * Get the active entitlement set for the current user.
 * Regular users see only their own active entitlements via RLS.
 * Owners/admins see all active entitlements, but this function filters
 * to the current user's active entitlements.
 */
export async function getActiveEntitlements(
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<ActiveEntitlements> {
  const currentUserId = await requireUserId(client, expectedUserId);

  const { data, error } = await client
    .from("entitlements")
    .select(
      "id,user_id,capability,status,granted_by,granted_at,expires_at,revoked_by,revoked_at,revoke_reason,is_permanent,reason",
    )
    .eq("user_id", currentUserId)
    .eq("status", "active");

  if (error) {
    throw databaseFailure("lookup", "Could not verify your access. Retry when online.", error);
  }

  const entitlements: Entitlement[] = (data ?? []).map(mapEntitlementRow);
  const activeEntitlements = entitlements.filter(isEntitlementActive);
  const capabilities = buildActiveCapabilitySet(activeEntitlements);

  return {
    hasCapability: (cap: EntitlementCapability) => capabilities.has(cap),
    capabilities,
  };
}

/**
 * Check if the current user is an owner or admin.
 */
export async function checkOwnerOrAdmin(
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<boolean> {
  const currentUserId = await requireUserId(client, expectedUserId);

  const { data, error } = await client
    .from("app_roles")
    .select("user_id,role,granted_by,granted_at,reason")
    .eq("user_id", currentUserId);

  if (error) return false;
  const roles = (data ?? []).map(mapAppRoleRow);
  return roles.some((r) => r.role === "owner" || r.role === "admin");
}

/**
 * List all entitlements (owner/admin only).
 */
export async function listAllEntitlements(
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<Entitlement[]> {
  const currentUserId = await requireUserId(client, expectedUserId);
  const isAdmin = await checkOwnerOrAdmin(client, currentUserId);
  if (!isAdmin) {
    throw new EntitlementRepositoryError("list", "You are not authorized to view all entitlements.");
  }

  const { data, error } = await client
    .from("entitlements")
    .select(
      "id,user_id,capability,status,granted_by,granted_at,expires_at,revoked_by,revoked_at,revoke_reason,is_permanent,reason",
    )
    .order("granted_at", { ascending: false });

  if (error) {
    throw databaseFailure("list", "Entitlements could not be loaded.", error);
  }
  return (data ?? []).map(mapEntitlementRow);
}

/**
 * List a specific user's entitlements (owner/admin only).
 */
export async function listUserEntitlements(
  userId: string,
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<Entitlement[]> {
  const currentUserId = await requireUserId(client, expectedUserId);
  const isAdmin = await checkOwnerOrAdmin(client, currentUserId);
  if (!isAdmin) {
    throw new EntitlementRepositoryError("list", "You are not authorized to view this user's entitlements.");
  }

  const { data, error } = await client
    .from("entitlements")
    .select(
      "id,user_id,capability,status,granted_by,granted_at,expires_at,revoked_by,revoked_at,revoke_reason,is_permanent,reason",
    )
    .eq("user_id", userId)
    .order("granted_at", { ascending: false });

  if (error) {
    throw databaseFailure("list", "User entitlements could not be loaded.", error);
  }
  return (data ?? []).map(mapEntitlementRow);
}

/**
 * Grant a new capability to a user (owner/admin only).
 */
export async function grantEntitlement(
  input: EntitlementGrantInput,
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<Entitlement> {
  const currentUserId = await requireUserId(client, expectedUserId);
  const isAdmin = await checkOwnerOrAdmin(client, currentUserId);
  if (!isAdmin) {
    throw new EntitlementRepositoryError("grant", "You are not authorized to grant entitlements.");
  }

  const { data, error } = await client
    .from("entitlements")
    .insert({
      user_id: input.userId,
      capability: input.capability,
      status: "active",
      granted_by: currentUserId,
      reason: input.reason,
      expires_at: input.expiresAt,
      is_permanent: input.isPermanent,
    })
    .select(
      "id,user_id,capability,status,granted_by,granted_at,expires_at,revoked_by,revoked_at,revoke_reason,is_permanent,reason",
    )
    .single();

  if (error || !data) {
    throw databaseFailure("grant", "The entitlement could not be granted.", error);
  }
  return mapEntitlementRow(data);
}

/**
 * Revoke or suspend an entitlement (owner/admin only).
 */
export async function revokeOrSuspendEntitlement(
  input: EntitlementRevokeInput,
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<Entitlement> {
  const currentUserId = await requireUserId(client, expectedUserId);
  const isAdmin = await checkOwnerOrAdmin(client, currentUserId);
  if (!isAdmin) {
    throw new EntitlementRepositoryError("revoke", "You are not authorized to revoke entitlements.");
  }

  const newStatus = input.scope === "suspend" ? "suspended" : "revoked";
  const { data, error } = await client
    .from("entitlements")
    .update({
      status: newStatus,
      revoked_by: currentUserId,
      revoked_at: new Date().toISOString(),
      revoke_reason: input.reason,
    })
    .eq("id", input.entitlementId)
    .select(
      "id,user_id,capability,status,granted_by,granted_at,expires_at,revoked_by,revoked_at,revoke_reason,is_permanent,reason",
    )
    .single();

  if (error || !data) {
    throw databaseFailure(input.scope === "suspend" ? "suspend" : "revoke", "The entitlement could not be updated.", error);
  }
  return mapEntitlementRow(data);
}

/**
 * Renew or modify an entitlement's expiration (owner/admin only).
 */
export async function renewEntitlement(
  input: EntitlementRenewInput,
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<Entitlement> {
  const currentUserId = await requireUserId(client, expectedUserId);
  const isAdmin = await checkOwnerOrAdmin(client, currentUserId);
  if (!isAdmin) {
    throw new EntitlementRepositoryError("renew", "You are not authorized to renew entitlements.");
  }

  const { data, error } = await client
    .from("entitlements")
    .update({
      status: "active",
      expires_at: input.expiresAt,
      is_permanent: input.isPermanent,
      revoked_by: null,
      revoked_at: null,
      revoke_reason: "",
      reason: input.reason,
    })
    .eq("id", input.entitlementId)
    .select(
      "id,user_id,capability,status,granted_by,granted_at,expires_at,revoked_by,revoked_at,revoke_reason,is_permanent,reason",
    )
    .single();

  if (error || !data) {
    throw databaseFailure("renew", "The entitlement could not be renewed.", error);
  }
  return mapEntitlementRow(data);
}

/**
 * List entitlement history for a specific entitlement (owner/admin only).
 */
export async function listEntitlementHistory(
  entitlementId: string,
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<EntitlementHistoryEntry[]> {
  const currentUserId = await requireUserId(client, expectedUserId);
  const isAdmin = await checkOwnerOrAdmin(client, currentUserId);
  if (!isAdmin) {
    throw new EntitlementRepositoryError("history", "You are not authorized to view entitlement history.");
  }

  const { data, error } = await client
    .from("entitlement_history")
    .select(
      "id,entitlement_id,user_id,capability,action,performed_by,performed_at,reason,old_status,new_status,expires_at,is_permanent,metadata",
    )
    .eq("entitlement_id", entitlementId)
    .order("performed_at", { ascending: false });

  if (error) {
    throw databaseFailure("history", "Entitlement history could not be loaded.", error);
  }
  return (data ?? []).map(mapEntitlementHistoryRow);
}

/**
 * Search for users by email or ID (owner/admin only).
 * Uses the people table since we don't expose auth.users directly.
 */
export async function searchUsers(
  searchTerm: string,
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<{ userId: string; fullName: string; count: number }[]> {
  const currentUserId = await requireUserId(client, expectedUserId);
  const isAdmin = await checkOwnerOrAdmin(client, currentUserId);
  if (!isAdmin) {
    throw new EntitlementRepositoryError("list", "You are not authorized to search users.");
  }

  const { data, error } = await client
    .from("people")
    .select("user_id,full_name")
    .or(`full_name.ilike.%${searchTerm}%`)
    .order("full_name", { ascending: true });

  if (error) {
    throw databaseFailure("list", "User search could not be completed.", error);
  }

  const uniqueUsers = new Map<string, { userId: string; fullName: string; count: number }>();
  for (const row of data ?? []) {
    const existing = uniqueUsers.get(row.user_id);
    if (existing) {
      existing.count += 1;
    } else {
      uniqueUsers.set(row.user_id, { userId: row.user_id, fullName: row.full_name, count: 1 });
    }
  }
  return [...uniqueUsers.values()];
}

/**
 * Set the owner/admin role for a user (owner only).
 * This is the secure bootstrap mechanism.
 */
export async function setUserRole(
  targetUserId: string,
  role: OwnerRole,
  reason: string,
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): Promise<AppRole> {
  const currentUserId = await requireUserId(client, expectedUserId);
  const isAdmin = await checkOwnerOrAdmin(client, currentUserId);
  if (!isAdmin) {
    throw new EntitlementRepositoryError("grant", "You are not authorized to manage roles.");
  }

  const { data, error } = await client
    .from("app_roles")
    .upsert({
      user_id: targetUserId,
      role,
      granted_by: currentUserId,
      reason,
    })
    .select("user_id,role,granted_by,granted_at,reason")
    .single();

  if (error || !data) {
    throw databaseFailure("grant", "The role could not be set.", error);
  }
  return mapAppRoleRow(data);
}
