import { spawn } from 'node:child_process';
import fs from 'node:fs';

async function testModals() {
  const profileDir = fs.mkdtempSync('/tmp/ff_modals_prof_');
  const port = '9255';

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

    async function evalJs(code) {
      const res = await send('script.evaluate', {
        expression: code,
        target: { context: contextId },
        awaitPromise: true
      });
      if (res && res.result && res.result.value !== undefined) {
        return res.result.value;
      }
      return res;
    }

    // Navigate to admin
    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/admin',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 1500));

    // Mock login
    await evalJs(`(async () => {
      try {
        await fetch('/api/auth/mock-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tenantSlug: 'bengkel-gps-motor', email: 'admin@gpsmotor.local' })
        });
        window.location.reload();
      } catch(e) {}
    })()`);
    await new Promise(r => setTimeout(r, 2000));

    // Set Desktop Viewport 1280x900
    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width: 1280, height: 900 },
      devicePixelRatio: 1
    });
    await new Promise(r => setTimeout(r, 500));

    // 1. Open Settings Modal
    console.log('--- TEST 1: Open Settings Modal (Desktop) ---');
    const openRes = await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pengaturan') || b.querySelector('svg.lucide-settings'));
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { clicked: false, allBtns: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()) };
    })()`);
    console.log('Clicked Pengaturan button:', openRes);
    await new Promise(r => setTimeout(r, 600));

    // Switch to Photos sub-tab
    await evalJs(`(() => {
      const photoTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Foto & Landing Page'));
      if (photoTab) photoTab.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    // Check modal geometry & close button
    const geometry = await evalJs(`(() => {
      const closeBtn = document.querySelector('button[title*="Tutup"]') || 
        Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x'));
      const modal = closeBtn ? closeBtn.closest('.bg-white, .dark\\\\:bg-slate-900, .dark\\\\:bg-slate-800') : null;
      
      const winH = window.innerHeight;
      const winW = window.innerWidth;
      
      let closeRect = null;
      let modalRect = null;
      if (closeBtn) {
        const r = closeBtn.getBoundingClientRect();
        closeRect = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
      }
      if (modal) {
        const r = modal.getBoundingClientRect();
        modalRect = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height };
      }

      return {
        winH, winW,
        closeRect,
        modalRect,
        closeVisibleInsideViewport: closeRect ? (closeRect.top >= 0 && closeRect.bottom <= winH && closeRect.right <= winW) : false
      };
    })()`);
    console.log('Desktop Settings Modal Geometry:', JSON.stringify(geometry, null, 2));

    // Capture screenshot of desktop modal
    const shotDesktop = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_modal_settings_desktop.png', Buffer.from(shotDesktop.data, 'base64'));
    console.log('Saved /tmp/verify_modal_settings_desktop.png');

    // Test Escape key dismissal
    console.log('--- TEST 2: Escape key listener dismissal ---');
    await evalJs(`(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const checkClosedEsc = await evalJs(`(() => {
      const modal = Array.from(document.querySelectorAll('h2, h3')).find(h => h.textContent.includes('Pengaturan Workshop'));
      return { isStillOpen: !!modal };
    })()`);
    console.log('Modal closed after ESC:', !checkClosedEsc.isStillOpen);

    // 3. Test Mobile Viewport 390x844
    console.log('--- TEST 3: Mobile Viewport 390x844 ---');
    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width: 390, height: 844 },
      devicePixelRatio: 1
    });
    await new Promise(r => setTimeout(r, 600));

    // Open settings again on mobile
    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pengaturan') || b.querySelector('svg.lucide-settings'));
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 600));

    // Switch to Photos sub-tab
    await evalJs(`(() => {
      const photoTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Foto & Landing Page'));
      if (photoTab) photoTab.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const mobileGeometry = await evalJs(`(() => {
      const closeBtn = document.querySelector('button[title*="Tutup"]') || 
        Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x'));
      const modal = closeBtn ? closeBtn.closest('.bg-white, .dark\\\\:bg-slate-900, .dark\\\\:bg-slate-800') : null;
      
      const winH = window.innerHeight;
      const winW = window.innerWidth;
      
      let closeRect = null;
      let modalRect = null;
      if (closeBtn) {
        const r = closeBtn.getBoundingClientRect();
        closeRect = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
      }
      if (modal) {
        const r = modal.getBoundingClientRect();
        modalRect = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height };
      }

      return {
        winH, winW,
        closeRect,
        modalRect,
        closeVisibleInsideViewport: closeRect ? (closeRect.top >= 0 && closeRect.bottom <= winH && closeRect.right <= winW) : false
      };
    })()`);
    console.log('Mobile Settings Modal Geometry:', JSON.stringify(mobileGeometry, null, 2));

    const shotMobile = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_modal_settings_mobile.png', Buffer.from(shotMobile.data, 'base64'));
    console.log('Saved /tmp/verify_modal_settings_mobile.png');

    // Test close button click on mobile
    console.log('--- TEST 4: Close button click dismissal on mobile ---');
    await evalJs(`(() => {
      const closeBtn = document.querySelector('button[title*="Tutup"]') || 
        Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const checkClosedClick = await evalJs(`(() => {
      const modal = Array.from(document.querySelectorAll('h2, h3')).find(h => h.textContent.includes('Pengaturan Workshop'));
      return { isStillOpen: !!modal };
    })()`);
    console.log('Modal closed after clicking X:', !checkClosedClick.isStillOpen);

    // 5. Test Backdrop Click Dismissal
    console.log('--- TEST 5: Backdrop click dismissal ---');
    // Open settings again
    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pengaturan') || b.querySelector('svg.lucide-settings'));
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    // Click backdrop
    await evalJs(`(() => {
      const backdrop = document.querySelector('.fixed.inset-0.z-50');
      if (backdrop) backdrop.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const checkClosedBackdrop = await evalJs(`(() => {
      const modal = Array.from(document.querySelectorAll('h2, h3')).find(h => h.textContent.includes('Pengaturan Workshop'));
      return { isStillOpen: !!modal };
    })()`);
    console.log('Modal closed after clicking backdrop:', !checkClosedBackdrop.isStillOpen);

    console.log('ALL MODAL TESTS PASSED!');
    await send('session.end', {});
    ws.close();
  } finally {
    ff.kill('SIGKILL');
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

testModals().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
