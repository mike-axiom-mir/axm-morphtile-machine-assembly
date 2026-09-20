const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const paths = {
  form: process.env.FORM_MACHINE_PATH,
  surface: process.env.SURFACE_MACHINE_PATH,
  capability: process.env.CAPABILITY_MACHINE_PATH,
  core: process.env.MORPHTILE_CORE_PATH
};
const ready = Object.values(paths).every(Boolean);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-current-sibling-retention" }
  };
}

function formCandidate(Form, id) {
  const out = Form.run(req(id, "Create a bounded form for Assembly retention proof", {
    shape: "box",
    name: "Retention proof",
    size: [1, 1, 1]
  }));
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  return out;
}

function importedTile(MT, kitResult, worldName) {
  const imported = MT.importKit(MT.createWorld(worldName), JSON.parse(JSON.stringify(kitResult.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  const add = imported.ops.find((operation) => operation.op === "tile.add");
  assert.ok(add && add.tile, "verified import must carry a tile.add operation");
  return add.tile;
}

test("current Surface checker pattern survives Assembly candidate, kit materialization, and verified import", { skip: !ready }, () => {
  const Form = require(path.resolve(paths.form));
  const Surface = require(path.resolve(paths.surface));
  const MT = require(path.resolve(paths.core));

  const form = formCandidate(Form, "form-surface-retention");
  const surface = Surface.run(req("surface-pattern-retention", "Create an explicitly patterned surface", {
    base_color: [0.3, 0.4, 0.5],
    pattern: { kind: "checker", scale: 2.25 }
  }));
  assert.equal(surface.status, "CANDIDATE", JSON.stringify(surface.holds));
  assert.equal(surface.candidate.value.data.pattern, "checker");
  assert.equal(surface.candidate.value.data.scale, 2.25);

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assemble-surface-pattern-retention",
    goal: "Preserve current Surface pattern semantics through complete Assembly output",
    intent: { id: "mt_surface_retention", name: "Surface retention proof" },
    inputs: [form, surface],
    provenance: { caller: "assembly-current-sibling-retention" }
  });
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.equal(assembled.candidate.facets.material.data.pattern, "checker");
  assert.equal(assembled.candidate.facets.material.data.scale, 2.25);

  const kitResult = materializeKit(assembled, MT, { name: "Surface retention kit" });
  assert.equal(kitResult.status, "CANDIDATE", JSON.stringify(kitResult.holds));
  assert.equal(kitResult.kit.tile.facets.material.data.pattern, "checker");
  assert.equal(kitResult.kit.tile.facets.material.data.scale, 2.25);
  const received = importedTile(MT, kitResult, "Surface retention receiver");
  assert.equal(received.facets.material.data.pattern, "checker");
  assert.equal(received.facets.material.data.scale, 2.25);
});

test("current Capability falsey wake semantics survive Assembly candidate, content identity, kit, and verified import", { skip: !ready }, () => {
  const Form = require(path.resolve(paths.form));
  const Capability = require(path.resolve(paths.capability));
  const MT = require(path.resolve(paths.core));

  const form = formCandidate(Form, "form-capability-retention");
  const capability = Capability.run(req("capability-falsey-retention", "Create a sleeping counter with explicit falsey wake semantics", {
    kind: "sleeping-counter",
    initial: 1,
    wake: { on: "value", tile: "", var: "count", over: 3, sleeps: false }
  }));
  assert.equal(capability.status, "CANDIDATE", JSON.stringify(capability.holds));
  assert.deepEqual(capability.candidate.capabilities[0].wake, {
    on: "value",
    tile: "",
    var: "count",
    over: 3,
    sleeps: false
  });

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assemble-capability-falsey-retention",
    goal: "Preserve explicit false and empty-string Capability semantics through complete Assembly output",
    intent: { id: "mt_capability_retention", name: "Capability retention proof" },
    inputs: [form, capability],
    provenance: { caller: "assembly-current-sibling-retention" }
  });
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.deepEqual(assembled.candidate.capabilities[0].wake, {
    on: "value",
    tile: "",
    var: "count",
    over: 3,
    sleeps: false
  });

  const withoutFalsey = JSON.parse(JSON.stringify(capability));
  delete withoutFalsey.candidate.capabilities[0].wake.tile;
  delete withoutFalsey.candidate.capabilities[0].wake.sleeps;
  const comparison = assemble({
    envelope_version: "0.1",
    request_id: "assemble-capability-omission-comparison",
    goal: "Prove explicit falsey semantics remain content-bearing rather than collapsing to omission",
    intent: { id: "mt_capability_retention", name: "Capability retention proof" },
    inputs: [form, withoutFalsey],
    provenance: { caller: "assembly-current-sibling-retention" }
  });
  assert.equal(comparison.status, "CANDIDATE", JSON.stringify(comparison.holds));
  assert.notEqual(assembled.closure_hash.value, comparison.closure_hash.value);

  const kitResult = materializeKit(assembled, MT, { name: "Capability retention kit" });
  assert.equal(kitResult.status, "CANDIDATE", JSON.stringify(kitResult.holds));
  assert.deepEqual(kitResult.kit.tile.capabilities[0].wake, assembled.candidate.capabilities[0].wake);
  const received = importedTile(MT, kitResult, "Capability retention receiver");
  assert.deepEqual(received.capabilities[0].wake, assembled.candidate.capabilities[0].wake);
});
