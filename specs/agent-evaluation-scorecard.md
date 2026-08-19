# Agent Evaluation Scorecard

This scorecard records **real portfolio agent runs** and their human-review outcome. It is deliberately empty at project setup: an agent definition is not evidence that the agent is production-proven.

## How to create a valid record

Add one object to `tests/data/agent-evaluations.json` only after an actual run has completed.

```json
{
  "id": "healer-2026-08-20-001",
  "agentId": "healer",
  "evaluatedAt": "2026-08-20",
  "scope": "tests/auth/login.spec.ts failed after a verified UI copy change",
  "inputSummary": "Failure output, DOM snapshot, and browser console logs",
  "outputSummary": "Proposed an updated text assertion with unchanged intent",
  "reviewerDecision": "approved",
  "failureCategory": "copy-change",
  "evidenceRefs": [
    "test-results/auth-login/trace.zip",
    "GitHub Actions run URL"
  ]
}
```

`reviewerDecision` must be one of:

- `approved` — a human reviewed and accepted the result.
- `needs-human-review` — the agent produced useful output, but it is not accepted yet.
- `rejected` — the output was unsafe, incorrect, or not useful.

## What to measure

- **Human-approved output rate:** approved outputs divided by all reviewed real runs.
- **Failure categories:** patterns such as `locator-drift`, `copy-change`, `real-regression`, `environment`, `unsafe-suggestion`, or `not-applicable`.
- **Evidence quality:** every record must reference a trace, CI run, report, commit, issue, or equivalent run evidence.

## Generate the current report

```powershell
npm run report:agents
```

Do not publish production claims, success rates, cost figures, or autonomous-healing statements until the scorecard contains enough genuine, reviewable run evidence to support them.
