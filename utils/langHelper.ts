import { Lang } from '../store/langStore';

export function getLocalizedField(obj: any, fieldName: string, lang: Lang): string {
  if (!obj) return "";

  // Try the exact requested language first
  if (lang !== 'ru' && obj[`${fieldName}_${lang}`]) {
    return obj[`${fieldName}_${lang}`];
  }

  // Fallback chain: _ru → base field
  return obj[`${fieldName}_ru`] || obj[fieldName] || '';
}
