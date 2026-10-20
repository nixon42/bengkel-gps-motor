import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function captureDocsScreenshots() {
  const profileDir = fs.mkdtempSync('/tmp/ff_docs_prof_');
  const port = '9260';
  const outDir = path.resolve('public/images/docs');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

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

    async function snap(filename, width = 1200, height = 750) {
      await send('browsingContext.setViewport', {
        context: contextId,
        viewport: { width, height },
        devicePixelRatio: 1
      });
      await new Promise(r => setTimeout(r, 400));
      const shot = await send('browsingContext.captureScreenshot', { context: contextId });
      const targetFile = path.join(outDir, filename);
      fs.writeFileSync(targetFile, Buffer.from(shot.data, 'base64'));
      console.log(`[Captured] ${filename} (${width}x${height})`);
    }

    // 1. Initial navigation & mock login
    console.log('Navigating and authenticating as admin...');
    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/admin',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 1200));

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

    // Ensure dark mode for sleek terminal look
    await evalJs(`(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    })()`);
    await new Promise(r => setTimeout(r, 300));

    // ==========================================
    // CAPTURE 1: Overview Dashboard & KPI Summary
    // ==========================================
    await snap('docs_overview_dashboard.png', 1200, 750);

    // ==========================================
    // CAPTURE 2: Omnibox Command Palette (Ctrl+K)
    // ==========================================
    console.log('Triggering Command Palette Omnibox...');
    await evalJs(`(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    })()`);
    await new Promise(r => setTimeout(r, 600));
    await snap('docs_app_omnibox.png', 1100, 680);

    // Close Omnibox
    await evalJs(`(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // ==========================================
    // CAPTURE 3: Workshop Settings & Profile Modal
    // ==========================================
    console.log('Opening Workshop Settings Modal...');
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
    await new Promise(r => setTimeout(r, 400));
    await snap('docs_owner_settings.png', 1100, 720);

    // Close settings modal
    await evalJs(`(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // ==========================================
    // CAPTURE 4: Repair Orders Page & New RO Modal
    // ==========================================
    console.log('Navigating to Repair Orders Tab...');
    await evalJs(`(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Servis Mobil (RO)'));
      if (tab) tab.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));

    // Open "Buat RO Baru" modal
    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Buat RO Baru') || b.textContent.includes('Order Servis'));
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 600));
    await snap('docs_kasir_new_ro.png', 1100, 750);

    // Close New RO Modal
    await evalJs(`(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // ==========================================
    // CAPTURE 5 & 6: RO Detail (Lifecycle & Photos)
    // ==========================================
    console.log('Opening First RO Detail...');
    await evalJs(`(() => {
      const roCardOrRow = document.querySelector('button[title*="Lihat Detail"], tr.cursor-pointer, div.cursor-pointer') ||
        Array.from(document.querySelectorAll('button, tr, div')).find(el => el.textContent && el.textContent.includes('AG 1822 AB'));
      if (roCardOrRow) roCardOrRow.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // Snap Top Section (6-Stage Stepper & Status)
    await evalJs(`window.scrollTo(0, 0);`);
    await new Promise(r => setTimeout(r, 300));
    await snap('docs_ro_lifecycle.png', 1200, 750);

    // Scroll to Photo Documentation section
    await evalJs(`(() => {
      const photoHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Dokumentasi Foto'));
      if (photoHeading) {
        photoHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        window.scrollTo(0, 500);
      }
    })()`);
    await new Promise(r => setTimeout(r, 600));
    await snap('docs_photo_upload.png', 1200, 750);

    // Scroll to Parts & Payment section
    await evalJs(`(() => {
      const payHeading = Array.from(document.querySelectorAll('h3, h4')).find(h => h.textContent.includes('Rincian Biaya') || h.textContent.includes('Pembayaran'));
      if (payHeading) {
        payHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        window.scrollTo(0, 1100);
      }
    })()`);
    await new Promise(r => setTimeout(r, 600));
    await snap('docs_kasir_payment.png', 1200, 750);

    // Go back to RO List
    await evalJs(`(() => {
      const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kembali') || b.querySelector('svg.lucide-arrow-left'));
      if (backBtn) backBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 600));

    // ==========================================
    // CAPTURE 7: Inventory Catalog
    // ==========================================
    console.log('Navigating to Inventory Catalog...');
    await evalJs(`(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Inventaris & Sparepart'));
      if (tab) tab.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));
    await snap('docs_inventory_catalog.png', 1200, 750);

    // ==========================================
    // CAPTURE 8: Stock Mutations Audit Trail
    // ==========================================
    console.log('Navigating to Stock Mutations...');
    await evalJs(`(() => {
      const sub = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Riwayat Mutasi'));
      if (sub) sub.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));
    await snap('docs_stock_mutations.png', 1200, 750);

    // ==========================================
    // CAPTURE 9: Stock Opname
    // ==========================================
    console.log('Navigating to Stock Opname...');
    await evalJs(`(() => {
      const sub = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Stok Opname'));
      if (sub) sub.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));
    await snap('docs_stock_opname.png', 1200, 750);

    // ==========================================
    // CAPTURE 10: Finance & Cashflow
    // ==========================================
    console.log('Navigating to Finance Tab...');
    await evalJs(`(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Buku Kas & Keuangan'));
      if (tab) tab.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));
    await snap('docs_finance_cashflow.png', 1200, 750);

    // ==========================================
    // CAPTURE 11 & 12: Customers CRM & WhatsApp Promo
    // ==========================================
    console.log('Navigating to Customers CRM Tab...');
    await evalJs(`(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pelanggan'));
      if (tab) tab.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));
    await snap('docs_crm_customers.png', 1200, 750);

    // Open WhatsApp Promo modal
    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kirim Promo WhatsApp') || b.textContent.includes('Promosi'));
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 600));
    await snap('docs_crm_whatsapp.png', 1100, 720);

    // Close WhatsApp modal
    await evalJs(`(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`);
    await new Promise(r => setTimeout(r, 400));

    // ==========================================
    // CAPTURE 13: Public Tracking Portal (No Login)
    // ==========================================
    console.log('Navigating to Public Tracking Portal...');
    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/bengkel-gps-motor/cek-status?plate=AG%201822%20AB',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 1200));
    await snap('docs_public_tracking.png', 1200, 750);

    // ==========================================
    // CAPTURE 14: Superadmin Portal
    // ==========================================
    console.log('Navigating to Superadmin Portal...');
    await evalJs(`(async () => {
      try {
        await fetch('/api/auth/mock-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tenantSlug: 'bengkel-gps-motor', email: 'superadmin@gpsmotor.local' })
        });
      } catch(e) {}
    })()`);
    await new Promise(r => setTimeout(r, 500));
    await send('browsingContext.navigate', {
      context: contextId,
      url: 'http://localhost:5173/superadmin',
      wait: 'complete'
    });
    await new Promise(r => setTimeout(r, 1200));
    await snap('docs_superadmin.png', 1200, 750);

    console.log('ALL DOCS SCREENSHOTS CAPTURED SUCCESSFULLY!');
    await send('session.end', {});
    ws.close();
  } finally {
    ff.kill('SIGKILL');
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

captureDocsScreenshots().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
