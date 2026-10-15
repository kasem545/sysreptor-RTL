import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

import { getUnderlineRegions } from "./commands";

function getUnderlineTagDecorations(view: EditorView): DecorationSet {
  const state = view.state;
  const tree = syntaxTree(state);
  const decorations: { from: number, to: number, deco: Decoration }[] = [];

  for (const { from, to } of view.visibleRanges) {
    for (const region of getUnderlineRegions(tree, state.doc, { from, to })) {
      if (region.open.to < region.close.from) {
        decorations.push({ from: region.open.to, to: region.close.from, deco: Decoration.mark({ class: 'cm-underline' }) });
      }
      for (const tag of [region.open, region.close]) {
        const selectionOnLine = view.hasFocus && state.selection.ranges.some(r => r.from <= tag.to && r.to >= state.doc.lineAt(tag.from).from);
        if (!selectionOnLine) {
          decorations.push({ from: tag.from, to: tag.to, deco: Decoration.replace({}) });
        }
      }
    }
  }

  decorations.sort((a, b) => a.from - b.from || a.to - b.to);
  const builder = new RangeSetBuilder<Decoration>();
  for (const d of decorations) {
    builder.add(d.from, d.to, d.deco);
  }
  return builder.finish();
}

export const underlineDecorationsPlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet = Decoration.none;

  constructor(view: EditorView) {
    this.decorations = getUnderlineTagDecorations(view);
  }

  update(viewUpdate: ViewUpdate) {
    this.decorations = getUnderlineTagDecorations(viewUpdate.view);
  }
}, { decorations: v => v.decorations });

export const underlineDecorations = [
  underlineDecorationsPlugin,
  EditorView.baseTheme({
    '.cm-underline': { textDecoration: 'underline' },
  }),
];
