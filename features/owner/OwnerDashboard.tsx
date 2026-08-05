import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  grantEntitlement,
  listAllEntitlements,
  listEntitlementHistory,
  renewEntitlement,
  revokeOrSuspendEntitlement,
  searchUsers,
  setUserRole,
} from "../entitlements/entitlement.repository";
import {
  ALL_CAPABILITIES,
  CAPABILITY_DESCRIPTIONS,
  CAPABILITY_LABELS,
} from "../entitlements/entitlement.types";
import type {
  Entitlement,
  EntitlementCapability,
  EntitlementHistoryEntry,
} from "../entitlements/entitlement.types";

import "./owner.css";

type UserSearchResult = {
  userId: string;
  fullName: string;
  count: number;
};

type OwnerView = "overview" | "users" | "entitlements" | "history" | "roles";

export function OwnerDashboard() {
  const [view, setView] = useState<OwnerView>("overview");
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [history, setHistory] = useState<EntitlementHistoryEntry[]>([]);
  const [historyEntitlementId, setHistoryEntitlementId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [roleTargetId, setRoleTargetId] = useState("");
  const [roleReason, setRoleReason] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const all = await listAllEntitlements();
      setEntitlements(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load entitlements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const runSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const results = await searchUsers(term);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (entitlementId: string) => {
    setHistoryEntitlementId(entitlementId);
    setLoading(true);
    setError("");
    try {
      const entries = await listEntitlementHistory(entitlementId);
      setHistory(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "History could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleGrant(
    event: FormEvent,
    userId: string,
    capability: EntitlementCapability,
    isPermanent: boolean,
    expiresAt: string | null,
    reason: string,
  ) {
    event.preventDefault();
    setActionError("");
    try {
      await grantEntitlement({
        userId,
        capability,
        isPermanent,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        reason,
      });
      await loadAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Grant failed.");
    }
  }

  async function handleRevoke(
    entitlementId: string,
    scope: "revoke" | "suspend",
    reason: string,
  ) {
    setActionError("");
    try {
      await revokeOrSuspendEntitlement({ entitlementId, scope, reason });
      await loadAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `${scope} failed.`);
    }
  }

  async function handleRenew(
    entitlementId: string,
    isPermanent: boolean,
    expiresAt: string | null,
    reason: string,
  ) {
    setActionError("");
    try {
      await renewEntitlement({
        entitlementId,
        isPermanent,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        reason,
      });
      await loadAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Renew failed.");
    }
  }

  async function handleSetRole(event: FormEvent) {
    event.preventDefault();
    setActionError("");
    if (!roleTargetId.trim()) {
      setActionError("Enter a user ID.");
      return;
    }
    try {
      await setUserRole(roleTargetId.trim(), "admin", roleReason || "Owner granted admin access");
      setRoleTargetId("");
      setRoleReason("");
      setActionError("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Role assignment failed.");
    }
  }

  return (
    <section className="owner-dashboard" aria-label="Owner administration dashboard">
      <div className="owner-header">
        <div>
          <p className="eyebrow">Owner administration</p>
          <h2>Aionis Timeline Entitlements</h2>
        </div>
      </div>

      <nav className="owner-nav" aria-label="Owner dashboard sections">
        <button className={view === "overview" ? "active" : ""} type="button" onClick={() => setView("overview")}>Overview</button>
        <button className={view === "users" ? "active" : ""} type="button" onClick={() => setView("users")}>Users</button>
        <button className={view === "entitlements" ? "active" : ""} type="button" onClick={() => setView("entitlements")}>Entitlements</button>
        <button className={view === "history" ? "active" : ""} type="button" onClick={() => setView("history")}>History</button>
        <button className={view === "roles" ? "active" : ""} type="button" onClick={() => setView("roles")}>Roles</button>
      </nav>

      {error && <p className="owner-error" role="alert">{error}</p>}
      {actionError && <p className="owner-error" role="alert">{actionError}</p>}

      {loading && <p className="owner-loading" role="status">Loading…</p>}

      {view === "overview" && (
        <div className="owner-overview">
          <div className="owner-stat">
            <span className="owner-stat-value">{entitlements.filter((e) => e.status === "active").length}</span>
            <span className="owner-stat-label">Active entitlements</span>
          </div>
          <div className="owner-stat">
            <span className="owner-stat-value">{entitlements.filter((e) => e.status === "revoked").length}</span>
            <span className="owner-stat-label">Revoked</span>
          </div>
          <div className="owner-stat">
            <span className="owner-stat-value">{entitlements.filter((e) => e.status === "suspended").length}</span>
            <span className="owner-stat-label">Suspended</span>
          </div>
          <div className="owner-stat">
            <span className="owner-stat-value">{entitlements.filter((e) => isEntitlementActive(e)).length}</span>
            <span className="owner-stat-label">Currently effective</span>
          </div>
        </div>
      )}

      {view === "users" && (
        <div className="owner-users">
          <div className="owner-search">
            <label>
              Search users by name
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void runSearch(searchTerm); }}
                placeholder="Enter a name to search"
              />
            </label>
            <button className="primary-button" type="button" onClick={() => void runSearch(searchTerm)}>Search</button>
          </div>

          {selectedUser && (
            <div className="grant-panel" aria-label="Grant entitlements to selected user">
              <h3>Grant capability to {searchResults.find((r) => r.userId === selectedUser)?.fullName ?? selectedUser}</h3>
              {ALL_CAPABILITIES.map((capability) => (
                <GrantForm
                  key={capability}
                  capability={capability}
                  existing={entitlements.find((e) => e.userId === selectedUser && e.capability === capability)}
                  onGrant={(e, cap, permanent, expires, reason) => void handleGrant(e, selectedUser, cap, permanent, expires, reason)}
                />
              ))}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="search-results">
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Full name</th>
                    <th>People count</th>
                    <th>User ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result) => (
                    <tr key={result.userId}>
                      <td>{result.fullName}</td>
                      <td>{result.count}</td>
                      <td className="user-id-cell">{result.userId}</td>
                      <td>
                        <button
                          type="button"
                          className={selectedUser === result.userId ? "active" : ""}
                          onClick={() => setSelectedUser(result.userId)}
                        >
                          {selectedUser === result.userId ? "Selected" : "Manage"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === "entitlements" && (
        <div className="owner-entitlements">
          <table className="owner-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Permanent</th>
                <th>Granted at</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entitlements.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="empty-cell">No entitlements have been granted yet.</td>
                </tr>
              )}
              {entitlements.map((entitlement) => (
                <tr key={entitlement.id}>
                  <td>
                    <strong>{CAPABILITY_LABELS[entitlement.capability]}</strong>
                    <br />
                    <span className="user-id-cell">{entitlement.userId}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${entitlement.status}`}>{entitlement.status}</span>
                  </td>
                  <td>
                    {entitlement.expiresAt
                      ? new Date(entitlement.expiresAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{entitlement.isPermanent ? "Yes" : "No"}</td>
                  <td>{new Date(entitlement.grantedAt).toLocaleDateString()}</td>
                  <td className="reason-cell">{entitlement.reason || "—"}</td>
                  <td className="action-buttons">
                    {entitlement.status === "active" && (
                      <>
                        <button type="button" onClick={() => void handleRevoke(entitlement.id, "suspend", "Admin suspension")}>Suspend</button>
                        <button type="button" onClick={() => void handleRevoke(entitlement.id, "revoke", "Admin revocation")}>Revoke</button>
                      </>
                    )}
                    {entitlement.status !== "active" && (
                      <button type="button" onClick={() => void handleRenew(entitlement.id, true, null, "Admin reinstatement")}>Reinstate</button>
                    )}
                    <button type="button" onClick={() => void loadHistory(entitlement.id)}>History</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "history" && (
        <div className="owner-history">
          {historyEntitlementId && (
            <p className="history-context">Showing history for entitlement {historyEntitlementId}</p>
          )}
          {history.length === 0 ? (
            <p className="empty-cell">Select an entitlement and click "History" to view its audit trail.</p>
          ) : (
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Capability</th>
                  <th>Old status</th>
                  <th>New status</th>
                  <th>Expires</th>
                  <th>Permanent</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.performedAt).toLocaleString()}</td>
                    <td>{entry.action}</td>
                    <td>{CAPABILITY_LABELS[entry.capability]}</td>
                    <td>{entry.oldStatus ?? "—"}</td>
                    <td>{entry.newStatus ?? "—"}</td>
                    <td>{entry.expiresAt ? new Date(entry.expiresAt).toLocaleDateString() : "—"}</td>
                    <td>{entry.isPermanent === null ? "—" : entry.isPermanent ? "Yes" : "No"}</td>
                    <td className="reason-cell">{entry.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === "roles" && (
        <div className="owner-roles">
          <h3>Grant admin role to a user</h3>
          <form onSubmit={handleSetRole} className="role-form">
            <label>
              User ID
              <input
                type="text"
                value={roleTargetId}
                onChange={(e) => setRoleTargetId(e.target.value)}
                placeholder="Paste the user's UUID"
              />
            </label>
            <label>
              Reason
              <input
                type="text"
                value={roleReason}
                onChange={(e) => setRoleReason(e.target.value)}
                placeholder="Why this user needs admin access"
              />
            </label>
            <button className="primary-button" type="submit">Grant admin role</button>
          </form>
          <p className="role-hint">
            Use this carefully. Admin users can grant, revoke, and suspend entitlements for any account.
          </p>
        </div>
      )}
    </section>
  );
}

function GrantForm({
  capability,
  existing,
  onGrant,
}: {
  capability: EntitlementCapability;
  existing: Entitlement | undefined;
  onGrant: (e: FormEvent, capability: EntitlementCapability, permanent: boolean, expiresAt: string | null, reason: string) => void;
}) {
  const expiresRef = useRef<HTMLInputElement>(null);
  const permanentRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);

  if (existing && existing.status === "active") {
    return (
      <div className="grant-row existing">
        <div>
          <strong>{CAPABILITY_LABELS[capability]}</strong>
          <span className="status-badge status-active">Active</span>
          <span className="existing-hint">{CAPABILITY_DESCRIPTIONS[capability]}</span>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grant-row"
      onSubmit={(e) => {
        const permanent = permanentRef.current?.checked ?? false;
        const expires = expiresRef.current?.value ?? null;
        const reason = reasonRef.current?.value ?? "";
        onGrant(e, capability, permanent, permanent ? null : expires, reason);
      }}
    >
      <div className="grant-row-main">
        <strong>{CAPABILITY_LABELS[capability]}</strong>
        <span className="grant-hint">{CAPABILITY_DESCRIPTIONS[capability]}</span>
      </div>
      <div className="grant-row-controls">
        <label>
          <input ref={permanentRef} type="checkbox" />
          Permanent
        </label>
        <input ref={expiresRef} type="datetime-local" aria-label="Expiration date" />
        <input ref={reasonRef} type="text" placeholder="Reason" aria-label="Grant reason" />
        <button type="submit">Grant</button>
      </div>
    </form>
  );
}

function isEntitlementActive(e: Entitlement): boolean {
  if (e.status !== "active") return false;
  if (e.isPermanent) return true;
  if (!e.expiresAt) return false;
  return new Date(e.expiresAt).getTime() > Date.now();
}
