import fs from 'node:fs/promises';

const scorecardPath = new URL('../../tests/data/agent-evaluations.json', import.meta.url);
const requiredEvaluationFields = [
  'id',
  'agentId',
  'evaluatedAt',
  'scope',
  'inputSummary',
  'outputSummary',
  'reviewerDecision',
  'failureCategory',
  'evidenceRefs',
];
const decisions = new Set(['approved', 'needs-human-review', 'rejected']);

function assertScorecard(value) {
  if (!Array.isArray(value.agents) || !Array.isArray(value.evaluations)) {
    throw new Error('Scorecard must contain agents and evaluations arrays.');
  }

  const agentIds = new Set(value.agents.map(({ id }) => id));
  for (const evaluation of value.evaluations) {
    for (const field of requiredEvaluationFields) {
      if (!(field in evaluation)) {
        throw new Error(`Evaluation ${evaluation.id ?? '<unknown>'} is missing ${field}.`);
      }
    }

    if (!agentIds.has(evaluation.agentId)) {
      throw new Error(`Evaluation ${evaluation.id} references an unknown agent.`);
    }

    if (!decisions.has(evaluation.reviewerDecision)) {
      throw new Error(`Evaluation ${evaluation.id} has an invalid reviewerDecision.`);
    }

    if (!Array.isArray(evaluation.evidenceRefs) || evaluation.evidenceRefs.length === 0) {
      throw new Error(`Evaluation ${evaluation.id} needs at least one evidence reference.`);
    }
  }
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || 'not-classified';
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map());
}

function markdownTable(rows) {
  return rows.length === 0
    ? '_No real evaluation runs have been recorded yet._'
    : [
        '| Run | Agent | Decision | Failure category | Evidence |',
        '| --- | --- | --- | --- | --- |',
        ...rows.map((row) => `| ${row.id} | ${row.agentName} | ${row.reviewerDecision} | ${row.failureCategory} | ${row.evidenceRefs.join('<br>')} |`),
      ].join('\n');
}

const rawScorecard = await fs.readFile(scorecardPath, 'utf8');
const scorecard = JSON.parse(rawScorecard);
assertScorecard(scorecard);

const agentsById = new Map(scorecard.agents.map((agent) => [agent.id, agent]));
const decisionCounts = countBy(scorecard.evaluations, 'reviewerDecision');
const failureCounts = countBy(scorecard.evaluations, 'failureCategory');
const reviewed = scorecard.evaluations.length;
const approved = decisionCounts.get('approved') || 0;
const approvalRate = reviewed === 0 ? 'n/a (no real runs)' : `${((approved / reviewed) * 100).toFixed(1)}%`;

console.log('# Agent Evaluation Scorecard');
console.log('');
console.log(`Generated from \`tests/data/agent-evaluations.json\`. Last updated: ${scorecard.lastUpdated ?? 'not yet evaluated'}.`);
console.log('');
console.log('## Agent maturity');
console.log('');
console.log('| Agent | Purpose | Current maturity |');
console.log('| --- | --- | --- |');
for (const agent of scorecard.agents) {
  console.log(`| ${agent.name} | ${agent.purpose} | ${agent.maturity} |`);
}
console.log('');
console.log('## Evaluation outcomes');
console.log('');
console.log(`- Real runs reviewed: ${reviewed}`);
console.log(`- Approved: ${approved}`);
console.log(`- Needs human review: ${decisionCounts.get('needs-human-review') || 0}`);
console.log(`- Rejected: ${decisionCounts.get('rejected') || 0}`);
console.log(`- Human-approved output rate: ${approvalRate}`);
console.log('');
console.log('## Failure categories');
console.log('');
console.log(failureCounts.size === 0
  ? '_No failure categories recorded yet._'
  : [...failureCounts.entries()].map(([category, count]) => `- ${category}: ${count}`).join('\n'));
console.log('');
console.log('## Run log');
console.log('');
console.log(markdownTable(scorecard.evaluations.map((evaluation) => ({
  ...evaluation,
  agentName: agentsById.get(evaluation.agentId).name,
}))));
