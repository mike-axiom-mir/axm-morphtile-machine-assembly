const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.assembly.json");
const { run } = require("../src");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function holdOf(out, code) {
  return (out.holds || []).find((hold) => hold.code === code);
}

test("unknown enumerable Assembly request fields HOLD instead of collapsing to omission", () => {
  const request = clone(fixture);
  request.future_assembly_mode = "layered";

  const out = run(request);
  assert.equal(out.status, "HOLD");
  assert.deepEqual(holdOf(out, "HOLD_REQUEST_FIELD_UNSUPPORTED"), {
    code: "HOLD_REQUEST_FIELD_UNSUPPORTED",
    path: "request.future_assembly_mode",
    detail: "Assembly v0.1 request grammar does not define this authored field."
  });
  assert.equal(request.future_assembly_mode, "layered", "Assembly must not rewrite caller-owned unknown request data");
});

test("unknown hidden Assembly request fields HOLD as grammar violations before portable transport can drop them", () => {
  const request = clone(fixture);
  Object.defineProperty(request, "hidden_assembly_mode", {
    value: "layered",
    enumerable: false,
    configurable: true,
    writable: true
  });

  const out = run(request);
  assert.equal(out.status, "HOLD");
  assert.equal(holdOf(out, "HOLD_REQUEST_FIELD_UNSUPPORTED").path, "request.hidden_assembly_mode");
  const descriptor = Object.getOwnPropertyDescriptor(request, "hidden_assembly_mode");
  assert.equal(descriptor.value, "layered");
  assert.equal(descriptor.enumerable, false);
});

test("symbol-keyed Assembly request data HOLDs under the exact request grammar", () => {
  const request = clone(fixture);
  const key = Symbol("assembly-request-extension");
  request[key] = "layered";

  const out = run(request);
  assert.equal(out.status, "HOLD");
  assert.deepEqual(holdOf(out, "HOLD_REQUEST_FIELD_UNSUPPORTED"), {
    code: "HOLD_REQUEST_FIELD_UNSUPPORTED",
    path: "request",
    detail: "Assembly v0.1 request grammar does not define symbol-keyed authored fields."
  });
  assert.equal(request[key], "layered");
});

test("Assembly intent rejects unknown own fields instead of silently ignoring authored meaning", () => {
  const request = clone(fixture);
  request.intent.future_parent_mode = "nearest";

  const out = run(request);
  assert.equal(out.status, "HOLD");
  assert.equal(holdOf(out, "HOLD_REQUEST_INTENT_FIELD_UNSUPPORTED").path, "request.intent.future_parent_mode");
  assert.equal(request.intent.future_parent_mode, "nearest");
});

test("Assembly intent must remain an authored plain map", () => {
  const request = clone(fixture);
  request.intent = ["Proof tile"];

  const out = run(request);
  assert.equal(out.status, "HOLD");
  assert.equal(holdOf(out, "HOLD_REQUEST_INTENT_SHAPE_INVALID").path, "request.intent");
});

test("ordinary exact v0.1 request and intent fields remain a candidate control", () => {
  const request = clone(fixture);
  request.intent.id = "proof_tile";
  request.intent.tile_path = "proof_tile";
  request.dependencies = [];
  request.world_requirements = null;

  const out = run(request);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.candidate.id, "proof_tile");
});
