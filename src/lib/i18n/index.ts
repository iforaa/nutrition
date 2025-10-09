import { translations } from './translations';

// Simple translation function
export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation missing for key: ${key}`);
      return key; // Return the key if translation is missing
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Export translations for direct access
export { translations };