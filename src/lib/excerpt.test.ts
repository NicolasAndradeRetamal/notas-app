import { describe, expect, it } from 'vitest';
import { deriveExcerpt } from '@/lib/excerpt';

describe('deriveExcerpt', () => {
  it('strips markdown syntax down to plain text', () => {
    const markdown =
      '# Título\n\nTexto con **negrita**, *cursiva* y [un enlace](https://example.com).';
    expect(deriveExcerpt(markdown)).toBe('Título Texto con negrita, cursiva y un enlace.');
  });

  it('removes code blocks and inline code', () => {
    const markdown = 'Antes\n\n```ts\nconst x = 1;\n```\n\nDespués con `código`.';
    expect(deriveExcerpt(markdown)).toBe('Antes Después con .');
  });

  it('strips list and blockquote markers', () => {
    const markdown = '- primero\n- segundo\n\n> una cita\n\n1. uno\n2. dos';
    expect(deriveExcerpt(markdown)).toBe('primero segundo una cita uno dos');
  });

  it('returns null for empty or whitespace-only content', () => {
    expect(deriveExcerpt('')).toBeNull();
    expect(deriveExcerpt('   \n\n  ')).toBeNull();
  });

  it('truncates long content at a word boundary and appends an ellipsis', () => {
    const longText = 'palabra '.repeat(60).trim();
    const excerpt = deriveExcerpt(longText, 50);

    expect(excerpt).not.toBeNull();
    expect(excerpt!.length).toBeLessThanOrEqual(51);
    expect(excerpt!.endsWith('…')).toBe(true);
    expect(excerpt!.includes('palabr…')).toBe(false);
  });

  it('returns the text unchanged when shorter than the max length', () => {
    expect(deriveExcerpt('Nota corta.')).toBe('Nota corta.');
  });
});
