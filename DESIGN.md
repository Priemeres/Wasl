---
name: Wasl
description: Arabic-first desktop console for IoT devices, drawn as an engraved brass instrument on a lapis-ink ground.
colors:
  ground: "#0c1727"
  rail: "#08111e"
  plate: "#12223a"
  plate-hi: "#182b47"
  well: "#0a1424"
  brass: "#c9a05a"
  brass-hi: "#e2bd7b"
  brass-lo: "#7d653a"
  bone: "#efe7d5"
  text-2: "#b4bfce"
  text-3: "#8e9db2"
  ok: "#52b8a3"
  warn: "#eaa53b"
  alert: "#f0765f"
  keyline: "rgba(201, 160, 90, 0.3)"
  keyline-soft: "rgba(201, 160, 90, 0.14)"
typography:
  display:
    fontFamily: "'Noto Sans Arabic', Tahoma, 'Segoe UI', sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.5
  headline:
    fontFamily: "'Noto Sans Arabic', Tahoma, 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.75
  title:
    fontFamily: "'Noto Sans Arabic', Tahoma, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.75
  body:
    fontFamily: "'Noto Sans Arabic', Tahoma, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Noto Sans Arabic', Tahoma, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.75
  reading:
    fontFamily: "'Noto Sans Arabic', Tahoma, 'Segoe UI', sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.3
  code:
    fontFamily: "Menlo, Consolas, 'Courier New', monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  sm: "3px"
  plate: "4px"
  pill: "11px"
  round: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "34px"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "#150f04"
    rounded: "{rounded.sm}"
    padding: "8px 15px"
  button-primary-hover:
    backgroundColor: "{colors.brass-hi}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.sm}"
    padding: "8px 15px"
  button-secondary-hover:
    backgroundColor: "{colors.plate-hi}"
  plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.bone}"
    rounded: "{rounded.plate}"
  input:
    backgroundColor: "{colors.well}"
    textColor: "{colors.bone}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.plate-hi}"
    textColor: "{colors.brass-hi}"
    rounded: "{rounded.sm}"
    padding: "9px 12px"
---

# Design System: Wasl

## Overview

**Creative North Star: "Engraved Brass Instrument"**

Wasl is a working instrument, not a dashboard. A deep lapis-ink ground carries raised plates edged with double brass keylines (a 1px outer line and a hairline inset a few pixels inside it), like a stamped plate on a bench meter. There is one accent, brass, and it is spent on interaction, headings of tables, readings and the single dial. Everything else is lapis and bone-white.

The system is Arabic first. Layout is written with logical properties (`inset-inline-start`, `margin-inline-start`, `border-inline-end`, `text-align: start`) so right-to-left and left-to-right render as mirror images. Code, endpoints and the editor are the only forced-LTR islands. Direction-dependent glyphs (chevrons, arrows) flip under `html[dir=ltr]`.

Status is always a shape, never color alone. Density is calm and ledger-like: readouts are rows in a plain list, not KPI cards. Motion is a single event, the dial needle sweeping to its value once on mount.

**Key Characteristics:**
- Lapis-ink ground, raised plates, double brass keylines as the only ornament.
- One accent (brass); teal, amber and coral are reserved for status.
- Status carried by shape: circle, triangle, open circle, struck circle.
- RTL first, logical properties throughout.
- One typeface family (Noto Sans Arabic) plus system mono for code.
- Reduced motion switches off all transitions and animation.

## Colors

A blue-black lapis field lit by a single warm brass; status hues are cool teal, amber and coral, kept apart from brass.

