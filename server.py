#!/usr/bin/env python3
# Local dev server: python3 server.py
# Reads .env.local and serves web/ + /api/login

import http.server
import json
import os
from pathlib import Path

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

    def do_POST(self):
        if self.path == '/api/login':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length) or '{}')
            username = body.get('username', '').strip()
            password = body.get('password', '')
            accounts = parse_accounts()
            if accounts.get(username) == password:
                self._json(200, {'username': username})
            else:
                self._json(401, {'error': 'Invalid credentials'})
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
