# Print Contract

- Source component: `app/page.tsx` -> `PassPrintReport`.
- Source styles: `app/globals.css` -> `@media print`.
- Format: A4 portrait, 210 mm wide, report height capped at 287 mm.
- Layout rows: `34mm 42mm 58mm 46mm 82mm 1fr`.
- Contents: summary, 30-year focus, three years of months, 80-year lifetime, footer.
- Screen and print share the complete `PassPrintReport` markup; phone layouts use section-level horizontal scrolling without creating document-level overflow.
- Decorative dotted rows: exactly two in the focus section and two in the lifetime section.
- Name-part reductions must stay centered beneath their corresponding number groups.
- Traditional red, blue, cyan, green, and black chart data colors are preserved.
- Screen and print must consume the same `Report`; do not duplicate calculations in UI code.

Structural tests are necessary but not sufficient. A print change is complete only after a real browser-generated PDF is inspected for exactly one page, unclipped rows, centered reductions, and matching formula text.

Historical local proof: a one-page A4 PDF was generated and visually inspected on 2026-07-19 with the dedicated report banner, transparent seal, and paper texture. The ignored local PDF is not immutable repository evidence. Future print evidence must receive an evidence ID bound to the exact commit plus a SHA-256 digest, page count, generation environment, and inspection result; the evidence record may point to an access-controlled binary location without treating that location as immutable.
