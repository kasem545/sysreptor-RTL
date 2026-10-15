import { visit } from 'unist-util-visit';

// Unicode ranges of characters with strong right-to-left directionality (bidi classes R/AL)
const RTL_RANGES = [
  [0x0590, 0x05FF], // Hebrew
  [0x0600, 0x06FF], // Arabic
  [0x0700, 0x074F], // Syriac
  [0x0750, 0x077F], // Arabic Supplement
  [0x0780, 0x07BF], // Thaana
  [0x07C0, 0x07FF], // Nko
  [0x0800, 0x083E], // Samaritan
  [0x0840, 0x085F], // Mandaic
  [0x08A0, 0x08FF], // Arabic Extended-A/B
  [0xFB1D, 0xFB4F], // Hebrew Presentation Forms
  [0xFB50, 0xFDFF], // Arabic Presentation Forms-A
  [0xFE70, 0xFEFF], // Arabic Presentation Forms-B
];

// Unicode ranges of characters with strong left-to-right directionality (bidi class L)
const LTR_RANGES = [
  [0x0041, 0x005A], // A-Z
  [0x0061, 0x007A], // a-z
  [0x00C0, 0x00D6], // Latin-1 (except multiplication sign)
  [0x00D8, 0x00F6], // Latin-1 (except division sign)
  [0x00F8, 0x02B8], // Latin Extended, IPA extensions, spacing modifier letters
  [0x0370, 0x03FF], // Greek
  [0x0400, 0x052F], // Cyrillic
  [0x1E00, 0x1FFF], // Latin Extended Additional, Greek Extended
  [0x2C60, 0x2C7F], // Latin Extended-C
];

function charInRange(codepoint, ranges) {
  return ranges.some(([start, end]) => codepoint >= start && codepoint <= end);
}

/**
 * Determine the text direction (bidi paragraph level) from the first strong directional character,
 * like the HTML "dir=auto" algorithm.
 * @param {string} text
 * @returns {'ltr'|'rtl'|null} null if no strong directional character was found
 */
export function detectTextDirection(text) {
  for (const char of (text || '')) {
    const codepoint = char.codePointAt(0);
    if (charInRange(codepoint, RTL_RANGES)) {
      return 'rtl';
    } else if (charInRange(codepoint, LTR_RANGES)) {
      return 'ltr';
    }
  }
  return null;
}

// Block level elements that get their own text direction
const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'dd', 'dt', 'figcaption', 'caption', 'td', 'th']);
// Elements with left-to-right content, excluded from direction detection of surrounding text
const LTR_INLINE_TAGS = new Set(['code', 'pre', 'kbd', 'samp', 'svg']);

function collectText(node, texts) {
  if (node.type === 'text') {
    texts.push(node.value);
  } else if (node.type === 'element') {
    if (LTR_INLINE_TAGS.has(node.tagName)) {
      return;
    }
    for (const child of node.children || []) {
      collectText(child, texts);
    }
  }
}

/**
 * Set the dir attribute on block level elements whose direction (computed from the first strong
 * directional character of their content, like the HTML "dir=auto" algorithm) differs from the
 * base direction of the document. Allows rendering right-to-left text (e.g. Arabic, Hebrew)
 * correctly in LTR documents and vice versa, in both browsers and PDF rendering.
 * @param {{baseDirection?: 'ltr'|'rtl'}} options
 */
export function rehypeTextDirection({ baseDirection = 'ltr' } = {}) {
  return tree => {
    visit(tree, 'element', node => {
      if (node.properties.dir) {
        // Respect explicitly set direction (e.g. via markdown attrs syntax)
        return;
      }

      if (node.tagName === 'pre') {
        // Code blocks are always written left-to-right, even in RTL documents
        if (baseDirection === 'rtl') {
          node.properties.dir = 'ltr';
        }
        return;
      }
      if (BLOCK_TAGS.has(node.tagName)) {
        const texts = [];
        collectText(node, texts);
        const direction = detectTextDirection(texts.join(''));
        if (direction && direction !== baseDirection) {
          node.properties.dir = direction;
        }
      }
    });
  }
}
