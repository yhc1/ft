export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  if (!username) return json(400, { error: 'Missing username' });

  const key = `checked:${username}`;
  const result = await redisGet(key);
  const checkedIds = result !== null ? JSON.parse(result) : null;
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
  return data.result;
}

async function redisSet(key, value) {
  await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: value,
  });
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
