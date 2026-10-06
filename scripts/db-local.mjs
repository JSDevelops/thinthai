import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { config } from 'dotenv';
import pg from 'pg';
process.chdir(resolve(import.meta.dirname, '..'));
const base = resolve('.local');
const data = resolve(base, 'postgres');
const socket = resolve(base, 'run');
mkdirSync(socket, { recursive: true, mode: 0o700 });
const bin = process.env.PG_BIN ?? '/opt/homebrew/opt/postgresql@16/bin';
function run(name, args) {
  const p = spawnSync(`${bin}/${name}`, args, { stdio: 'inherit' });
  if (p.status !== 0) throw Error(`${name} failed. Set PG_BIN to PostgreSQL 16+ binaries.`);
}
if (process.argv[2] === 'stop') {
  if (existsSync(`${data}/PG_VERSION`)) run('pg_ctl', ['-D', data, 'stop', '-m', 'fast']);
  process.exit();
}
if (!existsSync('.env')) {
  const pw = randomBytes(24).toString('hex');
  writeFileSync(
    '.env',
    `DATABASE_URL=postgresql://thinthai:${pw}@127.0.0.1:55433/thinthai_dev
TEST_DATABASE_URL=postgresql://thinthai:${pw}@127.0.0.1:55433/thinthai_test
API_PORT=4200
WEB_ORIGIN=http://127.0.0.1:3200
`,
    { mode: 0o600 },
  );
}
config({ quiet: true });
const url = new URL(process.env.DATABASE_URL);
if (
  url.hostname !== '127.0.0.1' ||
  url.port !== '55433' ||
  url.username !== 'thinthai' ||
  url.pathname !== '/thinthai_dev'
)
  throw Error('Local helper only manages isolated ThinThai development databases.');
if (!existsSync(`${data}/PG_VERSION`)) {
  const file = resolve(base, 'init-password');
  writeFileSync(file, decodeURIComponent(url.password), { mode: 0o600 });
  try {
    run('initdb', [
      '-D',
      data,
      '-U',
      'thinthai',
      '--auth=scram-sha-256',
      '--pwfile',
      file,
      '--encoding=UTF8',
      '--locale=C',
    ]);
  } finally {
    unlinkSync(file);
  }
}
if (spawnSync(`${bin}/pg_ctl`, ['-D', data, 'status'], { stdio: 'ignore' }).status !== 0)
  run('pg_ctl', [
    '-D',
    data,
    '-l',
    resolve(base, 'postgres.log'),
    '-o',
    "-p 55433 -h 127.0.0.1 -k ''",
    '-w',
    'start',
  ]);
url.pathname = '/postgres';
const client = new pg.Client({ connectionString: url.href });
await client.connect();
try {
  for (const name of ['thinthai_dev', 'thinthai_test']) {
    if (!(await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [name])).rowCount)
      await client.query(`CREATE DATABASE ${name}`);
  }
} finally {
  await client.end();
}
console.log('ThinThai local PostgreSQL ready on port 55433.');
