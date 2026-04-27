const _username = sessionStorage.getItem('ail_username') || 'default';
const STORAGE_KEY = _username + '_ail_checked_prereqs';

let checkedIds = new Set();

export async function init() {
  const serverIds = await fetchFromServer();
  if (serverIds !== null) {
    checkedIds = new Set(serverIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serverIds));
  } else {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    checkedIds = new Set(local);
    if (local.length > 0) {
      await saveToServer(local);
    }
  }
}

async function fetchFromServer() {
  try {
    const res = await fetch(`/api/state?username=${encodeURIComponent(_username)}`);
    const data = await res.json();
    return data.checkedIds ?? null;
  } catch {
    return null;
  }
}

async function saveToServer(ids) {
  try {
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: _username, checkedIds: ids }),
    });
  } catch {
    // silent fail — local state still works
  }
}

export function isChecked(id) { return checkedIds.has(id); }

export async function togglePrereq(id) {
  if (checkedIds.has(id)) checkedIds.delete(id);
  else checkedIds.add(id);
  const arr = [...checkedIds];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  await saveToServer(arr);
}

export function getCheckedIds() { return checkedIds; }

export function useCaseReadiness(requiredIds) {
  return requiredIds.every(id => checkedIds.has(id)) ? 'ready' : 'not-ready';
}

export function dimensionStatus(dimension) {
  const statuses = dimension.useCases.map(uc => useCaseReadiness(uc.requiredPrereqIds));
  if (statuses.some(s => s === 'ready')) return 'ready';
  const allReqIds = new Set(dimension.useCases.flatMap(uc => uc.requiredPrereqIds));
  const hasAny = [...allReqIds].some(id => checkedIds.has(id));
  return hasAny ? 'partial' : 'not-ready';
}
