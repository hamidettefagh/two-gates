---
name: ship-gate
description: Reviews an AI agent for production readiness across evaluation, cost, observability, guardrails, human oversight, reliability, and governance. Use when someone is preparing an agent for production or a go-live, asking whether an agent is ready to ship, reviewing an agent's design, prompt, tools, or deployment, or hardening a working prototype into a dependable system. Produces an evidence-based scorecard and a prioritized list of the gaps to close.
license: MIT
---

# Agent production readiness review

A demo that works in a keynote is not an agent that works at 2am. This skill runs the review that tells the difference. It scores an agent across seven dimensions and returns the gaps that stand between a promising prototype and a dependable production system.

It is the ship-time gate. Its sibling, the [agent-or-workflow](https://github.com/hamidettefagh/agent-or-workflow) skill, is the design-time gate. This one decides whether an agent is ready to run; that one decides what to build in the first place.

## When to run this

Run this when the user is:

- Preparing an agent for production or a go-live.
- Asking whether an agent is ready, or good enough to ship.
- Reviewing an agent's design, prompt, tools, or deployment.
- Turning a working prototype into something they can operate.

Do not run it against a throwaway prototype the user has said will never reach production. Ask if you are unsure.

## How to run the review

Work through four phases in order. Do not skip to a score.

### Phase 1: Understand the agent

Before assessing anything, establish the basics, either by asking the user or by reading the material they provide:

- What the agent does, and for whom.
- Where it runs, and what it is connected to: tools, data, systems of record.
- What actions it can take, and which of those are hard to reverse.
- What "wrong" looks like, and who is harmed when it happens.

Keep this short. You are calibrating how strict the rest of the review should be. An agent that can only read is judged differently from one that can move money.

### Phase 2: Assess each dimension

Assess all seven dimensions in `references/rubric.md`. For each check:

- Look for evidence. A claim that evals exist is not evidence; the eval set is. If you cannot find evidence, treat the item as not met, and say so.
- Record what you saw, not just pass or fail.
- Flag anything worse than not-met: a guardrail that exists but is bypassable, an eval set that only covers happy paths, an audit log nobody can read.

Use `references/failure-modes.md` for the specific production failures each dimension is meant to catch.

### Phase 3: Score

Report a count per dimension and a total out of 28. Name the strongest dimension and the weakest. Do not round up. A system that is strong in six dimensions and absent in the seventh is not nearly ready if the seventh is the one that gets someone hurt.

### Phase 4: Recommend

The score is the start of the conversation, not the end. Return a short, prioritized list of the gaps that matter most, ordered by risk rather than by how easy they are to fix. For each gap: what is missing, why it matters for this specific agent, and the smallest change that would close it.

## Output

Use the format in `assets/review-template.md`. Lead with the gaps, not the score. A filled example is in `assets/example-review.md`.

## Principles

- Production over demos. Judge the agent by how it behaves on its worst day, not its best.
- Evidence over assertion. If it is not shown, it is not done.
- The gaps are the work. A low score is not a failure; it is a plan.
