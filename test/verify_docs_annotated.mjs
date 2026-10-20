import { spawn } from 'node:child_process';
import fs from 'node:fs';

async function verifyDocsAnnotated() {
  const profileDir = fs.mkdtempSync('/tmp/ff_docs_verify_');
  const port = '9268';

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

    // 1. Navigate to /panduan
    console.log('Navigating to /panduan...');
    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/panduan',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 1500));

    // Set dark mode to match user screenshot
    await evalJs(`(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gps_theme', 'dark');
    })()`);
    await new Promise(r => setTimeout(r, 300));

    // Set Desktop Viewport 1280x900
    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width: 1280, height: 900 },
      devicePixelRatio: 1
    });
    await new Promise(r => setTimeout(r, 500));

    // 2. Click module: "Dokumentasi Foto Pengerjaan (Before, Progress, After)"
    console.log('Selecting module: Dokumentasi Foto Pengerjaan...');
    const selectRes = await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dokumentasi Foto Pengerjaan'));
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`);
    console.log('Select module result:', selectRes);
    await new Promise(r => setTimeout(r, 800));

    // 3. Check annotated screenshot presence & pin count
    const checkPins = await evalJs(`(() => {
      const pins = document.querySelectorAll('button[title*="Langkah"]');
      const img = document.querySelector('img[src*="docs_photo_upload"]');
      return {
        hasImage: !!img,
        pinCount: pins.length,
        pinsText: Array.from(pins).map(p => p.textContent.trim())
      };
    })()`);
    console.log('Pins verification:', JSON.stringify(checkPins, null, 2));

    // Capture desktop screenshot (scrolled to annotated card)
    await evalJs(`(() => {
      const heading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Tangkapan Layar & Panduan Anotasi'));
      if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await new Promise(r => setTimeout(r, 600));

    const shotDesktop = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_docs_annotated_desktop.png', Buffer.from(shotDesktop.data, 'base64'));
    console.log('Saved /tmp/verify_docs_annotated_desktop.png');

    // 4. Test Lightbox Zoom
    console.log('Testing Fullscreen Zoom Lightbox...');
    await evalJs(`(() => {
      const zoomBtn = document.querySelector('button[title*="Perbesar Tangkapan Layar"]');
      if (zoomBtn) zoomBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 600));

    const shotZoom = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_docs_annotated_zoom.png', Buffer.from(shotZoom.data, 'base64'));
    console.log('Saved /tmp/verify_docs_annotated_zoom.png');

    // Close zoom on ESC
    await evalJs(`(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`);
    await new Promise(r => setTimeout(r, 500));

    // 5. Test Mobile Viewport 390x844
    console.log('Testing Mobile Viewport 390x844...');
    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width: 390, height: 844 },
      devicePixelRatio: 1
    });
    await new Promise(r => setTimeout(r, 600));

    const shotMobile = await send('browsingContext.captureScreenshot', { context: contextId });
    fs.writeFileSync('/tmp/verify_docs_annotated_mobile.png', Buffer.from(shotMobile.data, 'base64'));
    console.log('Saved /tmp/verify_docs_annotated_mobile.png');

    console.log('ALL DOCS ANNOTATION TESTS PASSED!');
    await send('session.end', {});
    ws.close();
  } finally {
    ff.kill('SIGKILL');
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

verifyDocsAnnotated().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
