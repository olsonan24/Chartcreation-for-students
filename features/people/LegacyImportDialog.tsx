import { useState } from "react";

import type { LegacyOffer } from "./usePeople";
import "./people-cloud.css";

export function LegacyImportDialog({
  offer,
  importing,
  onImport,
  onSkip,
}: {
  offer: LegacyOffer;
  importing: boolean;
  onImport: () => Promise<void>;
  onSkip: () => void;
}) {
  const [error, setError] = useState("");

  async function importPeople() {
    setError("");
    try {
      await onImport();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import failed. Your old records remain on this device.");
    }
  }

  return (
    <div className="modal-backdrop legacy-import-backdrop" role="presentation">
      <section className="sheet legacy-import-sheet" role="dialog" aria-modal="true" aria-labelledby="legacy-import-title">
        <div className="sheet-handle" />
        <div className="section-heading">
          <div>
            <p className="eyebrow">Old on-device records</p>
            <h2 id="legacy-import-title">Import saved people?</h2>
          </div>
        </div>
        {offer.parseError ? (
          <p>The old local data could not be read. Nothing has been changed or uploaded.</p>
        ) : (
          <>
            <p>
              {offer.importableCount} {offer.importableCount === 1 ? "person is" : "people are"} ready to import into this signed-in account.
              Importing securely saves those source records in the cloud account.
            </p>
            {(offer.duplicateCount > 0 || offer.invalidCount > 0) && (
              <ul className="legacy-import-details">
                {offer.duplicateCount > 0 && <li>{offer.duplicateCount} duplicate {offer.duplicateCount === 1 ? "record" : "records"} will not be imported again.</li>}
                {offer.invalidCount > 0 && <li>{offer.invalidCount} invalid {offer.invalidCount === 1 ? "record" : "records"} cannot be imported and will remain on this device.</li>}
              </ul>
            )}
          </>
        )}
        <p className="legacy-import-assurance">The original <code>pass7-mobile-clients-v1</code> data stays untouched, including after a failed or partial import.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="legacy-import-actions">
          <button className="secondary-button" type="button" disabled={importing} onClick={onSkip}>Skip</button>
          {!offer.parseError && offer.importableCount > 0 && (
            <button className="primary-button" type="button" disabled={importing} onClick={() => void importPeople()}>
              {importing ? "Importing…" : `Import ${offer.importableCount}`}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
