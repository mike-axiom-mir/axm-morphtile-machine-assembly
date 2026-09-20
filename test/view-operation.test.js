const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.assembly.json");
const { run } = require("../src");

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function viewEnvelope(id = "mt_four_machine", view = { title: "Counter", body: [{ value: "count" }] }) {
  return {
    envelope_version: "0.1",
    request_id: "interface-view",
    machine: { id: "axm.morphtile.machine.interface", version: "0.1.0" },
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.view-operation/v0.4",
      operation: { op: "view.set", id, view }
    },
    dependencies: [],
    world_requirements: null,
    evidence: [],
    warnings: [],
    holds: [],
    provenance: { caller: "interface-fixture" }
  };
}

test("folds the exact stable view.set contract when target equals explicit assembly id", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-view-fold";
  request.intent = { id: "mt_four_machine", name: "Four machine proof" };
  request.inputs.push(viewEnvelope());

  const out = run(request);
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.equal(out.candidate.id, "mt_four_machine");
  assert.deepEqual(out.candidate.view, { title: "Counter", body: [{ value: "count" }] });
  assert.equal(out.source_provenance[2].candidate_schema, "morphtile.view-operation/v0.4");
});

test("binds a view operation to a tile-spec id when the request does not repeat identity", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-view-tile-id";
  request.inputs[0].candidate.id = "mt_four_machine";
  request.inputs.push(viewEnvelope());

  const out = run(request);
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.equal(out.candidate.id, "mt_four_machine");
  assert.deepEqual(out.candidate.view, { title: "Counter", body: [{ value: "count" }] });
});

test("holds view operations when no assembled tile identity exists", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-view-unbound";
  request.inputs.push(viewEnvelope());

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_VIEW_OPERATION_TARGET_UNBOUND");
  assert.equal(hold.target, "mt_four_machine");
});

test("holds view operations addressed to another tile", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-view-mismatch";
  request.intent = { id: "mt_target", name: "Target" };
  request.inputs.push(viewEnvelope("mt_other"));

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_VIEW_OPERATION_TARGET_MISMATCH");
  assert.equal(hold.target, "mt_other");
  assert.equal(hold.assembled_id, "mt_target");
});

test("holds conflicting tile identities before folding addressed operations", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-id-conflict";
  request.intent = { id: "mt_request", name: "Conflict" };
  request.inputs[0].candidate.id = "mt_form";
  request.inputs.push(viewEnvelope("mt_request"));

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_ASSEMBLY_ID_CONFLICT");
  assert.deepEqual(hold.identities, [
    { source: "request.intent.id", value: "mt_request" },
    { source: "input[0].candidate.id", value: "mt_form" }
  ]);
});

test("holds unknown view-operation fields instead of silently dropping future meaning", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-view-extra-field";
  request.intent = { id: "mt_four_machine", name: "Four machine proof" };
  const interfaceOut = viewEnvelope();
  interfaceOut.candidate.operation.authority_snapshot = { count: 42 };
  request.inputs.push(interfaceOut);

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_VIEW_OPERATION_SHAPE_INVALID");
  assert.deepEqual(hold.fields, ["authority_snapshot"]);
});

test("a pre-existing different tile view conflicts instead of being overwritten by view.set", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-view-conflict";
  request.intent = { id: "mt_four_machine", name: "Four machine proof" };
  request.inputs[0].candidate.view = { title: "Existing", body: [{ text: "keep me" }] };
  request.inputs.push(viewEnvelope());

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_ASSEMBLY_CONFLICT");
  assert.deepEqual(hold.paths, ["view"]);
});
