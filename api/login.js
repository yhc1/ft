export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const accounts = (process.env.ACCOUNTS || '').split(',').reduce((acc, entry) => {
    const [u, p] = entry.split(':');
    if (u && p) acc[u.trim()] = p.trim();
    return acc;
  }, {});

  if (accounts[username] && accounts[username] === password) {
    return res.status(200).json({ username });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
}
