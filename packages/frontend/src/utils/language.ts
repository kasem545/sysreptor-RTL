const RTL_LANGUAGES = new Set(['ar', 'he']);

/**
 * Check if a language is written right-to-left (e.g. Arabic, Hebrew).
 * Mirrors `sysreptor.utils.language.Language.is_rtl` on the API side.
 */
export function isRtlLanguage(lang?: string | null): boolean {
  if (!lang) {
    return false;
  }
  return RTL_LANGUAGES.has(lang.split('-', 1)[0]!.toLowerCase());
}
