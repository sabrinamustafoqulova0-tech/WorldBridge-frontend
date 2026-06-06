import { Lang } from '../store/langStore';

// Map frontend lang codes to DB suffix (backend stores tg not tj)
const LANG_TO_SUFFIX: Record<string, string> = { ru: 'ru', en: 'en', tj: 'tg' };

export function getLocalizedField(obj: any, fieldName: string, lang: Lang): string {
  if (!obj) return "";
  const suffix = LANG_TO_SUFFIX[lang] ?? lang;
  if (suffix !== 'ru' && obj[`${fieldName}_${suffix}`]) {
    return obj[`${fieldName}_${suffix}`];
  }
  return obj[`${fieldName}_ru`] || obj[fieldName] || '';
}