### Primary
- **Brass** (#c9a05a): the accent. Table column heads, nav section labels, fills for the primary button, icon tint on empty states.
- **Brass Highlight** (#e2bd7b): active and hover state of anything brass, readings, links, the dial needle, focus ring, chart line.
- **Brass Shadow** (#7d653a): resting borders of buttons and segmented controls, page-heading rule, dial ticks.

### Neutral
- **Lapis Ground** (#0c1727): page background.
- **Rail Ink** (#08111e): sidebar, topbar, file tabs; the darkest layer, sits behind the plates.
- **Plate** (#12223a): raised surfaces (panels, cards, dialogs, toolbars).
- **Plate Highlight** (#182b47): hover and selected fill on plates.
- **Well** (#0a1424): recessed fields, inputs, segmented tracks, code surface and terminal.
- **Bone** (#efe7d5): primary text.
- **Slate Mist** (#b4bfce): secondary text. **Slate Fog** (#8e9db2): tertiary text and captions.
- **Keyline** (brass at 30%) and **Keyline Soft** (brass at 14%): panel borders and row dividers respectively.

### Status
- **Teal Ok** (#52b8a3): online, success. **Amber Warn** (#eaa53b): warning. **Coral Alert** (#f0765f): alerts, danger, the sidebar count pill.

### Named Rules
**The One Brass Rule.** Brass is the only accent. A second accent hue for decoration is never introduced; teal, amber and coral mean status and nothing else.

**The Shape Before Color Rule.** Every status carries a distinct shape (filled circle online, triangle warning, open circle offline, open circle with a diagonal strike revoked). Color reinforces the shape and never replaces it.

## Typography

**Display / Body Font:** Noto Sans Arabic (bundled; fallback Tahoma, Segoe UI, sans-serif)
**Code Font:** Menlo, Consolas, Courier New (monospace)

**Character:** One family carries every role; hierarchy comes only from weight and size. Numerals are tabular (`font-variant-numeric: tabular-nums`) so readings align. Line height is generous (1.75 body) for Arabic diacritics.

### Hierarchy
- **Display** (700, 34px, 1.5; 28px under 760px): page titles.
- **Headline** (600, 18px, 1.75): panel and section headings; 21-22px in dialogs and guide panels.
- **Title** (600, 15-16px): card titles, table names, form rows.
- **Body** (400, 15px, 1.75; 2.0 in long-form guide text): descriptions and settings.
- **Label** (600, 12px, brass): table heads, nav group labels, doc labels. Sentence case, no uppercase, no letter-spacing.
- **Reading** (600-700, 28px in cards, 48px in device detail, 44px on the dial): measured values in Brass Highlight or Bone.
- **Code** (400, 13px, 1.7): endpoints, tokens, editor (14px), terminal.

### Named Rules
**The Weight Ladder Rule.** With one family, rank by weight and size (700 / 600 / 400) and by color step (Bone / Slate Mist / Slate Fog). Do not add a second decorative face without a decision recorded here.

**The Bundled Face Rule.** Arabic text uses the bundled Noto Sans Arabic; do not depend on an installed or remote font.

Open item: a second typographic voice for plate captions was planned and deferred. The build is single-voice, and that is the current system.

## Layout

Fixed sidebar (244px; 216px under 1200px; 190px under 760px) pinned to the inline-start edge, with the app column offset by the same variable. Main content is padded 32px 34px (38px 44px above 1450px; 26px 24px under 1200px; 16px inline under 760px), max width 1680px. Gaps step through 10, 14, 18, 22, 26px; panel interiors use 24px inline padding. Monitor area is one column, two (1.3fr / 1fr) at 1300px and up. Project grid is four columns, two under 1280px, one under 760px. Page headings end in a brass hairline rule; on the overview it gains a ruled scale (fine ticks every 8px, major every 40px).

## Elevation & Depth

Depth is tonal layering plus keylines, with a soft downward shadow only under raised plates and the primary button. Panels stack Rail, Ground, Plate, Plate Highlight, with Well recessed below.

### Shadow Vocabulary
- **Double keyline** (`inset 0 0 0 4px plate, inset 0 0 0 5px keyline-soft`): the inner hairline of panels and dialogs (3px/4px on cards and the IDE toolbar).
- **Plate lift** (`0 14px 26px -16px #000c`): panels. Dialogs use `0 30px 70px -20px #000d`.
- **Button lift** (`0 6px 14px -8px #000c`): primary button.

### Named Rules
**The Keyline Rule.** Raised means a brass keyline border plus an inset hairline; shadow is secondary and always soft, blurred and offset downward, never a hard offset.

## Shapes

Small, machined corners: 3px on controls and fields, 4px on plates, dialogs and code surface, 2px on segmented inner buttons. Circles (50%) for status marks and step numbers; an 11px pill for the sidebar count and 10px for the small count chip. Hairline borders (1px) separate rows and regions; active nav items carry a small rotated 7px brass diamond at the inline end. The dial is a circular bezel with a double ring, tick marks and a brass needle.

## Components

### Buttons
- **Shape:** 3px corners, 1px border, 8px 15px padding, 14px text.
- **Primary:** filled Brass with near-black ink (#150f04), 600 weight; the IDE upload button uses the same treatment.
- **Secondary:** transparent with a Brass Shadow border and Bone text. Hover fills Plate Highlight and lifts the border to Brass.
- **Danger:** Coral text with a 50% coral border; hover tints 12% coral.
- **Disabled:** dashed keyline border, Slate Fog text, no fill.
- **Focus:** 2px Brass Highlight outline with 2px offset on all buttons, inputs and selects.

### Fields
- Well background, 1px Keyline Soft border, 3px corners; hover shows Brass Shadow, focus shows Brass. Caret is Brass Highlight. Search and selects are 36px high. Code-like inputs use the mono stack.

### Segmented Control and Tabs
- Segmented: Well track with 3px padding; selected segment is Plate Highlight, Brass Highlight text, inset keyline.
- Device tabs: text only, selected shows Brass Highlight text with a 2px underline.

### Plates (Panels, Cards, Dialogs)
- Plate fill, 1px Keyline border, 4px corners, double-keyline inset. Project cards on hover swap to Plate Highlight and a Brass border. Dialogs use a Brass Shadow border and a 74% ink backdrop.

### Navigation
- Rail Ink sidebar, 15px items in Slate Mist. Active item takes Plate Highlight, Brass Highlight text, 600 weight, inset keyline and the diamond marker. Group labels are 12px Brass. Unread alerts show a Coral count pill.

### Status Mark
- 10px shape beside 13px text: filled teal circle (online), amber triangle by clip-path (warning), open slate circle (offline), open circle with diagonal strike (revoked). The dial repeats the same four shapes per device.

### Dial (signature)
- A 260-unit SVG: double brass-shadow bezel, ticks (one major at midpoint in Brass Highlight), an 82-radius arc, one status shape per device, a brass needle and hub, the online count at 44px. The needle sweeps from -150deg to its value once over 1.1s with `cubic-bezier(.16, 1, .3, 1)`. It is the only entrance animation.

### Readout Ledger
- Label and value rows divided by Keyline Soft hairlines (170px label column), no cards.

### Code Surface
- Well ground, Brass Shadow border, editor theme in lapis and brass (keywords Brass Highlight, types teal, functions blue, strings coral-orange, numbers amber, comments slate italic, purple for macros). Editor is forced LTR with the mono stack.

## Do's and Don'ts

### Do:
- **Do** write layout with logical properties so RTL and LTR mirror each other; flip directional glyphs under `html[dir=ltr]`.
- **Do** pair every status color with its shape mark.
- **Do** build raised surfaces from Plate, a Keyline border and an inset hairline.
- **Do** use Brass Highlight for hover, selection, focus and readings; Brass for heads and fills.
- **Do** keep Noto Sans Arabic bundled and tabular numerals on.
- **Do** honor `prefers-reduced-motion`; the dial sweep is the only choreographed motion.

### Don't:
- **Don't** add a second accent color or use status hues decoratively.
- **Don't** signal state by color alone.
- **Don't** use hard offset shadows or bright glows; shadows stay soft and downward.
- **Don't** turn readouts into card grids of large KPI tiles.
- **Don't** use physical `left` and `right` in layout, except in the code and editor islands that are LTR by design.
- **Don't** rely on an installed or remote font for Arabic.

## Not canonized (build carries, system does not inherit)

- Off-token literals: `#f4c274`, `#f7b7a8`, `#f4a48f`, `#cfe4dd` (tinted status text), `#2b3d5a` and `#3f5578` (scrollbar), and hex values hardcoded in the chart (`#a3b1c4`, `#6b5a3a`) and editor theme. These should be tokenized, not copied.
- Small all-brass 12px labels (`nav-label`, `th`, `doc-label`) read close to eyebrows; they are heads of real navigation groups and table columns, not a licence for new decorative kickers.
- The deferred second typographic voice (see Typography).
