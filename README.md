# Claude Usage Monitor

Real-time dashboard for monitoring your Claude.ai usage limits.

## Quick Start

```bash
# 1. Run it
node server.js

# 2. Open http://localhost:3000
# 3. Click Settings and paste your session cookie
```

## Get Your Session Cookie

1. Go to https://claude.ai and log in
2. Open DevTools (F12) → Application → Cookies → claude.ai
3. Copy the `sessionKey` value
4. Paste it into the Settings panel in the dashboard

## Features

- Live usage data from Claude.ai
- 5-hour and 7-day rolling window tracking
- Auto-refresh every 30 seconds (toggleable)
- Two views: Classic (`/`) and Neon Glassmorphism (`/neon`)
- Color-coded progress bars and charts
- UI-based session key management
- Interactive tutorial (`/tutorial`)
- Demo mode when not configured
- Zero npm dependencies

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Session expired" | Get a new cookie from claude.ai and re-enter in Settings |
| Port in use | `PORT=3001 node server.js` |
| Stuck on "Initializing" | Hard refresh (Ctrl+Shift+R) |

## Files

```
├── server.js                # Node server (zero deps)
├── claude_usage_monitor.html # Classic dashboard
├── claude_usage_neon.html    # Neon glassmorphism dashboard
├── tutorial.html             # Interactive chart tutorial
└── session.json              # Session storage (gitignored)
```
