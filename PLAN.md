# State Sync 實作計劃（tmp）

## 目標
把勾選狀態從 localStorage 改存到 Upstash Redis，讓同帳號跨裝置共享。

## Redis 連線資訊（來自 .env.local）
- URL key: `KV_REST_API_URL`
- Token key: `KV_REST_API_TOKEN`
- Redis key 格式: `checked:{username}`（例如 `checked:admin`）

## Upstash REST API 用法（不需要 SDK）
```
GET  {KV_REST_API_URL}/get/checked:admin
     Header: Authorization: Bearer {KV_REST_API_TOKEN}
     Response: {"result": "[\"prereq-001\", \"prereq-002\"]"} 或 {"result": null}

POST {KV_REST_API_URL}/set/checked:admin
     Header: Authorization: Bearer {KV_REST_API_TOKEN}
     Header: Content-Type: application/json
     Body: ["prereq-001", "prereq-002"]
     Response: {"result": "OK"}
```

---

## Step 1：新增 `api/state.js`

```js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  if (!username) return json(400, { error: 'Missing username' });

  const key = `checked:${username}`;
  const result = await redisGet(key);
  const checkedIds = result ? JSON.parse(result) : [];
  return json(200, { checkedIds });
}

export async function POST(request) {
  const { username, checkedIds } = await request.json();
  if (!username) return json(400, { error: 'Missing username' });

  const key = `checked:${username}`;
  await redisSet(key, JSON.stringify(checkedIds));
  return json(200, { ok: true });
}

async function redisGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
  const data = await res.json();
  return data.result; // string or null
}

async function redisSet(key, value) {
  await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: value, // stringified JSON array
  });
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## Step 2：修改 `server.py`

在 `Handler` 的 `do_GET` 和 `do_POST` 加入 `/api/state` 處理，用本地 `state.json` 模擬 Redis。

```python
import json
from pathlib import Path

STATE_FILE = Path(__file__).parent / 'state.json'

def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}

def save_state(state):
    STATE_FILE.write_text(json.dumps(state))
```

- `GET /api/state?username=xxx` → 讀 state.json，回傳 `{"checkedIds": [...]}`
- `POST /api/state` body `{username, checkedIds}` → 寫入 state.json

`state.json` 加入 `.gitignore`。

---

## Step 3：修改 `web/js/state.js`

### 完整替換邏輯

```js
const _username = sessionStorage.getItem('ail_username') || 'default';
const STORAGE_KEY = _username + '_ail_checked_prereqs';

let checkedIds = new Set();

// 呼叫後才能使用其他 function
export async function init() {
  const serverIds = await fetchFromServer();
  if (serverIds !== null) {
    // server 有資料 → 以 server 為主
    checkedIds = new Set(serverIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serverIds));
  } else {
    // server 沒資料 → 嘗試從 localStorage 遷移
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    checkedIds = new Set(local);
    if (local.length > 0) {
      await saveToServer(local); // 自動 migration
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
```

---

## Step 4：修改 `web/js/app.js`

找到頁面初始化的地方，在 render 前加入：

```js
import { init } from './state.js';

// 在 DOMContentLoaded 或 init 流程中：
await init();
// 然後才 render
```

確認 `togglePrereq` 的呼叫端要改成 `await togglePrereq(id)`（如果原本是 sync call）。

---

## Step 5：`.gitignore` 加入

```
state.json
```

---

## 驗證步驟
1. `python3 server.py` 本地跑起來
2. 登入 → 勾幾個 prereq → 確認 `state.json` 有寫入
3. 重新整理 → 確認勾選狀態保留
4. Deploy Vercel → 對方先打開（migration）→ 你再打開確認看到同樣狀態
