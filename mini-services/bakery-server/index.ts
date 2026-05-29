import { spawn } from 'child_process';
import { resolve } from 'path';

const projectRoot = resolve(__dirname, '../..');
const PORT = 3000;

console.log(`Starting Al-Malika Bakery on port ${PORT}...`);

const child = spawn('bun', ['--bun', 'next', 'dev', '-p', PORT.toString()], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env, PORT: PORT.toString() },
  detached: true
});

child.on('error', (err) => {
  console.error('Failed to start:', err);
});

child.on('exit', (code, signal) => {
  console.log(`Server exited with code ${code}, signal ${signal}`);
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, keeping server alive...');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, keeping server alive...');
});
