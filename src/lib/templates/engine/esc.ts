/** HTML-escape a string for safe insertion into innerHTML */
export function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Alias for esc (some templates use escH naming) */
export const escH = esc;

/** Escape for CSS style attribute contexts — strips dangerous patterns */
export function escAttr(s: string | number | null | undefined): string {
  return esc(s).replace(/[;)]/g, '').replace(/url\(/gi, '');
}
