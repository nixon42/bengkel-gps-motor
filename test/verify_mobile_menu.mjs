import { spawn } from 'node:child_process';
import fs from 'node:fs';

const profileDir = fs.mkdtempSync('/tmp/ff_prof_');

const ff = spawn('firefox', [
  '--headless',
  '--profile', profileDir,
  '--remote-debugging-port', '9228',
  '--remote-allow-system-access',
  '--window-size', '414,896'
], { stdio: 'inherit' });

async function run() {
  await new Promise(r => setTimeout(r, 1500));

  const ws = new WebSocket('ws://127.0.0.1:9228/session');
  
  let msgId = 1;
  const pending = new Map();

  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error + ': ' + msg.message));
        else resolve(msg.result);
      }
    } catch (e) {
      console.error(e);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  await send('session.new', { capabilities: {} });
  
  const tree = await send('browsingContext.getTree', {});
  const contextId = tree.contexts[0].context;

  await send('browsingContext.navigate', {
    context: contextId,
    url: 'http://localhost:5173/',
    wait: 'complete'
  });

  await new Promise(r => setTimeout(r, 2000));

  // Click mobile hamburger menu
  await send('script.evaluate', {
    expression: `const btn = document.querySelector('button[aria-label="Buka menu navigasi"]'); if (btn) btn.click();`,
    target: { context: contextId },
    awaitPromise: true
  });

  await new Promise(r => setTimeout(r, 600));

  const shot = await send('browsingContext.captureScreenshot', {
    context: contextId
  });

  const buffer = Buffer.from(shot.data, 'base64');
  fs.writeFileSync('/tmp/verify_navbar_mobile_open.png', buffer);
  console.log(`Saved screenshot to /tmp/verify_navbar_mobile_open.png (${buffer.length} bytes)`);

  ws.close();
}

try {
  await run();
} catch (err) {
  console.error('Error during capture:', err);
} finally {
  ff.kill('SIGKILL');
  fs.rmSync(profileDir, { recursive: true, force: true });
  process.exit(0);
}
