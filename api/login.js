export async function POST(request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Missing credentials' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const accounts = (process.env.ACCOUNTS || '').split(',').reduce((acc, entry) => {
    const [u, p] = entry.split(':');
    if (u && p) acc[u.trim()] = p.trim();
    return acc;
  }, {});

  if (accounts[username] && accounts[username] === password) {
    return new Response(JSON.stringify({ username }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
