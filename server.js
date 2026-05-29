const { createServer } = require('http');
const { spawn } = require('child_process');

// Start Next.js server
const nextServer = spawn('bun', ['run', 'start'], {
  cwd: '/home/z/my-project',
  stdio: 'inherit',
  detached: true
});

nextServer.on('exit', (code) => {
  console.log('Server exited with code:', code);
  // Restart
  setTimeout(() => {
    spawn('bun', ['run', 'start'], {
      cwd: '/home/z/my-project',
      stdio: 'inherit',
      detached: true
    });
  }, 2000);
});

process.on('SIGTERM', () => {
  nextServer.kill();
});
