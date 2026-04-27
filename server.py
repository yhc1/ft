#!/usr/bin/env python3
# Local dev server: python3 server.py
# Reads .env.local and serves web/ + /api/login

import http.server
import json
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs

STATE_FILE = Path(__file__).parent / 'state.json'


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}


def save_state(state):
    STATE_FILE.write_text(json.dumps(state))

# Load .env.local
env_file = Path(__file__).parent / '.env.local'
if env_file.exists():
    for line in env_file.read_text().splitlines():
        if '=' in line and not line.startswith('#'):
            key, _, val = line.partition('=')
            os.environ.setdefault(key.strip(), val.strip())

PORT = 8080
WEB_DIR = Path(__file__).parent / 'web'


def parse_accounts():
    accounts = {}
    for entry in os.environ.get('ACCOUNTS', '').split(','):
        if ':' in entry:
            u, _, p = entry.strip().partition(':')
            accounts[u] = p
    return accounts


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/state':
            params = parse_qs(parsed.query)
            username = (params.get('username') or [None])[0]
            if not username:
                self._json(400, {'error': 'Missing username'})
                return
            state = load_state()
            key_data = state.get(username)
            self._json(200, {'checkedIds': key_data if key_data is not None else None})
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length) or '{}')
        if parsed.path == '/api/login':
            username = body.get('username', '').strip()
            password = body.get('password', '')
            accounts = parse_accounts()
            if accounts.get(username) == password:
                self._json(200, {'username': username})
            else:
                self._json(401, {'error': 'Invalid credentials'})
        elif parsed.path == '/api/state':
            username = body.get('username', '').strip()
            if not username:
                self._json(400, {'error': 'Missing username'})
                return
            checked_ids = body.get('checkedIds', [])
            state = load_state()
            state[username] = checked_ids
            save_state(state)
            self._json(200, {'ok': True})
        else:
            self.send_error(404)

    def _json(self, status, data):
        payload = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(payload))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, fmt, *args):
        print(f'{self.address_string()} - {fmt % args}')


if __name__ == '__main__':
    with http.server.HTTPServer(('', PORT), Handler) as httpd:
        print(f'Local server running at http://localhost:{PORT}')
        httpd.serve_forever()
