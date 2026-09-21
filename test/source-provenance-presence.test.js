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

test("source_provenance preserves authored falsey candidate schema identity on HOLD", () => {
  for (const schema of [false, 0, ""]) {
    const input = candidateInput({ producer: "schema-presence-proof" });
    input.candidate.schema = schema;
    const out = assemble(input, `source-schema-${String(schema)}`);
    assert.equal(out.status, "HOLD");
    assert.equal(out.holds.some((hold) => hold.code === "HOLD_CANDIDATE_SCHEMA_INVALID"), true);
    assert.deepEqual(
      out.source_provenance[0].candidate_schema,
      schema,
      `schema=${JSON.stringify(schema)}`
    );
  }
});

test("source_provenance preserves authored falsey upstream machine and request identity by presence", () => {
  for (const [label, machine, requestId] of [
    ["false", false, false],
    ["zero", 0, 0],
    ["empty", "", ""]
  ]) {
    const input = candidateInput({ producer: "source-identity-presence-proof" });
    input.machine = machine;
    input.request_id = requestId;

    const out = assemble(input, `source-identity-${label}`);

    assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
    assert.deepEqual(out.source_provenance[0].machine, machine, label);
    assert.deepEqual(out.source_provenance[0].request_id, requestId, label);
  }
});

test("source_provenance uses null only when upstream machine or request identity is absent", () => {
  const input = candidateInput({ producer: "source-identity-absence-proof" });
  delete input.machine;
  delete input.request_id;

  const out = assemble(input, "source-identity-absent");

  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.equal(out.source_provenance[0].machine, null);
  assert.equal(out.source_provenance[0].request_id, null);
});

test("source identity trace preservation does not invent an upstream validity policy", () => {
  const input = candidateInput(false);
  input.machine = { id: "axm.test.producer", version: "1" };
  input.request_id = "upstream-source-provenance";

  const out = assemble(input, "source-provenance-adjacent-control");
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(out.source_provenance[0].machine, input.machine);
  assert.equal(out.source_provenance[0].request_id, input.request_id);
  assert.equal(out.source_provenance[0].candidate_schema, "morphtile.tile-spec/v0.4");
});
