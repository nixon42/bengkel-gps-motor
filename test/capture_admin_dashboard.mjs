import { spawn } from 'node:child_process';
import fs from 'node:fs';

async function captureAdmin(width, height, prefix) {
  const profileDir = fs.mkdtempSync('/tmp/ff_admin_prof_');
  const port = prefix.includes('mobile') ? '9244' : '9243';

  const ff = spawn('firefox', [
    '--headless',
    '--profile', profileDir,
    '--remote-debugging-port', port,
    '--remote-allow-system-access'
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

    // 1. Navigate FIRST to content page
    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/admin',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 2000));

    // 2. Set viewport after navigation
    try {
      await send('browsingContext.setViewport', {
        context: contextId,
        viewport: { width, height },
        devicePixelRatio: 1
      });
    } catch (e) {
      console.log('setViewport note:', e.message);
    }
    await new Promise(r => setTimeout(r, 500));

    // 3. Ensure mock-login is triggered
    await send('script.evaluate', {
      expression: `(async () => {
        try {
          await fetch('/api/auth/mock-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ tenantSlug: 'bengkel-gps-motor', email: 'admin@gpsmotor.local' })
          });
          window.location.reload();
        } catch(e) {}
      })()`,
      target: { context: contextId },
      awaitPromise: true
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
      await new Promise(r => setTimeout(r, 400));
    }

    async function snap(filename, scrollY = 0) {
      if (scrollY > 0) {
        await send('script.evaluate', {
          expression: `window.scrollTo(0, ${scrollY});`,
          target: { context: contextId },
          awaitPromise: true
        });
        await new Promise(r => setTimeout(r, 600));
      } else {
        await send('script.evaluate', {
          expression: `window.scrollTo(0, 0);`,
          target: { context: contextId },
          awaitPromise: true
        });
        await new Promise(r => setTimeout(r, 400));
      }
      const shot = await send('browsingContext.captureScreenshot', { context: contextId });
      fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot to ${filename}`);
    }

    // Capture dark mode top & scroll
    await setDark(true);
    await snap(`/tmp/${prefix}_dark_top.png`, 0);
    await snap(`/tmp/${prefix}_dark_triage.png`, 350);

    // Capture light mode top
    await setDark(false);
    await snap(`/tmp/${prefix}_light_top.png`, 0);

    await send('session.end', {});
    ws.close();
  } finally {
    ff.kill('SIGKILL');
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

async function run() {
  console.log('Capturing Admin Desktop (1280x900)...');
  await captureAdmin(1280, 900, 'admin_desktop');
  console.log('Capturing Admin Mobile (390x844)...');
  await captureAdmin(390, 844, 'admin_mobile');
  console.log('All Admin captures complete!');
}

run().catch(err => {
  console.error('Run failed:', err);
  process.exit(1);
});
