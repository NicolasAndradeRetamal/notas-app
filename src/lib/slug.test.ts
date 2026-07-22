import { describe, expect, it } from 'vitest';
import { slugify } from '@/lib/slug';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Trabajo Diario')).toBe('trabajo-diario');
  });

  it('strips accents and special characters', () => {
    expect(slugify('Café con Leche & Azúcar!')).toBe('cafe-con-leche-azucar');
  });

  it('collapses repeated separators and trims leading/trailing hyphens', () => {
    expect(slugify('  Múltiples   Espacios  ')).toBe('multiples-espacios');
  });

  it('truncates to the requested max length without a trailing hyphen', () => {
    const result = slugify('palabra-larga-que-sobrepasa-el-limite-de-caracteres', 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result.endsWith('-')).toBe(false);
  });

  it('falls back to a default slug when nothing alphanumeric remains', () => {
    expect(slugify('!!!')).toBe('item');
  });
});
