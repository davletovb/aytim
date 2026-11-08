import { build } from 'esbuild';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const bundled = await build({ entryPoints: [resolve('src/worker.mjs')], bundle: true, format: 'esm',
  platform: 'browser', target: 'es2022', write: false });

export const workerOptions = {
  name: 'aytim-test', modulesRoot: resolve('.'),
  modules: [{ type: 'ESModule', path: resolve('test/worker-bundle.mjs'), contents: bundled.outputFiles[0].text }],
  compatibilityDate: '2026-11-08', d1Databases: { DB: 'aytim-test' },
  serviceBindings: { ASSETS: () => new Response('static asset') }
};

export async function migrate(instance) {
  const db = await instance.getD1Database('DB');
  const directory = new URL('../migrations/', import.meta.url);
  for (const name of (await readdir(directory)).filter(name => name.endsWith('.sql')).sort()) {
    const sql = await readFile(new URL(name, directory), 'utf8');
    for (const statement of sql.split(';').filter(part => part.trim())) await db.prepare(statement).run();
  }
}
