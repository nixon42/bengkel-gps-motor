import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const url = process.argv[2] || 'http://localhost:5173/';
const outputFile = process.argv[3] || '/tmp/test_bidi.png';
const delayMs = parseInt(process.argv[4] || '2000', 10);
const width = parseInt(process.argv[5] || '1280', 10);
const height = parseInt(process.argv[6] || '900', 10);
const scrollY = parseInt(process.argv[7] || '0', 10);
const isDark = process.argv[8] === 'dark';

const profileDir = fs.mkdtempSync('/tmp/ff_prof_');

const ff = spawn('firefox', [
  '--headless',
  '--profile', profileDir,
  '--remote-debugging-port', '9224',
  '--remote-allow-system-access',
  `--window-size=${width},${height}`
], { stdio: 'inherit' });

async function run() {
  await new Promise(r => setTimeout(r, 1500));

  const ws = new WebSocket('ws://127.0.0.1:9224/session');
  
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

  console.log('Connected to WebDriver BiDi');

  await send('session.new', { capabilities: {} });
  
  const tree = await send('browsingContext.getTree', {});
  const contextId = tree.contexts[0].context;
  console.log('Context ID:', contextId);

  // Set viewport
  try {
    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width, height },
      devicePixelRatio: 1
    });
  } catch (e) {
    console.log('setViewport optional:', e.message);
  }

  console.log('Navigating to', url);
  await send('browsingContext.navigate', {
    context: contextId,
    url: url,
    wait: 'complete'
  });

  console.log(`Waiting ${delayMs}ms for React rendering and network idle...`);
  await new Promise(r => setTimeout(r, delayMs));

  if (isDark) {
    try {
      console.log('Activating Dark Mode...');
      await send('script.evaluate', {
        expression: `document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark');`,
        target: { context: contextId },
        awaitPromise: true
      });
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.log('Dark mode warning:', e.message);
    }
  }

  if (scrollY > 0) {
    try {
      console.log(`Scrolling to Y=${scrollY}...`);
      await send('script.evaluate', {
        expression: `window.scrollTo(0, ${scrollY});`,
        target: { context: contextId },
        awaitPromise: true
      });
      await new Promise(r => setTimeout(r, 600));
    } catch (e) {
      console.log('Scroll warning:', e.message);
    }
  }

  console.log('Capturing screenshot...');
  const shot = await send('browsingContext.captureScreenshot', {
    context: contextId
  });

  const buffer = Buffer.from(shot.data, 'base64');
  fs.writeFileSync(outputFile, buffer);
  console.log(`Saved screenshot to ${outputFile} (${buffer.length} bytes)`);

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
