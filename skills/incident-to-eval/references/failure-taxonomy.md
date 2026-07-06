# The failure taxonomy

Nine categories of production agent failure, the modes inside each, and the eval each mode owes you. Classify the incident to one primary mode. If two fit, pick the one closest to the root cause and note the other; do not force a tie.

A rule that holds throughout: classify from evidence in the incident, not from what would be convenient to test. The most common misclassification is calling something a model problem when the trace shows a grounding, retrieval, or context problem.

---

## grounding

The answer came from the wrong source of truth.

- `parametric-answer`: The agent answered from what the model absorbed in training instead of the governed source. The classic tell: fluent, confident, and stale.
- `unsupported-citation`: The agent cited a source that does not actually support the claim.
- `stale-source-served`: The agent read from a governed source that was itself out of date or superseded.

Spot it: the answer contradicts the current approved content, or the citation does not contain the claim.

The eval to write: give the case the current approved content as a fixture, assert the answer draws from it (`must-cite-source`, `must-contain` the current fact) and does not reproduce the superseded fact (`must-not-contain`). If no grounding exists, assert refusal (`must-refuse`).

## retrieval

The right source exists; the wrong parts of it came back.

- `wrong-chunks`: Retrieval returned plausible but irrelevant passages.
- `missing-coverage`: The answer needed content that was never indexed.
- `ranking-miss`: The right passage existed in the index but did not surface.

Spot it: the trace shows retrieval results that do not contain the needed fact, while the source does.

The eval to write: pin the query as the input, assert the answer contains the fact that lives in the known-correct passage (`must-contain`). Evaluate retrieval on its own before blaming the model; the case should fail on bad retrieval even with a perfect model.

## tool-use

The agent reached for tools wrongly.

- `wrong-tool`: A different tool than the task needed.
- `invalid-arguments`: The right tool with malformed or wrong arguments.
- `swallowed-error`: A tool failed and the agent proceeded as if it had succeeded.
- `missing-confirmation`: An irreversible action ran without the required gate.

Spot it: the trace shows the tool call sequence; compare it against what the task required.

The eval to write: assert the expected call happens (`must-call-tool`), the wrong one does not (`must-not-call-tool`), and for gates, assert escalation or confirmation (`must-escalate`). For swallowed errors, make the fixture tool fail and assert the agent surfaces the failure rather than inventing success (`must-contain` the failure acknowledgment).

## reasoning

The plan was wrong even though the inputs were right.

- `wrong-plan`: A path that could never have satisfied the task.
- `loop`: The agent repeated a step without progress.
- `premature-give-up`: The agent stopped with work left that it could have done.
- `plan-deviation`: The agent had the right plan and did not follow it.

Spot it: inputs and tools were correct in the trace; the sequence of decisions was not.

The eval to write: pin the scenario and assert the outcome, not the path (`must-contain` the completed result, `must-match-schema` for structured output). Reasoning evals that assert exact step sequences rot fast; assert what must be true at the end.

## context

The agent lost information it had.

- `dropped-constraint`: A requirement stated earlier stopped being honored.
- `buried-instruction`: An instruction present in the prompt was ignored, often because of position or volume.
- `lost-state`: Cross-turn state the conversation established disappeared.

Spot it: the constraint is visible in the transcript before the failure point.

The eval to write: reproduce the full conversation shape, not a summary of it. Assert the constraint holds at the end (`must-contain` or `must-not-contain` against the constraint). The case must include enough turns to recreate the loss.

## guardrail

The agent did something it was never allowed to do.

- `out-of-scope-action`: An action outside the agent's declared scope.
- `injection-followed`: Instructions embedded in retrieved or user content were obeyed.
- `data-leak`: Information crossed a boundary it should not have crossed.

Spot it: compare what happened against the declared scope, not against what seems reasonable.

The eval to write: make the case adversarial. Put the injection or the out-of-scope request in the input and assert refusal (`must-refuse`), non-action (`must-not-call-tool`), and the absence of the leaked content (`must-not-contain`). These cases run `every-change`; guardrails are the last place to tolerate regression.

## freshness

It worked, then the world changed and it silently did not.

- `policy-drift`: The governed content changed and behavior did not follow.
- `model-update-regression`: The underlying model changed and behavior shifted.
- `prompt-regression`: A prompt or config change broke something that worked.

Spot it: the incident has a "when did this start" answer that matches a change, not a bug.

The eval to write: the case that would have caught the change. Pin the pre-change behavior as assertions, and set the guard to run on every change to the prompt, config, or model version, not on a calendar.

## escalation

The handoff to a person failed.

- `missed-escalation`: The case met the escalation criteria and the agent kept going.
- `overconfident-answer`: Uncertainty that should have been surfaced was not.
- `wrong-autonomy`: The agent acted where it was only trusted to draft, or vice versa.

Spot it: the escalation criteria existed and the trace shows they were met.

The eval to write: build the case at the escalation boundary and assert the handoff (`must-escalate`) or the draft-only behavior (`must-not-call-tool` on the send). If the criteria were never written down, that is the finding; write them, then write the eval.

## coordination

More than one agent, and the seams failed.

- `dropped-handoff`: Context lost between agents.
- `duplicate-action`: Two agents did the same thing.
- `conflicting-actions`: Two agents did opposite things.

Spot it: each agent looks correct in isolation; the failure only exists in the whole.

The eval to write: end-to-end through the seam, never per-agent. Assert the single final outcome (`must-contain`, `must-call-tool` exactly once via the expected behavior description). If a coordination case cannot be written smaller than the whole system, that is evidence the system has more agents than it can afford.

---

## When more than one fits

Chains are common: a retrieval miss becomes a grounding failure becomes an overconfident answer. Classify to the first failure in the chain, because that is where the fix and the eval belong. Note the downstream modes in the case notes; do not write three evals when one at the root makes the chain impossible.
