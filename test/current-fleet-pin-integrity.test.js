"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const fleet = require("../fixtures/current-fleet.json");

const workflowPath = path.resolve(__dirname, "../.github/workflows/current-fleet.yml");
const workflow = fs.readFileSync(workflowPath, "utf8");

const lanes = {
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

function validate(text, expectedFleet) {
  const errors = [];
  for (const [lane, contract] of Object.entries(lanes)) {
    const commit = expectedFleet[lane];
    if (typeof commit !== "string" || !/^[0-9a-f]{40}$/.test(commit)) {
      errors.push(`${lane}: manifest commit is not an exact 40-character sha`);
      continue;
    }

    const checkout = new RegExp(
      `repository:\\s*${escapeRegex(contract.repository)}\\s*\\n\\s*ref:\\s*${commit}(?:\\s|$)`
    );
    if (!checkout.test(text)) {
      errors.push(`${lane}: checkout ref does not match manifest ${commit}`);
    }

    const env = new RegExp(`${contract.env}:\\s*${commit}(?:\\s|$)`);
    if (!env.test(text)) {
      errors.push(`${lane}: ${contract.env} does not match manifest ${commit}`);
    }
  }
  return errors;
}

test("current-fleet workflow checkout refs and evidence env identities match one canonical manifest", () => {
  assert.equal(fleet.schema, "axm.morphtile.assembly-current-fleet/v1");
  assert.deepEqual(validate(workflow, fleet), []);
});

test("current-fleet pin validator fails closed when a workflow drifts from the manifest", () => {
  const staleForm = "0000000000000000000000000000000000000000";
  const drifted = workflow.replaceAll(fleet.form, staleForm);
  const errors = validate(drifted, fleet);
  assert.equal(errors.some((entry) => entry.startsWith("form: checkout ref")), true);
  assert.equal(errors.some((entry) => entry.startsWith("form: CURRENT_FORM_COMMIT")), true);
});
