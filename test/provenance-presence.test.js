const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");
const { result } = require("../src/envelope");

function fragment(extra = {}) {
  return {
    schema: "morphtile.tile-spec/v0.4",
    id: "provenance_tile",
    facets: {
      mesh: {
        type: "primitive",
        source: null,
        data: { shape: "box", size: [1, 1, 1] }
      }
    },
    ...extra
  };
}

function request(provenance, input = { candidate: fragment() }) {
  const out = {
    envelope_version: "0.1",
    request_id: "assembly-provenance-presence",
    goal: "preserve authored provenance by presence",
    intent: { id: "provenance_tile", name: "Provenance presence proof" },
    inputs: [input]
  };
  if (provenance !== undefined) out.provenance = provenance;
  return out;
}

test("request provenance defaults only on absence, not on authored falsey portable values", () => {
  for (const provenance of [null, false, 0, ""]) {
    const out = run(request(provenance));
    assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
    assert.deepEqual(out.provenance, provenance, `provenance=${JSON.stringify(provenance)}`);
  }

  const absent = run(request(undefined));
  assert.deepEqual(absent.provenance, {});
});

test("explicit result provenance override also uses presence rather than truthiness", () => {
  const base = request({ caller: "request" });
  for (const provenance of [null, false, 0, ""]) {
    const out = result(base, { id: "test.machine", version: "1" }, "PASS", { provenance });
    assert.deepEqual(out.provenance, provenance, `override=${JSON.stringify(provenance)}`);
  }
});

test("source provenance preserves authored falsey values and invalid schema identity exactly", () => {
  for (const provenance of [null, false, 0, ""]) {
    const input = { candidate: fragment({ schema: "" }), provenance };
    const out = run(request(undefined, input));
    assert.equal(out.status, "HOLD");
    assert.equal(out.holds.some((hold) => hold.code === "HOLD_CANDIDATE_SCHEMA_INVALID"), true);
    assert.equal(out.source_provenance.length, 1);
    assert.equal(out.source_provenance[0].candidate_schema, "");
    assert.deepEqual(out.source_provenance[0].provenance, provenance, `source provenance=${JSON.stringify(provenance)}`);
  }
});
