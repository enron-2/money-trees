import { lstatSync, readdirSync, readFileSync } from 'fs';
import { createHash, Hash } from 'crypto';
import { join } from 'path';

/**
 * Create hash from directory contents
 */
export function getFolderHash(path: string): string {
  if (!lstatSync(path).isDirectory()) {
    throw new Error(`Path: ${path}\nIs not a directory`);
  }
  const hash = createHash('sha512');

  hashDeep(path, hash);

  return hash.digest('base64');
}

function hashDeep(path: string, hash: Hash) {
  readdirSync(path)
    .map((f) => join(path, f))
    .filter((f) => lstatSync(f).isDirectory())
    .map((dir) => hashDeep(dir, hash));
  readdirSync(path)
    .map((f) => join(path, f))
    .filter((f) => lstatSync(f).isFile())
    .forEach((f) => hash.update(readFileSync(f)));
}
