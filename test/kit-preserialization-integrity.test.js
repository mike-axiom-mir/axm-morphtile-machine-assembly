"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { materializeKit } = require("../src/kit");

function assemblyResult() {
  return {
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      id: "mt_kit_portable",
      name: "Kit portable proof",
      form_hints: [],
      facets: {}
    },
    target_binding: { id: "mt_kit_portable", path: "mt_kit_portable" },
    dependencies: [],
    world_requirements: null,
    closure_hash: {
      algorithm: "sha256",
      canonicalization: "sorted-key-json/v1",
      scope: "candidate+dependencies+world_requirements",
      value: "kit-source-integrity-test"
    },
    source_provenance: [{ input: 0, provenance: { caller: "kit-preserialization-integrity-test" } }],
    warnings: []
  };
}

function hold(out, code) {
  assert.equal(out.status, "HOLD");
  const found = out.holds.find((item) => item.code === code);
  assert.ok(found, JSON.stringify(out.holds));
  assert.equal(out.kit, null);
  return found;
}

test("forged candidate toJSON cannot rewrite matter before kit materialization sees it", () => {
  const input = assemblyResult();
  let calls = 0;
  input.candidate.toJSON = function toJSON() {
    calls += 1;
    return {
      schema: "morphtile.tile-spec/v0.4",
      id: "mt_kit_portable",
      name: "Rewritten",
      form_hints: [],
      facets: {}
    };
  };

  const out = materializeKit(input, null);
  const found = hold(out, "HOLD_KIT_INPUT_NONPORTABLE_VALUE");
  assert.equal(calls, 0, "kit preflight must not invoke caller-controlled toJSON");
  assert.equal(found.path, "assembly_result.candidate.toJSON");
  assert.equal(found.source_code, "HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE");
});

test("forged source provenance with nested undefined HOLDS before source trace can drop it", () => {
  const input = assemblyResult();
  input.source_provenance[0].provenance.note = undefined;

  const out = materializeKit(input, null);
  const found = hold(out, "HOLD_KIT_INPUT_NONPORTABLE_VALUE");
  assert.equal(found.path, "assembly_result.source_provenance[0].provenance.note");
  assert.equal(out.source_provenance.length, 0, "unsafe source trace must not be partially republished after failed preflight");
});

test("forged non-finite world requirement HOLDS before MorphTile runtime translation", () => {
  const input = assemblyResult();
  input.world_requirements = {
    definitions: {
      panel: {
        id: "panel",
        body: { params: [{ id: "width", default: Number.POSITIVE_INFINITY }] }
      }
    }
  };

  const out = materializeKit(input, null);
  const found = hold(out, "HOLD_KIT_INPUT_NONFINITE_VALUE");
  assert.equal(found.path, "assembly_result.world_requirements.definitions.panel.body.params[0].default");
  assert.equal(found.source_code, "HOLD_ASSEMBLY_INPUT_NONFINITE_VALUE");
});

test("kit options accessors HOLD without invoking the getter and retain already-safe source trace", () => {
  const input = assemblyResult();
  let calls = 0;
  const options = {};
  Object.defineProperty(options, "name", {
    enumerable: true,
    get() {
      calls += 1;
      return "Getter name";
    }
  });

  const out = materializeKit(input, null, options);
  const found = hold(out, "HOLD_KIT_INPUT_NONPORTABLE_VALUE");
  assert.equal(calls, 0, "kit option accessors must never execute during preflight");
  assert.equal(found.path, "options.name");
  assert.deepEqual(out.source_closure_hash, input.closure_hash);
  assert.deepEqual(out.source_provenance, input.source_provenance);
});
