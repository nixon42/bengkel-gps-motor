import { spawn } from 'node:child_process';
import fs from 'node:fs';

const profileDir = fs.mkdtempSync('/tmp/ff_prof_mob_clean_');

const ff = spawn('firefox', [
  '--headless',
  '--profile', profileDir,
  '--remote-debugging-port', '9240',
  '--remote-allow-system-access'
], { stdio: 'inherit' });

async function run() {
  await new Promise(r => setTimeout(r, 1500));

  const ws = new WebSocket('ws://127.0.0.1:9240/session');
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
    url: 'http://localhost:5173/bengkel-gps-motor',
    wait: 'complete'
  });
  await new Promise(r => setTimeout(r, 2000));

  await send('browsingContext.setViewport', {
    context: contextId,
    viewport: { width: 390, height: 844 },
    devicePixelRatio: 1
  });
  await new Promise(r => setTimeout(r, 600));

  // Dark mode
  await send('script.evaluate', {
    expression: `document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark');`,
    target: { context: contextId },
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 300));

  // Snap mobile hero
  const shot1 = await send('browsingContext.captureScreenshot', { context: contextId });
  fs.writeFileSync('/tmp/verify_mobile_hero_390.png', Buffer.from(shot1.data, 'base64'));
  console.log('Saved /tmp/verify_mobile_hero_390.png');

  // Scroll down to facilities
  await send('script.evaluate', {
    expression: `
      (() => {
        const el = document.querySelector('#fasilitas');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo(0, y);
        }
      })()
    `,
    target: { context: contextId },
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 600));

  const shot2 = await send('browsingContext.captureScreenshot', { context: contextId });
  fs.writeFileSync('/tmp/verify_mobile_facilities_390.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved /tmp/verify_mobile_facilities_390.png');

  // Scroll down to pricing
  await send('script.evaluate', {
    expression: `
      (() => {
        const el = document.querySelector('#estimasi-biaya');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo(0, y);
        }
      })()
    `,
    target: { context: contextId },
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 600));

  const shot3 = await send('browsingContext.captureScreenshot', { context: contextId });
  fs.writeFileSync('/tmp/verify_mobile_pricing_390.png', Buffer.from(shot3.data, 'base64'));
  console.log('Saved /tmp/verify_mobile_pricing_390.png');

  await send('session.end', {});
  ws.close();
  ff.kill('SIGKILL');
  fs.rmSync(profileDir, { recursive: true, force: true });
}

run().catch(err => {
  console.error(err);
  ff.kill('SIGKILL');
  process.exit(1);
});
