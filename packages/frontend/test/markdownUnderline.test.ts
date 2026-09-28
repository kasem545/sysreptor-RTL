import { describe, test, expect } from 'vitest'
import {
  EditorState, EditorSelection, EditorView,
  markdown,
  underlineDecorationsPlugin,
} from '@sysreptor/markdown/editor';

function createEditorView(textWithSelection: string, cursorMarker: string = '|') {
  const parts = textWithSelection.split(cursorMarker);
  let selectionRange;
  if (parts.length === 2) {
    selectionRange = EditorSelection.cursor(parts[0]!.length)
  } else if (parts.length === 3) {
    selectionRange = EditorSelection.range(parts[0]!.length, parts[1]!.length + parts[0]!.length)
  } else {
    throw new Error('Invalid number of cursors in text');
  }

  return new EditorView({
    state: EditorState.create({
      doc: parts.join(''),
      selection: EditorSelection.create([selectionRange]),
      extensions: [markdown(), underlineDecorationsPlugin],
    }),
  });
}

function decorationsOf(view: EditorView) {
  const plugin = view.plugin(underlineDecorationsPlugin)!;
  const out: { spec: any, from: number, to: number }[] = [];
  const cursor = plugin.decorations.iter();
  while (cursor.value) {
    out.push({ spec: cursor.value.spec, from: cursor.from, to: cursor.to });
    cursor.next();
  }
  return out;
}

describe('underlineDecorations', () => {
  test('hides tags and underlines the content', () => {
    const view = createEditorView('a <u>text</u> b\nother line|');
    const decos = decorationsOf(view);
    expect(decos.map(d => [d.from, d.to, d.spec.class ?? null])).toEqual([
      [2, 5, null],
      [5, 9, 'cm-underline'],
      [9, 13, null],
    ]);
  });

  test('keeps tags hidden when the editor is not focused, even with the selection on the same line', () => {
    const view = createEditorView('other line\na <u>te|xt</u> b');
    const decos = decorationsOf(view);
    expect(decos.filter(d => !d.spec.class)).toHaveLength(2);
  });

  test('does not decorate unbalanced tags', () => {
    const view = createEditorView('a <u>text b\nother line|');
    const decos = decorationsOf(view);
    expect(decos).toEqual([]);
  });

  test('underlines only the region content, not surrounding text', () => {
    const view = createEditorView('before <u>in</u> after\nx|');
    const decos = decorationsOf(view);
    const mark = decos.find(d => d.spec.class === 'cm-underline')!;
    expect([mark.from, mark.to]).toEqual([10, 12]);
  });

  test('handles adjacent regions', () => {
    const view = createEditorView('<u>a</u><u>b</u>\n|');
    const decos = decorationsOf(view);
    const marks = decos.filter(d => d.spec.class === 'cm-underline');
    expect(marks.map(m => [m.from, m.to])).toEqual([[3, 4], [11, 12]]);
    expect(decos.filter(d => !d.spec.class)).toHaveLength(4);
  });
});
