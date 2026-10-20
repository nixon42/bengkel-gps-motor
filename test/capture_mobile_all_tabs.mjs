import { spawn } from 'node:child_process';
import fs from 'node:fs';

async function captureMobileTabs() {
  const profileDir = fs.mkdtempSync('/tmp/ff_mob_prof_');
  const port = '9266';

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

    // Navigate to admin
    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/admin',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 2000));

    // Set mobile viewport 390x844
    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width: 390, height: 844 },
      devicePixelRatio: 2
    });
    await new Promise(r => setTimeout(r, 500));

    // Ensure mock login
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
      await new Promise(r => setTimeout(r, 300));
    }

    async function switchTab(tabKey) {
      await send('script.evaluate', {
        expression: `
          if (window.__setActiveTab) {
            window.__setActiveTab('${tabKey}');
          }
        `,
        target: { context: contextId },
        awaitPromise: true
      });
      await new Promise(r => setTimeout(r, 1200));
    }

    async function snap(filename, scrollY = 0) {
      if (scrollY > 0) {
        await send('script.evaluate', {
          expression: `window.scrollTo(0, ${scrollY});`,
          target: { context: contextId },
          awaitPromise: true
        });
        await new Promise(r => setTimeout(r, 500));
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

    await setDark(true);

    // 1. Mobile Overview Dashboard
    console.log('Capturing Mobile Overview...');
    await switchTab('overview');
    await snap('/tmp/verify_mobile_overview_dark.png');
    await snap('/tmp/verify_mobile_overview_scroll_dark.png', 400);

    // 2. Mobile Repair Orders
    console.log('Capturing Mobile Repair Orders...');
    await switchTab('repair-orders');
    await snap('/tmp/verify_mobile_ro_dark.png');
    await snap('/tmp/verify_mobile_ro_scroll_dark.png', 400);

    // 3. Mobile Inventory
    console.log('Capturing Mobile Inventory...');
    await switchTab('inventory');
    await snap('/tmp/verify_mobile_inventory_dark.png');
    await snap('/tmp/verify_mobile_inventory_scroll_dark.png', 400);

    // 4. Mobile Stock Opname
    console.log('Capturing Mobile Stock Opname...');
    await switchTab('opname');
    await snap('/tmp/verify_mobile_opname_dark.png');

    // 5. Mobile Stock Mutations
    console.log('Capturing Mobile Stock Mutations...');
    await switchTab('mutations');
    await snap('/tmp/verify_mobile_mutations_dark.png');

    // 6. Mobile Finance
    console.log('Capturing Mobile Finance...');
    await switchTab('finance');
    await snap('/tmp/verify_mobile_finance_dark.png');
    await snap('/tmp/verify_mobile_finance_scroll_dark.png', 400);

    // 7. Mobile Customers
    console.log('Capturing Mobile Customers...');
    await switchTab('customers');
    await snap('/tmp/verify_mobile_customers_dark.png');

    console.log('All mobile captures complete!');
    await send('session.end', {});
    ws.close();
  } finally {
    ff.kill('SIGKILL');
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

captureMobileTabs().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
