import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../auth/useAuth";
import { checkOwnerOrAdmin, getActiveEntitlements } from "./entitlement.repository";
import type {
  ActiveEntitlements,
  EntitlementCapability,
} from "./entitlement.types";

export type EntitlementState = {
  loading: boolean;
  error: string;
  capabilities: Set<EntitlementCapability>;
  hasCapability: (capability: EntitlementCapability) => boolean;
  isOwner: boolean;
  refresh: () => Promise<void>;
};

const EMPTY_CAPABILITIES = new Set<EntitlementCapability>();

export function useEntitlements() {
  const { user } = useAuth();
  const userIdRef = useRef<string | null>(user?.id ?? null);
  userIdRef.current = user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [capabilities, setCapabilities] = useState<Set<EntitlementCapability>>(EMPTY_CAPABILITIES);
  const [isOwner, setIsOwner] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setCapabilities(EMPTY_CAPABILITIES);
      setIsOwner(false);
      setLoading(false);
      setError("");
      return;
    }
    const requestUserId = user.id;
    setLoading(true);
    setError("");
    try {
      const [activeEntitlements, ownerStatus] = await Promise.all([
        getActiveEntitlements(undefined, requestUserId),
        checkOwnerOrAdmin(undefined, requestUserId),
      ]);
      if (userIdRef.current !== requestUserId) return;
      setCapabilities(activeEntitlements.capabilities);
      setIsOwner(ownerStatus);
    } catch (err) {
      if (userIdRef.current === requestUserId) {
        setError(err instanceof Error ? err.message : "Access status could not be verified.");
        setCapabilities(EMPTY_CAPABILITIES);
        setIsOwner(false);
      }
    } finally {
      if (userIdRef.current === requestUserId) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasCapability = useCallback(
    (capability: EntitlementCapability) => capabilities.has(capability),
    [capabilities],
  );

  return {
    loading,
    error,
    capabilities,
    hasCapability,
    isOwner,
    refresh: load,
  } as EntitlementState;
}

export type TimelineStatus = {
  loading: boolean;
  hasChartAccess: boolean;
  hasTimelineAccess: boolean;
  hasTimelineDescriptions: boolean;
  hasComparisons: boolean;
  hasPrintExport: boolean;
  hasAdvancedInsights: boolean;
  isLocked: boolean;
  isOwner: boolean;
  error: string;
  hasCapability: (capability: EntitlementCapability) => boolean;
  refresh: () => Promise<void>;
};

export function useTimelineStatus() {
  const { loading, error, capabilities, hasCapability, isOwner, refresh } = useEntitlements();

  const result: TimelineStatus = {
    loading,
    error,
    hasChartAccess: hasCapability("chart_access"),
    hasTimelineAccess: hasCapability("timeline_access"),
    hasTimelineDescriptions: hasCapability("timeline_descriptions"),
    hasComparisons: hasCapability("comparisons"),
    hasPrintExport: hasCapability("print_export"),
    hasAdvancedInsights: hasCapability("advanced_insights"),
    isLocked:
      !hasCapability("chart_access") ||
      !hasCapability("timeline_access"),
    isOwner,
    hasCapability,
    refresh,
  };

  return result;
}
