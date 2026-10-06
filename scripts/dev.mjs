import { spawn } from 'node:child_process';
const children = ['@thinthai/api', '@thinthai/web'].map((name) =>
  spawn('npm', ['run', 'dev', '-w', name], { stdio: 'inherit', env: { ...process.env } }),
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', () => stop(1));
  child.on('exit', (code) => stop(code ?? 1));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
