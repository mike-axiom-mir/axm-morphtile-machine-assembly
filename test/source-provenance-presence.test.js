"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function candidateInput(provenance, includeProvenance = true) {
  const input = {
    envelope_version: "0.1",
    request_id: "upstream-source-provenance",
    machine: { id: "axm.test.producer", version: "1" },
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      id: "source_provenance_tile",
      facets: {
        mesh: {
          type: "primitive",
          source: null,
          data: { shape: "box", size: [1, 1, 1] }
        }
      }
    }
  };
  if (includeProvenance) input.provenance = provenance;
  return input;
}

function assemble(input, id) {
  return run({
    envelope_version: "0.1",
    request_id: id,
    goal: "preserve upstream source provenance by authored presence",
    intent: { id: "source_provenance_tile", name: "Source provenance proof" },
    inputs: [input],
    provenance: { caller: "source-provenance-presence-regression" }
  });
}

test("source_provenance preserves authored falsey portable provenance by presence", () => {
  for (const provenance of [null, false, 0, ""]) {
    const out = assemble(candidateInput(provenance), `source-provenance-${String(provenance)}`);
    assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
    assert.equal(out.source_provenance.length, 1);
    assert.deepEqual(
      out.source_provenance[0].provenance,
      provenance,
      `provenance=${JSON.stringify(provenance)}`
    );
  }
});

test("source_provenance defaults provenance to null only when the upstream field is absent", () => {
  const out = assemble(candidateInput(undefined, false), "source-provenance-absent");
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.equal(out.source_provenance[0].provenance, null);
});

test("the bounded provenance repair does not redefine adjacent source-trace identity policy", () => {
  const input = candidateInput(false);
  input.machine = { id: "axm.test.producer", version: "1" };
  input.request_id = "upstream-source-provenance";

  const out = assemble(input, "source-provenance-adjacent-control");
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(out.source_provenance[0].machine, input.machine);
  assert.equal(out.source_provenance[0].request_id, input.request_id);
  assert.equal(out.source_provenance[0].candidate_schema, "morphtile.tile-spec/v0.4");
});
