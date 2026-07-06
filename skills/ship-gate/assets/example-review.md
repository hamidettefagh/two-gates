# Production readiness review: airline customer service agent

A worked example. This is the review as it would have run the week before the go-live described in the [airline super agent case study](https://hamidettefagh.com/work/airline-super-agent). It scores the agent as it was when it nearly got shut down in its first day. Every gap it names is one that later showed up in production. The point of the ship gate is to find these on a Tuesday afternoon, not a Friday night.

## Summary

11/28. Not ready. This is a demo that will fail in production, and it did. Strongest: human oversight. Biggest gap: guardrails, specifically grounding. The single thing standing in the way is that the agent is allowed to answer from the model's own knowledge instead of the airline's current approved policy.

## Scores

| Dimension | Score | What I saw |
|---|---|---|
| Evaluation | 1/4 | A demo suite of happy-path questions. No eval set for policy grounding, so a fluent wrong answer passes. This is why the failure was invisible until customers hit it. |
| Cost | 2/4 | Model is oversized for the volume and cost per resolved case is not tracked, only cost per call. Affordable in the demo, not at hundreds of thousands of actions a week. |
| Observability | 1/4 | A key KPI is computed by a layer that returns numbers nobody can reconcile. There is no trustworthy read on what the agent is doing in production. |
| Guardrails | 1/4 | Nothing forces answers through the airline's approved source. The agent can and does answer from parametric knowledge, including on a policy that recently changed. |
| Human oversight | 2/4 | There is an escalation path, but no confirmation gate in front of the irreversible, customer-facing actions. |
| Reliability | 2/4 | One monolithic agent holds loyalty, baggage, and back-office. A fault in one path degrades all three, and there is no isolation between them. |
| Governance | 2/4 | Federally regulated customer data flows through the platform without an explicit trust boundary, so the blast radius of a mistake is undefined. |

## Gaps to close, in priority order

Ordered by risk to this specific agent, not by how easy they are to fix.

1. **Grounding is not enforced** (Guardrails). The agent answers from what the model remembers, not from the airline's live approved policy. In a regulated business a fluent wrong answer is worse than no answer. Smallest fix: force every answer through retrieval against the approved source, and refuse when there is no grounding.
2. **No grounding evals** (Evaluation). Without a test set that checks answers against current policy, the fix above cannot be proven or defended against regression. Smallest fix: build an eval set of policy questions with known correct answers and run it on every change.
3. **Observability cannot be trusted** (Observability). Leadership is steering on a number that is wrong. Smallest fix: compute the core metric directly from the source of truth and reconcile it before anyone makes a call on it.

## What is already solid

- Human oversight has a real escalation path, which is the seed the confirmation gate can build on.
- The team knows the three request domains cleanly, which is what later made splitting into delegate agents behind an orchestrator straightforward.

---

Reviewed against the agent production readiness rubric. The score is a prompt for a conversation, not a certificate. The design that produced this agent is decided at the other gate: [agent-or-workflow](https://github.com/hamidettefagh/agent-or-workflow).
