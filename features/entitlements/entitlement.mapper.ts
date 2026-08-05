import type { Tables } from "../../lib/supabase/database.types";
import type {
  AppRole,
  Entitlement,
  EntitlementCapability,
  EntitlementHistoryEntry,
  EntitlementStatus,
  OwnerRole,
} from "./entitlement.types";

export type EntitlementRow = Tables<"entitlements">;
export type EntitlementHistoryRow = Tables<"entitlement_history">;
export type AppRoleRow = Tables<"app_roles">;

export function mapEntitlementRow(row: EntitlementRow): Entitlement {
  return {
    id: row.id,
    userId: row.user_id,
    capability: row.capability as EntitlementCapability,
    status: row.status as EntitlementStatus,
    grantedBy: row.granted_by,
    grantedAt: row.granted_at,
    expiresAt: row.expires_at,
    revokedBy: row.revoked_by,
    revokedAt: row.revoked_at,
    revokeReason: row.revoke_reason,
    isPermanent: row.is_permanent,
    reason: row.reason,
  };
}

export function mapEntitlementHistoryRow(
  row: EntitlementHistoryRow,
): EntitlementHistoryEntry {
  return {
    id: row.id,
    entitlementId: row.entitlement_id,
    userId: row.user_id,
    capability: row.capability as EntitlementCapability,
    action: row.action,
    performedBy: row.performed_by,
    performedAt: row.performed_at,
    reason: row.reason,
    oldStatus: row.old_status as EntitlementStatus | null,
    newStatus: row.new_status as EntitlementStatus | null,
    expiresAt: row.expires_at,
    isPermanent: row.is_permanent,
  };
}

export function mapAppRoleRow(row: AppRoleRow): AppRole {
  return {
    userId: row.user_id,
    role: row.role as OwnerRole,
    grantedBy: row.granted_by,
    grantedAt: row.granted_at,
    reason: row.reason,
  };
}

export function isEntitlementActive(entitlement: Entitlement): boolean {
  if (entitlement.status !== "active") return false;
  if (entitlement.isPermanent) return true;
  if (!entitlement.expiresAt) return false;
  return new Date(entitlement.expiresAt).getTime() > Date.now();
}

export function buildActiveCapabilitySet(
  entitlements: Entitlement[],
): Set<EntitlementCapability> {
  const activeSet = new Set<EntitlementCapability>();
  for (const entitlement of entitlements) {
    if (isEntitlementActive(entitlement)) {
      activeSet.add(entitlement.capability);
    }
  }
  return activeSet;
}
