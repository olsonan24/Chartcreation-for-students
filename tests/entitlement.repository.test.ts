import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  checkOwnerOrAdmin,
  getActiveEntitlements,
  grantEntitlement,
  EntitlementRepositoryError,
  renewEntitlement,
  revokeOrSuspendEntitlement,
} from "../features/entitlements/entitlement.repository";
import type {
  AppRole,
  Entitlement,
  EntitlementHistoryEntry,
} from "../features/entitlements/entitlement.types";
import type { Database } from "../lib/supabase/database.types";

const userId = "84662d76-271b-40c8-9ce7-29fb621efe56";
const otherUserId = "3ac3a738-06ab-4b5a-bfda-2b4b1c099d56";

function authClient(from: ReturnType<typeof vi.fn>) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }),
    },
    from,
  } as unknown as SupabaseClient<Database>;
}

describe("entitlement repository", () => {
  it("getActiveEntitlements returns capability set from active entitlements", async () => {
    const activeRow = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      user_id: userId,
      capability: "chart_access",
      status: "active",
      granted_by: otherUserId,
      granted_at: "2026-08-05T00:00:00Z",
      expires_at: null,
      revoked_by: null,
      revoked_at: null,
      revoke_reason: "",
      is_permanent: true,
      reason: "Initial grant",
    };
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
    };
    chain.eq.mockReturnValueOnce({
      ...chain,
      eq: vi.fn().mockResolvedValue({ data: [activeRow], error: null }),
    });
    const client = authClient(vi.fn(() => chain));

    const result = await getActiveEntitlements(client, userId);

    expect(result.hasCapability("chart_access")).toBe(true);
    expect(result.hasCapability("timeline_access")).toBe(false);
    expect(client.auth.getUser).not.toHaveBeenCalled();
  });

  it("uses the AuthProvider user ID without a duplicate session verification request", async () => {
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
    };
    chain.eq.mockReturnValueOnce({
      ...chain,
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { code: "session_not_found" },
        }),
      },
      from: vi.fn(() => chain),
    } as unknown as SupabaseClient<Database>;

    const result = await getActiveEntitlements(client, userId);

    expect(result.capabilities.size).toBe(0);
    expect(client.auth.getUser).not.toHaveBeenCalled();
  });

  it("checkOwnerOrAdmin returns true when user has admin role", async () => {
    const roleRow = {
      user_id: userId,
      role: "admin",
      granted_by: otherUserId,
      granted_at: "2026-08-05T00:00:00Z",
      reason: "Owner granted admin",
    };
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn().mockResolvedValue({ data: [roleRow], error: null }),
    };
    const client = authClient(vi.fn(() => chain));

    const result = await checkOwnerOrAdmin(client, userId);

    expect(result).toBe(true);
  });

  it("checkOwnerOrAdmin returns false when user has no roles", async () => {
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    const client = authClient(vi.fn(() => chain));

    const result = await checkOwnerOrAdmin(client, userId);

    expect(result).toBe(false);
  });

  it("grantEntitlement throws when user is not admin", async () => {
    const rolesChain = {
      select: vi.fn(() => rolesChain),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    const client = authClient(vi.fn(() => rolesChain));

    await expect(
      grantEntitlement(
        {
          userId: otherUserId,
          capability: "chart_access",
          isPermanent: false,
          expiresAt: "2027-01-01T00:00:00Z",
          reason: "Test grant",
        },
        client,
        userId,
      ),
    ).rejects.toMatchObject({
      name: "EntitlementRepositoryError",
      operation: "grant",
    });
  });

  it("grantEntitlement inserts when user is admin", async () => {
    const insertedValue: Record<string, unknown> = {};
    const roleRow = {
      user_id: userId,
      role: "owner",
      granted_by: null,
      granted_at: "2026-08-05T00:00:00Z",
      reason: "Bootstrap",
    };
    const createdRow = {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      user_id: otherUserId,
      capability: "chart_access",
      status: "active",
      granted_by: userId,
      granted_at: "2026-08-05T00:00:00Z",
      expires_at: "2027-01-01T00:00:00Z",
      revoked_by: null,
      revoked_at: null,
      revoke_reason: "",
      is_permanent: false,
      reason: "Test grant",
    };
    const insertChain = {
      insert: vi.fn((value: unknown) => {
        Object.assign(insertedValue, value as Record<string, unknown>);
        return insertChain;
      }),
      select: vi.fn(() => insertChain),
      single: vi.fn().mockResolvedValue({ data: createdRow, error: null }),
    };
    const rolesChain = {
      select: vi.fn(() => rolesChain),
      eq: vi.fn().mockResolvedValue({ data: [roleRow], error: null }),
    };
    const from = vi.fn((table: string) => (table === "app_roles" ? rolesChain : insertChain));
    const client = authClient(from);

    const result = await grantEntitlement(
      {
        userId: otherUserId,
        capability: "chart_access",
        isPermanent: false,
        expiresAt: "2027-01-01T00:00:00Z",
        reason: "Test grant",
      },
      client,
      userId,
    );

    expect(insertedValue).toMatchObject({
      user_id: otherUserId,
      capability: "chart_access",
      reason: "Test grant",
    });
    expect(result.capability).toBe("chart_access");
  });

  it("revokeOrSuspendEntitlement suspends an entitlement", async () => {
    const roleRow = {
      user_id: userId,
      role: "owner",
      granted_by: null,
      granted_at: "2026-08-05T00:00:00Z",
      reason: "Bootstrap",
    };
    const updatedRow = {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      user_id: otherUserId,
      capability: "timeline_access",
      status: "suspended",
      granted_by: userId,
      granted_at: "2026-08-05T00:00:00Z",
      expires_at: null,
      revoked_by: userId,
      revoked_at: "2026-08-05T12:00:00Z",
      revoke_reason: "Admin suspension",
      is_permanent: false,
      reason: "Test",
    };
    const updateChain = {
      update: vi.fn(() => updateChain),
      eq: vi.fn(() => updateChain),
      select: vi.fn(() => updateChain),
      single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
    };
    const rolesChain = {
      select: vi.fn(() => rolesChain),
      eq: vi.fn().mockResolvedValue({ data: [roleRow], error: null }),
    };
    const from = vi.fn((table: string) => (table === "app_roles" ? rolesChain : updateChain));
    const client = authClient(from);

    const result = await revokeOrSuspendEntitlement(
      { entitlementId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", scope: "suspend", reason: "Admin suspension" },
      client,
      userId,
    );

    expect(result.status).toBe("suspended");
  });

  it("renewEntitlement reactivates a suspended entitlement", async () => {
    const roleRow = {
      user_id: userId,
      role: "owner",
      granted_by: null,
      granted_at: "2026-08-05T00:00:00Z",
      reason: "Bootstrap",
    };
    const updatedRow = {
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      user_id: otherUserId,
      capability: "print_export",
      status: "active",
      granted_by: userId,
      granted_at: "2026-08-05T00:00:00Z",
      expires_at: null,
      revoked_by: null,
      revoked_at: null,
      revoke_reason: "",
      is_permanent: true,
      reason: "Admin reinstatement",
    };
    const updateChain = {
      update: vi.fn(() => updateChain),
      eq: vi.fn(() => updateChain),
      select: vi.fn(() => updateChain),
      single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
    };
    const rolesChain = {
      select: vi.fn(() => rolesChain),
      eq: vi.fn().mockResolvedValue({ data: [roleRow], error: null }),
    };
    const from = vi.fn((table: string) => (table === "app_roles" ? rolesChain : updateChain));
    const client = authClient(from);

    const result = await renewEntitlement(
      { entitlementId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", isPermanent: true, expiresAt: null, reason: "Admin reinstatement" },
      client,
      userId,
    );

    expect(result.status).toBe("active");
  });

  it("isEntitlementActive predicate correctly identifies active and expired entitlements", async () => {
    const { mapEntitlementRow, isEntitlementActive: isActive, buildActiveCapabilitySet } =
      await import("../features/entitlements/entitlement.mapper");
    const rows: Entitlement[] = [
      { id: "1", userId, capability: "chart_access", status: "active", grantedBy: otherUserId, grantedAt: "", expiresAt: null, revokedBy: null, revokedAt: null, revokeReason: "", isPermanent: true, reason: "" },
      { id: "2", userId, capability: "timeline_access", status: "active", grantedBy: otherUserId, grantedAt: "", expiresAt: "2024-01-01T00:00:00Z", revokedBy: null, revokedAt: null, revokeReason: "", isPermanent: false, reason: "" },
      { id: "3", userId, capability: "comparisons", status: "revoked", grantedBy: otherUserId, grantedAt: "", expiresAt: null, revokedBy: otherUserId, revokedAt: "", revokeReason: "revoked", isPermanent: true, reason: "" },
    ];
    expect(isActive(rows[0])).toBe(true);
    expect(isActive(rows[1])).toBe(false);
    expect(isActive(rows[2])).toBe(false);
    const activeSet = buildActiveCapabilitySet(rows);
    expect(activeSet.has("chart_access")).toBe(true);
    expect(activeSet.has("timeline_access")).toBe(false);
    expect(activeSet.has("comparisons")).toBe(false);
  });
});
