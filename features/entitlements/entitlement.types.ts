export type EntitlementCapability =
  | "chart_access"
  | "timeline_access"
  | "timeline_descriptions"
  | "comparisons"
  | "print_export"
  | "advanced_insights";

export type EntitlementStatus = "active" | "revoked" | "suspended" | "expired";

export type OwnerRole = "owner" | "admin";

export type EntitlementAction =
  | "grant"
  | "revoke"
  | "suspend"
  | "expire"
  | "reinstate"
  | "modify";

export type Entitlement = {
  id: string;
  userId: string;
  capability: EntitlementCapability;
  status: EntitlementStatus;
  grantedBy: string;
  grantedAt: string;
  expiresAt: string | null;
  revokedBy: string | null;
  revokedAt: string | null;
  revokeReason: string;
  isPermanent: boolean;
  reason: string;
};

export type EntitlementHistoryEntry = {
  id: number;
  entitlementId: string;
  userId: string;
  capability: EntitlementCapability;
  action: EntitlementAction | string;
  performedBy: string;
  performedAt: string;
  reason: string;
  oldStatus: EntitlementStatus | null;
  newStatus: EntitlementStatus | null;
  expiresAt: string | null;
  isPermanent: boolean | null;
};

export type AppRole = {
  userId: string;
  role: OwnerRole;
  grantedBy: string | null;
  grantedAt: string;
  reason: string;
};

export type EntitlementGrantInput = {
  userId: string;
  capability: EntitlementCapability;
  reason: string;
  expiresAt: string | null;
  isPermanent: boolean;
};

export type EntitlementRevokeInput = {
  entitlementId: string;
  reason: string;
  scope: "revoke" | "suspend";
};

export type EntitlementRenewInput = {
  entitlementId: string;
  expiresAt: string | null;
  isPermanent: boolean;
  reason: string;
};

export type ActiveEntitlements = {
  hasCapability(capability: EntitlementCapability): boolean;
  capabilities: Set<EntitlementCapability>;
};

export const ALL_CAPABILITIES: readonly EntitlementCapability[] = [
  "chart_access",
  "timeline_access",
  "timeline_descriptions",
  "comparisons",
  "print_export",
  "advanced_insights",
] as const;

export const TIMELINE_CAPABILITIES: readonly EntitlementCapability[] = [
  "chart_access",
  "timeline_access",
  "timeline_descriptions",
  "comparisons",
  "print_export",
  "advanced_insights",
] as const;

export const CAPABILITY_LABELS: Record<EntitlementCapability, string> = {
  chart_access: "Chart access",
  timeline_access: "Timeline access",
  timeline_descriptions: "Timeline descriptions",
  comparisons: "Comparisons",
  print_export: "Print / export",
  advanced_insights: "Advanced insights",
};

export const CAPABILITY_DESCRIPTIONS: Record<EntitlementCapability, string> = {
  chart_access:
    "View Aionis timeline charts with calculated numbers and compound-number trails.",
  timeline_access:
    "Access the full Timeline system including yearly and monthly cycle calculations.",
  timeline_descriptions:
    "Read written descriptions and interpretations of timeline periods.",
  comparisons:
    "Compare two or more people side by side across timeline cycles.",
  print_export:
    "Generate printable A4 reports and export timeline data for personal use.",
  advanced_insights:
    "Access advanced interpretive content beyond standard timeline descriptions.",
};
