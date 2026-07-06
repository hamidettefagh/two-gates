# Rubric

Seven dimensions, four checks each, 28 in total. For each check, "look for" describes the evidence that meets it. Absent evidence, the check is not met.

## Evaluation

You can tell whether a change made the agent better or worse before users do.

- **An evaluation set built from real user inputs, not hand-picked happy paths.** Look for: a set drawn from real or realistic traffic, including the messy, ambiguous, and adversarial cases, not a handful of clean examples.
- **Evals run automatically when the prompt, tools, or model change.** Look for: evaluation wired into the change process, so a change is scored before it ships rather than after a user finds the regression.
- **You measure grounding and accuracy, not just whether a reply was produced.** Look for: metrics that check whether answers are correct and grounded in their sources, not just that the agent returned something.
- **Someone reviews a sample of real conversations on a set cadence.** Look for: a standing process where a person reads live conversations, and a place those findings go.

## Cost

The agent is affordable at scale, and you know before finance does.

- **A token or credit budget per conversation that you actually enforce.** Look for: a real ceiling that stops a runaway loop, not an assumption that conversations stay short.
- **The model is right-sized for the task, not the largest one by default.** Look for: cheaper models used where they suffice, with the expensive model reserved for the work that needs it.
- **Cost is monitored, with an alert before the bill surprises you.** Look for: spend tracked over time and an alert threshold set below the point where it hurts.
- **You know the cost per resolved conversation, not just per call.** Look for: cost expressed per outcome, so you can reason about unit economics.

## Observability

When something goes wrong, you can see what happened and why.

- **Every conversation is traced end to end, tools included.** Look for: model calls and tool calls linked to a single request, reconstructable after the fact.
- **Tool-call success and failure rates are tracked, not assumed.** Look for: tool outcomes recorded and monitored, so a silently failing tool surfaces before users report it.
- **Latency is measured at the tail, not just the average.** Look for: p95 and p99 latency, because the average hides the conversations that frustrate people.
- **You can pull up any past conversation and see what happened.** Look for: retrievable history detailed enough to reconstruct what the agent saw and did.

## Guardrails

The agent does what it should and refuses what it should not.

- **Inputs are validated before they reach the model.** Look for: untrusted input checked and bounded, not passed straight through.
- **The agent stays in scope and declines work outside it.** Look for: the agent holding its boundaries under attempts to push it off task, tested rather than hoped.
- **Sensitive data is handled deliberately, not passed through by accident.** Look for: PII and secrets handled on purpose, and kept out of tools and logs that do not need them.
- **Outputs are checked before they reach a customer or a system of record.** Look for: validation on the way out, especially for actions that write or send.

## Human oversight

A person can step in when the agent should not act alone.

- **There is a clear path to a human when the agent should step back.** Look for: a defined, working handoff for cases the agent should not resolve on its own.
- **High-risk actions require confirmation before they run.** Look for: irreversible or high-impact actions gated behind an explicit approval.
- **Low-confidence answers are caught rather than sent anyway.** Look for: uncertainty flagged or escalated instead of delivered with false confidence.
- **The people on the hook for the agent know how it behaves.** Look for: the accountable owners understanding its behavior, including its failure modes.

## Reliability

The agent keeps working, and a bad change can be undone.

- **Prompts and agent config are versioned like code.** Look for: prompts, tools, and config under version control, with history you can inspect.
- **You can roll back a bad change in minutes, not days.** Look for: a tested revert path, not a redeploy that takes an afternoon.
- **The agent degrades gracefully when a tool or model is down.** Look for: sensible behavior when a dependency fails, rather than a hard crash or a confident wrong answer.
- **You have tested what happens under load and under failure.** Look for: evidence the agent has been run under real load and injected failure, not just on the demo path.

## Governance

You can answer for what the agent did.

- **Every consequential action leaves an audit trail.** Look for: actions logged with enough detail to reconstruct who, what, and when, and a log that cannot be quietly edited.
- **Data handling and retention are written down and followed.** Look for: documented rules for what the agent uses, retains, and discards, and evidence they are actually followed.
- **Access to the agent and its tools is controlled and reviewed.** Look for: least-privilege access that is granted deliberately and reviewed periodically.
- **Changes go through review before they reach production.** Look for: a review step with a record of who approved what.
