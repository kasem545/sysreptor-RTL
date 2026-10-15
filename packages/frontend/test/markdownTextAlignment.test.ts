import { describe, test, expect, afterEach } from 'vitest'
import {
  EditorState, EditorSelection, EditorView,
  markdown,
  setTextAlignment, getActiveTextAlignment,
  textAlignmentDecorations,
} from '@sysreptor/markdown/editor';
import { renderMarkdownToHtml } from '@sysreptor/markdown';

function createEditorState(textWithSelection: string, cursorMarker: string = '|') {
  const parts = textWithSelection.split(cursorMarker);
  let selectionRange;
  if (parts.length === 2) {
    selectionRange = EditorSelection.cursor(parts[0]!.length)
  } else if (parts.length === 3) {
    selectionRange = EditorSelection.range(parts[0]!.length, parts[0]!.length + parts[1]!.length)
  } else {
    throw new Error('Invalid number of cursors in text');
  }

  return EditorState.create({
    doc: parts.join(''),
    selection: EditorSelection.create([selectionRange]),
    extensions: [
      markdown(),
    ]
  })
}

describe('markdown paragraph attributes', () => {
  test('attributes at the end of a paragraph apply to the paragraph', () => {
    const html = renderMarkdownToHtml({ text: 'text {style="text-align: center"}' });
    expect(html).toContain('<p style="text-align: center">');
  });

  test('attributes after inline elements with space apply to the paragraph', () => {
    const html = renderMarkdownToHtml({ text: '**bold** {.test-class}' });
    expect(html).toContain('<p class="test-class"><strong>');
  });

  test('attributes directly after inline elements still apply to the element', () => {
    const html = renderMarkdownToHtml({ text: '**bold**{.test-class}' });
    expect(html).toContain('<strong class="test-class">');
  });

  test('attributes in the middle of a paragraph remain literal text', () => {
    const html = renderMarkdownToHtml({ text: 'text {.test} more' });
    expect(html).toContain('&#x7B;.test&#x7D;');
  });
});

describe('setTextAlignment', () => {
  function align(before: string, after: string, alignment: 'left'|'center'|'right', cursorMarker: string = '|') {
    test(`${before} -> ${after}`, () => {
      const view = new EditorView({ state: createEditorState(before, cursorMarker) });
      setTextAlignment(view, alignment);
      const stateAfterActual = view.state;

      const stateAfterExpected = createEditorState(after, cursorMarker);
      expect(stateAfterActual.doc.toString()).toBe(stateAfterExpected.doc.toString());
    });
  }

  for (const alignment of ['left', 'center', 'right'] as const) {
    align(`some te|xt`, `some text| {style="text-align: ${alignment}"}`, alignment);
  }

  test('toggles off when the same alignment is already set', () => {
    const view = new EditorView({ state: createEditorState('some te|xt {style="text-align: center"}') });
    setTextAlignment(view, 'center');
    expect(view.state.doc.toString()).toBe('some text');
  });

  test('replaces a different alignment', () => {
    const view = new EditorView({ state: createEditorState('some te|xt {style="text-align: center"}') });
    setTextAlignment(view, 'right');
    expect(view.state.doc.toString()).toBe('some text {style="text-align: right"}');
  });

  test('keeps other attributes when toggling off', () => {
    const view = new EditorView({ state: createEditorState('some te|xt {#some-id style="text-align: center"}') });
    setTextAlignment(view, 'center');
    expect(view.state.doc.toString()).toBe('some text {#some-id}');
  });

  test('appends to existing attributes without alignment', () => {
    const view = new EditorView({ state: createEditorState('some te|xt {#some-id}') });
    setTextAlignment(view, 'center');
    expect(view.state.doc.toString()).toBe('some text {#some-id style="text-align: center"}');
  });

  test('applies to the end of multi-line blocks', () => {
    const view = new EditorView({ state: createEditorState('first line\nsecond li|ne\nthird line') });
    setTextAlignment(view, 'center');
    expect(view.state.doc.toString()).toBe('first line\nsecond line\nthird line {style="text-align: center"}');
  });

  test('applies to headings', () => {
    const view = new EditorView({ state: createEditorState('# Head|line') });
    setTextAlignment(view, 'center');
    expect(view.state.doc.toString()).toBe('# Headline {style="text-align: center"}');
  });

  test('does not modify code blocks', () => {
    const doc = '```\ncode line\n```';
    const view = new EditorView({ state: createEditorState('```\ncode li|ne\n```') });
    setTextAlignment(view, 'center');
    expect(view.state.doc.toString()).toBe(doc);
  });

  test('does not modify tables', () => {
    const doc = '| a | b |\n| --- | --- |\n| c | d |';
    const view = new EditorView({ state: createEditorState('| a | b |\n| --- | --- |\n| c | d⟂ |', '⟂') });
    setTextAlignment(view, 'center');
    expect(view.state.doc.toString()).toBe(doc);
  });
});

