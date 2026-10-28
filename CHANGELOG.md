# Changelog

Users receive plugin updates only when the version in `.claude-plugin/plugin.json` changes, so every user-visible change bumps the version and gets a line here.

## 1.2.2, 2026-10-27

- The incident-to-eval worked example now reproduces the incident it is named for. The airline agent skipped its knowledge lookup only on follow-up questions, so the case is a two-turn conversation that asserts the lookup is called on the follow-up (`must-call-tool`); the old single-question version would most likely have passed against the agent that failed. It is classified to the first failure in the chain, `context / buried-instruction`, with the customer-facing grounding failure noted downstream, as the taxonomy's own rule requires.
- The worked examples tell the weekend fix accurately: tighter grounding instructions held the launch, and enforcing retrieval in the path is the lasting fix still to come, not something already done.
- The design gate's decision record and the ship gate's review describe the design that was chosen: one coordinator that answers questions itself and a single back-office delegate, split on the verified-session boundary.

## 1.2.1, 2026-10-27

- The worked examples no longer carry a detail that could identify the engagement: the airline's request domains now read loyalty, reservations, and back-office, matching the case study.
- The examples' volume figures match the verified evidence: more than 120,000 automated actions a week in the design gate's decision record, and production volume in the ship gate's review, in place of hundreds of thousands.

## 1.2.0, 2026-09-22

- The design gate's Agentforce lens is current with the platform as of September 2026. The hybrid verdict now splits on surface: conversational work pins its load-bearing decisions in Agent Script, using availability gates and conditional instructions the model cannot override, while backend work has no agent to script and stays a Flow that calls a prompt template at the judgment points.
- The single agent verdict names Agent Script as where the topic is defined, so the guardrails and transitions are reviewable and the execution topology is known before a conversation starts.
- The multi-agent verdict is named Multi-Agent Orchestration, matching the shipped product.
- The design gate's trigger description names Agent Script and Multi-Agent Orchestration, so a question phrased in those terms reaches the skill.
- The classification is unchanged. The surface split affects wording and the diagram only, never the shape, and never leaks into the general lens. The golden suite is now 37 checks and covers both branches, plus the diagram vocabulary each verdict implies.

## 1.1.0, 2026-07-16

- Script invocations in the design-gate and incident-to-eval skills now use `${CLAUDE_SKILL_DIR}`, so they resolve from the plugin install directory regardless of the working directory.
- The design gate's knowledge guidance for stable documents now acknowledges agentic search alongside vector RAG, and the decision logic notes code execution over an API as the current pattern for large tool surfaces.
- A table of contents atop the incident-to-eval failure taxonomy.
- Discovery metadata: keywords in the plugin manifest, category and tags on the marketplace entry, and a manifest `$schema` for editor validation.

## 1.0.0, 2026-07-06

- Initial release. Three skills under one install: design-gate (agent, workflow, or a single call, with an Agentforce lens and a deterministic verdict engine), ship-gate (seven-dimension production readiness review), and incident-to-eval (turn a production failure into a validated, portable regression case). Every gate ships a worked example from the same real airline engagement, and both engines carry golden test suites.
