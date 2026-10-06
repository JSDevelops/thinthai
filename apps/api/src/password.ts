import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
const N = 131072,
  r = 8,
  p = 1;
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, { N, r, p, maxmem: 256 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${N}$${r}$${p}$${salt}$${(await derive(password, salt)).toString('hex')}`;
}
// Fixed dummy record causes unknown accounts to do the same expensive verification.
export const dummyHash = `scrypt$${N}$${r}$${p}$${'0'.repeat(32)}$${'0'.repeat(128)}`;
export async function verifyPassword(password: string, record: string) {
  const [algorithm, n, block, parallel, salt, encoded] = record.split('$');
  if (
    algorithm !== 'scrypt' ||
    Number(n) !== N ||
    Number(block) !== r ||
    Number(parallel) !== p ||
    !/^[a-f0-9]{32}$/.test(salt ?? '') ||
    !/^[a-f0-9]{128}$/.test(encoded ?? '')
  )
    return false;
  return timingSafeEqual(await derive(password, salt), Buffer.from(encoded, 'hex'));
}