describe('getActiveTextAlignment', () => {
  function active(doc: string): string|null {
    return getActiveTextAlignment(createEditorState(doc));
  }

  test('detects alignment of the current block', () => {
    expect(active('some te|xt {style="text-align: center"}')).toBe('center');
    expect(active('some te|xt {style="text-align: right"}')).toBe('right');
    expect(active('# Head|line {style="text-align: left"}')).toBe('left');
  });

  test('detects alignment at the end of multi-line blocks', () => {
    expect(active('first line\nsecond li|ne\nthird line {style="text-align: center"}')).toBe('center');
  });

  test('returns null without alignment', () => {
    expect(active('some te|xt')).toBeNull();
    expect(active('some te|xt {#some-id}')).toBeNull();
  });
});

describe('textAlignmentDecorations', () => {
  const alignPlugin = textAlignmentDecorations[0] as any;

  function createAlignView(doc: string, cursorPos: number = 0) {
    const view = new EditorView({
      parent: document.body,
      state: EditorState.create({
        doc,
        selection: EditorSelection.cursor(cursorPos),
        extensions: [markdown(), textAlignmentDecorations],
      }),
    });
    views.push(view);
    return view;
  }
  const views: EditorView[] = [];
  afterEach(() => {
    for (const view of views.splice(0)) {
      view.destroy();
    }
  });

  function decorationList(view: EditorView): {from: number, to: number, cls?: string, hidden: boolean}[] {
    const plugin = view.plugin(alignPlugin)!;
    const out: {from: number, to: number, cls?: string, hidden: boolean}[] = [];
    const it = plugin.decorations.iter();
    while (it.value) {
      out.push({ from: it.from, to: it.to, cls: it.value.spec.class, hidden: !it.value.spec.class });
      it.next();
    }
    return out;
  }

  test('applies alignment line class and hides the attribute syntax when the cursor is elsewhere', () => {
    const doc = 'other paragraph\n\ntext {style="text-align: center"}';
    const view = createAlignView(doc, 0);  // Cursor on first line
    const decorations = decorationList(view);
    expect(decorations.some(d => d.cls === 'cm-text-align-center' && d.from === doc.indexOf('text'))).toBe(true);
    const hidden = decorations.find(d => d.hidden)!;
    expect(hidden).toBeTruthy();
    expect(doc.slice(hidden.from, hidden.to)).toBe(' {style="text-align: center"}');
  });

  test('shows the attribute syntax when the editor is focused on the same line', () => {
    const doc = 'text {style="text-align: center"}';
    const view = createAlignView(doc, 0);  // Cursor on the line
    view.focus();
    view.dispatch({ selection: { anchor: 1 } });  // Simulate clicking into the line
    const decorations = decorationList(view);
    expect(decorations.some(d => d.hidden)).toBe(false);
    expect(decorations.some(d => d.cls === 'cm-text-align-center')).toBe(true);
  });

  test('applies the alignment class to all lines of a multi-line block', () => {
    const doc = 'first line\nsecond line\nthird line {style="text-align: right"}';
    const view = createAlignView(doc, 0);
    const decorations = decorationList(view);
    const lineClasses = decorations.filter(d => d.cls === 'cm-text-align-right');
    expect(lineClasses.length).toBe(3);
  });

  test('does not hide other trailing attributes', () => {
    const doc = 'other paragraph\n\ntext {#some-id style="text-align: center"}';
    const view = createAlignView(doc, 0);
    const decorations = decorationList(view);
    expect(decorations.some(d => d.hidden)).toBe(false);
  });

  test('updates visibility when the selection moves', () => {
    const doc = 'other paragraph\n\ntext {style="text-align: center"}';
    const view = createAlignView(doc, 0);
    expect(decorationList(view).some(d => d.hidden)).toBe(true);
    view.focus();
    view.dispatch({ selection: { anchor: doc.indexOf('text') + 2 } });
    expect(decorationList(view).some(d => d.hidden)).toBe(false);
  });
});
