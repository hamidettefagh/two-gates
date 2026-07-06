#!/usr/bin/env node
// validate-eval.mjs: the deterministic gate for eval case files.
//
// A case either conforms to the format or it does not, with exact errors and
// stable exit codes. The judgment in this skill lives in reading the incident;
// none of it lives here. Same file in, same verdict out, every time.
//
// Usage:
//   node validate-eval.mjs case.json [more.json ...]   # validate, exit 0 or 2
//   node validate-eval.mjs --template                  # print a starter case
//   node validate-eval.mjs --md case.json              # render a markdown summary

import { readFileSync } from "node:fs";

const CATEGORIES = [
  "grounding",
  "retrieval",
  "tool-use",
  "reasoning",
  "context",
  "guardrail",
  "freshness",
  "escalation",
  "coordination",
];

const ASSERTION_TYPES = [
  "must-contain",
  "must-not-contain",
  "must-cite-source",
  "must-refuse",
  "must-escalate",
  "must-call-tool",
  "must-not-call-tool",
  "must-match-schema",
  "human-review",
];

const SEVERITIES = ["sev1", "sev2", "sev3", "sev4"];
const RUN_ON = ["every-change", "nightly", "pre-release"];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

export function validateCase(c) {
  const errors = [];
  const need = (cond, msg) => {
    if (!cond) errors.push(msg);
  };

  if (typeof c !== "object" || c === null || Array.isArray(c)) {
    return ["The case must be a JSON object."];
  }

  need(isNonEmptyString(c.id) && KEBAB.test(c.id), "id: required, kebab-case (lowercase letters, digits, hyphens).");
  need(isNonEmptyString(c.title), "title: required, one plain sentence.");

  const si = c.sourceIncident;
  if (typeof si !== "object" || si === null) {
    errors.push("sourceIncident: required object.");
  } else {
    need(isNonEmptyString(si.summary), "sourceIncident.summary: required.");
    need(SEVERITIES.includes(si.severity), `sourceIncident.severity: required, one of ${SEVERITIES.join(", ")}.`);
    if (si.date !== undefined) need(DATE.test(String(si.date)), "sourceIncident.date: YYYY-MM-DD when present.");
  }

  const f = c.failure;
  if (typeof f !== "object" || f === null) {
    errors.push("failure: required object.");
  } else {
    need(CATEGORIES.includes(f.category), `failure.category: required, one of ${CATEGORIES.join(", ")}.`);
    need(isNonEmptyString(f.mode) && KEBAB.test(f.mode), "failure.mode: required, kebab-case, normally from the taxonomy.");
    need(isNonEmptyString(f.observed), "failure.observed: required, what the agent did.");
    need(isNonEmptyString(f.expected), "failure.expected: required, what it should have done.");
  }

  const cs = c.case;
  if (typeof cs !== "object" || cs === null) {
    errors.push("case: required object.");
  } else {
    need(isNonEmptyString(cs.input), "case.input: required, the smallest input that reproduces the failure.");
    if (cs.context !== undefined)
      need(typeof cs.context === "object" && cs.context !== null && !Array.isArray(cs.context), "case.context: an object when present.");
    const ex = cs.expected;
    if (typeof ex !== "object" || ex === null) {
      errors.push("case.expected: required object.");
    } else {
      need(isNonEmptyString(ex.behavior), "case.expected.behavior: required.");
      if (!Array.isArray(ex.assertions) || ex.assertions.length === 0) {
        errors.push("case.expected.assertions: required, at least one assertion.");
      } else {
        ex.assertions.forEach((a, i) => {
          if (typeof a !== "object" || a === null) {
            errors.push(`case.expected.assertions[${i}]: must be an object with type and value.`);
            return;
          }
          need(
            ASSERTION_TYPES.includes(a.type),
            `case.expected.assertions[${i}].type: "${a.type}" is not one of ${ASSERTION_TYPES.join(", ")}.`,
          );
          need(isNonEmptyString(a.value), `case.expected.assertions[${i}].value: required, non-empty.`);
        });
      }
    }
  }

  const g = c.guard;
  if (typeof g !== "object" || g === null) {
    errors.push("guard: required object.");
  } else {
    need(RUN_ON.includes(g.runOn), `guard.runOn: required, one of ${RUN_ON.join(", ")}.`);
  }

  return errors;
}

const TEMPLATE = {
  id: "short-kebab-id",
  title: "One sentence stating what must be true",
  sourceIncident: {
    date: "2026-01-01",
    summary: "What happened, short enough to read in a diff.",
    severity: "sev2",
    surface: "which agent, which environment",
  },
  failure: {
    category: "grounding",
    mode: "parametric-answer",
    observed: "What the agent did.",
    expected: "What it should have done.",
  },
  case: {
    input: "The smallest input that reproduces the failure.",
    context: {
      fixtures: "Documents, records, or tool responses the case depends on.",
    },
    expected: {
      behavior: "The outcome in one or two sentences.",
      assertions: [{ type: "must-contain", value: "the fact the output must state" }],
    },
  },
  guard: {
    runOn: "every-change",
    suite: "name of the regression suite",
    owner: "who answers for this case",
  },
};

function toMarkdown(c) {
  const asserts = c.case.expected.assertions.map((a) => `- \`${a.type}\`: ${a.value}`).join("\n");
  return `## Eval case: ${c.title}

Incident (${c.sourceIncident.severity}${c.sourceIncident.date ? `, ${c.sourceIncident.date}` : ""}): ${c.sourceIncident.summary}

Failure: \`${c.failure.category} / ${c.failure.mode}\`. ${c.failure.observed} Expected: ${c.failure.expected}

Input: ${c.case.input}

Expected behavior: ${c.case.expected.behavior}

Assertions:
${asserts}

Guard: runs ${c.guard.runOn}${c.guard.suite ? ` in ${c.guard.suite}` : ""}${c.guard.owner ? `, owned by ${c.guard.owner}` : ""}.
`;
}

// --- CLI ---
const argv = process.argv.slice(2);

if (argv.includes("--template")) {
  console.log(JSON.stringify(TEMPLATE, null, 2));
  process.exit(0);
}

const wantMd = argv.includes("--md");
const files = argv.filter((a) => !a.startsWith("--"));

if (files.length === 0) {
  console.error(
    "Provide one or more case files.\n" +
      "  node validate-eval.mjs case.json          validate\n" +
      "  node validate-eval.mjs --md case.json     markdown summary\n" +
      "  node validate-eval.mjs --template         starter case",
  );
  process.exit(2);
}

let failed = 0;
for (const file of files) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`${file}: not readable as JSON. ${e.message}`);
    failed++;
    continue;
  }
  const errors = validateCase(parsed);
  if (errors.length) {
    console.error(`${file}: ${errors.length} problem(s)`);
    for (const e of errors) console.error(`  ${e}`);
    failed++;
  } else if (wantMd) {
    console.log(toMarkdown(parsed));
  } else {
    console.log(`${file}: valid`);
  }
}

process.exit(failed ? 2 : 0);
