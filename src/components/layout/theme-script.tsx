// Inline, blocking script executed before first paint to avoid a flash of the wrong theme.
const BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme') || 'system';
    var resolved = stored === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : stored;
    document.documentElement.dataset.theme = resolved;
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }} />;
}
