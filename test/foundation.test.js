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
  conflict.inputs.push({ candidate: { schema: "morphtile.tile-spec/v0.4", facets: { mesh: { type: "primitive", data: { shape: "sphere" } } } } });
  const out = run(conflict);
  assert.equal(out.status, "HOLD");
  assert.deepEqual(out.holds.find((hold) => hold.code === "HOLD_ASSEMBLY_CONFLICT").paths, ["facets.mesh"]);
});

test("preserves dependency closure, world requirements, and source provenance", () => {
  const closed = JSON.parse(JSON.stringify(request));
  closed.request_id = "assembly-closure";
  closed.dependencies = [{ id: "material-pack", ref: "sha256:abc" }];
  closed.inputs[0] = {
    envelope_version: "0.1",
    request_id: "form-source",
    machine: { id: "axm.morphtile.machine.form", version: "0.2.0" },
    provenance: { caller: "form-fixture" },
    dependencies: [{ ref: "sha256:abc", id: "material-pack" }],
    world_requirements: {
      words: { clamp01: { name: "clamp01", args: ["x"], body: ["min", 1, ["max", 0, ["var", "x"]]], note: "fixture" } },
      definitions: { reusable_box: { id: "reusable_box", name: "Reusable box", body: { shape: "box" }, created_by: "fixture" } }
    },
    candidate: closed.inputs[0].candidate
  };
  const before = JSON.stringify(closed);
  const out = run(closed);
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.dependencies, [{ id: "material-pack", ref: "sha256:abc" }]);
  assert.equal(out.world_requirements.words.clamp01.name, "clamp01");
  assert.equal(out.world_requirements.definitions.reusable_box.id, "reusable_box");
  assert.equal(out.source_provenance[0].machine.id, "axm.morphtile.machine.form");
  assert.deepEqual(out.provenance, { caller: "fixture" });
  assert.equal(JSON.stringify(closed), before);
});

test("holds same-identity dependency drift instead of selecting one", () => {
  const conflict = JSON.parse(JSON.stringify(request));
  conflict.request_id = "dependency-conflict";
  conflict.dependencies = [{ id: "surface-lib", ref: "commit-a" }];
  conflict.inputs[0].dependencies = [{ id: "surface-lib", ref: "commit-b" }];
  const out = run(conflict);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_DEPENDENCY_CONFLICT");
  assert.equal(hold.identity, "id:surface-lib");
  assert.deepEqual(hold.sources, ["request", "input[0]"]);
});

test("holds conflicting word or definition requirements instead of overwriting", () => {
  const conflict = JSON.parse(JSON.stringify(request));
  conflict.request_id = "world-requirement-conflict";
  conflict.inputs[0].world_requirements = { words: { pulse: { name: "pulse", args: [], body: 1 } } };
  conflict.inputs[1].world_requirements = { words: { pulse: { body: 2, args: [], name: "pulse" } } };
  const out = run(conflict);
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds.some((item) => item.code === "HOLD_WORD_CONFLICT" && item.identity === "pulse"), true);
});

test("does not silently accept malformed current Interface operation bundles", () => {
  const interfaceBundle = JSON.parse(JSON.stringify(request));
  interfaceBundle.request_id = "interface-bundle-malformed";
  interfaceBundle.intent = { id: "mt_counter", name: "Counter" };
  interfaceBundle.inputs[0].candidate.form_hints.push("ui_panel");
  interfaceBundle.inputs.push({
    machine: { id: "axm.morphtile.machine.interface", version: "0.2.0" },
    candidate: {
      schema: "morphtile.interface-operations/v0.4",
      operations: [
        { do: "view.set", id: "mt_counter", view: { form: "ui_panel" } },
        { do: "presentation.set", id: "mt_counter", presentation: { mode: "docked", dock: "right" } }
      ]
    }
  });
  const out = run(interfaceBundle);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID");
  assert.equal(hold.input, 2);
  assert.match(hold.detail, /unsupported interface operation/);
});

test("canonical comparison accepts semantically equal object key order", () => {
  const reordered = JSON.parse(JSON.stringify(request));
  reordered.request_id = "canonical-key-order";
  reordered.inputs.push({
    candidate: {
      schema: "morphtile.facet-candidate/v0.4",
      facet: "mesh",
      value: { data: { size: [1, 1, 1], shape: "box" }, source: null, type: "primitive" }
    }
  });
  const out = run(reordered);
  assert.equal(out.status, "CANDIDATE");
});

test("binds candidate closure with an order-invariant canonical sha256", () => {
  const first = JSON.parse(JSON.stringify(request));
  first.request_id = "hash-first";
  first.dependencies = [{ id: "surface-lib", ref: "commit-a", meta: { b: 2, a: 1 } }];
  first.inputs[0].world_requirements = {
    words: { pulse: { name: "pulse", args: [], body: ["+", 1, 2] } }
  };

  const second = JSON.parse(JSON.stringify(first));
  second.request_id = "hash-second";
  second.dependencies = [{ meta: { a: 1, b: 2 }, ref: "commit-a", id: "surface-lib" }];
  second.inputs[0].world_requirements = {
    words: { pulse: { body: ["+", 1, 2], args: [], name: "pulse" } }
  };

  const a = run(first), b = run(second);
  assert.equal(a.status, "CANDIDATE");
  assert.equal(b.status, "CANDIDATE");
  assert.match(a.closure_hash.value, /^[0-9a-f]{64}$/);
  assert.deepEqual(a.closure_hash, b.closure_hash);
  assert.equal(a.closure_hash.algorithm, "sha256");
  assert.equal(a.closure_hash.scope, "candidate+dependencies+world_requirements");
});

test("closure hash changes on content mutation but not provenance-only mutation", () => {
  const base = JSON.parse(JSON.stringify(request));
  base.request_id = "hash-base";
  base.dependencies = [{ id: "surface-lib", ref: "commit-a" }];
  base.inputs[0].world_requirements = {
    definitions: { shape: { id: "shape", body: { kind: "box" } } }
  };

  const provenanceOnly = JSON.parse(JSON.stringify(base));
  provenanceOnly.request_id = "hash-provenance";
  provenanceOnly.inputs[0].provenance = { note: "different source annotation" };

  const changed = JSON.parse(JSON.stringify(base));
  changed.request_id = "hash-content";
  changed.inputs[0].world_requirements.definitions.shape.body.kind = "sphere";

  const a = run(base), b = run(provenanceOnly), c = run(changed);
  assert.equal(a.closure_hash.value, b.closure_hash.value);
  assert.notEqual(a.closure_hash.value, c.closure_hash.value);
});
