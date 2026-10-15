import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

// Trailing markdown attributes that only set text alignment, e.g. ` {style="text-align: center"}`
const trailingTextAlignRegex = / *\{style="text-align: (left|center|right|justify)"}$/;

type TextAlignBlock = {
  blockFrom: number,
  blockTo: number,
  attrFrom: number,
  attrTo: number,
  alignment: string,
};

function getTextAlignBlocks(view: EditorView): TextAlignBlock[] {
  const doc = view.state.doc;
  const blocks: TextAlignBlock[] = [];
  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = doc.lineAt(pos);
      const m = trailingTextAlignRegex.exec(line.text);
      if (m) {
        // Expand to the whole block (separated by blank lines): the alignment applies to all lines of the block
        let firstLine = line;
        while (firstLine.number > 1 && doc.lineAt(firstLine.from - 1).text.trim() !== '') {
          firstLine = doc.lineAt(firstLine.from - 1);
        }
        blocks.push({
          blockFrom: firstLine.from,
          blockTo: line.to,
          attrFrom: line.from + m.index!,
          attrTo: line.to,
          alignment: m[1]!,
        });
      }
      if (line.to >= to) {
        break;
      }
      pos = line.to + 1;
    }
  }
  return blocks;
}

function getTextAlignDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc;
  const blocks = getTextAlignBlocks(view);

  // Apply the text alignment to all lines of the blocks
  for (const block of blocks) {
    let pos = block.blockFrom;
    while (pos <= block.blockTo) {
      const line = doc.lineAt(pos);
      builder.add(line.from, line.from, Decoration.line({ class: `cm-text-align-${block.alignment}` }));
      if (line.to >= block.blockTo) {
        break;
      }
      pos = line.to + 1;
    }
  }

  // Hide the attribute syntax, unless the editor is focused with the selection on the same line (to keep it editable)
  for (const block of blocks) {
    const selectionOnLine = view.hasFocus && view.state.selection.ranges.some(r => r.from <= block.attrTo && r.to >= doc.lineAt(block.attrFrom).from);
    if (!selectionOnLine) {
      builder.add(block.attrFrom, block.attrTo, Decoration.replace({}));
    }
  }

  return builder.finish();
}

export const textAlignmentDecorations = [
  ViewPlugin.fromClass(class {
    decorations: DecorationSet = Decoration.none;

    constructor(view: EditorView) {
      this.decorations = getTextAlignDecorations(view);
    }

    update(viewUpdate: ViewUpdate) {
      this.decorations = getTextAlignDecorations(viewUpdate.view);
    }
  }, { decorations: v => v.decorations }),
  EditorView.baseTheme({
    '.cm-line.cm-text-align-left': { textAlign: 'left' },
    '.cm-line.cm-text-align-center': { textAlign: 'center' },
    '.cm-line.cm-text-align-right': { textAlign: 'right' },
    '.cm-line.cm-text-align-justify': { textAlign: 'justify' },
  }),
];
