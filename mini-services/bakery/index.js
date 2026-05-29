const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '../..');
const PORT = 3000;

console.log('Starting Al-Malika Bakery on port', PORT);

const child = spawn('bun', ['run', 'dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env, PORT: PORT.toString() }
});

child.on('error', (err) => {
  console.error('Failed to start:', err);
});

child.on('exit', (code) => {
  console.log('Server exited with code:', code);
});
