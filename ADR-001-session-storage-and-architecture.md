# ADR-001: Session Storage and Architecture Decisions

**Status**: Accepted
**Date**: 2026-02-04
**Decision Makers**: Project contributors

## Context

This project is a Claude.ai usage monitor that displays API usage statistics via a local web dashboard. Several architectural decisions were made during development regarding configuration management, dependencies, and UI approach.

## Decisions

### 1. Session Key Storage: `session.json` File

**Decision**: Store the Claude.ai session cookie in a `session.json` file managed via REST API.

**Alternatives Considered**:
- `.claude/settings.local.json` — Rejected: Mixes app config with Claude Code config
- `.env` file — Rejected: Awkward for frequently-changing session cookies
- Browser localStorage — Rejected: Doesn't work across browsers, tied to single client

**Rationale**:
- UI-based management allows pasting session key directly in browser
- Persists across server restarts
- Single source of truth accessible from any browser
- Easy to gitignore for security

**API Endpoints**:
- `GET /api/session` — Returns `{ configured: bool, preview: "sk-ant-sid01-..." }`
- `POST /api/session` — Saves session key to file
- `DELETE /api/session` — Clears stored session

### 2. Zero NPM Dependencies

**Decision**: Maintain zero runtime dependencies.

**Rationale**:
- Simple installation: just `node server.js`
- No `node_modules` bloat for a small utility
- Reduces security surface area
- Custom .env parser is only ~10 lines of code

**Trade-offs**:
- Manual implementation of features that packages would provide
- Acceptable for this project's scope

### 3. Dual Dashboard Views

**Decision**: Provide two dashboard views at `/` (classic) and `/neon` (glassmorphism).

**Rationale**:
- Classic view: Simple, functional, fast
- Neon view: Visually distinctive for dedicated side monitor usage
- Both share the same API backend

### 4. 30-Second Refresh Interval

**Decision**: Auto-refresh every 30 seconds (changed from initial 5 seconds).

**Rationale**:
- Reduces API load for always-on side monitor usage
- Claude.ai usage data doesn't change that frequently
- Manual refresh button available for immediate updates
- Auto-update can be toggled off entirely via UI

### 5. Neon Color System

**Decision**: Color-code usage percentages with neon palette.

| Usage Range | Color | Hex |
|-------------|-------|-----|
| 0-40% | Green | `#00ff88` |
| 40-70% | Cyan | `#00d4ff` |
| 70-90% | Magenta | `#ff00ff` |
| 90%+ | Orange/Warning | `#ffaa00` |

**Rationale**:
- Instant visual recognition of usage status
- Matches glassmorphism aesthetic
- High contrast on dark background

## Consequences

### Positive
- Simple, self-contained application
- Easy to deploy and maintain
- Flexible viewing options
- Secure session management (gitignored, server-side storage)

### Negative
- Session key stored in plaintext (acceptable for local tool)
- No authentication on dashboard (assumes local network use)
- Manual session key rotation when cookie expires

## Related Files

- `server.js` — Main server with API endpoints
- `claude_usage_monitor.html` — Classic dashboard
- `claude_usage_neon.html` — Glassmorphism dashboard
- `session.json` — Session storage (gitignored)
- `tutorial.html` — Interactive chart tutorial
