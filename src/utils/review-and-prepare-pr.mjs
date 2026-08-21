import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
};

const baseBranch = valueAfter('--base') ?? 'main';
const requestedTitle = valueAfter('--title');
const includeUntracked = args.includes('--include-untracked');

const git = (...gitArgs) => execFileSync('git', gitArgs, { encoding: 'utf8' }).trim();
const tryGit = (...gitArgs) => {
  try { return git(...gitArgs); } catch { return ''; }
};

function getBaseRef() {
  const remoteRef = `origin/${baseBranch}`;
  return tryGit('rev-parse', '--verify', remoteRef) ? remoteRef : baseBranch;
}

function changedFiles(baseRef) {
  const files = tryGit('diff', '--name-only', `${baseRef}...HEAD`).split(/\r?\n/).filter(Boolean);
  if (!includeUntracked) return files;
  const untracked = tryGit('ls-files', '--others', '--exclude-standard').split(/\r?\n/).filter(Boolean);
  return [...new Set([...files, ...untracked])];
}

function changedPackageDependencies(baseRef) {
  if (!existsSync('package.json')) return [];
  const current = JSON.parse(readFileSync('package.json', 'utf8'));
  const priorRaw = tryGit('show', `${baseRef}:package.json`);
  if (!priorRaw) return [];
  const prior = JSON.parse(priorRaw);
  const before = { ...(prior.dependencies ?? {}), ...(prior.devDependencies ?? {}) };
  const after = { ...(current.dependencies ?? {}), ...(current.devDependencies ?? {}) };
  return Object.keys(after).filter((name) => before[name] !== after[name]);
}

function review(files, baseRef) {
  const findings = [];
  const add = (severity, rule, file, detail) => findings.push({ severity, rule, file, detail });

  for (const file of files) {
    if (/^(\.env|storage-state\.json)$/i.test(path.basename(file))) add('blocking', 'Secret protection', file, 'Do not commit environment files, storage state, or tokens.');
    if (/^playwright\.config\.(ts|js)$/i.test(file)) add('warning', 'Configuration review', file, 'Confirm this Playwright config change was explicitly approved.');
    if (!/\.(?:[cm]?[jt]s|tsx|jsx)$/i.test(file) || !existsSync(file)) continue;

    const current = readFileSync(file, 'utf8');
    if (/page\.waitForTimeout\s*\(/.test(current)) add('blocking', 'No fixed waits', file, 'Replace page.waitForTimeout with auto-waiting or a web-first assertion.');
    if (/waitForSelector\s*\(/.test(current)) add('blocking', 'No waitForSelector', file, 'Use locator auto-waiting and web-first assertions.');
    if (/page\.pause\s*\(/.test(current)) add('blocking', 'No committed pause', file, 'Remove page.pause before commit.');
    if (/locator\s*\(\s*['"](?:xpath=|\/\/|\.|#)/.test(current)) add('warning', 'Locator priority', file, 'Review CSS/XPath locator usage against the project locator policy.');

    if (/^tests\/.+\.spec\.(?:ts|js)$/i.test(file) && /from\s+['"]@playwright\/test['"]/.test(current)) add('blocking', 'Fixture import', file, 'Tests must import test from src/fixtures/base.ts, not @playwright/test directly.');
    if (/^tests\/.+\.spec\.(?:ts|js)$/i.test(file) && !/from\s+['"].*src\/fixtures\/base(?:\.ts)?['"]/.test(current)) add('warning', 'Fixture import', file, 'Confirm the spec uses the shared base fixture.');
  }

  for (const dependency of changedPackageDependencies(baseRef)) add('warning', 'Dependency review', 'package.json', `Dependency changed: ${dependency}. Confirm the new dependency is approved.`);
  return findings;
}

function titleFromFiles(files) {
  if (files.some((file) => file.startsWith('tests/accessibility/'))) return 'test: add accessibility coverage';
  if (files.some((file) => file.startsWith('tests/api/'))) return 'test: add API coverage';
  return 'chore: review proposed changes';
}

const branch = git('branch', '--show-current');
const baseRef = getBaseRef();
const files = changedFiles(baseRef);
const findings = review(files, baseRef);
const blocking = findings.filter((item) => item.severity === 'blocking');
const title = requestedTitle ?? titleFromFiles(files);
const canPrepare = branch !== baseBranch && files.length > 0 && blocking.length === 0;

console.log('# Dry-run PR Review');
console.log(`- Branch: ${branch}`);
console.log(`- Target: ${baseBranch} (${baseRef})`);
console.log(`- Changed files: ${files.length}`);
console.log('- Mode: dry-run only — no branch, push, or PR was created.');
if (files.length === 0) console.log('\nNo tracked branch changes found. Create a feature branch and make a focused change before preparing a PR.');
if (files.length > 0) { console.log('\n## Files reviewed'); files.forEach((file) => console.log(`- ${file}`)); }

console.log('\n## Findings');
if (findings.length === 0) console.log('- No static rule violations found. Human review and relevant tests are still required.');
for (const item of findings) console.log(`- [${item.severity.toUpperCase()}] ${item.rule}: ${item.file} — ${item.detail}`);

console.log('\n## Proposed PR');
console.log(`Title: ${title}`);
console.log(`- Summary: ${files.length ? `Review ${files.length} changed file(s).` : 'No changes to describe.'}`);
console.log('- Checks: run the relevant Playwright commands before creating the PR.');
console.log('- Review: static repository-rule review completed in dry-run mode.');

console.log('\n## Would create');
if (!canPrepare) {
  if (branch === baseBranch) console.log(`- Blocked: current branch is ${baseBranch}. Create a feature branch first.`);
  if (files.length === 0) console.log('- Blocked: no changed files to submit.');
  if (blocking.length) console.log(`- Blocked: ${blocking.length} blocking finding(s) must be fixed.`);
} else console.log(`gh pr create --base ${baseBranch} --head ${branch} --title "${title}" --body-file <generated-pr-body.md>`);

console.log('\nThis command never runs gh, git push, or git commit.');
