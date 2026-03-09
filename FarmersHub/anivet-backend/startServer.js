// Wrapper to launch server and log output clearly
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => {
  process.stdout.write('[SERVER] ' + data.toString());
});

server.stderr.on('data', (data) => {
  process.stderr.write('[SERVER ERR] ' + data.toString());
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

console.log('Server wrapper started, PID:', server.pid);
