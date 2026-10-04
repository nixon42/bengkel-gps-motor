#!/usr/bin/env node
/**
 * Master E2E Verification Test Runner for Bengkel Mobil GPS Motor Kediri
 * Executes the complete 4-tier test suite in-process with isolated SQLite database.
 * 
 * Usage:
 *   node test/verify.js           # Run standard verification suite
 *   node test/verify.js --strict  # Require all routes across all milestones to be implemented
 */

import { runTier1Features } from './e2e/tier1-features.js';
import { runTier2Boundary } from './e2e/tier2-boundary.js';
import { runTier3Interactions } from './e2e/tier3-interactions.js';
import { runTier4Scenarios } from './e2e/tier4-scenarios.js';

const isStrict = process.argv.includes('--strict');
const tierArg = process.argv.find(a => a.startsWith('--tier='));
const targetTier = tierArg ? parseInt(tierArg.split('=')[1], 10) : null;

// ANSI Color codes for clean terminal output
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

async function main() {
  const startTime = Date.now();

  console.log(`\n${COLORS.bold}================================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}  Bengkel Mobil GPS Motor Kediri — E2E Test Suite Verification  ${COLORS.reset}`);
  console.log(`${COLORS.bold}================================================================${COLORS.reset}\n`);

  const allResults = [];

  // Tier 1: Feature Coverage
  if (!targetTier || targetTier === 1) {
    console.log(`${COLORS.bold}${COLORS.cyan}▶ Tier 1: Feature Coverage (R1-R11 Core Functions)${COLORS.reset}`);
    const t1Results = await runTier1Features();
    printResults(t1Results);
    allResults.push(...t1Results);
  }

  // Tier 2: Boundary & Corner Cases
  if (!targetTier || targetTier === 2) {
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Tier 2: Boundary & Corner Cases (E01-E18 Edge Scenarios)${COLORS.reset}`);
    const t2Results = await runTier2Boundary();
    printResults(t2Results);
    allResults.push(...t2Results);
  }

  // Tier 3: Cross-Feature Interactions
  if (!targetTier || targetTier === 3) {
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Tier 3: Cross-Feature Interactions (RO, Inventory, Finance)${COLORS.reset}`);
    const t3Results = await runTier3Interactions();
    printResults(t3Results);
    allResults.push(...t3Results);
  }

  // Tier 4: Real-World Scenarios
  if (!targetTier || targetTier === 4) {
    console.log(`\n${COLORS.bold}${COLORS.cyan}▶ Tier 4: Real-World Customer Scenarios (End-to-End Workflow)${COLORS.reset}`);
    const t4Results = await runTier4Scenarios();
    printResults(t4Results);
    allResults.push(...t4Results);
  }

  // Summary Metrics
  const total = allResults.length;
  const passed = allResults.filter(r => r.pass && !r.pendingMilestone).length;
  const pending = allResults.filter(r => r.pendingMilestone).length;
  const failed = allResults.filter(r => !r.pass).length;
  const totalTimeMs = Date.now() - startTime;

  console.log(`\n${COLORS.bold}----------------------------------------------------------------${COLORS.reset}`);
  console.log(`${COLORS.bold}  Test Suite Execution Summary:${COLORS.reset}`);
  console.log(`  Total Tests:     ${total}`);
  console.log(`  ${COLORS.green}✔ Passed Active: ${passed}${COLORS.reset}`);
  if (pending > 0) {
    console.log(`  ${COLORS.yellow}⏳ Pending Routes:${pending} (Scheduled for subsequent milestones)${COLORS.reset}`);
  }
  if (failed > 0) {
    console.log(`  ${COLORS.red}✖ Failed:        ${failed}${COLORS.reset}`);
  }
  console.log(`  Duration:        ${(totalTimeMs / 1000).toFixed(2)}s`);
  console.log(`${COLORS.bold}----------------------------------------------------------------${COLORS.reset}\n`);

  if (failed > 0) {
    console.error(`${COLORS.red}${COLORS.bold}Verification FAILED: ${failed} test(s) failed.${COLORS.reset}`);
    process.exit(1);
  }

  if (isStrict && pending > 0) {
    console.error(`${COLORS.red}${COLORS.bold}Strict Mode FAILED: ${pending} milestone route(s) pending implementation.${COLORS.reset}`);
    process.exit(1);
  }

  console.log(`${COLORS.green}${COLORS.bold}✔ ALL VERIFICATIONS PASSED SUCCESSFULLY (Exit 0)${COLORS.reset}\n`);
  process.exit(0);
}

function printResults(results) {
  for (const r of results) {
    const time = `${COLORS.dim}(${r.durationMs || 0}ms)${COLORS.reset}`;
    if (!r.pass) {
      console.log(`  ${COLORS.red}✖ FAIL${COLORS.reset} ${r.name} ${time}`);
      console.log(`    ${COLORS.red}Error: ${r.error}${COLORS.reset}`);
    } else if (r.pendingMilestone) {
      console.log(`  ${COLORS.yellow}⏳ PENDING [${r.pendingMilestone}]${COLORS.reset} ${r.name} ${time}`);
      console.log(`    ${COLORS.dim}→ ${r.note}${COLORS.reset}`);
    } else {
      console.log(`  ${COLORS.green}✔ PASS${COLORS.reset} ${r.name} ${time}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
