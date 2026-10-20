import { spawn } from 'node:child_process';
import fs from 'node:fs';

const profileDir = fs.mkdtempSync('/tmp/ff_eval_');
const ff = spawn('firefox', [
  '--headless',
  '--profile', profileDir,
  '--remote-debugging-port', '9238',
  '--remote-allow-system-access'
], { stdio: 'ignore' });

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  await sleep(1500);
  const ws = new WebSocket('ws://127.0.0.1:9238/session');
  let msgId = 1;
  const pending = new Map();
  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      if (m.error) pending.get(m.id).reject(new Error(m.error + ': ' + m.message));
      else pending.get(m.id).resolve(m.result);
    }
  };
  await new Promise(r => ws.onopen = r);
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

  // Common analysis function to inject
  const analysisSnippet = `(() => {
    function luminance(r, g, b) {
      var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    function parseRgb(colorStr) {
      var match = colorStr ? colorStr.match(/\\d+/g) : null;
      if (!match || match.length < 3) return [0, 0, 0];
      return match.slice(0, 3).map(Number);
    }
    function getContrast(fg, bg) {
      var c1 = parseRgb(fg);
      var c2 = parseRgb(bg);
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
            text: (el.textContent || el.getAttribute('aria-label') || el.title || el.placeholder || '').trim().slice(0, 35),
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
            classes: (el.className || '').toString().slice(0, 70)
          });
        }
      }
    });

    var docWidth = document.documentElement.clientWidth;
    var bodyScroll = document.documentElement.scrollWidth;

    // Check tabular-nums
    var numEls = Array.from(document.querySelectorAll('*')).filter(function(el) {
      return el.children.length === 0 && (el.textContent.includes('Rp') || /\\b\\d{1,3}(\\.\\d{3})+\\b/.test(el.textContent));
    });
    var missingTabular = [];
    numEls.forEach(function(el) {
      var style = window.getComputedStyle(el);
      var hasTnum = style.fontFeatureSettings.includes('tnum') || el.classList.contains('tabular-nums') || style.fontFamily.includes('mono');
      if (!hasTnum) {
        missingTabular.push({
          text: el.textContent.trim().slice(0, 25),
          fontFeature: style.fontFeatureSettings,
          fontFamily: style.fontFamily
        });
      }
    });

    // Check color contrasts on visible text elements
    var textEls = Array.from(document.querySelectorAll('span, p, h1, h2, h3, h4, th, td, label, button, a')).filter(function(el) {
      return el.children.length === 0 && el.textContent.trim().length > 0;
    });
    var contrastIssues = [];
    textEls.forEach(function(el) {
      var style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
      var fg = style.color;
      var curr = el;
      var bg = 'rgba(0, 0, 0, 0)';
      while (curr && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = window.getComputedStyle(curr).backgroundColor;
        curr = curr.parentElement;
      }
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        var ratio = getContrast(fg, bg);
        var size = parseFloat(style.fontSize) || 14;
        var weight = parseInt(style.fontWeight, 10) || 400;
        var isLarge = size >= 18 || (size >= 14 && weight >= 700);
        var threshold = isLarge ? 3.0 : 4.5;
        if (ratio < threshold) {
          contrastIssues.push({
            text: el.textContent.trim().slice(0, 35),
            fg: fg,
            bg: bg,
            ratio: Math.round(ratio * 100) / 100,
            threshold: threshold,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight
          });
        }
      }
    });

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hasHorizontalScroll: bodyScroll > docWidth,
      scrollWidth: bodyScroll,
      clientWidth: docWidth,
      totalInteractives: interactives.length,
      smallTargetsCount: smallTargets.length,
      smallTargets: smallTargets,
      totalNumericElements: numEls.length,
      missingTabularCount: missingTabular.length,
      missingTabularSample: missingTabular.slice(0, 8),
      totalTextElements: textEls.length,
      contrastIssuesCount: contrastIssues.length,
      contrastIssuesSample: contrastIssues.slice(0, 10)
    };
  })()`;

  console.log('Navigating to /admin...');
  await send('browsingContext.navigate', { context: contextId, url: 'http://localhost:5173/admin', wait: 'complete' });
  await sleep(1500);

  // Admin Desktop (1280x900)
  await setViewport(1280, 900);
  await sleep(800);
  const adminDesktopRes = await evalJs(`JSON.stringify(${analysisSnippet})`);
  console.log('\n=== ADMIN DESKTOP (1280x900) ===');
  console.log(adminDesktopRes);

  // Admin Mobile (390x844)
  await setViewport(390, 844);
  await sleep(800);
  const adminMobileRes = await evalJs(`JSON.stringify(${analysisSnippet})`);
  console.log('\n=== ADMIN MOBILE (390x844) ===');
  console.log(adminMobileRes);

  // Superadmin Desktop (1280x900)
  await setViewport(1280, 900);
  await evalJs(`(async () => {
    await fetch('/api/auth/mock-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tenantSlug: 'bengkel-gps-motor', email: 'superadmin@gpsmotor.id', name: 'Superadmin GPS Motor' })
    });
  })()`);
  await send('browsingContext.navigate', { context: contextId, url: 'http://localhost:5173/superadmin', wait: 'complete' });
  await sleep(2000);
  const superadminDesktopRes = await evalJs(`JSON.stringify(${analysisSnippet})`);
  console.log('\n=== SUPERADMIN DESKTOP (1280x900) ===');
  console.log(superadminDesktopRes);

  // Check OnboardingModal specifically
  await send('browsingContext.navigate', { context: contextId, url: 'http://localhost:5173/admin', wait: 'complete' });
  await sleep(1500);
  // Force open onboarding modal via state or DOM test
  const onboardingTest = await evalJs(`JSON.stringify((() => {
    // Check if OnboardingModal can be mounted or if input sizes can be tested
    return {
      title: document.title
    };
  })())`);

  ws.close();
  ff.kill('SIGKILL');
  fs.rmSync(profileDir, { recursive: true, force: true });
}

try {
  await run();
} catch (e) {
  console.error('Error:', e);
  process.exit(1);
}
