---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/styles.css","src/IDE.tsx"]
---

# Wasl desktop app: visual redesign

Scope: every screen of the Electron app (overview, devices, projects, telemetry, alerts, IDE, guide, settings, modals). Visitor mode: Operate. Build path: code-led (no image generation available).

Audience and job: Arabic-speaking makers, students and small labs registering devices, watching readings, and writing/uploading Arduino code, offline, RTL-first, on Windows/Linux.
Constraints: bundled Noto Sans Arabic only (no web fonts), keep assets/icon.svg as the app icon, fully offline, right-to-left with English/LTR as the exception, no invented claims.

## Direction contract

THESIS: Wasl is an engraved brass instrument. Each screen is a plate, live readings are the pointer, and every scale on the page is a real scale carrying data. It refuses the pale-green card dashboard: KPI cards, donut, sparklines, icon tiles.

OWN-WORLD: Lapis-ink ground (#0c1727) with raised plates (#12223a) bounded by brass hairline double keylines. Brass (#c9a05a, bright #e2bd7b) is the one accent and the primary action. Bone (#efe7d5) text. Verdigris marks online, amber marks warning, vermilion marks alerts and errors, and stale values gray back toward the plate. Status is a shape mark (disc, triangle, ring, struck ring), never color alone. Small 2-3px radii, engraved tick rules under page headings, tabular numerals, Noto Sans Arabic at weight steps 400/600/700 for hierarchy. The code editor shares the same lapis ground.

STORY: The user sees at once whether their devices are alive, watches a reading arrive, and moves from registering a first device to writing firmware without leaving one coherent instrument.

FIRST VIEWPORT: Overview. A slim brass-hairline rail of plates on the inline-start edge with the app icon and wordmark on top. Main area: heading with an engraved tick rule beneath it, then a two-plate row: on the reading-start side a large engraved dial (one mark per device on a degree-scale ring, needle at the share online, count at center) with four plain readout rows beneath it, and beside it the incoming-readings plot drawn in brass line on hairline grid. Below, the device table with shape-mark status. Primary action "Add device" is the single brass-filled button.

FORM: Engraved astrolabe plate system, position 7 on the ordered candidate list, seed key 674fb09f. Raises: state as mark not hue (cutting-bench rail), readings age toward the plate (wall calendar), tabular numerals and non-color status (cyclorama), one shared ground for editor and shell.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
