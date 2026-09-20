const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function request(inputs, id) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal: "Preserve authored facet own-key identity during Assembly merge",
    intent: { name: "Own-key facet proof" },
    inputs,
    provenance: { caller: "facet-own-key-regression" }
  };
}

function facetInput(name, marker, source = "fixture") {
  return {
    machine: { id: source, version: "0.0.0" },
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.facet-candidate/v0.4",
      facet: name,
      value: { type: "opaque-proof", source: null, data: { marker } }
    }
  };
}

test("Assembly preserves inherited-looking facet names as authored own data", () => {
  for (const name of ["__proto__", "constructor", "toString"]) {
    const out = run(request([facetInput(name, 1)], `assembly-own-facet-${name}`));

    assert.equal(out.status, "CANDIDATE", name);
    assert.equal(Object.prototype.hasOwnProperty.call(out.candidate.facets, name), true, name);
    assert.deepEqual(out.candidate.facets[name], {
      type: "opaque-proof",
      source: null,
      data: { marker: 1 }
    }, name);
  }
});

test("same inherited-looking facet value deduplicates while a true conflict remains explicit", () => {
  const equal = run(request([
    facetInput("__proto__", 1, "producer-a"),
    facetInput("__proto__", 1, "producer-b")
  ], "assembly-own-facet-equal"));

  assert.equal(equal.status, "CANDIDATE");
  assert.equal(Object.prototype.hasOwnProperty.call(equal.candidate.facets, "__proto__"), true);
  assert.equal(equal.holds.length, 0);

  const conflict = run(request([
    facetInput("__proto__", 1, "producer-a"),
    facetInput("__proto__", 2, "producer-b")
  ], "assembly-own-facet-conflict"));

  assert.equal(conflict.status, "HOLD");
  const hold = conflict.holds.find((item) => item.code === "HOLD_ASSEMBLY_CONFLICT");
  assert.ok(hold);
  assert.deepEqual(hold.paths, ["facets.__proto__"]);
  assert.equal(hold.conflicts.length, 1);
  assert.deepEqual(hold.conflicts[0].sources, ["input[0]", "input[1]"]);
  assert.deepEqual(hold.conflicts[0].variants, [
    { type: "opaque-proof", source: null, data: { marker: 1 } },
    { type: "opaque-proof", source: null, data: { marker: 2 } }
  ]);
});
