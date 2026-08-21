import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const baseRef = option('--base', 'origin/main');
const headRef = option('--head', 'HEAD');
const impactReportPath = option('--impact-report', 'test-impact.md');
const reportPath = option('--report', 'release-risk.md');
const git = (...gitArgs) => execFileSync('git', gitArgs, { encoding: 'utf8' }).trim();
const changedFiles = git('diff', '--name-only', `${baseRef}...${headRef}`).split(/\r?\n/).filter(Boolean);
const rules = JSON.parse(readFileSync(new URL('../../tests/data/release-risk-rules.json', import.meta.url), 'utf8'));
const matches = (file, candidate) => candidate.endsWith('/') ? file.startsWith(candidate) : file === candidate;
const rank = { low: 1, medium: 2, high: 3 };

const drivers = [];
for (const rule of rules.riskRules) {
  const affected = changedFiles.filter((file) => rule.paths.some((candidate) => matches(file, candidate)));
  if (affected.length) drivers.push({ ...rule, affected });
}
const broad = changedFiles.filter((file) => rules.broadRiskPaths.some((candidate) => matches(file, candidate)));
if (broad.length) drivers.push({
  area: 'Framework or delivery pipeline',
  level: 'high',
  reason: 'Configuration, dependency, fixture, or CI workflow changes can affect multiple quality signals.',
  affected: broad,
});

const impactReport = existsSync(impactReportPath) ? readFileSync(impactReportPath, 'utf8') : '';
const impactNeedsReview = impactReport.includes('needs human review') || impactReport.includes('Unmapped files needing human review');
const docsOnly = changedFiles.length > 0 && changedFiles.every((file) => /^(README\.md|specs\/|\.github\/agents\/)/.test(file));
const highestRuleRisk = drivers.reduce((level, driver) => Math.max(level, rank[driver.level]), 0);
let initialRisk = highestRuleRisk === 3 ? 'high' : highestRuleRisk === 2 ? 'medium' : docsOnly ? 'low' : changedFiles.length ? 'medium' : 'low';
if (impactNeedsReview && initialRisk === 'low') initialRisk = 'medium';

const requiredEvidence = new Set([
  'Playwright Tests workflow is green for Chromium, Firefox, WebKit, and API.',
  'PR Review Agent blocking findings are resolved.',
]);
if (drivers.some((driver) => driver.area === 'Checkout journey')) requiredEvidence.add('Checkout smoke/critical path is reviewed, including validation and completion behavior.');
if (drivers.some((driver) => driver.area === 'Authentication')) requiredEvidence.add('Authentication success and rejection paths are reviewed.');
if (drivers.some((driver) => driver.area === 'API contract coverage')) requiredEvidence.add('API success, contract, and not-found coverage is reviewed.');
if (broad.length) requiredEvidence.add('A QA owner confirms the impact of framework/pipeline changes and preserves rollback evidence.');
if (impactNeedsReview) requiredEvidence.add('A QA owner resolves the Test Impact Analyst unmapped-area prompt.');

const lines = [
  '## Release Risk Analysis',
  '',
  `**Initial risk:** ${initialRisk.toUpperCase()} — based on changed code scope; this is not a release approval or production decision.`,
  '',
  '### Risk drivers',
  ...(drivers.length ? drivers.flatMap((driver) => [
    `- **${driver.area} (${driver.level})**: ${driver.reason}`,
    `  - Changed: ${driver.affected.map((file) => `\`${file}\``).join(', ')}`,
  ]) : ['- No maintained risk rule matched. A human QA owner should confirm the changed area and user impact.']),
  '',
  '### Required release evidence',
  ...[...requiredEvidence].map((item) => `- ${item}`),
  '',
  '### Rollback and ownership prompt',
  '- QA/release owner: confirm the release decision after evidence is reviewed.',
  '- Engineering owner: confirm rollback path for the changed journey or configuration.',
  '- If CI fails, inspect the CI Failure Triage report before retrying or changing tests.',
  '',
  '### Decision boundary',
  '- This agent does not approve a merge or release. Human QA and release owners remain accountable.',
].join('\n');

writeFileSync(reportPath, `${lines}\n`);
console.log(`Release risk report written to ${reportPath}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `initial_risk=${initialRisk}\n`);
