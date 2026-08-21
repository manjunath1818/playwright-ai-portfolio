import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};

const resultsDir = option('--results-dir', 'test-results');
const reportPath = option('--report', path.join(resultsDir, 'ci-failure-triage.md'));
const project = option('--project', 'unknown-project');
const runUrl = option('--run-url', 'not available');

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const candidate = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(candidate) : [candidate];
  });
}

const textFiles = filesIn(resultsDir).filter((file) => /\.(?:txt|log|json|md)$/i.test(file));
const artifacts = filesIn(resultsDir).map((file) => path.relative(resultsDir, file).replaceAll('\\', '/'));
const textEvidence = textFiles.map((file) => ({
  file: path.relative(resultsDir, file).replaceAll('\\', '/'),
  text: readFileSync(file, 'utf8').slice(0, 12000),
}));
const combined = textEvidence.map(({ text }) => text).join('\n');

const rules = [
  { category: 'environment', confidence: 'medium', pattern: /net::ERR_|ECONNREFUSED|ENOTFOUND|browserType\.launch|Target page, context or browser has been closed|Connection reset/i, next: 'Check runner, browser launch, network, and target-service availability; re-run only after preserving this evidence.' },
  { category: 'product-regression', confidence: 'medium', pattern: /(?:status|response)\s*(?:is|:)?\s*5\d\d|Internal Server Error|Unhandled exception|page\.error/i, next: 'Validate the suspected product behaviour with the trace, console/network evidence, and a reproducible user flow before filing a defect.' },
  { category: 'test-automation', confidence: 'medium', pattern: /strict mode violation|locator\(.+\) resolved to 0 elements|expected .+ to be visible|Timeout .* waiting for locator|toHaveText/i, next: 'Review the failing locator or assertion against the trace and current UI. Do not weaken the test without human approval.' },
  { category: 'test-data', confidence: 'low', pattern: /invalid credentials|fixture|test data|expected.*user|missing.*data/i, next: 'Validate the approved JSON/fixture data and test setup before changing any scenario.' },
];

const match = rules.find((rule) => rule.pattern.test(combined));
const classification = match ?? { category: 'unknown', confidence: 'low', next: 'Open the Playwright trace and failure screenshot, then classify with a human reviewer. Do not guess or change the test.' };
const matchingEvidence = textEvidence
  .map(({ file, text }) => ({ file, excerpt: text.split(/\r?\n/).find((line) => match?.pattern.test(line)) }))
  .filter(({ excerpt }) => excerpt)
  .slice(0, 3);

const report = [
  '# CI Failure Triage',
  '',
  `- Playwright project: \`${project}\``,
  `- CI run: ${runUrl}`,
  '- Mode: evidence-only triage. No source, test, data, configuration, or product changes were made.',
  '',
  '## Classification',
  '',
  `**${classification.category}** — hypothesis, ${classification.confidence} confidence.`,
  '',
  '## Evidence available',
  '',
  ...(artifacts.length ? artifacts.map((artifact) => `- \`${artifact}\``) : ['- No test-result artifacts were found.']),
  ...(matchingEvidence.length ? ['', '## Matching log excerpts', '', ...matchingEvidence.map(({ file, excerpt }) => `- \`${file}\`: ${excerpt.trim().slice(0, 300)}`)] : []),
  '',
  '## Why this classification fits',
  '',
  match ? `- The report found a failure pattern associated with \`${classification.category}\`. This is not a confirmed root cause.` : '- Available artifacts did not contain enough distinctive evidence for a safe classification.',
  '',
  '## Next human action',
  '',
  `- ${classification.next}`,
  '',
  '## Safety check',
  '',
  '- This agent did not retry tests, alter test intent, modify code, or approve a merge.',
].join('\n');

mkdirSync(path.dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${report}\n`);
console.log(`CI failure triage report written to ${reportPath}`);
