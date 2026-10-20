import { spawn } from 'node:child_process';
import fs from 'node:fs';

async function captureSession(width, height, isMobile = false) {
  const profileDir = fs.mkdtempSync('/tmp/ff_prof_tenant_');
  const port = isMobile ? '9227' : '9226';

  const ff = spawn('firefox', [
    '--headless',
    '--profile', profileDir,
    '--remote-debugging-port', port,
    '--remote-allow-system-access',
    `--window-size=${width},${height}`
  ], { stdio: 'inherit' });

  try {
    await new Promise(r => setTimeout(r, 1500));

    const ws = new WebSocket(`ws://127.0.0.1:${port}/session`);
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

    try {
      await send('browsingContext.setViewport', {
        context: contextId,
        viewport: { width, height },
        devicePixelRatio: 1
      });
    } catch (e) {
      // Ignored if unsupported
    }

    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/bengkel-gps-motor',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 2000));

    async function setDark(isDark) {
      await send('script.evaluate', {
        expression: `
          if (${isDark}) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        `,
        target: { context: contextId },
        awaitPromise: true
      });
      await new Promise(r => setTimeout(r, 300));
    }

    async function snap(filename, selector = null, padY = 0) {
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
        await new Promise(r => setTimeout(r, 700));
      } else {
        await send('script.evaluate', {
          expression: `window.scrollTo(0, 0);`,
          target: { context: contextId },
          awaitPromise: true
        });
        await new Promise(r => setTimeout(r, 500));
      }
      const shot = await send('browsingContext.captureScreenshot', { context: contextId });
      fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot to ${filename}`);
    }

    if (!isMobile) {
      // Dark Mode captures
      await setDark(true);
      await snap('/tmp/verify_tenant_hero_dark.png');
      await snap('/tmp/verify_tenant_facilities_dark.png', '#fasilitas', -80);
      await snap('/tmp/verify_tenant_pricing_dark.png', '#estimasi-biaya', -80);

      // Light Mode captures
      await setDark(false);
      await snap('/tmp/verify_tenant_hero_light.png');
      await snap('/tmp/verify_tenant_facilities_light.png', '#fasilitas', -80);
      await snap('/tmp/verify_tenant_pricing_light.png', '#estimasi-biaya', -80);
    } else {
      // Mobile captures
      await setDark(true);
      await snap('/tmp/verify_tenant_mobile_hero_dark.png');
      await snap('/tmp/verify_tenant_mobile_pricing_dark.png', '#estimasi-biaya', -70);

      await setDark(false);
      await snap('/tmp/verify_tenant_mobile_hero_light.png');
    }

    await send('session.end', {});
    ws.close();
  } finally {
    ff.kill('SIGKILL');
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

async function run() {
  console.log('Capturing desktop screenshots (1280x900)...');
  await captureSession(1280, 900, false);
  console.log('Capturing mobile screenshots (390x844)...');
  await captureSession(390, 844, true);
  console.log('Finished capturing all verification screenshots.');
}

run().catch(err => {
  console.error('Run error:', err);
  process.exit(1);
});
