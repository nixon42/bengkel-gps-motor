/**
 * In-Process Test Harness & Helper Utilities for Bengkel Mobil GPS Motor Kediri
 * Integrates supertest with in-memory SQLite and Express app, providing
 * session authentication, tenant isolation helpers, and business logic oracles.
 */

import request from 'supertest';
import { createApp } from '../server/app.js';
import { initDatabase } from '../server/db/index.js';

/**
 * Creates an isolated in-memory test application and database
 */
export function createTestApp() {
  const db = initDatabase(':memory:');
  const app = createApp(db);

  return {
    app,
    db,
    cleanup: () => {
      try {
        db.close();
      } catch (err) {
        // Ignored on teardown
      }
    }
  };
}

/**
 * Authenticates as an operator for the given tenant slug and email
 * Returns session cookie and user/tenant payload
 */
export async function loginUser(app, { tenantSlug = 'bengkel-gps-motor', email, name } = {}) {
  const payload = { tenantSlug, name };
  if (email !== undefined) payload.email = email;
  const res = await request(app)
    .post('/api/auth/mock-login')
    .send(payload)
    .expect(200);

  const rawCookies = res.headers['set-cookie'] || [];
  const sessionCookie = rawCookies.find(c => c.startsWith('bengkel_session='));
  const cookieValue = sessionCookie ? sessionCookie.split(';')[0] : '';
  const sessionId = res.body.sessionId;

  return {
    res,
    sessionId,
    cookie: cookieValue,
    authHeader: sessionId ? `Bearer ${sessionId}` : '',
    user: res.body.user,
    tenant: res.body.tenant
  };
}

/**
 * Creates an authenticated request agent attached to the Express app
 */
export function createAuthAgent(app, { cookie, authHeader, tenantId }) {
  const agent = request.agent(app);
  return {
    get: (url) => {
      let req = agent.get(url);
      if (cookie) req = req.set('Cookie', cookie);
      if (authHeader) req = req.set('Authorization', authHeader);
      if (tenantId) req = req.set('x-tenant-id', tenantId);
      return req;
    },
    post: (url) => {
      let req = agent.post(url);
      if (cookie) req = req.set('Cookie', cookie);
      if (authHeader) req = req.set('Authorization', authHeader);
      if (tenantId) req = req.set('x-tenant-id', tenantId);
      return req;
    },
    put: (url) => {
      let req = agent.put(url);
      if (cookie) req = req.set('Cookie', cookie);
      if (authHeader) req = req.set('Authorization', authHeader);
      if (tenantId) req = req.set('x-tenant-id', tenantId);
      return req;
    },
    delete: (url) => {
      let req = agent.delete(url);
      if (cookie) req = req.set('Cookie', cookie);
      if (authHeader) req = req.set('Authorization', authHeader);
      if (tenantId) req = req.set('x-tenant-id', tenantId);
      return req;
    }
  };
}

/**
 * Executes a function with console.error temporarily silenced
 */
export async function withSilencedConsole(fn) {
  const originalError = console.error;
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.error = originalError;
  }
}

// ==========================================
// BUSINESS LOGIC ORACLES (Expected Output Verifiers)
// ==========================================

/**
 * Oracle for License Plate Privacy Masking (R6, E01, E03)
 */
export function oracleMaskPlate(plate) {
  if (!plate || typeof plate !== 'string') return '';
  // Normalize spaces and hyphens, uppercase
  const normalized = plate.toUpperCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Format with standard components: [Region] [Digits] [Suffix]
  const matchWithSpaces = normalized.match(/^([A-Z]{1,2})\s+(\d+)\s+([A-Z]+)$/);
  if (matchWithSpaces) {
    const [, region, digits, suffix] = matchWithSpaces;
    const len = digits.length;
    let maskedDigits = '';
    if (len >= 4) {
      maskedDigits = digits.slice(0, 2) + '*'.repeat(len - 2);
    } else if (len === 3) {
      maskedDigits = digits.slice(0, 2) + '*';
    } else if (len === 2) {
      maskedDigits = digits.slice(0, 1) + '*'; // E03 Short 2-digit plate (e.g. B 12 A -> B 1* A)
    } else {
      maskedDigits = digits.slice(0, 1) + '*'; // E03 Short 1-digit plate (e.g. AG 1 X -> AG 1* X)
    }
    return `${region} ${maskedDigits} ${suffix}`;
  }

  // Fallback for compact plate without spaces (e.g. AG1234XX -> AG 12** XX)
  const matchCompact = normalized.match(/^([A-Z]{1,2})(\d+)([A-Z]+)$/);
  if (matchCompact) {
    const [, region, digits, suffix] = matchCompact;
    const len = digits.length;
    let maskedDigits = '';
    if (len >= 4) {
      maskedDigits = digits.slice(0, 2) + '*'.repeat(len - 2);
    } else if (len === 3) {
      maskedDigits = digits.slice(0, 2) + '*';
    } else {
      maskedDigits = digits.slice(0, 1) + '*';
    }
    return `${region} ${maskedDigits} ${suffix}`;
  }

  return normalized;
}

/**
 * Oracle for Customer Name Privacy Masking (R6, E04, E05)
 */
export function oracleMaskName(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  const tokens = trimmed.split(/\s+/);

  if (tokens.length === 1) {
    const single = tokens[0];
    if (single.length <= 1) return single + '*';
    if (single.length === 2) return single[0] + '*';
    // Single word name like "Slamet" (E04) -> first 3 chars preserved or first 3 + ***
    return single.slice(0, 3) + '*'.repeat(Math.max(1, single.length - 3));
  }

  const first = tokens[0];
  const rest = tokens.slice(1).map(t => {
    if (t.length <= 1) return t + '*';
    return t[0] + '*'.repeat(Math.max(t.length - 1, 3));
  }).join(' ');

  return `${first} ${rest}`;
}

/**
 * Oracle for Profit Margin Calculation (R3, E08, E09)
 */
export function oracleProfitMargin(buyPrice, sellPrice) {
  const buy = Number(buyPrice) || 0;
  const sell = Number(sellPrice) || 0;
  const nominal = sell - buy;

  let percentage = 0;
  if (sell > 0) {
    percentage = ((sell - buy) / sell) * 100;
  } else if (sell === 0 && buy > 0) {
    percentage = -100;
  } else {
    // Both 0 or gift item (E08 Divide by Zero Protection)
    percentage = 0;
  }

  // Round to 2 decimal places, guarantee no NaN or Infinity
  const safePercentage = Number.isFinite(percentage) ? Math.round(percentage * 100) / 100 : 0;

  return {
    nominal,
    percentage: safePercentage,
    isProfit: nominal > 0,
    isLoss: nominal < 0
  };
}

/**
 * Oracle for Cashflow Net Balance (R4, E12)
 */
export function oracleNetBalance(incomes = [], expenses = []) {
  const totalIncome = incomes.reduce((acc, curr) => acc + (Number(curr.amount || curr.nominal) || 0), 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + (Number(curr.amount || curr.nominal) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    isDeficit: netBalance < 0
  };
}

/**
 * Oracle for RFC-4180 CSV Field Escaping (R3b, R4, E18)
 */
export function oracleEscapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
