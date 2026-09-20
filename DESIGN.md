---
name: Wasl
description: Arabic-first desktop console for IoT devices, drawn as an engraved instrument in white and green.
colors:
  ground: "#f2f6f3"
  rail: "#ffffff"
  plate: "#ffffff"
  plate-hi: "#e7f2eb"
  well: "#f0f5f2"
  accent: "#1a7f57"
  accent-strong: "#125f42"
  accent-line: "#7db89f"
  on-accent: "#ffffff"
  ink: "#10261b"
  text-2: "#3a5547"
  text-3: "#566f61"
  ok: "#1f9d6b"
  warn: "#c77c0a"
  alert: "#c5402b"
  keyline: "rgba(26, 127, 87, 0.34)"
  keyline-soft: "rgba(26, 127, 87, 0.16)"
  shade: "rgba(16, 38, 27, 0.22)"
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
    lineHeight: 1.75
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
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: "8px 15px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 15px"
  button-secondary-hover:
    backgroundColor: "{colors.plate-hi}"
  button-disabled:
    backgroundColor: "{colors.well}"
    textColor: "{colors.text-3}"
    rounded: "{rounded.sm}"
  plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
  input:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.plate-hi}"
    textColor: "{colors.accent-strong}"
    rounded: "{rounded.sm}"
    padding: "9px 12px"
  code-block:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
---

# Design System: Wasl

## Overview

**Creative North Star: "Engraved Instrument, White and Green"**

Wasl is a working instrument, not a dashboard. White plates sit on a barely tinted green-grey ground, each edged with a double green keyline (a 1px outer line and a hairline inset a few pixels inside it), like a stamped plate on a bench meter. There is one accent, green, and it is spent on interaction, table heads, readings, focus and the single dial. Everything else is white, tinted paper and deep green-black ink.

The system is Arabic first. Layout is written with logical properties (`inset-inline-start`, `margin-inline-start`, `border-inline-end`, `text-align: start`) so right-to-left and left-to-right render as mirror images. Code, endpoints, code blocks and the editor are the forced-LTR islands; Latin fragments inside Arabic prose are rendered as isolated LTR `code` (`unicode-bidi: isolate`, `dir="ltr"`) so bidi cannot scramble them. Direction-dependent glyphs flip under `html[dir=ltr]`.

Status is always a shape, never color alone. Density is calm and ledger-like: readouts are rows in a plain list, not KPI cards. Motion is a single event, the dial needle sweeping to its value once on mount. The overview and guide headings end in an engraved tick rule.

**Key Characteristics:**
- White plates on a barely tinted ground, double green keylines as the only ornament.
- One green accent; the status greens, amber and vermilion are reserved for status.
- Status carried by shape: circle, triangle, open circle, struck circle.
- RTL first, logical properties throughout, isolated LTR code fragments.
- One typeface family (bundled Noto Sans Arabic) plus system mono for code.
- Reduced motion switches off all transitions and animation.

## Colors

A near-white green-tinted field, pure white plates, and one mid-forest green accent; status hues are a slightly brighter green, amber and vermilion.

