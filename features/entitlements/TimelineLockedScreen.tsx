import { useTimelineStatus } from "../entitlements/useEntitlements";
import type { EntitlementCapability } from "../entitlements/entitlement.types";
import { CAPABILITY_LABELS, CAPABILITY_DESCRIPTIONS } from "../entitlements/entitlement.types";

export function TimelineLockedScreen() {
  const { loading } = useTimelineStatus();

  if (loading) {
    return (
      <div className="timeline-locked" role="status">
        <div className="locked-icon" aria-hidden="true">&#128274;</div>
        <h2>Checking your access…</h2>
      </div>
    );
  }

  return (
    <div className="timeline-locked" role="region" aria-label="Timeline access status">
      <div className="locked-icon" aria-hidden="true">&#128274;</div>
      <h2>Your Timeline has not been activated for this account yet.</h2>
      <p className="locked-description">
        Aionis can still help you understand yourself through the self-understanding
        experience. Timeline charts, descriptions, and comparisons become available
        when an authorized account administrator activates them for you.
      </p>
      <p className="locked-hint">
        Your information is not shared with other users or used in another person's profile.
      </p>
      <a className="locked-explore-link" href="#self-understanding">
        Explore self-understanding
      </a>
    </div>
  );
}

export function CapabilityLockedNotice({
  capability,
}: {
  capability: EntitlementCapability;
}) {
  return (
    <div className="capability-locked-notice" role="region" aria-label={`${CAPABILITY_LABELS[capability]} is not available`}>
      <div className="capability-locked-icon" aria-hidden="true">&#128274;</div>
      <h3>{CAPABILITY_LABELS[capability]} is not available for this account.</h3>
      <p>{CAPABILITY_DESCRIPTIONS[capability]}</p>
      <p className="capability-locked-hint">
        This feature is activated by an authorized account administrator.
      </p>
    </div>
  );
}
