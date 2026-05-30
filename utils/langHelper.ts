import { Lang } from '../store/langStore';

export function getLocalizedField(obj: any, fieldName: string, lang: Lang): string {
  if (!obj) return "";
  
  if (lang === 'en' && obj[`${fieldName}_en`]) {
    return obj[`${fieldName}_en`];
  }
  
  // Default to ru for both 'ru' and 'tg', since we don't have 'tg' in DB
  return obj[`${fieldName}_ru`] || obj[fieldName] || '';
}
