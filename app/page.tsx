"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import {
  type MonthsSet,
  Report,
  isValidDob,
  normalizeDob,
  normalizeName,
} from "../lib/numerology";

type Client = {
  id: string;
  fullName: string;
  calledName: string;
  dob: string;
};

type AppView = "people" | "chart" | "compare";
type CompareMode = "years" | "months";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "pass7-mobile-clients-v1";
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function spacedSequence(value: string): string {
  return value.split("").join(" ");
}

const EMPTY_MONTH: MonthsSet = {
  essence: "............",
  personalYear: "............",
  personalMonth: "............",
  personalMonthEssence: "............",
  combined: "............",
};

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function YearGrid({
  report,
  start,
  length,
  includeNames = true,
  label = "Year chart",
}: {
  report: Report;
  start: number;
  length: number;
  includeNames?: boolean;
  label?: string;
}) {
  const set = report.getYearSet(start, length);
  const ages = Array.from({ length }, (_, index) => start + index);
  const rows = [
    ...(includeNames
      ? set.names.map((value, index) => ({ label: report.names[index] || `Name ${index + 1}`, value, tone: "name" }))
      : []),
    { label: "Essence", value: set.essence, tone: "essence" },
    { label: "Combined", value: set.combined, tone: "combined" },
    { label: "Personal", value: set.personalYear, tone: "personal" },
    { label: "Calendar", value: set.calendarYear, tone: "calendar" },
  ];
  const gridStyle = {
    gridTemplateColumns: `82px repeat(${length}, 30px)`,
  } as CSSProperties;

  return (
    <div className="chart-scroll" role="region" aria-label={label} tabIndex={0}>
      <div className="number-grid" style={gridStyle}>
        <div className="grid-label grid-heading">Age</div>
        {ages.map((age) => (
          <div
            className={`number-cell age-cell ${age === report.age ? "current-cell" : ""}`}
            key={`age-${age}`}
            title={age === report.age ? "Current age" : undefined}
          >
            {age}
          </div>
        ))}
        {rows.map((row) => (
          <div className="grid-row-fragment" key={`${row.label}-${row.value}`}>
            <div className={`grid-label tone-${row.tone}`}>{row.label}</div>
            {Array.from(row.value).map((value, index) => (
              <div
                className={`number-cell tone-${row.tone} ${ages[index] === report.age ? "current-column" : ""}`}
                key={`${row.label}-${index}`}
              >
                {value === " " ? "·" : value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthCard({ title, set }: { title: string; set: MonthsSet }) {
  const rows = [
    { label: "Ess", value: set.essence, tone: "name" },
    { label: "PME", value: set.personalMonthEssence, tone: "essence" },
    { label: "Comb", value: set.combined, tone: "combined" },
    { label: "PM", value: set.personalMonth, tone: "personal" },
    { label: "Month", value: MONTHS.join(""), tone: "calendar" },
    { label: "PY", value: set.personalYear, tone: "name" },
  ];
  return (
    <article className="month-card">
      <h4>{title}</h4>
      <div className="month-grid">
        {rows.map((row) => (
          <div className="month-row" key={`${title}-${row.label}`}>
            <span className={`month-label tone-${row.tone}`}>{row.label}</span>
            {Array.from(row.value).map((value, index) => (
              <span className={`month-value tone-${row.tone}`} key={`${row.label}-${index}`}>
                {value}
              </span>
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}

function MonthBand({ report, focusAge }: { report: Report; focusAge: number }) {
  const birthYear = new Date().getFullYear() - report.age;
  return (
    <div className="month-band">
      {[focusAge - 1, focusAge, focusAge + 1].map((age) => (
        <MonthCard
          key={age}
          title={age < 0 ? "Before birth" : `${birthYear + age} · age ${age}`}
          set={age < 0 ? EMPTY_MONTH : report.getMonthSet(age)}
        />
      ))}
    </div>
  );
}

function PersonForm({
  person,
  onCancel,
  onSave,
}: {
  person: Client | null;
  onCancel: () => void;
  onSave: (client: Client) => void;
}) {
  const [fullName, setFullName] = useState(person?.fullName ?? "");
  const [calledName, setCalledName] = useState(person?.calledName ?? "");
  const [dob, setDob] = useState(person?.dob ?? "");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const normalizedName = normalizeName(fullName);
    if (!normalizedName) {
      setError("Enter the full birth name used for the chart.");
      return;
    }
    if (!isValidDob(dob)) {
      setError("Enter a valid date in DD/MM/YYYY format.");
      return;
    }
    onSave({
      id: person?.id ?? makeId(),
      fullName: normalizedName,
      calledName: normalizeName(calledName),
      dob,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="person-form-title">
        <div className="sheet-handle" />
        <div className="section-heading">
          <div>
            <p className="eyebrow">Chart subject</p>
            <h2 id="person-form-title">{person ? "Edit person" : "Add a person"}</h2>
          </div>
          <button className="text-button" type="button" onClick={onCancel}>Cancel</button>
        </div>
        <form className="person-form" onSubmit={submit}>
          <label>
            Full birth name
            <input
              autoFocus
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Roman Peter Vaughan"
            />
          </label>
          <label>
            Called name <span className="optional">Optional</span>
            <input
              value={calledName}
              onChange={(event) => setCalledName(event.target.value)}
              placeholder="Roman Vaughan"
            />
          </label>
          <label>
            Date of birth
            <input
              inputMode="numeric"
              autoComplete="bday"
              value={dob}
              onChange={(event) => setDob(normalizeDob(event.target.value))}
              placeholder="DD/MM/YYYY"
              maxLength={10}
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button full-button" type="submit">
            {person ? "Save changes" : "Create chart"}
          </button>
        </form>
      </section>
    </div>
  );
}

function InstallHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="sheet install-sheet" role="dialog" aria-modal="true" aria-labelledby="install-title">
        <div className="sheet-handle" />
        <div className="section-heading">
          <div>
            <p className="eyebrow">Phone installation</p>
            <h2 id="install-title">Add PASS 7 to your home screen</h2>
          </div>
          <button className="text-button" type="button" onClick={onClose}>Done</button>
        </div>
        <div className="install-steps">
          <div>
            <strong>iPhone or iPad</strong>
            <p>Open this page in Safari, tap Share, then choose Add to Home Screen.</p>
          </div>
          <div>
            <strong>Android</strong>
            <p>Open the browser menu and choose Install app or Add to Home screen.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const currentYear = new Date().getFullYear();
  const chartDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const [clients, setClients] = useState<Client[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<AppView>("people");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<Client | "new" | null>(null);
  const [focusAge, setFocusAge] = useState(0);
  const [focusYear, setFocusYear] = useState(currentYear);
  const [compareMode, setCompareMode] = useState<CompareMode>("years");
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setClients(JSON.parse(stored) as Client[]);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setHydrated(true);
    });
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);

    const captureInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", captureInstall);
    return () => window.removeEventListener("beforeinstallprompt", captureInstall);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients, hydrated]);

  const selectedClient = clients.find((client) => client.id === selectedId) ?? null;
  const selectedReport = useMemo(
    () => (selectedClient ? new Report(selectedClient.fullName, selectedClient.dob, currentYear) : null),
    [currentYear, selectedClient],
  );
  const compareClients = clients.filter((client) => compareIds.includes(client.id));

  function openChart(client: Client) {
    const report = new Report(client.fullName, client.dob, currentYear);
    setSelectedId(client.id);
    setFocusAge(report.age);
    setView("chart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveClient(client: Client) {
    setClients((current) => {
      const exists = current.some((item) => item.id === client.id);
      return exists
        ? current.map((item) => (item.id === client.id ? client : item))
        : [...current, client].sort((a, b) => a.fullName.localeCompare(b.fullName));
    });
    setEditing(null);
    openChart(client);
  }

  function deleteClient(client: Client) {
    if (!window.confirm(`Remove ${client.fullName} from this phone?`)) return;
    setClients((current) => current.filter((item) => item.id !== client.id));
    setCompareIds((current) => current.filter((id) => id !== client.id));
    if (selectedId === client.id) {
      setSelectedId(null);
      setView("people");
    }
  }

  function toggleCompare(id: string) {
    setCompareIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  async function installApp() {
    if (!installPrompt) {
      setShowInstallHelp(true);
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  const chartStart = selectedReport ? Math.max(0, focusAge - 9) : 0;
  const chartYear = selectedReport ? currentYear - selectedReport.age + focusAge : currentYear;

  return (
    <main className="app-shell">
      <header className="app-header no-print">
        <button className="brand-button" type="button" onClick={() => setView("people")} aria-label="Open people list">
          <Image src="/pass-logo.jpg" alt="PASS" width={50} height={50} priority />
          <span>
            <strong>PASS 7</strong>
            <small>Numerology charts</small>
          </span>
        </button>
        <button className="install-button" type="button" onClick={installApp}>Install</button>
      </header>

      <div className="content-shell">
        {view === "people" && (
          <section className="people-view view-section">
            <div className="hero-card">
              <p className="eyebrow">Peter Vaughan&apos;s original system</p>
              <h1>Your numerology chart creator, now in your pocket.</h1>
              <p>Exact PASS calculations. Your people stay saved privately on this phone.</p>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={() => setEditing("new")}>+ Add person</button>
                <button className="secondary-button" type="button" onClick={installApp}>Add to phone</button>
              </div>
              <div className="privacy-line"><span className="privacy-dot" /> Saved on this device · works offline</div>
            </div>

            <div className="section-heading people-heading">
              <div>
                <p className="eyebrow">Chart subjects</p>
                <h2>People</h2>
              </div>
              <span className="count-badge">{clients.length}</span>
            </div>

            {!hydrated ? (
              <div className="empty-card"><p>Loading your saved people…</p></div>
            ) : clients.length === 0 ? (
              <div className="empty-card">
                <div className="empty-mark">7</div>
                <h3>Add your first person</h3>
                <p>Enter a full birth name and date of birth to create the original PASS chart.</p>
                <button className="primary-button" type="button" onClick={() => setEditing("new")}>Add person</button>
              </div>
            ) : (
              <div className="people-list">
                {clients.map((client) => (
                  <article className="person-card" key={client.id}>
                    <button className="person-main" type="button" onClick={() => openChart(client)}>
                      <span className="person-initials">{client.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                      <span className="person-copy">
                        <strong>{client.fullName}</strong>
                        <small>{client.calledName || "No called name"} · {client.dob}</small>
                      </span>
                      <span className="chevron" aria-hidden="true">›</span>
                    </button>
                    <div className="person-actions">
                      <label className="compare-check">
                        <input type="checkbox" checked={compareIds.includes(client.id)} onChange={() => toggleCompare(client.id)} />
                        Compare
                      </label>
                      <button type="button" onClick={() => setEditing(client)}>Edit</button>
                      <button className="danger-text" type="button" onClick={() => deleteClient(client)}>Remove</button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {compareIds.length >= 2 && (
              <button className="compare-fab" type="button" onClick={() => setView("compare")}>
                Compare {compareIds.length} people
              </button>
            )}
          </section>
        )}

        {view === "chart" && selectedClient && selectedReport && (
          <section className="chart-view view-section">
            <div className="chart-title-row">
              <button className="back-button no-print" type="button" onClick={() => setView("people")}>‹ People</button>
              <div className="print-title">
                <p className="eyebrow">QuickChart · PASS 7</p>
                <h1>{selectedClient.fullName}</h1>
                <p>{selectedClient.dob} · Age {selectedReport.age}</p>
              </div>
              <button className="secondary-button compact-button no-print" type="button" onClick={() => window.print()}>Print / PDF</button>
            </div>

            <section className="profile-panel original-profile-panel">
              <p className="original-profile-hint no-print">Swipe sideways to view the original chart header.</p>
              <div className="original-profile-scroll" tabIndex={0} aria-label={`Original PASS chart header for ${selectedClient.fullName}`}>
                <div className="original-profile-sheet">
                  <div className="original-identity">
                    <code>{selectedReport.hdc}  {selectedReport.hdcTotal}</code>
                    <code>{selectedClient.fullName}</code>
                    <code>{selectedReport.fullLetters}  {selectedReport.fullLettersTotal}</code>
                    <code className="original-parts">{selectedReport.fullLettersTotalPart}</code>
                  </div>
                  <div className="original-meta">
                    <time>{chartDate}</time>
                    <code>UG : {selectedReport.ultimateGoal}</code>
                  </div>
                  <div className="original-pmei" aria-label="Physical, mental, emotional, and intuitive values">
                    {selectedReport.pmei.map((value, index) => (
                      <code key={value}>{["P", "M", "E", "I"][index]} {value}</code>
                    ))}
                  </div>
                  <div className="original-birth-values">
                    <code>{selectedReport.dob}</code>
                    <code>{selectedReport.birthForce}</code>
                  </div>
                  <div className="original-pincha">
                    <code>P: {spacedSequence(selectedReport.pin)}</code>
                    <code>C: {spacedSequence(selectedReport.cha)}</code>
                  </div>
                  <div className="original-season-row">
                    <code>Age : {selectedReport.age}</code>
                    {selectedReport.seasons.map((season) => <code key={season}>{season}</code>)}
                  </div>
                </div>
              </div>
            </section>

            <section className="chart-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Name cycles</p>
                  <h2>Year chart</h2>
                </div>
                <div className="focus-pill">{chartYear} · age {focusAge}</div>
              </div>
              <div className="focus-controls no-print">
                <button type="button" aria-label="Previous age" onClick={() => setFocusAge((age) => Math.max(0, age - 1))}>−</button>
                <input
                  aria-label="Focus age"
                  type="range"
                  min="0"
                  max="150"
                  value={focusAge}
                  onChange={(event) => setFocusAge(Number(event.target.value))}
                />
                <button type="button" aria-label="Next age" onClick={() => setFocusAge((age) => Math.min(150, age + 1))}>+</button>
              </div>
              <p className="scroll-hint no-print">Swipe sideways across the chart to explore all 20 years.</p>
              <YearGrid report={selectedReport} start={chartStart} length={20} label={`Year chart for ${selectedClient.fullName}`} />
            </section>

            <section className="chart-panel month-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Monthly cycles</p>
                  <h2>Three-year view</h2>
                </div>
              </div>
              <p className="scroll-hint no-print">Swipe sideways to compare the previous, selected, and following year.</p>
              <MonthBand report={selectedReport} focusAge={Math.max(0, focusAge)} />
            </section>
          </section>
        )}

        {view === "compare" && (
          <section className="compare-view view-section">
            <div className="chart-title-row">
              <button className="back-button no-print" type="button" onClick={() => setView("people")}>‹ People</button>
              <div className="print-title">
                <p className="eyebrow">Multi Chart · PASS 7</p>
                <h1>Compare people</h1>
                <p>{compareClients.length} selected</p>
              </div>
              {compareClients.length >= 2 && <button className="secondary-button compact-button no-print" type="button" onClick={() => window.print()}>Print / PDF</button>}
            </div>

            <div className="compare-picker no-print">
              {clients.map((client) => (
                <label key={client.id}>
                  <input type="checkbox" checked={compareIds.includes(client.id)} onChange={() => toggleCompare(client.id)} />
                  <span>{client.fullName}</span>
                </label>
              ))}
            </div>

            {compareClients.length < 2 ? (
              <div className="empty-card">
                <div className="empty-mark">2</div>
                <h3>Select at least two people</h3>
                <p>Choose the people above to align their numerology cycles around one year.</p>
              </div>
            ) : (
              <>
                <div className="compare-toolbar no-print">
                  <div className="segmented-control" aria-label="Comparison mode">
                    <button className={compareMode === "years" ? "active" : ""} type="button" onClick={() => setCompareMode("years")}>Years</button>
                    <button className={compareMode === "months" ? "active" : ""} type="button" onClick={() => setCompareMode("months")}>Months</button>
                  </div>
                  <div className="year-stepper">
                    <button type="button" aria-label="Previous year" onClick={() => setFocusYear((year) => year - 1)}>−</button>
                    <label>Focus year<input type="number" value={focusYear} onChange={(event) => setFocusYear(Number(event.target.value))} /></label>
                    <button type="button" aria-label="Next year" onClick={() => setFocusYear((year) => year + 1)}>+</button>
                  </div>
                </div>

                <div className="comparison-stack">
                  {compareClients.map((client) => {
                    const report = new Report(client.fullName, client.dob, currentYear);
                    const ageAtFocus = report.age + focusYear - currentYear;
                    return (
                      <article className="comparison-card" key={client.id}>
                        <div className="comparison-person">
                          <div><h2>{client.fullName}</h2><p>{client.dob}</p></div>
                          <span>{focusYear} · age {ageAtFocus}</span>
                        </div>
                        {ageAtFocus < 0 ? (
                          <p className="before-birth">This focus year is before the person&apos;s birth.</p>
                        ) : compareMode === "years" ? (
                          <YearGrid report={report} start={Math.max(0, ageAtFocus - 10)} length={21} includeNames={false} label={`Comparison chart for ${client.fullName}`} />
                        ) : (
                          <MonthBand report={report} focusAge={ageAtFocus} />
                        )}
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )}
      </div>

      <nav className="bottom-nav no-print" aria-label="Primary navigation">
        <button className={view === "people" ? "active" : ""} type="button" onClick={() => setView("people")}><span>People</span><small>{clients.length}</small></button>
        <button className={view === "chart" ? "active" : ""} type="button" disabled={!selectedClient} onClick={() => setView("chart")}><span>Chart</span><small>{selectedClient ? "Open" : "—"}</small></button>
        <button className={view === "compare" ? "active" : ""} type="button" onClick={() => setView("compare")}><span>Compare</span><small>{compareIds.length}</small></button>
      </nav>

      {editing && <PersonForm person={editing === "new" ? null : editing} onCancel={() => setEditing(null)} onSave={saveClient} />}
      {showInstallHelp && <InstallHelp onClose={() => setShowInstallHelp(false)} />}
    </main>
  );
}
