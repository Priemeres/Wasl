---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/styles.css","src/IDE.tsx","src/Guide.tsx"]
---

# Wasl desktop app: visual system

Scope: every screen of the Electron app. Visitor mode: Operate. Build path: code-led.
Audience: Arabic-speaking makers, students and small labs; RTL-first, offline, Windows/Linux.
Constraints: bundled Noto Sans Arabic only, keep assets/icon.svg, fully offline, no invented claims.

Revision (user request): keep the engraved-instrument theme (keylines, dial, shape-mark status, tick rule) but change the colors to white with a green accent. The brass/lapis palette is retired.

## Direction contract

THESIS: Wasl is an engraved instrument. Each screen is a plate, live readings are the pointer, and every scale carries data. It refuses the pale KPI-card dashboard: stat cards, donut, sparklines, icon tiles.

OWN-WORLD: White plates (#ffffff) on a barely tinted ground (#f2f6f3), bounded by green hairline double keylines. Green (#1a7f57, strong #125f42) is the one accent and the primary action. Deep green-black ink (#10261b) text. Green marks online, amber marks warning, vermilion marks alerts and errors, and stale values gray back toward the plate. Status is a shape mark (disc, triangle, ring, struck ring), never color alone. Small 3-4px radii, engraved tick rule under the overview heading only, tabular numerals, Noto Sans Arabic at weight steps. The code editor is a light white/green theme on the same plates.

STORY: The user sees at once whether their devices are alive, watches a reading arrive, and moves from registering a first device to writing firmware without leaving one coherent instrument.

FIRST VIEWPORT: Overview. A slim white rail with a green hairline on the inline-start edge, the app icon and wordmark on top. Main area: heading with an engraved tick rule beneath, then a two-plate row: the engraved status dial with device marks and readout rows, beside the incoming-readings plot in a green line on a hairline grid. Below, the device table with shape-mark status. Primary action "Add device" is the single green-filled button.

FORM: Engraved instrument plate system, seed key 674fb09f, recolored to white and green.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
