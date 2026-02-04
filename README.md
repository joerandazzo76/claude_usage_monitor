# Claude Usage Monitor

Real-time dashboard for monitoring your Claude.ai usage limits.

## Features

- Live usage data from Claude.ai API
- 5-hour and 7-day rolling window tracking
- Auto-refresh every 5 seconds
- Color-coded progress bars (green/blue/orange/red)
- 3 color themes (Purple, Dark, Ocean)
- Demo mode fallback when not configured

## Quick Start

1. **Copy settings example:**
   ```bash
   cp settings.example.json settings.local.json
   ```

2. **Get your session cookie:**
   - Open https://claude.ai and log in
   - Press F12 → Application → Cookies → claude.ai
   - Copy the `sessionKey` value

3. **Add cookie to settings.local.json:**
   ```json
   {
     "sessionCookie": "sk-ant-sid01-..."
   }
   ```

4. **Start the server:**
   ```bash
   node server.js
   ```

5. **Open http://localhost:3000**

## Themes

Click the theme buttons (top right) to switch between:
- **Purple** - Default gradient theme
- **Dark** - Dark mode
- **Ocean** - Blue/teal theme

Theme preference is saved in your browser.

## Configuration

### settings.local.json

```json
{
  "sessionCookie": "your-session-key-here",
  "theme": "purple"
}
```

### Environment Variables

```bash
# Windows
set CLAUDE_SESSION_COOKIE=sk-ant-sid01-...
node server.js

# Mac/Linux
export CLAUDE_SESSION_COOKIE=sk-ant-sid01-...
node server.js
```

### Port

```bash
set PORT=8080
node server.js
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/` | Dashboard UI |
| `/api/usage` | Proxied usage data from Claude.ai |
| `/api/health` | Health check |

## Files

```
claude_usage/
├── server.js                  # Node.js proxy server
├── claude_usage_monitor.html  # Dashboard UI
├── settings.example.json      # Example config
├── settings.local.json        # Your config (gitignored)
├── .gitignore
└── README.md
```

## Troubleshooting

**"Session expired or invalid"** - Get a new cookie from claude.ai

**"No session cookie configured"** - Create settings.local.json with your cookie

**Port already in use** - `set PORT=3001 && node server.js`

**Stuck on "Initializing"** - Hard refresh (Ctrl+Shift+R)

## License

MIT
