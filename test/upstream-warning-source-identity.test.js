"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function requestWithMachineId(machineId, requestId) {
  return {
    envelope_version: "0.1",
    request_id: requestId,
    goal: "Preserve exact authored upstream warning source identity",
    inputs: [
      {
        envelope_version: "0.1",
        request_id: "upstream-source",
        machine: { id: machineId, version: "fixture" },
        status: "CANDIDATE",
        warnings: [{ code: "UPSTREAM_FIXTURE_WARNING", detail: "keep source identity exact" }],
        candidate: {
          schema: "morphtile.tile-spec/v0.4",
          form_hints: [],
          facets: {}
        }
      }
    ],
    provenance: { caller: "upstream-warning-source-identity-regression" }
  };
}

test("upstream warning source preserves authored falsey machine ids instead of rewriting them to absence", () => {
  for (const [label, machineId] of [
    ["empty-string", ""],
    ["zero", 0],
    ["false", false]
  ]) {
    const source = requestWithMachineId(machineId, `warning-source-${label}`);
    const before = JSON.stringify(source);
    const out = run(source);

    assert.equal(out.status, "CANDIDATE", label);
    assert.equal(out.warnings.length, 1, label);
    assert.equal(out.warnings[0].code, "UPSTREAM_WARNING", label);
    assert.equal(out.warnings[0].machine, machineId, `${label}: warning source machine id must retain authored presence/value`);
    assert.deepEqual(out.warnings[0].warning, source.inputs[0].warnings[0], label);
    assert.equal(out.source_provenance[0].machine.id, machineId, `${label}: source provenance is the comparison truth`);
    assert.equal(JSON.stringify(source), before, `${label}: caller input must remain unchanged`);
  }
});

test("upstream warning source still reports null when no machine id was authored", () => {
  const source = requestWithMachineId("fixture", "warning-source-absent");
  delete source.inputs[0].machine.id;
  const out = run(source);

  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.warnings.length, 1);
  assert.equal(out.warnings[0].machine, null);
  assert.deepEqual(out.source_provenance[0].machine, { version: "fixture" });
});
