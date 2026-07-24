const EXCERPT_MAX_LENGTH = 280;
const ELLIPSIS = '…';

/** Strips common markdown syntax to derive a plain-text preview for listings. */
export function deriveExcerpt(markdown: string, maxLength = EXCERPT_MAX_LENGTH): string | null {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) return null;
  if (plainText.length <= maxLength) return plainText;

  // Reserve room for the ellipsis so the result never exceeds the column width.
  const truncated = plainText.slice(0, maxLength - ELLIPSIS.length);
  const lastSpace = truncated.lastIndexOf(' ');
  const clipped = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return `${clipped}${ELLIPSIS}`;
}
