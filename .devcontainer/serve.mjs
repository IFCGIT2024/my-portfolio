/** Local-only static preview; not a production web server. */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the repository from this script, independent of the terminal's cwd.
const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const port = 8000;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.pdf':'application/pdf','.txt':'text/plain; charset=utf-8'};
const fail = (res, status, message) => {res.writeHead(status, {'Content-Type':'text/plain; charset=utf-8'});res.end(message)};
createServer(async (req,res) => {
  if (!['GET','HEAD'].includes(req.method)) return fail(res,405,'Method not allowed');
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch { return fail(res,400,'Invalid URL'); }
  // Don't serve Git internals or hidden files; resolve symlinks before checking root.
  if (pathname.split('/').some(part => part.startsWith('.'))) return fail(res,403,'Forbidden');
  try {
    let file = await realpath(path.resolve(root, '.' + pathname));
    if (file !== root && !file.startsWith(root + path.sep)) return fail(res,403,'Forbidden');
    let details = await stat(file);
    if (details.isDirectory()) {
      file = await realpath(path.join(file,'index.html'));
      if (!file.startsWith(root + path.sep)) return fail(res,403,'Forbidden');
      details = await stat(file);
    }
    if (!details.isFile()) return fail(res,404,'Not found');
    res.writeHead(200, {'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if (req.method==='HEAD') return res.end();
    createReadStream(file).on('error',()=>res.destroy()).pipe(res);
  } catch { fail(res,404,'Not found'); }
}).listen(port,'0.0.0.0',()=>console.log(`Portfolio preview: http://localhost:${port}/\nLittle Room Next: http://localhost:${port}/docs/projects/little-room-next/\nOriginal Little Room: http://localhost:${port}/docs/projects/little-room/`));
