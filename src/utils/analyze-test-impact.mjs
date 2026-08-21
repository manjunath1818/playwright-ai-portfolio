import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const baseRef = option('--base', 'origin/main');
const headRef = option('--head', 'HEAD');
const reportPath = option('--report', 'test-impact.md');
const git = (...gitArgs) => execFileSync('git', gitArgs, { encoding: 'utf8' }).trim();
const changedFiles = git('diff', '--name-only', `${baseRef}...${headRef}`).split(/\r?\n/).filter(Boolean);
const map = JSON.parse(readFileSync(new URL('../../tests/data/test-impact-map.json', import.meta.url), 'utf8'));

const matches = (file, candidate) => candidate.endsWith('/') ? file.startsWith(candidate) : file === candidate;
const broad = changedFiles.filter((file) => map.broadImpactPaths.some((candidate) => matches(file, candidate)));
const selectedTests = new Set(changedFiles.filter((file) => file.startsWith('tests/') && /\.spec\.ts$/.test(file)));
const mappedFiles = new Set();

for (const mapping of map.mappings) {
  const mapped = changedFiles.filter((file) => mapping.changedPaths.some((candidate) => matches(file, candidate)));
  if (!mapped.length) continue;
  mapped.forEach((file) => mappedFiles.add(file));
  mapping.tests.forEach((test) => selectedTests.add(test));
}

if (broad.length) map.uiTests.forEach((test) => selectedTests.add(test));
if (broad.length && changedFiles.some((file) => file === 'package.json' || file === 'package-lock.json' || file === 'playwright.config.js')) selectedTests.add('tests/api/jsonplaceholder.spec.ts');

const analysisRelevant = changedFiles.filter((file) => file.startsWith('src/') || file.startsWith('tests/') || file.startsWith('specs/') || file === 'package.json' || file === 'package-lock.json' || file.startsWith('.github/workflows/') || file === 'playwright.config.js');
const unmapped = analysisRelevant.filter((file) => !mappedFiles.has(file) && !broad.includes(file) && !selectedTests.has(file));
const tests = [...selectedTests].sort();
const onlyApi = tests.length > 0 && tests.every((test) => test.startsWith('tests/api/'));
const uiTests = tests.filter((test) => !test.startsWith('tests/api/'));
const apiSelected = tests.some((test) => test.startsWith('tests/api/'));
const fastCommand = !tests.length
  ? 'No focused Playwright command inferred; review impact manually.'
  : onlyApi
    ? 'npm run test:api'
    : apiSelected
      ? `npx playwright test ${uiTests.join(' ')} --project=chromium && npm run test:api`
      : `npx playwright test ${uiTests.join(' ')} --project=chromium`;
const confidence = broad.length ? 'broad impact' : unmapped.length ? 'needs human review' : tests.length ? 'mapped' : 'not applicable';

const report = [
  '## Test Impact Analysis',
  '',
  `**Confidence:** ${confidence}`,
  '',
  '### Changed areas',
  ...(changedFiles.length ? changedFiles.map((file) => `- \`${file}\``) : ['- No changed files detected.']),
  '',
  '### Recommended fast feedback',
  ...(tests.length ? tests.map((test) => `- \`${test}\``) : ['- No focused tests inferred.']),
  `- Command: \`${fastCommand}\``,
  '',
  '### Merge safety net',
  '- Full cross-browser UI and API CI remains required. This recommendation accelerates feedback; it does not replace the merge gate.',
  '',
  '### Confidence and gaps',
  ...(broad.length ? [`- Broad-impact files: ${broad.map((file) => `\`${file}\``).join(', ')}. Run the full suite.`] : []),
  ...(unmapped.length ? [`- Unmapped files needing human review: ${unmapped.map((file) => `\`${file}\``).join(', ')}.`] : []),
  ...(!broad.length && !unmapped.length ? ['- Every runtime-relevant changed path matched the maintained impact map.'] : []),
].join('\n');

writeFileSync(reportPath, `${report}\n`);
console.log(`Test impact report written to ${reportPath}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `confidence=${confidence}\n`);
