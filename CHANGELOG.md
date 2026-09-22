# Changelog

Users receive plugin updates only when the version in `.claude-plugin/plugin.json` changes, so every user-visible change bumps the version and gets a line here.

## 1.2.0, 2026-09-22

- The design gate's Agentforce lens is current with the platform as of September 2026. The hybrid verdict now splits on surface: conversational work pins its load-bearing decisions in Agent Script, using availability gates and conditional instructions the model cannot override, while backend work has no agent to script and stays a Flow that calls a prompt template at the judgment points.
- The single agent verdict names Agent Script as where the topic is defined, so the guardrails and transitions are reviewable and the execution topology is known before a conversation starts.
- The multi-agent verdict is named Multi-Agent Orchestration, matching the shipped product.
- The classification is unchanged. The surface split affects wording and the diagram only, never the shape, and never leaks into the general lens. The golden suite is now 37 checks and covers both branches, plus the diagram vocabulary each verdict implies.

## 1.1.0, 2026-07-16

- Script invocations in the design-gate and incident-to-eval skills now use `${CLAUDE_SKILL_DIR}`, so they resolve from the plugin install directory regardless of the working directory.
- The design gate's knowledge guidance for stable documents now acknowledges agentic search alongside vector RAG, and the decision logic notes code execution over an API as the current pattern for large tool surfaces.
- A table of contents atop the incident-to-eval failure taxonomy.
- Discovery metadata: keywords in the plugin manifest, category and tags on the marketplace entry, and a manifest `$schema` for editor validation.

## 1.0.0, 2026-07-06

- Initial release. Three skills under one install: design-gate (agent, workflow, or a single call, with an Agentforce lens and a deterministic verdict engine), ship-gate (seven-dimension production readiness review), and incident-to-eval (turn a production failure into a validated, portable regression case). Every gate ships a worked example from the same real airline engagement, and both engines carry golden test suites.
