import { spawn } from 'node:child_process';
import fs from 'node:fs';

async function verifyDocsRedesign() {
  const profileDir = fs.mkdtempSync('/tmp/ff_docs_redesign_');
  const port = '9269';

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

    // ==========================================
    // 1. STANDALONE DESKTOP VIEWPORT (1280x900)
    // ==========================================
    console.log('Navigating to /panduan (Standalone Desktop)...');
    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/panduan',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 1500));

    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width: 1280, height: 900 },
      devicePixelRatio: 1
    });
    await new Promise(r => setTimeout(r, 500));

    // Set dark mode for consistent automotive terminal inspection
    await evalJs(`(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gps_theme', 'dark');
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // Capture desktop top (Header, Search Omnibox, Station Binders, Active SOP Card)
    const shotDeskTop = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_docs_redesign_desktop_top.png', Buffer.from(shotDeskTop.data, 'base64'));
    console.log('Saved /tmp/verify_docs_redesign_desktop_top.png');

    // Select module: SOP-MEK-03 (Foto Kamera)
    console.log('Selecting module SOP-MEK-03...');
    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dokumentasi Foto Pengerjaan'));
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));

    // Scroll to annotated card
    await evalJs(`(() => {
      const heading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Tangkapan Layar & Panduan Anotasi'));
      if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const shotDeskAnnotated = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_docs_redesign_desktop_annotated.png', Buffer.from(shotDeskAnnotated.data, 'base64'));
    console.log('Saved /tmp/verify_docs_redesign_desktop_annotated.png');

    // ==========================================
    // 2. STANDALONE MOBILE VIEWPORT (390x844)
    // ==========================================
    console.log('Testing Mobile Viewport (390x844)...');
    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width: 390, height: 844 },
      devicePixelRatio: 1
    });

    // Scroll back to top
    await evalJs(`window.scrollTo(0, 0);`);
    await new Promise(r => setTimeout(r, 500));

    const shotMobileTop = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_docs_redesign_mobile_top.png', Buffer.from(shotMobileTop.data, 'base64'));
    console.log('Saved /tmp/verify_docs_redesign_mobile_top.png');

    // Open mobile drawer
    console.log('Opening mobile SOP picker drawer...');
    await evalJs(`(() => {
      const trigger = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pilih Bab'));
      if (trigger) trigger.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const shotMobileDrawer = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_docs_redesign_mobile_drawer.png', Buffer.from(shotMobileDrawer.data, 'base64'));
    console.log('Saved /tmp/verify_docs_redesign_mobile_drawer.png');

    // ==========================================
    // 3. INLINE DASHBOARD TAB INTEGRATION
    // ==========================================
    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/admin',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 1500));

    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width: 1280, height: 900 },
      devicePixelRatio: 1
    });
    await new Promise(r => setTimeout(r, 500));

    // Switch to Panduan tab
    await evalJs(`(() => {
      if (window.__setActiveTab) {
        window.__setActiveTab('docs');
      } else {
        const docBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Panduan');
        if (docBtn) docBtn.click();
      }
    })()`);
    await new Promise(r => setTimeout(r, 800));

    const shotAdminInline = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_docs_redesign_admin_inline.png', Buffer.from(shotAdminInline.data, 'base64'));
    console.log('Saved /tmp/verify_docs_redesign_admin_inline.png');

    console.log('ALL DOCS REDESIGN VERIFICATIONS COMPLETE!');
    await send('session.end', {});
    ws.close();
  } finally {
    ff.kill('SIGKILL');
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

verifyDocsRedesign().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
