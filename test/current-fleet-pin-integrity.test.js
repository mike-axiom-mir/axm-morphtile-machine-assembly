"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const fleet = require("../fixtures/current-fleet.json");
const { LANES, SCHEMA, validateFleet, outputLines } = require("../scripts/current-fleet-pins");

const workflowPath = path.resolve(__dirname, "../.github/workflows/current-fleet.yml");
const receiverProofPath = path.resolve(__dirname, "./round37-current-fleet.integration.test.js");
const workflow = fs.readFileSync(workflowPath, "utf8");
const receiverProof = fs.readFileSync(receiverProofPath, "utf8");

const contracts = {
  form: {
    repository: "mike-axiom-mir/axm-morphtile-machine-form",
    env: "CURRENT_FORM_COMMIT"
  },
  surface: {
    repository: "mike-axiom-mir/axm-morphtile-machine-surface",
    env: "CURRENT_SURFACE_COMMIT"
  },
  capability: {
    repository: "mike-axiom-mir/axm-morphtile-machine-capability",
    env: "CURRENT_CAPABILITY_COMMIT"
  },
  interface: {
    repository: "mike-axiom-mir/axm-morphtile-machine-interface",
    env: "CURRENT_INTERFACE_COMMIT"
  },
  core: {
    repository: "mike-axiom-mir/axm-morphtile",
    env: "CURRENT_MORPHTILE_COMMIT"
  }
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function outputRef(lane) {
  return "${{ steps.pins.outputs." + lane + " }}";
}

function validateWorkflowBindings(text) {
  const errors = [];
  if (!/id:\s*pins\s*\n\s*run:\s*node scripts\/current-fleet-pins\.js >> "\$GITHUB_OUTPUT"/.test(text)) {
    errors.push("workflow: canonical manifest pin emitter is not wired to GITHUB_OUTPUT");
  }

  for (const lane of LANES) {
    const contract = contracts[lane];
    const ref = outputRef(lane);
    const checkout = new RegExp(
      `repository:\\s*${escapeRegex(contract.repository)}[\\s\\S]{0,120}?ref:\\s*${escapeRegex(ref)}(?:\\s|$)`
    );
    if (!checkout.test(text)) {
      errors.push(`${lane}: checkout ref is not driven by the canonical pin output`);
    }

    const env = new RegExp(`${contract.env}:\\s*${escapeRegex(ref)}(?:\\s|$)`);
    if (!env.test(text)) {
      errors.push(`${lane}: ${contract.env} is not driven by the canonical pin output`);
    }

    if (text.includes(fleet[lane])) {
      errors.push(`${lane}: workflow still duplicates the literal manifest commit`);
    }
  }

  return errors;
}

test("current-fleet manifest is exact and deterministically emits every lane pin", () => {
  assert.equal(fleet.schema, SCHEMA);
  assert.deepEqual(validateFleet(fleet), []);
  const emitted = outputLines(fleet).trim().split("\n");
  assert.deepEqual(emitted, LANES.map((lane) => `${lane}=${fleet[lane]}`));
});

test("current-fleet workflow consumes manifest outputs instead of duplicating exact commit literals", () => {
  assert.deepEqual(validateWorkflowBindings(workflow), []);
});

test("full-fleet receiver proof derives exact identities from the same manifest", () => {
  assert.match(receiverProof, /const fleet = require\("\.\.\/fixtures\/current-fleet\.json"\);/);
  for (const lane of LANES) {
    assert.equal(receiverProof.includes(fleet[lane]), false,
      `${lane}: receiver proof must not duplicate the manifest commit literal`);
  }
});

test("pin emitter fails closed on malformed or incomplete manifest identity", () => {
  const malformed = { ...fleet, form: "not-an-exact-sha" };
  assert.throws(() => outputLines(malformed), /form: expected an exact lowercase 40-character commit sha/);

  const incomplete = { ...fleet };
  delete incomplete.interface;
  assert.throws(() => outputLines(incomplete), /interface: expected an exact lowercase 40-character commit sha/);

  const wrongSchema = { ...fleet, schema: "axm.morphtile.assembly-current-fleet/v0" };
  assert.throws(() => outputLines(wrongSchema), /manifest: schema must equal/);
});
