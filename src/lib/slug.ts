const DEFAULT_MAX_LENGTH = 96;
const FALLBACK_SLUG = 'item';
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(input: string, maxLength = DEFAULT_MAX_LENGTH): string {
  const normalized = input
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');

  return normalized || FALLBACK_SLUG;
}
