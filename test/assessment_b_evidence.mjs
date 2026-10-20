import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = '/tmp/assessment_b_evidence';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const profileDir = fs.mkdtempSync('/tmp/ff_assess_');
const ff = spawn('firefox', [
  '--headless',
  '--profile', profileDir,
  '--remote-debugging-port', '9235',
  '--remote-allow-system-access'
], { stdio: 'inherit' });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  await sleep(1500);

  const ws = new WebSocket('ws://127.0.0.1:9235/session');
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

  console.log('Connected to WebDriver BiDi on port 9235');
  await send('session.new', { capabilities: {} });

  const tree = await send('browsingContext.getTree', {});
  const contextId = tree.contexts[0].context;

  async function setViewport(width, height) {
    await send('browsingContext.setViewport', {
      context: contextId,
      viewport: { width, height },
      devicePixelRatio: 1
    });
    await sleep(200);
  }

  async function takeScreenshot(filename) {
    const shot = await send('browsingContext.captureScreenshot', { context: contextId });
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);
    return filePath;
  }

  async function evalJs(code) {
    const res = await send('script.evaluate', {
      expression: code,
      target: { context: contextId },
      awaitPromise: true
    });
    if (res.result && res.result.value !== undefined) {
      return res.result.value;
    }
    return res;
  }

  const inspectionReport = {
    timestamp: new Date().toISOString(),
    screenshots: {},
    domAnalysis: {}
  };

  // -------------------------------------------------------------
  // 1. TENANT WORKSPACE - ADMIN DASHBOARD & DASHBOARD PAGE
  // -------------------------------------------------------------
  console.log('\n--- 1. Testing Tenant Admin Dashboard ---');
  await send('browsingContext.navigate', {
    context: contextId,
    url: 'http://localhost:5173/admin',
    wait: 'complete'
  });
  await sleep(2000);

  // Set desktop viewport (1280x900)
  await setViewport(1280, 900);
  await sleep(1000);

  // Ensure mock login as admin
  await evalJs(`(async () => {
    try {
      await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tenantSlug: 'bengkel-gps-motor', email: 'admin@gpsmotor.local' })
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  })()`);
  await sleep(2500);

  // Desktop Overview
  inspectionReport.screenshots.tenantDesktopOverview = await takeScreenshot('tenant_desktop_1280_overview.png');

  // Inspect Desktop Overview DOM (touch targets, contrast, tabular nums, overflow)
  const desktopDomOverview = await evalJs(`JSON.stringify((() => {
    function getContrast(rgb1, rgb2) {
      function luminance(r, g, b) {
        var a = [r, g, b].map(function (v) {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }
      function parseRgb(colorStr) {
        var match = colorStr.match(/\\d+/g);
        if (!match || match.length < 3) return [0, 0, 0];
        return match.slice(0, 3).map(Number);
      }
      var c1 = parseRgb(rgb1);
      var c2 = parseRgb(rgb2);
      var l1 = luminance(c1[0], c1[1], c1[2]) + 0.05;
      var l2 = luminance(c2[0], c2[1], c2[2]) + 0.05;
      return l1 > l2 ? l1 / l2 : l2 / l1;
    }

    var interactives = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));
    var smallTargets = [];
    interactives.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var style = window.getComputedStyle(el);
      if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
        if (rect.width < 44 || rect.height < 44) {
          smallTargets.push({
            tag: el.tagName.toLowerCase(),
            text: (el.innerText || el.getAttribute('aria-label') || el.title || el.placeholder || '').trim().slice(0, 40),
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
            className: (el.className || '').toString().slice(0, 80)
          });
        }
      }
    });

    // Check horizontal overflow
    var docWidth = document.documentElement.clientWidth;
    var bodyScroll = document.documentElement.scrollWidth;
    var hasHScroll = bodyScroll > docWidth;

    // Check tabular-nums on numbers
    var rupiahElements = Array.from(document.querySelectorAll('*')).filter(function(el) {
      return el.children.length === 0 && (el.innerText.includes('Rp') || /\\b\\d{1,3}(\\.\\d{3})+\\b/.test(el.innerText));
    });
    var missingTabularNums = [];
    rupiahElements.slice(0, 15).forEach(function(el) {
      var fontFeature = window.getComputedStyle(el).fontFeatureSettings;
      var hasTabular = fontFeature.includes('tnum') || el.classList.contains('tabular-nums');
      if (!hasTabular) {
        missingTabularNums.push({
          text: el.innerText.trim().slice(0, 30),
          fontFeature: fontFeature,
          className: (el.className || '').toString().slice(0, 60)
        });
      }
    });

    // Check contrast samples on badges / cards / text
    var textNodes = Array.from(document.querySelectorAll('span, p, h1, h2, h3, h4, th, td, label')).filter(function(el) {
      return el.children.length === 0 && el.innerText.trim().length > 0;
    });
    var contrastIssues = [];
    textNodes.slice(0, 50).forEach(function(el) {
      var style = window.getComputedStyle(el);
      var parent = el.parentElement;
      var parentStyle = parent ? window.getComputedStyle(parent) : null;
      var fg = style.color;
      var bg = style.backgroundColor;
      if ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && parentStyle) {
        bg = parentStyle.backgroundColor;
      }
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && fg) {
        var ratio = getContrast(fg, bg);
        if (ratio < 4.5) {
          contrastIssues.push({
            text: el.innerText.trim().slice(0, 30),
            fg: fg,
            bg: bg,
            ratio: Math.round(ratio * 100) / 100,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight
          });
        }
      }
    });

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hasHorizontalScroll: hasHScroll,
      scrollWidth: bodyScroll,
      clientWidth: docWidth,
      totalInteractives: interactives.length,
      smallTargetsCount: smallTargets.length,
      sampleSmallTargets: smallTargets.slice(0, 10),
      missingTabularNumsSample: missingTabularNums.slice(0, 10),
      contrastIssuesSample: contrastIssues.slice(0, 10)
    };
  })())`);

  inspectionReport.domAnalysis.tenantDesktopOverview = typeof desktopDomOverview === 'string' ? JSON.parse(desktopDomOverview) : desktopDomOverview;

  // -------------------------------------------------------------
  // 2. TENANT TABS CAPTURE (Desktop)
  // -------------------------------------------------------------
  console.log('\n--- 2. Capturing Tenant Tabs (Desktop) ---');
  const tabsToCapture = [
    { id: 'repair-orders', label: 'Servis Mobil (RO)', file: 'tenant_desktop_tab_repair_orders.png' },
    { id: 'inventory', label: 'Inventaris & Sparepart', file: 'tenant_desktop_tab_inventory.png' },
    { id: 'finance', label: 'Buku Kas & Keuangan', file: 'tenant_desktop_tab_finance.png' },
    { id: 'mutations', label: 'Mutasi Stok', file: 'tenant_desktop_tab_mutations.png' }
  ];

  for (const tab of tabsToCapture) {
    await evalJs(`(() => {
      var btns = Array.from(document.querySelectorAll('button'));
      var targetBtn = btns.find(b => b.innerText && b.innerText.includes('${tab.label}'));
      if (targetBtn) targetBtn.click();
    })()`);
    await sleep(1200);
    inspectionReport.screenshots[tab.id] = await takeScreenshot(tab.file);
  }

  // Back to overview
  await evalJs(`(() => {
    var btns = Array.from(document.querySelectorAll('button'));
    var targetBtn = btns.find(b => b.innerText && b.innerText.includes('Ringkasan Bengkel'));
    if (targetBtn) targetBtn.click();
  })()`);
  await sleep(1000);

  // -------------------------------------------------------------
  // 3. SETTINGS MODAL / ONBOARDING MODAL
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Settings & Onboarding Modal ---');
  await evalJs(`(() => {
    var btn = document.querySelector('button[aria-label="Pengaturan Bengkel"]');
    if (btn) btn.click();
  })()`);
  await sleep(800);
  inspectionReport.screenshots.settingsModal = await takeScreenshot('tenant_desktop_settings_modal.png');

  // Close Settings modal
  await evalJs(`(() => {
    var closeBtn = document.querySelector('button[aria-label="Tutup Pengaturan"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Batal'));
    if (closeBtn) closeBtn.click();
  })()`);
  await sleep(600);

  // -------------------------------------------------------------
  // 4. MOBILE VIEW (390x844)
  // -------------------------------------------------------------
  console.log('\n--- 4. Testing Tenant Mobile View (390x844) ---');
  await setViewport(390, 844);
  await sleep(1200);

  inspectionReport.screenshots.tenantMobileOverviewTop = await takeScreenshot('tenant_mobile_390_overview_top.png');

  // Scroll down to middle/bottom
  await evalJs(`window.scrollTo(0, 600);`);
  await sleep(600);
  inspectionReport.screenshots.tenantMobileOverviewMid = await takeScreenshot('tenant_mobile_390_overview_mid.png');

  await evalJs(`window.scrollTo(0, 1400);`);
  await sleep(600);
  inspectionReport.screenshots.tenantMobileOverviewBottom = await takeScreenshot('tenant_mobile_390_overview_bottom.png');

  // Inspect Mobile DOM
  const mobileDomOverview = await evalJs(`(() => {
    var interactives = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));
    var smallTargets = [];
    interactives.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var style = window.getComputedStyle(el);
      if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
        if (rect.width < 44 || rect.height < 44) {
          smallTargets.push({
            tag: el.tagName.toLowerCase(),
            text: (el.innerText || el.getAttribute('aria-label') || el.title || el.placeholder || '').trim().slice(0, 40),
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
            className: (el.className || '').toString().slice(0, 80)
          });
        }
      }
    });

    var docWidth = document.documentElement.clientWidth;
    var bodyScroll = document.documentElement.scrollWidth;
    var hasHScroll = bodyScroll > docWidth;

    // Mobile bottom nav check
    var nav = document.querySelector('nav.md\\\\:hidden');
    var navButtons = nav ? Array.from(nav.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      width: Math.round(b.getBoundingClientRect().width),
      height: Math.round(b.getBoundingClientRect().height)
    })) : [];

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hasHorizontalScroll: hasHScroll,
      scrollWidth: bodyScroll,
      clientWidth: docWidth,
      totalInteractives: interactives.length,
      smallTargetsCount: smallTargets.length,
      sampleSmallTargets: smallTargets.slice(0, 12),
      mobileBottomNav: navButtons
    };
  })())`);
  inspectionReport.domAnalysis.tenantMobileOverview = typeof mobileDomOverview === 'string' ? JSON.parse(mobileDomOverview) : mobileDomOverview;

  // -------------------------------------------------------------
  // 5. SUPERADMIN DASHBOARD (Desktop 1280x900)
  // -------------------------------------------------------------
  console.log('\n--- 5. Testing Superadmin Portal ---');
  await setViewport(1280, 900);
  await sleep(500);

  // Mock login as superadmin
  await evalJs(`(async () => {
    try {
      await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tenantSlug: 'bengkel-gps-motor', email: 'superadmin@gpsmotor.id', name: 'Superadmin GPS Motor' })
      });
    } catch (e) {
      console.error(e);
    }
  })()`);

  await send('browsingContext.navigate', {
    context: contextId,
    url: 'http://localhost:5173/superadmin',
    wait: 'complete'
  });
  await sleep(2500);

  inspectionReport.screenshots.superadminOverview = await takeScreenshot('superadmin_desktop_1280_overview.png');

  // Switch to Tenants tab
  await evalJs(`(() => {
    var btns = Array.from(document.querySelectorAll('button'));
    var b = btns.find(x => x.innerText && x.innerText.includes('Manajemen Bengkel'));
    if (b) b.click();
  })()`);
  await sleep(1000);
  inspectionReport.screenshots.superadminTenants = await takeScreenshot('superadmin_desktop_1280_tenants.png');

  // Switch to Users tab
  await evalJs(`(() => {
    var btns = Array.from(document.querySelectorAll('button'));
    var b = btns.find(x => x.innerText && x.innerText.includes('Pengguna & Operator'));
    if (b) b.click();
  })()`);
  await sleep(1000);
  inspectionReport.screenshots.superadminUsers = await takeScreenshot('superadmin_desktop_1280_users.png');

  // Switch to System tab
  await evalJs(`(() => {
    var btns = Array.from(document.querySelectorAll('button'));
    var b = btns.find(x => x.innerText && x.innerText.includes('Sistem & Database'));
    if (b) b.click();
  })()`);
  await sleep(1000);
  inspectionReport.screenshots.superadminSystem = await takeScreenshot('superadmin_desktop_1280_system.png');

  // Inspect Superadmin DOM
  const superadminDom = await evalJs(`JSON.stringify((() => {
    function getContrast(rgb1, rgb2) {
      function luminance(r, g, b) {
        var a = [r, g, b].map(function (v) {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }
      function parseRgb(colorStr) {
        var match = colorStr.match(/\\d+/g);
        if (!match || match.length < 3) return [0, 0, 0];
        return match.slice(0, 3).map(Number);
      }
      var c1 = parseRgb(rgb1);
      var c2 = parseRgb(rgb2);
      var l1 = luminance(c1[0], c1[1], c1[2]) + 0.05;
      var l2 = luminance(c2[0], c2[1], c2[2]) + 0.05;
      return l1 > l2 ? l1 / l2 : l2 / l1;
    }

    var interactives = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));
    var smallTargets = [];
    interactives.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var style = window.getComputedStyle(el);
      if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
        if (rect.width < 44 || rect.height < 44) {
          smallTargets.push({
            tag: el.tagName.toLowerCase(),
            text: (el.innerText || el.getAttribute('aria-label') || el.title || el.placeholder || '').trim().slice(0, 40),
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
            className: (el.className || '').toString().slice(0, 80)
          });
        }
      }
    });

    var docWidth = document.documentElement.clientWidth;
    var bodyScroll = document.documentElement.scrollWidth;

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hasHorizontalScroll: bodyScroll > docWidth,
      scrollWidth: bodyScroll,
      clientWidth: docWidth,
      totalInteractives: interactives.length,
      smallTargetsCount: smallTargets.length,
      sampleSmallTargets: smallTargets.slice(0, 10)
    };
  })())`);
  inspectionReport.domAnalysis.superadminSystem = typeof superadminDom === 'string' ? JSON.parse(superadminDom) : superadminDom;

  // Write report to JSON
  fs.writeFileSync(path.join(OUTPUT_DIR, 'inspection_report.json'), JSON.stringify(inspectionReport, null, 2));
  console.log(`\nAll captures complete! Inspection report written to ${OUTPUT_DIR}/inspection_report.json`);

  ws.close();
}

try {
  await run();
} catch (err) {
  console.error('Fatal execution error:', err);
} finally {
  ff.kill('SIGKILL');
  fs.rmSync(profileDir, { recursive: true, force: true });
  process.exit(0);
}
