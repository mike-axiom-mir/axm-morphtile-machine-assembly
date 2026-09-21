"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.assembly.json");
const { run } = require("../src");

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function upstreamEnvelope() {
  return {
    envelope_version: "0.1",
    request_id: "upstream-valid-request",
    machine: { id: "axm.test.producer", version: "1.0.0" },
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.facet-candidate/v0.4",
      facet: "material",
      value: {
        type: "primitive",
        source: null,
        data: { color: [0.3, 0.4, 0.5] }
      }
    }
  };
}

function assemble(input, label) {
  const request = copy(baseRequest);
  request.request_id = "upstream-envelope-identity-" + label;
  request.inputs.push(input);
  return run(request);
}

test("status-bearing upstream envelopes fail closed on malformed authored request identity", () => {
  for (const [label, value] of [
    ["null", null],
    ["false", false],
    ["zero", 0],
    ["empty", ""],
    ["object", { id: "not-a-request-id" }]
  ]) {
    const input = upstreamEnvelope();
    input.request_id = value;
    const before = JSON.stringify(input);

    const out = assemble(input, "request-id-" + label);

    assert.equal(out.status, "HOLD", label);
    const hold = out.holds.find((item) => item.code === "HOLD_INPUT_REQUEST_ID_INVALID");
    assert.ok(hold, label);
    assert.equal(hold.path, "request.inputs[2].request_id", label);
    assert.equal(JSON.stringify(input), before, label);
  }
});

test("status-bearing upstream envelopes fail closed on malformed authored machine identity", () => {
  for (const [label, value] of [
    ["null", null],
    ["false", false],
    ["string", "axm.test.producer"],
    ["array", ["axm.test.producer", "1.0.0"]],
    ["empty-map", {}],
    ["missing-version", { id: "axm.test.producer" }],
    ["empty-id", { id: "", version: "1.0.0" }],
    ["empty-version", { id: "axm.test.producer", version: "" }],
    ["structured-id", { id: { name: "axm.test.producer" }, version: "1.0.0" }]
  ]) {
    const input = upstreamEnvelope();
    input.machine = value;
    const before = JSON.stringify(input);

    const out = assemble(input, "machine-" + label);

    assert.equal(out.status, "HOLD", label);
    const hold = out.holds.find((item) => item.code === "HOLD_INPUT_MACHINE_INVALID");
    assert.ok(hold, label);
    assert.equal(hold.path, "request.inputs[2].machine", label);
    assert.equal(JSON.stringify(input), before, label);
  }
});

test("legacy status envelopes may omit either source identity field without fabricating it", () => {
  const machineOnly = upstreamEnvelope();
  delete machineOnly.request_id;
  const machineOnlyOut = assemble(machineOnly, "machine-only-legacy");
  assert.equal(machineOnlyOut.status, "CANDIDATE", JSON.stringify(machineOnlyOut.holds));
  assert.deepEqual(machineOnlyOut.source_provenance[2].machine, machineOnly.machine);
  assert.equal(machineOnlyOut.source_provenance[2].request_id, null);

  const requestOnly = upstreamEnvelope();
  delete requestOnly.machine;
  const requestOnlyOut = assemble(requestOnly, "request-only-legacy");
  assert.equal(requestOnlyOut.status, "CANDIDATE", JSON.stringify(requestOnlyOut.holds));
  assert.equal(requestOnlyOut.source_provenance[2].machine, null);
  assert.equal(requestOnlyOut.source_provenance[2].request_id, requestOnly.request_id);

  const statusOnly = upstreamEnvelope();
  delete statusOnly.request_id;
  delete statusOnly.machine;
  const statusOnlyOut = assemble(statusOnly, "status-only-legacy");
  assert.equal(statusOnlyOut.status, "CANDIDATE", JSON.stringify(statusOnlyOut.holds));
  assert.equal(statusOnlyOut.source_provenance[2].machine, null);
  assert.equal(statusOnlyOut.source_provenance[2].request_id, null);
});

test("valid upstream envelope identity remains accepted and exactly traceable", () => {
  const input = upstreamEnvelope();
  const out = assemble(input, "valid-control");

  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(out.source_provenance[2].machine, input.machine);
  assert.equal(out.source_provenance[2].request_id, input.request_id);
});
