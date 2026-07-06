# The eval case format

One incident becomes one case file: a single JSON document that any runner can consume. The format is deliberately vendor-neutral. It is not a test framework, it does not execute anything, and it never locks you into a platform. It is the portable statement of what must be true, written down so a runner, a CI job, or a person can enforce it.

`scripts/validate-eval.mjs` is the deterministic gate: a case either conforms or it does not, with exact errors. Do not hand-check a case and call it valid; run the validator.

## The shape

```json
{
  "id": "airline-policy-grounding",
  "title": "Policy answers must come from the approved source, not model memory",
  "sourceIncident": {
    "date": "2026-05-15",
    "summary": "Within a day of go-live the agent gave customers policy guidance that no longer matched a recently changed policy.",
    "severity": "sev1",
    "surface": "customer service agent, production"
  },
  "failure": {
    "category": "grounding",
    "mode": "parametric-answer",
    "observed": "The agent answered a policy question from the model's parametric knowledge.",
    "expected": "The agent answers only from the current approved policy source, or refuses when it has no grounding."
  },
  "case": {
    "input": "A customer asks about the policy that changed in the fixture.",
    "context": {
      "fixtures": "the current approved policy document, including the changed terms"
    },
    "expected": {
      "behavior": "The answer states the current terms and draws only from the fixture.",
      "assertions": [
        { "type": "must-cite-source", "value": "the approved policy fixture" },
        { "type": "must-contain", "value": "the current terms from the fixture" },
        { "type": "must-not-contain", "value": "the superseded terms" }
      ]
    }
  },
  "guard": {
    "runOn": "every-change",
    "suite": "grounding-regressions",
    "owner": "the team that owns the agent"
  },
  "notes": "Optional context for future readers."
}
```

## Field rules

The validator enforces exactly these. Extra fields are ignored so the format can grow without breaking existing cases.

| Field | Rule |
|---|---|
| `id` | Required. Kebab-case: lowercase letters, digits, hyphens. |
| `title` | Required. One sentence, the assertion in plain words. |
| `sourceIncident.summary` | Required. What happened, short enough to read in a diff. |
| `sourceIncident.severity` | Required. One of `sev1`, `sev2`, `sev3`, `sev4`. |
| `sourceIncident.date` | Optional. `YYYY-MM-DD`. |
| `sourceIncident.surface` | Optional. Where it happened. |
| `failure.category` | Required. One of the nine taxonomy categories: `grounding`, `retrieval`, `tool-use`, `reasoning`, `context`, `guardrail`, `freshness`, `escalation`, `coordination`. |
| `failure.mode` | Required. Kebab-case mode, normally from the taxonomy. |
| `failure.observed` | Required. What the agent did. |
| `failure.expected` | Required. What it should have done. |
| `case.input` | Required. The smallest input that reproduces the failure. |
| `case.context` | Optional object. Fixtures the case depends on: documents, records, tool responses. |
| `case.expected.behavior` | Required. The outcome in one or two sentences. |
| `case.expected.assertions` | Required. At least one. Each is `{ "type": ..., "value": ... }` with a non-empty value. |
| `guard.runOn` | Required. One of `every-change`, `nightly`, `pre-release`. |
| `guard.suite`, `guard.owner` | Optional. Where it lives and who answers for it. |
| `notes` | Optional. |

## Assertion types

A closed set, so a runner can implement them once.

| Type | Asserts |
|---|---|
| `must-contain` | The output contains this fact or content. |
| `must-not-contain` | The output does not contain it. Superseded facts, leaked data, forbidden phrasing. |
| `must-cite-source` | The output attributes its claim to this source. |
| `must-refuse` | The agent declines rather than inventing an answer or taking the action. |
| `must-escalate` | The agent hands off to a person. |
| `must-call-tool` | This tool is invoked for the case. |
| `must-not-call-tool` | This tool is not invoked. |
| `must-match-schema` | Structured output conforms to the named schema. |
| `human-review` | A person judges this dimension; the value states the question they answer. Use sparingly, it is the escape hatch, not the default. |

## Choosing assertions

Write the assertion at the level the failure lives. A grounding failure asserts sources and facts, not phrasing. A tool-use failure asserts calls, not prose. A reasoning failure asserts the end state, not the path. One case with three sharp assertions beats five cases restating the same one.
