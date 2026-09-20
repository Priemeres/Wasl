import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// White-and-green editor palette: matches the app plates; syntax hues stay separable at AA contrast.
const ground = '#ffffff', gutter = '#f0f5f2', accent = '#125f42', ink = '#10261b';
const view = EditorView.theme({
  '&': { color: ink, backgroundColor: ground },
  '.cm-content': { caretColor: accent },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: accent },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: 'rgba(26, 127, 87, .2)' },
  '.cm-activeLine': { backgroundColor: '#f0f7f3' },
  '.cm-gutters': { backgroundColor: gutter, color: '#566f61', border: 'none', borderInlineEnd: '1px solid rgba(26, 127, 87, .2)' },
  '.cm-activeLineGutter': { backgroundColor: '#e7f2eb', color: accent },
  '.cm-foldPlaceholder': { backgroundColor: '#e7f2eb', border: 'none', color: '#3a5547' },
  '.cm-tooltip': { backgroundColor: '#ffffff', border: '1px solid #7db89f', color: ink },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: '#e7f2eb', color: ink },
  '.cm-matchingBracket': { backgroundColor: 'rgba(26, 127, 87, .16)', outline: '1px solid #1a7f57' },
}, { dark: false });

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.modifier], color: '#0f6a45', fontWeight: '600' },
  { tag: [t.typeName, t.className, t.standard(t.name)], color: '#0b6b7a' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#2456a6' },
  { tag: [t.string, t.special(t.string)], color: '#a8431f' },
  { tag: [t.number, t.bool, t.constant(t.name), t.atom], color: '#8a5300' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#5f766a', fontStyle: 'italic' },
  { tag: [t.operator, t.punctuation, t.bracket], color: '#3a5547' },
  { tag: [t.processingInstruction, t.macroName], color: '#7a3d9c' },
]);

export const waslEditor = [view, syntaxHighlighting(highlight)];
