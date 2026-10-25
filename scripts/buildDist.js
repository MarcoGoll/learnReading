import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/** Files and folders needed at runtime. */
const RUNTIME_PATHS = ['index.html', 'css', 'js', 'assets'];

/**
 * Copies the runtime files into dist/ so docs, tests, and tooling are not published.
 */
function buildDist() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist);
  RUNTIME_PATHS.forEach((path) => cpSync(join(root, path), join(dist, path), { recursive: true }));
  console.log(`Built ${RUNTIME_PATHS.join(', ')} into dist/`);
}

buildDist();
