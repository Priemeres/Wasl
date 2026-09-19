import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// Lapis-and-brass editor palette: matches the app plates, syntax hues stay separable without neon.
const ground = '#0a1424', gutter = '#0e1b30', brass = '#e2bd7b', bone = '#efe7d5';
const view = EditorView.theme({
  '&': { color: bone, backgroundColor: ground },
  '.cm-content': { caretColor: brass },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: brass },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: '#3a4a63' },
  '.cm-activeLine': { backgroundColor: '#12213a' },
  '.cm-gutters': { backgroundColor: gutter, color: '#7f8ea3', border: 'none', borderInlineEnd: '1px solid #26364f' },
  '.cm-activeLineGutter': { backgroundColor: '#12213a', color: brass },
  '.cm-foldPlaceholder': { backgroundColor: '#1a2d49', border: 'none', color: '#a3b1c4' },
  '.cm-tooltip': { backgroundColor: '#12223a', border: '1px solid #6b5a3a', color: bone },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: '#26364f', color: bone },
  '.cm-matchingBracket': { backgroundColor: '#3a4a63', outline: '1px solid #c9a05a' },
}, { dark: true });

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.modifier], color: '#e2bd7b' },
  { tag: [t.typeName, t.className, t.standard(t.name)], color: '#7fc7b8' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#8fb8ee' },
  { tag: [t.string, t.special(t.string)], color: '#e58f6e' },
  { tag: [t.number, t.bool, t.constant(t.name), t.atom], color: '#f0a35c' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#7f8ea3', fontStyle: 'italic' },
  { tag: [t.operator, t.punctuation, t.bracket], color: '#a3b1c4' },
  { tag: [t.processingInstruction, t.macroName], color: '#c9a0dc' },
]);

export const waslEditor = [view, syntaxHighlighting(highlight)];
