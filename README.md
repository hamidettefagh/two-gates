# The two gates

A Claude Code plugin that installs how I build production AI agents.

Two gates and a loop. The design gate decides what to build. The ship gate proves it is ready. And when something gets through both anyway, the incident becomes an eval, so the failure is not just fixed but unrepeatable. The method came out of a production system that nearly got shut down in its first day; the write-up is at [hamidettefagh.com/two-gates](https://hamidettefagh.com/two-gates).

```
design gate -> build -> ship gate -> run -> incident
     ^                      ^                  |
     |                      +--- eval case <---+
     +------ revisit when the case changes the design
```

## Install

```
/plugin marketplace add hamidettefagh/two-gates
/plugin install two-gates@hamidettefagh
```

It is also listed in Anthropic's plugin directory. In the Claude apps, open Plugins, then Discover, and search `two-gates`.

## The three skills

| Skill | Gate | What it does |
|---|---|---|
| `/two-gates:design-gate` | Before you build | Reads a PRD, ticket, or use case and decides the shape: workflow, hybrid, single model call, single agent with tools, or multi-agent. Includes an Agentforce lens (Flow, prompt template, Agent Script, topic, or Multi-Agent Orchestration). Writes an architecture decision record. |
| `/two-gates:ship-gate` | Before you run | Reviews a built agent across seven dimensions: evaluation, cost, observability, guardrails, human oversight, reliability, governance. Scores it out of 28 and returns the gaps in priority order. |
| `/two-gates:incident-to-eval` | When it breaks anyway | Turns a production incident into a golden eval case: classifies the failure against a nine-category taxonomy and writes a portable regression test any runner can enforce. |

The skills also trigger on their own when the conversation calls for them: scoping an AI feature, asking whether an agent is ready to ship, or handing over a postmortem.

## The deterministic spine

The parts that should not be judgment calls are not. The design gate's five-way verdict is computed by a pinned script, the eval case format is enforced by a pinned validator, and both ship golden test suites. A method whose whole argument is "do not hand deterministic work to a model" should not do exactly that.

```bash
node skills/design-gate/scripts/decide.mjs --questions
node skills/incident-to-eval/scripts/validate-eval.mjs --template
```

## What it runs

The plugin adds no network access of its own. It has no hooks, no MCP servers, no telemetry, and no packages to install. It reads no environment variables and never asks for a credential.

Two of the skills tell Claude to run a local Node script that uses only Node's built-in modules:

- `decide.mjs`, in the design gate, reads the seven answers you give it, as JSON on the command line or from a file named with `--file`, and prints the verdict. It writes nothing.
- `validate-eval.mjs`, in incident-to-eval, reads the eval case file you name and prints whether it is valid, listing each problem it finds. It writes nothing.

Each script has a golden test suite beside it, `test.mjs`, which runs the script as a child process. The incident-to-eval suite writes its fixtures to a temporary directory it creates and then deletes; nothing else in the plugin writes a file. The ship gate is instructions and a rubric, with no script. The two scripts need Node.js; everything else is Markdown.

## Receipts

Every gate carries a worked example from the same real engagement, a major US airline's production customer service agent: the [architecture decision record](skills/design-gate/assets/example-decision-record.md), the [readiness review](skills/ship-gate/assets/example-review.md) as it would have run the week before the go-live incident, and the [eval case](skills/incident-to-eval/assets/example-airline-grounding.json) that would have caught that incident on a Tuesday afternoon instead of a Friday night. The full story is in the [case study](https://hamidettefagh.com/work/airline-super-agent).

## Standalone skills

Each skill also lives in its own repository, canonical and installable on its own: [agent-or-workflow](https://github.com/hamidettefagh/agent-or-workflow), [agent-production-readiness](https://github.com/hamidettefagh/agent-production-readiness), and [incident-to-eval](https://github.com/hamidettefagh/incident-to-eval). The plugin bundles them under one install and one version; the browser versions of both gates are at [hamidettefagh.com](https://hamidettefagh.com).

---

Hamid Ettefagh, [hamidettefagh.com](https://hamidettefagh.com)
