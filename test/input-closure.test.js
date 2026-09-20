const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.assembly.json");
const { run } = require("../src");

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

test("propagates upstream HOLD envelopes instead of treating them as empty fragments", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-upstream-hold";
  request.inputs.push({
    envelope_version: "0.1",
    request_id: "surface-held",
    status: "HOLD",
    machine: { id: "axm.morphtile.machine.surface", version: "0.1.0" },
    candidate: null,
    dependencies: [{ id: "missing-surface-pack", ref: "sha256:deadbeef" }],
    holds: [{ code: "HOLD_MATERIAL_DEPENDENCY_MISSING", dependency: "missing-surface-pack" }],
    provenance: { caller: "surface-machine" }
  });

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_INPUT_NOT_CANDIDATE");
  assert.equal(hold.input, 2);
  assert.equal(hold.status, "HOLD");
  assert.deepEqual(hold.upstream_holds, [{ code: "HOLD_MATERIAL_DEPENDENCY_MISSING", dependency: "missing-surface-pack" }]);
  assert.deepEqual(out.dependencies, [{ id: "missing-surface-pack", ref: "sha256:deadbeef" }]);
  assert.equal(out.source_provenance[2].status, "HOLD");
  assert.equal(out.source_provenance[2].machine.id, "axm.morphtile.machine.surface");
});

test("holds malformed upstream CANDIDATE envelopes with no candidate payload", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-missing-upstream-candidate";
  request.inputs.push({
    envelope_version: "0.1",
    request_id: "broken-machine-output",
    status: "CANDIDATE",
    machine: { id: "axm.morphtile.machine.example", version: "0.1.0" },
    candidate: null
  });

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_INPUT_CANDIDATE_MISSING");
  assert.equal(hold.input, 2);
});

test("preserves request-level words and definitions inside closure identity", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-request-world-closure";
  request.world_requirements = {
    words: {
      clamp01: { name: "clamp01", args: ["x"], body: ["min", 1, ["max", 0, ["var", "x"]]] }
    },
    definitions: {
      shared_box: { id: "shared_box", body: { shape: "box", size: [1, 1, 1] } }
    }
  };

  const out = run(request);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.world_requirements.words.clamp01.name, "clamp01");
  assert.equal(out.world_requirements.definitions.shared_box.id, "shared_box");
  assert.match(out.closure_hash.value, /^[0-9a-f]{64}$/);

  const changed = copy(request);
  changed.request_id = "assembly-request-world-closure-changed";
  changed.world_requirements.definitions.shared_box.body.shape = "sphere";
  const changedOut = run(changed);
  assert.notEqual(changedOut.closure_hash.value, out.closure_hash.value);
});

test("request-level world requirements conflict explicitly with sibling requirements", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-request-world-conflict";
  request.world_requirements = { words: { pulse: { name: "pulse", args: [], body: 1 } } };
  request.inputs[0].world_requirements = { words: { pulse: { name: "pulse", args: [], body: 2 } } };

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_WORD_CONFLICT");
  assert.equal(hold.identity, "pulse");
  assert.equal(hold.source, "input[0]");
});

test("unsupported operation candidates remain explicit inside HOLD output", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-interface-operation-held";
  request.inputs.push({
    envelope_version: "0.1",
    request_id: "interface-candidate",
    status: "CANDIDATE",
    machine: { id: "axm.morphtile.machine.interface", version: "0.1.0" },
    candidate: {
      schema: "morphtile.view-operation/v0.4",
      operation: { op: "view.set", id: "mt_counter", view: { title: "Counter", body: [{ value: "count" }] } }
    }
  });

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_UNASSEMBLABLE_CANDIDATE_SCHEMA");
  assert.equal(hold.input, 2);
  assert.equal(hold.schema, "morphtile.view-operation/v0.4");
  assert.equal(out.held_candidates.length, 1);
  assert.deepEqual(out.held_candidates[0].candidate, request.inputs[2].candidate);
});
