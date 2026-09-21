const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");
const { result } = require("../src/envelope");

function fragment() {
  return {
    schema: "morphtile.tile-spec/v0.4",
    id: "provenance_tile",
    facets: {
      mesh: {
        type: "primitive",
        source: null,
        data: { shape: "box", size: [1, 1, 1] }
      }
    }
  };
}

function request(provenance) {
  const out = {
    envelope_version: "0.1",
    request_id: "assembly-provenance-presence",
    goal: "preserve authored provenance by presence",
    intent: { id: "provenance_tile", name: "Provenance presence proof" },
    inputs: [{ candidate: fragment() }]
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

test.todo("source_provenance trace needs its own bounded presence policy for falsey upstream provenance/schema identity without guessing malformed machine/request_id policy");
