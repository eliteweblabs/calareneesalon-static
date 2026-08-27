import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from 'serve-handler';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), 'public');
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

const server = createServer((req, res) => {
  const url = req.url?.split('?')[0] ?? '/';
  if (url === '/') req.url = '/index.html';

  return handler(req, res, {
    public: publicDir,
    cleanUrls: false,
    directoryListing: false,
    headers: [
      { source: '**/*.html', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
      { source: '/', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
      { source: '**/*', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }] },
    ],
  });
});

server.listen(port, host, () => {
  console.log(`Serving ${publicDir} at http://${host}:${port}`);
});
