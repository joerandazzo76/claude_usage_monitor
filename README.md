# Claude Usage Monitor

Real-time dashboard for monitoring your Claude.ai usage limits.

## Quick Start

```bash
# 1. Copy the example env file
cp .env.example .env

# 2. Add your session cookie to .env (see below)

# 3. Run it
node server.js

# 4. Open http://localhost:3000
```

## Get Your Session Cookie

1. Go to https://claude.ai and log in
2. Open DevTools (F12) → Application → Cookies → claude.ai
3. Copy the `sessionKey` value
4. Paste it in `.env`:
   ```
   CLAUDE_SESSION_COOKIE=sk-ant-sid01-...
   ```

## Features

- Live usage data from Claude.ai
- 5-hour and 7-day rolling window tracking
- Auto-refresh every 5 seconds
- Color-coded progress bars
- 3 themes (Purple, Dark, Ocean)
- Demo mode when not configured

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Session expired" | Get a new cookie from claude.ai |
| Port in use | Add `PORT=3001` to .env |
| Stuck on "Initializing" | Hard refresh (Ctrl+Shift+R) |

## Files

```
├── server.js          # Node server (zero deps)
├── claude_usage_monitor.html
├── .env               # Your config (gitignored)
└── .env.example       # Template
```
