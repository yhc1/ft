export function getLang() {
  const params = new URLSearchParams(window.location.search);
  return params.get('lang') === 'zh' ? 'zh' : 'en';
}

export function t(field) {
  if (!field || typeof field === 'string') return field || '';
  return field[getLang()] || field['en'] || '';
}

export function setLang(lang) {
  const params = new URLSearchParams(window.location.search);
  params.set('lang', lang);
  window.location.replace(`?${params.toString()}${window.location.hash}`);
}
