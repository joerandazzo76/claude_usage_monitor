import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Load settings from settings.local.json
let settings = {};
const settingsPath = path.join(__dirname, 'settings.local.json');

try {
    if (fs.existsSync(settingsPath)) {
        const raw = fs.readFileSync(settingsPath, 'utf8');
        settings = JSON.parse(raw);
        console.log('Loaded settings from settings.local.json');
    }
} catch (err) {
    console.error('Error reading settings.local.json:', err.message);
}

const SESSION_COOKIE = process.env.CLAUDE_SESSION_COOKIE || settings.sessionCookie || '';

if (!SESSION_COOKIE) {
    console.log('\n⚠️  No session cookie configured!\n');
    console.log('Option 1: Create settings.local.json with:');
    console.log('  { "sessionCookie": "sk-ant-sid01-..." }\n');
    console.log('Option 2: Set environment variable:');
    console.log('  set CLAUDE_SESSION_COOKIE=sk-ant-sid01-... (Windows)');
    console.log('  export CLAUDE_SESSION_COOKIE=sk-ant-sid01-... (Mac/Linux)\n');
    console.log('To get your cookie:');
    console.log('  1. Open https://claude.ai and log in');
    console.log('  2. DevTools (F12) → Application → Cookies → claude.ai');
    console.log('  3. Copy the "sessionKey" value\n');
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

function serveStatic(res, filePath) {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(`Static file error: ${filePath}`, err.code);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'File not found', path: filePath }));
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

function sendError(res, statusCode, message, details = null) {
    console.error(`Error ${statusCode}: ${message}`, details || '');
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: message, details }));
}

function proxyToClaudeAI(req, res) {
    if (!SESSION_COOKIE) {
        sendError(res, 401, 'No session cookie configured',
            'Set sessionCookie in settings.local.json or CLAUDE_SESSION_COOKIE env var');
        return;
    }

    const orgOptions = {
        hostname: 'claude.ai',
        path: '/api/organizations',
        method: 'GET',
        headers: {
            'Cookie': `sessionKey=${SESSION_COOKIE}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
        },
        timeout: 10000
    };

    console.log('Fetching organizations...');

    const orgReq = https.request(orgOptions, (orgRes) => {
        let orgData = '';
        orgRes.on('data', chunk => orgData += chunk);
        orgRes.on('end', () => {
            try {
                if (orgRes.statusCode === 401 || orgRes.statusCode === 403) {
                    sendError(res, 401, 'Session expired or invalid',
                        'Please update your sessionKey cookie');
                    return;
                }

                if (orgRes.statusCode !== 200) {
                    sendError(res, orgRes.statusCode, 'Claude API error', orgData);
                    return;
                }

                const orgs = JSON.parse(orgData);
                console.log('Organizations response:', orgRes.statusCode);

                if (!Array.isArray(orgs) || orgs.length === 0) {
                    sendError(res, 500, 'No organizations found', orgs);
                    return;
                }

                const orgId = orgs[0].uuid;
                console.log('Using org:', orgId);
                fetchUsageData(orgId, res);

            } catch (e) {
                sendError(res, 500, 'Failed to parse organization data', e.message);
            }
        });
    });

    orgReq.on('error', (e) => {
        sendError(res, 500, 'Network error connecting to Claude.ai', e.message);
    });

    orgReq.on('timeout', () => {
        orgReq.destroy();
        sendError(res, 504, 'Request to Claude.ai timed out');
    });

    orgReq.end();
}

function fetchUsageData(orgId, res) {
    const usageOptions = {
        hostname: 'claude.ai',
        path: `/api/organizations/${orgId}/usage`,
        method: 'GET',
        headers: {
            'Cookie': `sessionKey=${SESSION_COOKIE}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
        },
        timeout: 10000
    };

    console.log('Fetching usage data...');

    const usageReq = https.request(usageOptions, (usageRes) => {
        let usageData = '';
        usageRes.on('data', chunk => usageData += chunk);
        usageRes.on('end', () => {
            console.log('Usage response:', usageRes.statusCode);

            if (usageRes.statusCode !== 200) {
                sendError(res, usageRes.statusCode, 'Failed to fetch usage data', usageData);
                return;
            }

            try {
                // Validate JSON
                JSON.parse(usageData);

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(usageData);
            } catch (e) {
                sendError(res, 500, 'Invalid JSON from Claude.ai', e.message);
            }
        });
    });

    usageReq.on('error', (e) => {
        sendError(res, 500, 'Network error fetching usage', e.message);
    });

    usageReq.on('timeout', () => {
        usageReq.destroy();
        sendError(res, 504, 'Usage request timed out');
    });

    usageReq.end();
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    console.log(`${new Date().toISOString()} ${req.method} ${url.pathname}`);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // API routes
    if (url.pathname === '/api/usage') {
        proxyToClaudeAI(req, res);
        return;
    }

    // Health check
    if (url.pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            configured: !!SESSION_COOKIE,
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // Static files
    let filePath = url.pathname;
    if (filePath === '/') {
        filePath = '/claude_usage_monitor.html';
    }

    const fullPath = path.join(__dirname, filePath);

    // Security: prevent directory traversal
    if (!fullPath.startsWith(__dirname)) {
        sendError(res, 403, 'Forbidden');
        return;
    }

    serveStatic(res, fullPath);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\nError: Port ${PORT} is already in use.`);
        console.error(`Try: set PORT=3001 && node server.js\n`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`\n🚀 Claude Usage Monitor running at http://localhost:${PORT}\n`);
    if (SESSION_COOKIE) {
        console.log('✅ Session cookie configured');
    } else {
        console.log('⚠️  Running without session cookie (API calls will fail)');
    }
    console.log('');
});
