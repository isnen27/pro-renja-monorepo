/**
 * Script ini dijalankan sebelum React hydration untuk menghindari
 * "flash of wrong theme" (FOWT). Diinjeksikan langsung ke <head>.
 */
export default function ThemeInitScript() {
  const script = `
    (function() {
      try {
        var saved = localStorage.getItem('aksi-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = saved || (prefersDark ? 'dark' : 'light');
        var html = document.documentElement;
        html.classList.remove('light', 'dark');
        html.classList.add(theme);
      } catch(e) {
        document.documentElement.classList.add('light');
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
