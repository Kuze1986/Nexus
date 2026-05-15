/**
 * Minimal SPA static server for Railway.
 * Serves files from /dist; falls back to index.html for any unknown path
 * so that client-side routes (react-router) work after a hard refresh.
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, '..', 'dist');

const MIME = {
  '.html' : 'text/html; charset=utf-8',
  '.js'   : 'application/javascript',
  '.mjs'  : 'application/javascript',
  '.css'  : 'text/css',
  '.svg'  : 'image/svg+xml',
  '.png'  : 'image/png',
  '.jpg'  : 'image/jpeg',
  '.jpeg' : 'image/jpeg',
  '.ico'  : 'image/x-icon',
  '.json' : 'application/json',
  '.woff' : 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf'  : 'font/ttf',
  '.webp' : 'image/webp',
};

http.createServer((req, res) => {
  const urlPath  = req.url.split('?')[0];            // strip query string
  let   filePath = path.join(DIST, urlPath);

  // Directory or missing file → serve SPA shell
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext         = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    // Aggressive caching for hashed assets, no-cache for HTML
    const cacheControl = ext === '.html'
      ? 'no-store'
      : 'public, max-age=31536000, immutable';

    res.writeHead(200, {
      'Content-Type' : contentType,
      'Cache-Control': cacheControl,
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`[nexus-sso] serving dist/ on port ${PORT}`);
});
