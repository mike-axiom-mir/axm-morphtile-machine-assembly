const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function request(candidate) {
  return {
    envelope_version: "0.1",
    request_id: "candidate-schema-identity",
    goal: "preserve authored candidate schema identity",
    intent: { name: "Schema identity proof" },
    inputs: [{ candidate }]
  };
}

function fragment(extra = {}) {
  return {
    ...extra,
    facets: {
      mesh: {
        type: "primitive",
        source: null,
        data: { shape: "box", size: [1, 1, 1] }
      }
    }
  };
}

test("a truly schema-less legacy fragment remains explicit legacy input", () => {
  const out = run(request(fragment()));
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.equal(out.warnings.some((warning) => warning.code === "LEGACY_SCHEMALESS_FRAGMENT"), true);
});

test("authored falsy or structured schema values HOLD instead of collapsing into schema omission", () => {
  for (const schema of ["", null, false, 0, { family: "morphtile.tile-spec/v0.4" }]) {
    const out = run(request(fragment({ schema })));
    assert.equal(out.status, "HOLD", `schema=${JSON.stringify(schema)} should HOLD`);
    const hold = out.holds.find((item) => item.code === "HOLD_CANDIDATE_SCHEMA_INVALID");
    assert.ok(hold, `missing schema identity HOLD for ${JSON.stringify(schema)}`);
    assert.equal(hold.input, 0);
    assert.deepEqual(hold.schema, schema);
    assert.equal(out.warnings.some((warning) => warning.code === "LEGACY_SCHEMALESS_FRAGMENT"), false);
    assert.deepEqual(out.held_candidates[0].candidate, fragment({ schema }));
  }
});
