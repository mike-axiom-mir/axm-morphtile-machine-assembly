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

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
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
    assert.equal(out.warnings[0].machine, machineId, `${label}: compact warning source must retain the exact authored id value`);
    assert.deepEqual(out.warnings[0].warning, source.inputs[0].warnings[0], label);
    assert.equal(out.source_provenance[0].machine.id, machineId, `${label}: full source provenance must report the same authored id value`);
    assert.equal(JSON.stringify(source), before, `${label}: caller input must remain unchanged`);
  }
});

test("authored null remains exact while full provenance distinguishes it from true absence", () => {
  const authoredNull = requestWithMachineId(null, "warning-source-null");
  const nullBefore = JSON.stringify(authoredNull);
  const nullOut = run(authoredNull);

  assert.equal(nullOut.status, "CANDIDATE");
  assert.equal(nullOut.warnings[0].machine, null, "compact warning source must retain the exact authored null value");
  assert.equal(hasOwn(nullOut.source_provenance[0].machine, "id"), true,
    "full provenance must preserve that null was actually authored");
  assert.equal(nullOut.source_provenance[0].machine.id, null);
  assert.equal(JSON.stringify(authoredNull), nullBefore, "authored-null input must remain unchanged");

  const absent = requestWithMachineId("fixture", "warning-source-absent");
  delete absent.inputs[0].machine.id;
  const absentBefore = JSON.stringify(absent);
  const absentOut = run(absent);

  assert.equal(absentOut.status, "CANDIDATE");
  assert.equal(absentOut.warnings[0].machine, null,
    "compact warning source uses null when the id key is truly absent");
  assert.equal(hasOwn(absentOut.source_provenance[0].machine, "id"), false,
    "full provenance must distinguish true absence from authored null");
  assert.deepEqual(absentOut.source_provenance[0].machine, { version: "fixture" });
  assert.deepEqual(absentOut.warnings[0].warning, absent.inputs[0].warnings[0]);
  assert.equal(JSON.stringify(absent), absentBefore, "absence fixture must remain unchanged");
});

test("undefined own-key machine id fails portability instead of collapsing into absence", () => {
  const source = requestWithMachineId("fixture", "warning-source-undefined");
  source.inputs[0].machine.id = undefined;
  const out = run(source);

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds.some((hold) => (
    hold.code === "HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE" &&
    hold.path === "request.inputs[0].machine.id"
  )), true, JSON.stringify(out.holds));
});
