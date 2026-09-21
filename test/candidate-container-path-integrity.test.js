"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function request(inputs, id) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal: "Preserve candidate semantic container identity across every accepted Assembly input representation",
    intent: { name: "Candidate container path proof" },
    inputs,
    provenance: { caller: "candidate-container-path-integrity-regression" }
  };
}

function tile(extra = {}) {
  return {
    schema: "morphtile.tile-spec/v0.4",
    form_hints: ["game_asset"],
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

function expectHoldWithoutThrow(input, id, code, path) {
  const source = request([input], id);
  const before = JSON.stringify(source);
  let out;
  assert.doesNotThrow(() => { out = run(source); }, id);
  assert.equal(out.status, "HOLD", id);
  const hold = out.holds.find((item) => item.code === code);
  assert.ok(hold, `${id}: missing ${code}`);
  assert.equal(hold.path, path, id);
  assert.equal(JSON.stringify(source), before, `${id}: caller input must remain unchanged`);
}

test("direct candidate form_hints use the same semantic array boundary as enveloped candidates", () => {
  expectHoldWithoutThrow(
    tile({ form_hints: { 0: "game_asset" } }),
    "direct-form-hints-container",
    "HOLD_FORM_HINTS_SHAPE_INVALID",
    "request.inputs[0].form_hints"
  );
});

test("direct candidate facet maps cannot inherit array index semantics", () => {
  expectHoldWithoutThrow(
    tile({ facets: [{ type: "primitive", source: null, data: { shape: "box", size: [1, 1, 1] } }] }),
    "direct-facets-container",
    "HOLD_FACETS_SHAPE_INVALID",
    "request.inputs[0].facets"
  );
});

test("candidate capabilities must remain authored arrays in direct and enveloped candidate forms", () => {
  expectHoldWithoutThrow(
    tile({ capabilities: { grants_ref: { def: "panel" } } }),
    "direct-capabilities-object",
    "HOLD_CAPABILITIES_SHAPE_INVALID",
    "request.inputs[0].capabilities"
  );

  for (const [label, value] of [
    ["false", false],
    ["zero", 0],
    ["empty-string", ""],
    ["object", { grants_ref: { def: "panel" } }]
  ]) {
    expectHoldWithoutThrow(
      { candidate: tile({ capabilities: value }) },
      `enveloped-capabilities-${label}`,
      "HOLD_CAPABILITIES_SHAPE_INVALID",
      "request.inputs[0].candidate.capabilities"
    );
  }
});

test("valid direct candidate containers retain established Assembly behavior", () => {
  const source = request([tile({ capabilities: [] })], "direct-valid-container-control");
  const before = JSON.stringify(source);
  const out = run(source);

  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(out.candidate.form_hints, ["game_asset"]);
  assert.deepEqual(out.candidate.capabilities, []);
  assert.equal(out.candidate.facets.mesh.type, "primitive");
  assert.equal(JSON.stringify(source), before);
});
