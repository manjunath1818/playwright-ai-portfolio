import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};

const baseRef = option('--base', 'origin/main');
const headRef = option('--head', 'HEAD');
const reportPath = option('--report', 'pr-review.md');
const git = (...gitArgs) => execFileSync('git', gitArgs, { encoding: 'utf8' }).trim();
const tryGit = (...gitArgs) => {
  try { return git(...gitArgs); } catch { return ''; }
};
const changedFiles = tryGit('diff', '--name-only', `${baseRef}...${headRef}`).split(/\r?\n/).filter(Boolean);

function dependenciesChanged() {
  if (!changedFiles.includes('package.json') || !existsSync('package.json')) return [];
  const beforeRaw = tryGit('show', `${baseRef}:package.json`);
  if (!beforeRaw) return [];
  const before = JSON.parse(beforeRaw);
  const after = JSON.parse(readFileSync('package.json', 'utf8'));
  const prior = { ...(before.dependencies ?? {}), ...(before.devDependencies ?? {}) };
  const current = { ...(after.dependencies ?? {}), ...(after.devDependencies ?? {}) };
  return Object.keys(current).filter((name) => prior[name] !== current[name]);
}

const findings = [];
const add = (severity, rule, file, detail) => findings.push({ severity, rule, file, detail });

for (const file of changedFiles) {
  if (/^(\.env|storage-state\.json)$/i.test(path.basename(file))) {
    add('blocking', 'Secret protection', file, 'Do not commit environment files, storage state, or tokens.');
  }
  if (/^playwright\.config\.(ts|js)$/i.test(file)) {
    add('warning', 'Configuration review', file, 'Confirm the Playwright configuration change has explicit approval.');
  }
  if (!/\.(?:[cm]?[jt]s|tsx|jsx)$/i.test(file) || !existsSync(file)) continue;

  const source = readFileSync(file, 'utf8');
  if (/page\.waitForTimeout\s*\(/.test(source)) add('blocking', 'No fixed waits', file, 'Replace page.waitForTimeout with auto-waiting or a web-first assertion.');
  if (/waitForSelector\s*\(/.test(source)) add('blocking', 'No waitForSelector', file, 'Use locator auto-waiting and web-first assertions.');
  if (/page\.pause\s*\(/.test(source)) add('blocking', 'No committed pause', file, 'Remove page.pause before commit.');
  if (/locator\s*\(\s*['"](?:xpath=|\/\/|\.|#)/.test(source)) add('warning', 'Locator priority', file, 'Review CSS/XPath locator usage against the project locator policy.');

  if (/^tests\/.+\.spec\.(?:ts|js)$/i.test(file)) {
    if (/from\s+['"]@playwright\/test['"]/.test(source)) add('blocking', 'Fixture import', file, 'Tests must import test from src/fixtures/base.ts, not @playwright/test directly.');
    if (!/from\s+['"].*src\/fixtures\/base(?:\.ts)?['"]/.test(source)) add('warning', 'Fixture import', file, 'Confirm the spec uses the shared base fixture.');
    if (!/@(?:smoke|regression|critical)\b/.test(source)) add('warning', 'Test tagging', file, 'Confirm the new test has an @smoke, @regression, or @critical tag.');
  }
}

for (const dependency of dependenciesChanged()) {
  add('warning', 'Dependency review', 'package.json', `Dependency changed: ${dependency}. Confirm the dependency is approved and justified.`);
}

const blocking = findings.filter((finding) => finding.severity === 'blocking');
const warnings = findings.filter((finding) => finding.severity === 'warning');
const status = blocking.length ? 'blocked' : warnings.length ? 'needs-human-review' : 'pass';
const lines = [
  '<!-- qa-pr-review-agent -->',
  '## QA PR Review Agent',
  '',
  `**Status:** ${status === 'pass' ? '✅ Pass' : status === 'blocked' ? '⛔ Blocked' : '⚠️ Needs human review'}`,
  '',
  `- Base: \`${baseRef}\``,
  `- Head: \`${headRef}\``,
  `- Changed files reviewed: ${changedFiles.length}`,
  '- Scope: deterministic repository-rule review. The existing Playwright Tests workflow provides test execution evidence.',
  '',
  '### Files reviewed',
  ...(changedFiles.length ? changedFiles.map((file) => `- \`${file}\``) : ['- No changed files were detected.']),
  '',
  '### Findings',
];

if (!findings.length) lines.push('- No static rule violations found. Human review is still required.');
for (const finding of findings) {
  const symbol = finding.severity === 'blocking' ? '⛔' : '⚠️';
  lines.push(`- ${symbol} **${finding.rule}** — \`${finding.file}\`: ${finding.detail}`);
}

lines.push('', '### Merge guidance');
if (status === 'blocked') lines.push('- Do not merge until all blocking findings are resolved and CI is green.');
else if (status === 'needs-human-review') lines.push('- Resolve or explicitly accept the warnings, then confirm CI is green.');
else lines.push('- Static review passed. Confirm the Playwright Tests workflow is green before merging.');

writeFileSync(reportPath, `${lines.join('\n')}\n`);
console.log(`PR review report written to ${reportPath}`);
console.log(`Status: ${status}`);

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `status=${status}\n`);
