const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.assembly.json");
const { run } = require("../src");

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

test("word conflicts preserve both variants and both sources", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-word-conflict-evidence";
  request.world_requirements = { words: { pulse: { name: "pulse", args: [], body: 1 } } };
  request.inputs[0].world_requirements = { words: { pulse: { name: "pulse", args: [], body: 2 } } };

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_WORD_CONFLICT");
  assert.equal(hold.identity, "pulse");
  assert.equal(hold.source, "input[0]");
  assert.deepEqual(hold.sources, ["request", "input[0]"]);
  assert.deepEqual(hold.variants, [
    { name: "pulse", args: [], body: 1 },
    { name: "pulse", args: [], body: 2 }
  ]);
});

test("definition conflicts preserve both meanings and provenance instead of hiding the rejected variant", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-definition-conflict-evidence";
  request.world_requirements = {
    definitions: {
      shared_shape: { id: "shared_shape", body: { shape: "box", size: [1, 1, 1] } }
    }
  };
  request.inputs[1].world_requirements = {
    definitions: {
      shared_shape: { id: "shared_shape", body: { shape: "sphere", radius: 1 } }
    }
  };

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_DEFINITION_CONFLICT");
  assert.equal(hold.identity, "shared_shape");
  assert.deepEqual(hold.sources, ["request", "input[1]"]);
  assert.deepEqual(hold.variants, [
    { id: "shared_shape", body: { shape: "box", size: [1, 1, 1] } },
    { id: "shared_shape", body: { shape: "sphere", radius: 1 } }
  ]);
  assert.deepEqual(out.world_requirements.definitions.shared_shape, hold.variants[0]);
});

test("candidate conflicts preserve the exact competing values and input sources", () => {
  const request = copy(baseRequest);
  request.request_id = "assembly-candidate-conflict-evidence";
  request.inputs.push({
    candidate: {
      schema: "morphtile.facet-candidate/v0.4",
      facet: "material",
      value: { type: "primitive", source: null, data: { color: [1, 0, 0] } }
    }
  });

  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_ASSEMBLY_CONFLICT");
  assert.deepEqual(hold.paths, ["facets.material"]);
  assert.equal(hold.conflicts.length, 1);
  assert.equal(hold.conflicts[0].path, "facets.material");
  assert.deepEqual(hold.conflicts[0].sources, ["input[1]", "input[2]"]);
  assert.deepEqual(hold.conflicts[0].variants, [
    { type: "primitive", source: null, data: { color: [0.3, 0.4, 0.5] } },
    { type: "primitive", source: null, data: { color: [1, 0, 0] } }
  ]);
});
