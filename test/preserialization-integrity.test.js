"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { run: assemble } = require("../src");

function baseRequest(id) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal: "Prove Assembly preserves authored input before portable transport",
    intent: { id: "mt_portable", name: "Portable source proof" },
    inputs: [{
      status: "CANDIDATE",
      candidate: {
        schema: "morphtile.tile-spec/v0.4",
        id: "mt_portable",
        form_hints: [],
        facets: {}
      },
      provenance: { caller: "preserialization-integrity-test" }
    }],
    provenance: { caller: "preserialization-integrity-test" }
  };
}

function hold(out, code) {
  assert.equal(out.status, "HOLD");
  const found = out.holds.find((item) => item.code === code);
  assert.ok(found, JSON.stringify(out.holds));
  return found;
}

test("caller toJSON cannot rewrite unsupported authored candidate matter before Assembly sees it", () => {
  const request = baseRequest("assembly-tojson-source-integrity");
  let calls = 0;
  request.inputs[0].candidate.toJSON = function toJSON() {
    calls += 1;
    return {
      schema: "morphtile.tile-spec/v0.4",
      id: "mt_portable",
      form_hints: [],
      facets: { material: { type: "pbr", data: { baseColor: [1, 1, 1] } } }
    };
  };

  const out = assemble(request);
  const found = hold(out, "HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE");
  assert.equal(calls, 0, "Assembly must inspect descriptors without invoking toJSON");
  assert.equal(out.candidate, null);
  assert.match(found.path, /candidate\.toJSON$/);
});

test("nested undefined dependency data HOLDS instead of disappearing during JSON transport", () => {
  const request = baseRequest("assembly-undefined-source-integrity");
  request.dependencies = [{ id: "dep.one", ref: undefined }];

  const out = assemble(request);
  const found = hold(out, "HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE");
  assert.equal(out.dependencies.length, 0);
  assert.equal(found.path, "request.dependencies[0].ref");
});

test("non-finite candidate data HOLDS instead of being rewritten to null", () => {
  const request = baseRequest("assembly-nonfinite-source-integrity");
  request.inputs[0].candidate.facets.material = {
    type: "pbr",
    data: { scale: Number.NaN }
  };

  const out = assemble(request);
  const found = hold(out, "HOLD_ASSEMBLY_INPUT_NONFINITE_VALUE");
  assert.equal(out.candidate, null);
  assert.equal(found.path, "request.inputs[0].candidate.facets.material.data.scale");
});

test("accessor-backed dependency data HOLDS without invoking the getter", () => {
  const request = baseRequest("assembly-accessor-source-integrity");
  let calls = 0;
  const dependency = { id: "dep.accessor" };
  Object.defineProperty(dependency, "ref", {
    enumerable: true,
    get() {
      calls += 1;
      return "main";
    }
  });
  request.dependencies = [dependency];

  const out = assemble(request);
  const found = hold(out, "HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE");
  assert.equal(calls, 0, "Assembly must not invoke accessors while deciding whether authored closure is portable");
  assert.equal(found.path, "request.dependencies[0].ref");
});

test("ordinary portable input still assembles without mutating caller matter", () => {
  const request = baseRequest("assembly-portable-control");
  request.dependencies = [{ id: "dep.portable", ref: "abc123" }];
  const before = JSON.parse(JSON.stringify(request));

  const out = assemble(request);
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(request, before);
  assert.deepEqual(out.dependencies, [{ id: "dep.portable", ref: "abc123" }]);
  assert.equal(out.candidate.id, "mt_portable");
});
