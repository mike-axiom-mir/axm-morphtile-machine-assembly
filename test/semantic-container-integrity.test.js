const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.assembly.json");
const { run } = require("../src");

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectHold(request, code) {
  let out;
  assert.doesNotThrow(() => { out = run(request); });
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds.some((hold) => hold.code === code), true);
}

test("request.inputs must remain an authored array", () => {
  const request = copy(baseRequest);
  request.request_id = "container-inputs";
  request.inputs = "not-an-array";
  expectHold(request, "HOLD_INPUTS_SHAPE_INVALID");
});

test("request dependencies must remain an authored array", () => {
  const request = copy(baseRequest);
  request.request_id = "container-request-dependencies";
  request.dependencies = { id: "dep-one" };
  expectHold(request, "HOLD_DEPENDENCIES_SHAPE_INVALID");
});

test("input dependencies must remain an authored array", () => {
  const request = copy(baseRequest);
  request.request_id = "container-input-dependencies";
  request.inputs[0].dependencies = { id: "dep-one" };
  expectHold(request, "HOLD_DEPENDENCIES_SHAPE_INVALID");
});

test("upstream warnings must remain an authored array", () => {
  const request = copy(baseRequest);
  request.request_id = "container-warnings";
  request.inputs[0].warnings = { code: "warning-shaped-object" };
  expectHold(request, "HOLD_WARNINGS_SHAPE_INVALID");
});

test("form hints must remain an authored string array", () => {
  const request = copy(baseRequest);
  request.request_id = "container-form-hints";
  request.inputs[0].candidate.form_hints = { 0: "ui_panel" };
  expectHold(request, "HOLD_FORM_HINTS_SHAPE_INVALID");
});

test("facet maps must not inherit array index semantics", () => {
  const request = copy(baseRequest);
  request.request_id = "container-facets";
  request.inputs[0].candidate.facets = [
    { type: "primitive", data: { shape: "box", size: [1, 1, 1] } }
  ];
  expectHold(request, "HOLD_FACETS_SHAPE_INVALID");
});

test("world requirement maps must not inherit array index semantics", () => {
  const request = copy(baseRequest);
  request.request_id = "container-world-map";
  request.world_requirements = {
    words: [{ name: "word-zero", meaning: "not a named map" }]
  };
  expectHold(request, "HOLD_WORLD_REQUIREMENTS_SHAPE_INVALID");
});

test("primitive input entries HOLD instead of becoming schemaless empty candidates", () => {
  const request = copy(baseRequest);
  request.request_id = "container-input-entry";
  request.inputs = ["candidate-shaped-string"];
  expectHold(request, "HOLD_INPUT_SHAPE_INVALID");
});
