const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("../fixtures/request.assembly.json");
const { run } = require("../src");

test("assembles compatible candidates deterministically and leaves inputs inspectable", () => {
  const before = JSON.stringify(request.inputs), out = run(request);
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(Object.keys(out.candidate.facets), ["mesh", "material"]);
  assert.equal(JSON.stringify(request.inputs), before);
  assert.deepEqual(run(request), out);
});

test("holds conflicting candidates without silently overwriting", () => {
  const conflict = JSON.parse(JSON.stringify(request));
  conflict.request_id = "assembly-held";
  conflict.inputs.push({ candidate: { facets: { mesh: { type: "primitive", data: { shape: "sphere" } } } } });
  const out = run(conflict);
  assert.equal(out.status, "HOLD");
  assert.deepEqual(out.holds[0].paths, ["facets.mesh"]);
});
