import { describe, expect, it } from 'vitest';
import { sanitizeHighlight } from '@/lib/markdown';

describe('sanitizeHighlight', () => {
  it('preserves <b> tags inserted by ts_headline', () => {
    expect(sanitizeHighlight('esto es una <b>nota</b> de prueba')).toBe('esto es una <b>nota</b> de prueba');
  });

  it('escapes HTML that comes from the note content itself', () => {
    expect(sanitizeHighlight('<script>alert(1)</script> <b>nota</b>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt; <b>nota</b>',
    );
  });

  it('escapes ampersands and quotes outside the highlight tags', () => {
    expect(sanitizeHighlight('Tom & Jerry "aventuras"')).toBe('Tom &amp; Jerry &quot;aventuras&quot;');
  });

  it('handles multiple highlighted fragments', () => {
    expect(sanitizeHighlight('<b>uno</b> y <b>dos</b>')).toBe('<b>uno</b> y <b>dos</b>');
  });
});
