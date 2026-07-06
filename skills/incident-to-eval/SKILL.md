---
name: incident-to-eval
description: Turns a production AI agent incident into a golden eval case, a portable regression test that makes the failure unrepeatable. Use when an agent did something wrong in production or testing, when someone has a postmortem, trace, bug report, or a paragraph describing an agent failure, when someone asks how to stop an agent failure from happening again, or when converting incidents, escalations, or wrong answers into evals, test cases, or a regression suite. Reconstructs the incident, classifies the failure against an agent-specific taxonomy, writes a vendor-neutral eval case, and validates it with a deterministic script.
license: MIT
---

# Incident to eval

An incident is an eval you already paid for. Most teams write the postmortem, fix the immediate cause, and throw the eval away, and then the same class of failure comes back wearing different clothes. This skill runs the step that gets skipped: it turns what broke into a golden case that runs on every change, so the failure is not just fixed but unrepeatable.

It is the loop that feeds the two gates. The [agent-or-workflow](https://github.com/hamidettefagh/agent-or-workflow) design gate decides what to build. The [agent-production-readiness](https://github.com/hamidettefagh/agent-production-readiness) ship gate proves it is ready. When something gets through both anyway, this skill turns it into evidence the ship gate checks forever after.

## When to run this

Run this when the user has:

- An agent that did something wrong, in production or in testing.
- A postmortem, an incident writeup, a trace, or a paragraph describing a failure.
- A recurring class of agent failure they want to pin down.
- A fix they want to protect against regression.

Do not run it for outages with no AI agent in the loop; generic incident tooling covers those. One incident normally produces one case. If the user brings a pile of incidents, run the steps per incident and dedupe at the classification step: incidents sharing a failure mode may share a case.

## How to run it

Work through four steps in order. The judgment lives in steps 1 and 2; the format is pinned by the validator in step 3.

### Step 1: Reconstruct the incident

Read whatever exists: the trace, the postmortem, the ticket, or the user's description. Establish four facts, quoting the source where you can:

- What the agent did (observed).
- What it should have done (expected).
- What the blast radius was (who saw it, what it cost, how it was caught).
- What has already been changed since.

Where the material is silent, ask or state the assumption. Do not invent trace details to make a cleaner story; a case built on an invented reproduction will not catch the real regression.

### Step 2: Classify the failure

Map the incident to one primary failure mode from `references/failure-taxonomy.md`. The taxonomy covers nine categories: grounding, retrieval, tool-use, reasoning, context, guardrail, freshness, escalation, coordination.

- Classify from evidence, not convenience. The most common miss is calling something a model problem when the trace shows a grounding or retrieval problem.
- When failures chain, classify to the first failure in the chain; that is where the eval belongs. Note the downstream modes in `notes`.
- Each mode's entry states the eval it owes you: which assertion types, at what level. Follow it.

### Step 3: Write the eval case and validate it

Write the case as a single JSON document in the format defined by `references/eval-case-schema.md`: the source incident, the classified failure, the smallest reproducing input, the expected behavior with assertions, and the guard that says when it runs.

- Start from the template: `node scripts/validate-eval.mjs --template`.
- The input must be the smallest thing that reproduces the failure, with fixtures in `case.context` rather than prose promises.
- Assert at the level the failure lives: sources and facts for grounding, calls for tool-use, end states for reasoning. Use `human-review` only when nothing sharper exists.
- Then validate. This is not optional and not a formality:

```bash
node scripts/validate-eval.mjs the-case.json
```

Run it from the skill's own directory, or pass the absolute path to the script. Do not hand-check the format and declare it valid; the validator is deterministic and its errors are exact. Fix and re-run until it passes. Add `--md` for a summary block ready to paste into the postmortem or the PR.

### Step 4: Wire the guard

A case that does not run is a document, not a guard.

- Set `guard.runOn` honestly: `every-change` for guardrail and grounding cases, `pre-release` or `nightly` where cost demands it.
- Name the suite it joins and the owner who answers for it.
- Tell the user where it lands in their runner: the case is portable JSON, so it maps onto whatever they run today, a CI job, an eval platform, or a plain test file.
- Close the loop: this case is evidence for the evaluation dimension of the production readiness review. A readiness review that scored evaluation thin is the standing reason this skill exists.

## Output

Return the validated JSON case and the `--md` summary. Lead with the one-line lesson: what class of failure this case makes unrepeatable. A worked example, built from a real production incident, is in `assets/example-airline-grounding.json`.

## Principles

- The incident leads, the eval follows. Never invent hypothetical failures when a real one is on the table.
- Smallest reproducing case. A case that needs the whole production environment will never run, and a case that never runs guards nothing.
- Portable over powerful. The case is plain JSON any runner can consume; this skill never locks the user into a platform.
- The format is deterministic, the reading is not. The validator pins the format; reconstructing and classifying the incident is your judgment, which is why steps 1 and 2 want evidence and honest assumptions.
