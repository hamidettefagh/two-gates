#!/usr/bin/env node
// test.mjs: golden checks for the eval case validator.
// Exercises the real CLI so the exit codes, error text, and determinism the
// skill depends on are enforced, not assumed. The shipped example must always
// validate; a broken example in the repo would be the exact failure this
// project exists to prevent.
//
//   node scripts/test.mjs

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, "validate-eval.mjs");
const example = join(here, "..", "assets", "example-airline-grounding.json");

let failed = 0;
function check(name, condition, detail) {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}${detail ? `\n         ${detail}` : ""}`);
  }
}

function run(args) {
  try {
    const stdout = execFileSync("node", [script, ...args], { encoding: "utf8", stdio: "pipe" });
    return { code: 0, stdout, stderr: "" };
  } catch (e) {
    return { code: e.status, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

const tmp = mkdtempSync(join(tmpdir(), "eval-cases-"));
const write = (name, obj) => {
  const p = join(tmp, name);
  writeFileSync(p, typeof obj === "string" ? obj : JSON.stringify(obj, null, 2));
  return p;
};

const good = JSON.parse(readFileSync(example, "utf8"));

// The shipped example is the first guarantee.
const ex = run([example]);
check("the shipped example validates", ex.code === 0 && /valid/.test(ex.stdout), ex.stderr || ex.stdout);

// The template must validate against the validator that ships next to it.
const tpl = run(["--template"]);
const tplFile = write("template.json", tpl.stdout);
check("the template validates", run([tplFile]).code === 0);

// Markdown rendering works and carries the load-bearing parts.
const md = run(["--md", example]);
check(
  "markdown summary renders the verdict parts",
  md.code === 0 && md.stdout.includes("## Eval case:") && md.stdout.includes("must-not-contain") && md.stdout.includes("every-change"),
  md.stdout.slice(0, 120),
);

// Each violation fails with a precise error.
const broken = [
  ["missing id", { ...good, id: undefined }, "id:"],
  ["bad id casing", { ...good, id: "Not-Kebab" }, "id:"],
  ["bad severity", { ...good, sourceIncident: { ...good.sourceIncident, severity: "critical" } }, "severity"],
  ["bad category", { ...good, failure: { ...good.failure, category: "vibes" } }, "failure.category"],
  ["missing observed", { ...good, failure: { ...good.failure, observed: "" } }, "failure.observed"],
  ["no assertions", { ...good, case: { ...good.case, expected: { ...good.case.expected, assertions: [] } } }, "at least one assertion"],
  [
    "unknown assertion type",
    { ...good, case: { ...good.case, expected: { ...good.case.expected, assertions: [{ type: "should-probably", value: "x" }] } } },
    "is not one of",
  ],
  [
    "empty assertion value",
    { ...good, case: { ...good.case, expected: { ...good.case.expected, assertions: [{ type: "must-contain", value: " " }] } } },
    "value: required",
  ],
  ["bad runOn", { ...good, guard: { ...good.guard, runOn: "whenever" } }, "guard.runOn"],
  ["bad date shape", { ...good, sourceIncident: { ...good.sourceIncident, date: "June 2026" } }, "YYYY-MM-DD"],
];

for (const [name, obj, needle] of broken) {
  const clean = JSON.parse(JSON.stringify(obj));
  const res = run([write(`${name.replace(/[^a-z]/g, "-")}.json`, clean)]);
  check(`rejects ${name}`, res.code === 2 && res.stderr.includes(needle), `code=${res.code} ${res.stderr.slice(0, 140)}`);
}

// Unknown extra fields are tolerated, so the format can grow.
check("extra fields are ignored", run([write("extra.json", { ...good, futureField: { anything: true } })]).code === 0);

// Not JSON at all.
const notJson = run([write("nope.json", "this is not json")]);
check("rejects a non-JSON file", notJson.code === 2 && notJson.stderr.includes("not readable as JSON"));

// Multiple files: one bad file fails the batch.
const batch = run([example, write("bad-batch.json", { ...good, guard: { runOn: "whenever" } })]);
check("a bad file fails the batch", batch.code === 2);

// Determinism: byte-identical output for the same input.
const a = run(["--md", example]).stdout;
const b = run(["--md", example]).stdout;
check("same input, byte-identical output", a === b);

rmSync(tmp, { recursive: true, force: true });

console.log("");
if (failed) {
  console.error(`${failed} check(s) failed.`);
  process.exit(1);
}
console.log("All checks passed.");
