import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
await build({entryPoints:[resolve(root,'main.tsx')],bundle:true,minify:true,jsx:'automatic',outfile:resolve(root,'../docs/app.js'),define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
