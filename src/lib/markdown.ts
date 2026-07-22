import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

// Shared remark/rehype pipeline for both the read view and the live preview,
// so both render markdown identically. rehype-sanitize uses its default
// allowlist schema, which strips <script>, on* handlers and javascript: URLs.
export const markdownRemarkPlugins = [remarkGfm];
export const markdownRehypePlugins = [rehypeSanitize];

const HIGHLIGHT_TAG = /(<\/?b>)/g;

/**
 * ts_headline() wraps matches in literal <b> tags but does not escape the
 * surrounding note text, so this escapes everything except those tags.
 */
export function sanitizeHighlight(highlight: string): string {
  return highlight
    .split(HIGHLIGHT_TAG)
    .map((part) => (part === '<b>' || part === '</b>' ? part : escapeHtml(part)))
    .join('');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