### Primary
- **Forest Accent** (#1a7f57): the accent. Table column heads, nav group labels, primary button fill, icon tint on empty states, dial ticks at the major mark, chart line.
- **Deep Forest** (#125f42): hover and pressed state of the accent, active nav and selected segment text, readings, links, focus ring, dial needle and hub, caret.
- **Keyline Green** (#7db89f): resting borders of buttons and toggles, page-heading rule, dial bezel and ticks, dialog and code-surface borders.
- **On Accent** (#ffffff): text on the accent fill.

### Neutral
- **Paper Ground** (#f2f6f3): page background.
- **Rail White** (#ffffff): sidebar, topbar, file tabs and status bar; separated from plates by keylines, not by tone.
- **Plate White** (#ffffff): raised surfaces (panels, cards, dialogs, toolbars, code surface).
- **Plate Wash** (#e7f2eb): hover and selected fill.
- **Well** (#f0f5f2): recessed fields, inputs, segmented tracks, code blocks, terminal.
- **Green Ink** (#10261b): primary text.
- **Moss Text** (#3a5547): secondary text. **Sage Text** (#566f61): tertiary text, captions and disabled labels.
- **Keyline** (accent at 34%) and **Keyline Soft** (accent at 16%): panel borders and row dividers respectively. **Shade** (ink at 22%) is the only shadow color.

### Status
- **Status Green** (#1f9d6b): online, success, guide path nodes. **Amber Warn** (#c77c0a): warning. **Vermilion Alert** (#c5402b): alerts, danger, the sidebar count pill.

### Named Rules
**The One Accent Rule.** Green (Forest Accent and its Deep and Line steps) is the only accent. No second decorative hue is introduced; Status Green, amber and vermilion mean status and nothing else. Because Status Green sits close to the accent, online is identified by its shape and by context, never by hue alone.

**The Shape Before Color Rule.** Every status carries a distinct shape (filled circle online, triangle warning, open circle offline, open circle with a diagonal strike revoked). Color reinforces the shape and never replaces it.

## Typography

**Display / Body Font:** Noto Sans Arabic (bundled; fallback Tahoma, Segoe UI, sans-serif)
**Code Font:** Menlo, Consolas, Courier New (monospace)

**Character:** One family carries every role; hierarchy comes only from weight and size. A second caption voice was planned and deferred; the build is single-voice and that is the current system. Numerals are tabular (`font-variant-numeric: tabular-nums`) so readings align. Line height is generous (1.75 body) for Arabic diacritics.

### Hierarchy
- **Display** (700, 34px, 1.5; 28px under 760px): page titles.
- **Headline** (600, 18px, 1.75): panel and section headings; 21-22px in dialogs and guide panels, 19px for guide section heads.
- **Title** (600, 15-16px): card titles, table names, form rows, guide step heads (16px).
- **Body** (400, 15px, 1.75; 2.0 in long-form guide text): descriptions and settings.
- **Label** (600, 12px, Forest Accent): table heads, nav group labels, doc labels. Sentence case, no uppercase, no letter-spacing.
- **Reading** (600-700, 28px in cards, 48px in device detail, 44px on the dial): measured values in Deep Forest or Green Ink.
- **Code** (400, 13px, 1.75): endpoints, tokens, guide code blocks, terminal; editor is 14px. Inline fragments in prose are 0.9em, Deep Forest on Well.

### Named Rules
**The Weight Ladder Rule.** With one family, rank by weight and size (700 / 600 / 400) and by ink step (Green Ink / Moss Text / Sage Text). Do not add a second decorative face without a decision recorded here.

**The Bundled Face Rule.** Arabic text uses the bundled Noto Sans Arabic; do not depend on an installed or remote font.

## Layout

Fixed sidebar (244px; 216px under 1200px; 190px under 760px) pinned to the inline-start edge, with the app column offset by the same variable. Main content is padded 32px 34px (38px 44px above 1450px; 26px 24px under 1200px; 16px inline under 760px), max width 1680px. Gaps step through 10, 14, 18, 22, 26px; panel interiors use 24px inline padding. Monitor area is one column, two (1.3fr / 1fr) at 1300px and up. Project grid is four columns, two under 1280px, one under 760px. The connection guide is a main article plus a sticky contents column (220-280px), collapsing to one column under 1200px. Page headings end in a green hairline rule; on the overview and guide-style headings it gains a ruled scale (fine ticks every 8px, major every 40px).

## Elevation & Depth

Depth is tonal layering plus keylines, with a soft downward shadow only under raised plates, dialogs, the toast and the primary button. Plates are white over the Paper Ground, with Plate Wash for hover and Well recessed for fields.

### Shadow Vocabulary
- **Double keyline** (`inset 0 0 0 4px plate, inset 0 0 0 5px keyline-soft`): the inner hairline of panels and dialogs (3px/4px on cards and the IDE toolbar).
- **Plate lift** (`0 14px 26px -16px shade`): panels. Dialogs use `0 30px 70px -20px shade`.
- **Button lift** (`0 6px 14px -8px shade`): primary button.

### Named Rules
**The Keyline Rule.** Raised means a green keyline border plus an inset hairline; shadow is secondary and always soft, blurred and offset downward, never a hard offset.

## Shapes

Small, machined corners: 3px on controls and fields, 4px on plates, dialogs and code surface, 2px on segmented inner buttons. Circles (50%) for status marks and step numbers; an 11px pill for the sidebar count and 10px for the small count chip. Hairline borders (1px) separate rows and regions; active nav items carry a small rotated 7px green diamond at the inline end. The dial is a circular bezel with a double ring, tick marks and a green needle.

## Components

### Buttons
- **Shape:** 3px corners, 1px border, 8px 15px padding, 14px text.
- **Primary:** filled Forest Accent with white text, 600 weight, button lift; hover moves to Deep Forest. The IDE upload button uses the same treatment.
- **Secondary:** transparent with a Keyline Green border and Green Ink text. Hover fills Plate Wash and lifts the border to Forest Accent.
- **Danger:** Vermilion text with a 50% vermilion border; hover tints 8% vermilion.
- **Disabled:** dashed Keyline border on the Well with Sage Text label, no fill or shadow (full opacity, so the label stays legible); other buttons fall back to 45% opacity.
- **Focus:** 2px Deep Forest outline with 2px offset on all buttons, inputs and selects.

### Fields
- Well background, 1px Keyline Soft border, 3px corners; hover shows Keyline Green, focus shows Forest Accent. Caret is Deep Forest. Search and selects are 36px high. Code-like inputs use the mono stack.

### Segmented Control and Tabs
- Segmented: Well track with 3px padding; selected segment is Plate Wash, Deep Forest text, inset keyline.
- Device tabs: text only, selected shows Deep Forest text with a 2px underline.

### Plates (Panels, Cards, Dialogs)
- White fill, 1px Keyline border, 4px corners, double-keyline inset. Project cards on hover swap to Plate Wash and a Forest Accent border. Dialogs use a Keyline Green border and a 42% ink backdrop.

### Navigation
- White rail sidebar, 15px items in Moss Text. Active item takes Plate Wash, Deep Forest text, 600 weight, inset keyline and the diamond marker. Group labels are 12px Forest Accent. Unread alerts show a Vermilion count pill with white text.

### Status Mark
- 10px shape beside 13px text: filled green circle (online), amber triangle by clip-path (warning), open sage circle (offline), open circle with diagonal strike (revoked). The dial repeats the same four shapes per device.

### Dial (signature)
- A 260-unit SVG: double Keyline Green bezel, ticks (one major at midpoint in Deep Forest), an 82-radius arc, one status shape per device, a Deep Forest needle and hub, the online count at 44px. The needle sweeps from -150deg to its value once over 1.1s with `cubic-bezier(.16, 1, .3, 1)`. It is the only entrance animation.

### Readout Ledger
- Label and value rows divided by Keyline Soft hairlines (170px label column), no cards.

### Connection Guide
- The engraved path: three steps across a tick rule, each node a 13px Status Green circle ringed with the plate color. Numbered step heads use a 26px outlined circle. Code blocks are Well surfaces with a Keyline Soft border, a 12px semibold Deep Forest head carrying a copy icon button, and an LTR `pre`. FAQ rows are flat: hairline-divided `details` with 600-weight summaries and a Deep Forest marker, no boxes. Callouts are Well notes with Deep Forest leading text.

### Code Surface
- White ground, Keyline Green border, editor theme in green and ink (keywords deep green 600 weight, types teal, functions blue, strings rust, numbers amber, comments sage italic, macros purple). Editor is forced LTR with the mono stack.

## Do's and Don'ts

### Do:
- **Do** write layout with logical properties so RTL and LTR mirror each other; flip directional glyphs under `html[dir=ltr]`; wrap Latin fragments in Arabic prose as isolated LTR code.
- **Do** pair every status color with its shape mark.
- **Do** build raised surfaces from white Plate, a Keyline border and an inset hairline.
- **Do** use Deep Forest for hover, selection, focus and readings; Forest Accent for heads and fills.
- **Do** style disabled controls as a dashed keyline on the Well with a Sage Text label.
- **Do** keep Noto Sans Arabic bundled and tabular numerals on.
- **Do** honor `prefers-reduced-motion`; the dial sweep is the only choreographed motion.

### Don't:
- **Don't** add a second accent color or use status hues decoratively.
- **Don't** signal state by color alone, least of all online versus accent green.
- **Don't** use hard offset shadows or bright glows; shadows stay soft and downward.
- **Don't** turn readouts into card grids of large KPI tiles.
- **Don't** use physical `left` and `right` in layout, except in the code and editor islands that are LTR by design.
- **Don't** rely on an installed or remote font for Arabic.

## Not canonized (build carries, system does not inherit)

- Drift to tokenize: scrollbar greens (#b9cfc2, #8fb3a0); syntax-highlight hues in `src/editorTheme.ts` (#0f6a45, #0b6b7a, #2456a6, #a8431f, #8a5300, #7a3d9c, #5f766a) plus its own copies of ground, gutter and ink; chart hex in `src/App.tsx` (#1a7f57, #566f61, #7db89f, #125f42, #10261b, #ffffff); amber and vermilion text tints (#8a5300, #7a4a00, #9c2f1d, #a8321f). These duplicate or shadow tokens and should become tokens, not be copied into new surfaces.
- The stylesheet still carries a stale comment ("same lapis ground as the shell") in the IDE block.
- Small all-accent 12px labels (`nav-label`, `th`, `doc-label`) read close to eyebrows; they head real navigation groups and table columns, not a licence for new decorative kickers.
- The deferred second caption voice (see Typography).
- The finish review's disposition was fix; its material fixes were applied in one batch and have not been re-reviewed.
