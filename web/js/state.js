const _username = sessionStorage.getItem('ail_username') || 'default';
const STORAGE_KEY = _username + '_ail_checked_prereqs';

let checkedIds = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));

export function isChecked(id) {
  return checkedIds.has(id);
}

export function togglePrereq(id) {
  if (checkedIds.has(id)) checkedIds.delete(id);
  else checkedIds.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedIds]));
}

export function getCheckedIds() {
  return checkedIds;
}

// 'ready' | 'not-ready'
export function useCaseReadiness(requiredIds) {
  return requiredIds.every(id => checkedIds.has(id)) ? 'ready' : 'not-ready';
}

// 'ready' | 'partial' | 'not-ready'
// Green: at least one use case is fully ready
// Orange: no use case fully ready, but some relevant prereqs are checked
// Red: no relevant prereqs checked at all
export function dimensionStatus(dimension) {
  const statuses = dimension.useCases.map(uc => useCaseReadiness(uc.requiredPrereqIds));
  if (statuses.some(s => s === 'ready')) return 'ready';

  const allReqIds = new Set(dimension.useCases.flatMap(uc => uc.requiredPrereqIds));
  const hasAny = [...allReqIds].some(id => checkedIds.has(id));
  return hasAny ? 'partial' : 'not-ready';
}
