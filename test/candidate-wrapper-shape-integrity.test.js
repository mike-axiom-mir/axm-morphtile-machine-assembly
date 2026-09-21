const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../fixtures/request.assembly.json");
const { run } = require("../src");

function copy() {
  return JSON.parse(JSON.stringify(fixture));
}

test("authored candidate wrappers fail closed when candidate is not a plain map", () => {
  const malformed = [null, false, 0, "", [], "not-a-candidate"];

  for (const [index, value] of malformed.entries()) {
    const request = copy();
    request.request_id = `candidate-wrapper-shape-${index}`;
    request.inputs.push({ candidate: value });

    const out = run(request);
    assert.equal(out.status, "HOLD", `case ${index} must not disappear into an empty legacy fragment`);
    assert.deepEqual(out.holds[0], {
      code: "HOLD_CANDIDATE_SHAPE_INVALID",
      path: "request.inputs[2].candidate",
      detail: "An authored candidate wrapper must contain a plain candidate map; null, arrays, and primitive values are not candidate omission."
    });
  }
});

test("status-less candidate wrappers with a plain candidate map remain compatible", () => {
  const request = copy();
  request.request_id = "candidate-wrapper-shape-positive";

  const out = run(request);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.candidate.facets.mesh.type, "primitive");
  assert.equal(out.candidate.facets.material.type, "primitive");
});

test("direct schemaless fragments remain the explicit legacy compatibility path", () => {
  const request = copy();
  request.request_id = "candidate-wrapper-direct-legacy";
  request.inputs.push({
    form_hints: ["decorative"],
    facets: {}
  });

  const out = run(request);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.candidate.form_hints.includes("decorative"), true);
  assert.equal(out.warnings.some((warning) => warning.code === "LEGACY_SCHEMALESS_FRAGMENT" && warning.input === 2), true);
});
