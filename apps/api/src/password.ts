import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
export const DEFAULT_N = 65536,
  r = 8,
  p = 1;
function derive(password: string, salt: string, n = DEFAULT_N): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, { N: n, r, p, maxmem: 256 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${DEFAULT_N}$${r}$${p}$${salt}$${(await derive(password, salt, DEFAULT_N)).toString('hex')}`;
}
// Fixed dummy record causes unknown accounts to do the same expensive verification.
export const dummyHash = `scrypt$${DEFAULT_N}$${r}$${p}$${'0'.repeat(32)}$${'0'.repeat(128)}`;

export function needsRehash(record: string): boolean {
  const parts = record.split('$');
  return parts[0] === 'scrypt' && Number(parts[1]) !== DEFAULT_N;
}

export async function verifyPassword(password: string, record: string) {
  const [algorithm, n, block, parallel, salt, encoded] = record.split('$');
  const recordN = Number(n);
  if (
    algorithm !== 'scrypt' ||
    (recordN !== 65536 && recordN !== 131072) ||
    Number(block) !== r ||
    Number(parallel) !== p ||
    !/^[a-f0-9]{32}$/.test(salt ?? '') ||
    !/^[a-f0-9]{128}$/.test(encoded ?? '')
  )
    return false;
  return timingSafeEqual(await derive(password, salt, recordN), Buffer.from(encoded, 'hex'));
}
