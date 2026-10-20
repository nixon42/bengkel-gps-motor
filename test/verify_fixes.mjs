import { spawn } from 'node:child_process';
import fs from 'node:fs';

const profileDir = fs.mkdtempSync('/tmp/ff_prof_fix_');

const ff = spawn('firefox', [
  '--headless',
  '--profile', profileDir,
  '--remote-debugging-port', '9225',
  '--remote-allow-system-access',
  '--window-size=1280,900'
], { stdio: 'inherit' });

async function run() {
  await new Promise(r => setTimeout(r, 1500));

  const ws = new WebSocket('ws://127.0.0.1:9225/session');
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

  console.log('Connected to WebDriver BiDi on port 9225');
  await send('session.new', { capabilities: {} });
  
  const tree = await send('browsingContext.getTree', {});
  const contextId = tree.contexts[0].context;

  try {
    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width: 1280, height: 900 },
      devicePixelRatio: 1
    });
  } catch (e) {
    console.log('setViewport optional:', e.message);
  }

  await send('browsingContext.navigate', {
    context: contextId,
    url: 'http://localhost:5173/',
    wait: 'complete'
  });

  await new Promise(r => setTimeout(r, 2000));

  // Enable dark mode
  await send('script.evaluate', {
    expression: `
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    `,
    target: { context: contextId },
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 500));

  async function snap(selector, filename, padY = 0) {
    if (selector) {
      await send('script.evaluate', {
        expression: `
          (() => {
            const el = document.querySelector('${selector}');
            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY + (${padY});
              window.scrollTo(0, y);
            }
          })()
        `,
        target: { context: contextId },
        awaitPromise: true
      });
      await new Promise(r => setTimeout(r, 600));
    }
    const shot = await send('browsingContext.captureScreenshot', { context: contextId });
    const buffer = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(filename, buffer);
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }

  // 1. Hero Section (Foto 1)
  await snap(null, '/tmp/verify_fix_foto1_hero.png');

  // 2. Konsol Bengkel - Vehicle Cards (Foto 2)
  await snap('#konsol-bengkel', '/tmp/verify_fix_foto2_vehicle_cards.png', 80);

  // 3. Before/After Slider inside Konsol Bengkel (Foto 5)
  // Scroll down a bit more to see the photo slider in the right column
  await snap('#konsol-bengkel', '/tmp/verify_fix_foto5_before_after.png', 420);

  // 4. Mitra Bengkel Directory (Foto 3)
  await snap('#mitra-bengkel', '/tmp/verify_fix_foto3_mitra_bengkel.png', -20);

  // 5. Pricing Cards (Foto 4)
  await snap('#harga', '/tmp/verify_fix_foto4_pricing.png', -20);

  ws.close();
}

try {
  await run();
} catch (err) {
  console.error('Error:', err);
} finally {
  ff.kill('SIGKILL');
  fs.rmSync(profileDir, { recursive: true, force: true });
  process.exit(0);
}
