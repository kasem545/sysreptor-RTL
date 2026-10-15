import { describe, test, expect } from 'vitest'
import { renderMarkdownToHtml, detectTextDirection } from '@sysreptor/markdown';
import { isRtlLanguage } from '~/utils/language';

describe('detectTextDirection', () => {
  test.each([
    ['Hello world', 'ltr'],
    ['Übermäßig ätzend', 'ltr'],
    ['Καλημέρα', 'ltr'],
    ['Привет', 'ltr'],
    ['مرحبا بالعالم', 'rtl'],
    ['שלום עולם', 'rtl'],
    ['123 !?.', null],
    ['', null],
  ])('detects direction of %j as %j', (text, expected) => {
    expect(detectTextDirection(text)).toEqual(expected);
  });

  test('first strong character wins', () => {
    expect(detectTextDirection('مرحبا Hello')).toEqual('rtl');
    expect(detectTextDirection('Hello مرحبا')).toEqual('ltr');
  });
});

describe('renderMarkdownToHtml direction', () => {
  test('RTL text in LTR document gets dir=rtl', () => {
    const html = renderMarkdownToHtml({ text: 'نص بالعربية' });
    expect(html).toContain('<p dir="rtl">');
  });

  test('LTR text in LTR document gets no dir', () => {
    const html = renderMarkdownToHtml({ text: 'English text' });
    expect(html).toContain('<p>');
    expect(html).not.toContain('dir=');
  });

  test('RTL document base direction', () => {
    const html = renderMarkdownToHtml({ text: 'نص بالعربية\n\nEnglish text', baseDirection: 'rtl' });
    expect(html).toContain('<p dir="ltr">');
    expect(html).not.toContain('<p dir="rtl">');
  });

  test('headings and list items get direction', () => {
    const html = renderMarkdownToHtml({ text: '# عنوان\n- عنصر' });
    expect(html).toContain('<h1 dir="rtl">');
    expect(html).toContain('<li dir="rtl">');
  });

  test('code blocks stay LTR in RTL documents', () => {
    const html = renderMarkdownToHtml({ text: '```\ncode\n```', baseDirection: 'rtl' });
    expect(html).toContain('<pre class="code-block" dir="ltr">');
  });

  test('code blocks get no explicit direction in LTR documents', () => {
    const html = renderMarkdownToHtml({ text: '```\ncode\n```' });
    expect(html).not.toContain('dir=');
  });

  test('inline code does not affect direction detection', () => {
    const html = renderMarkdownToHtml({ text: '`ls -la` ثم نص' });
    expect(html).toContain('<p dir="rtl">');
  });

  test('explicitly set direction is respected', () => {
    const html = renderMarkdownToHtml({ text: '<p dir="rtl">English text</p>' });
    expect(html).toContain('<p dir="rtl">');
  });

  test('text without strong directional characters inherits direction', () => {
    const html = renderMarkdownToHtml({ text: '1234' });
    expect(html).toContain('<p>');
  });

  test('table cells get direction', () => {
    const html = renderMarkdownToHtml({ text: '| a | b |\n| - | - |\n| نص | x |' });
    expect(html).toContain('<td dir="rtl">');
  });
});

describe('isRtlLanguage', () => {
  test.each([
    ['ar', true],
    ['he', true],
    ['ar-SA', true],
    ['he-IL', true],
    ['en-US', false],
    ['de-DE', false],
    [null, false],
    [undefined, false],
    ['', false],
  ])('%j -> %j', (lang, expected) => {
    expect(isRtlLanguage(lang)).toEqual(expected);
  });
});
