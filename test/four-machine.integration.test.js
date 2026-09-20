const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");

const paths = {
  form: process.env.FORM_MACHINE_PATH,
  surface: process.env.SURFACE_MACHINE_PATH,
  capability: process.env.CAPABILITY_MACHINE_PATH,
  interface: process.env.INTERFACE_MACHINE_PATH,
  core: process.env.MORPHTILE_CORE_PATH
};
const ready = Object.values(paths).every(Boolean);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-four-machine-integration" }
  };
}

test("current sibling mains expose the ui_panel boundary and assemble the proven Interface presentation bundle once eligibility is explicit", { skip: !ready }, () => {
  const Form = require(path.resolve(paths.form));
  const Surface = require(path.resolve(paths.surface));
  const Capability = require(path.resolve(paths.capability));
  const Interface = require(path.resolve(paths.interface));
  const MT = require(path.resolve(paths.core));

  const form = Form.run(req("form-current", "Create the proof form", {
    shape: "box",
    name: "Current-main proof",
    size: [1, 1, 1]
  }));
  const surface = Surface.run(req("surface-current", "Create the proof surface", {
    base_color: [0.3, 0.4, 0.5]
  }));
  const capability = Capability.run(req("capability-current", "Create the proof counter behavior", {
    kind: "counter",
    initial: 7
  }));
  const interfaceOut = Interface.run(req("interface-current", "Create the proof counter interface and placement", {
    tile_path: "mt_current_machine",
    title: "Counter",
    readout: "count",
    action: "increment",
    bindings: { readouts: ["count"], actions: ["increment"], controls: [] },
    placement: {
      mode: "docked",
      dock: "right",
      preferred_size: [360, 640],
      user_adjustable: true
    }
  }));

  for (const output of [form, surface, capability, interfaceOut]) {
    assert.equal(output.status, "CANDIDATE", JSON.stringify(output.holds));
  }
  assert.equal(interfaceOut.candidate.schema, "morphtile.interface-operations/v0.5");
  assert.deepEqual(interfaceOut.candidate.operations.map((operation) => operation.op), ["view.set", "presentation.set"]);
  assert.equal(interfaceOut.warnings.some((warning) => warning.code === "TARGET_MUST_EXIST_AND_DECLARE_UI_PANEL"), true);

  const raw = assemble({
    envelope_version: "0.1",
    request_id: "assemble-current-raw",
    goal: "Assemble current integrated specialist outputs without inventing missing eligibility",
    intent: { id: "mt_current_machine", name: "Current-main proof" },
    inputs: [form, surface, capability, interfaceOut],
    provenance: { caller: "assembly-four-machine-integration" }
  });

  assert.equal(raw.status, "HOLD");
  assert.equal(raw.holds.some((hold) => hold.code === "HOLD_VIEW_TARGET_FORM_MISSING"), true);
  assert.equal(raw.warnings.some((entry) => entry.code === "UPSTREAM_WARNING" && entry.warning.code === "TARGET_MUST_EXIST_AND_DECLARE_UI_PANEL"), true);

  const explicitUiEligibility = {
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      form_hints: ["ui_panel"],
      facets: {}
    },
    provenance: { caller: "integration-explicit-ui-eligibility" }
  };

  const combined = assemble({
    envelope_version: "0.1",
    request_id: "assemble-current-compatible",
    goal: "Assemble current integrated specialist outputs with explicit ui_panel eligibility",
    intent: { id: "mt_current_machine", name: "Current-main proof" },
    inputs: [form, surface, capability, interfaceOut, explicitUiEligibility],
    provenance: { caller: "assembly-four-machine-integration" }
  });

  assert.equal(combined.status, "CANDIDATE", JSON.stringify(combined.holds));
  assert.equal(combined.candidate.id, "mt_current_machine");
  assert.deepEqual(combined.candidate.form_hints.sort(), ["game_asset", "ui_panel"]);
  assert.equal(combined.candidate.facets.mesh.type, "primitive");
  assert.equal(combined.candidate.facets.material.type, "generated");
  assert.equal(combined.candidate.facets.logic.type, "rule");
  assert.equal(combined.candidate.facets.logic.data.vars.count, 7);
  assert.equal(combined.candidate.facets.connect.sockets[0].id, "increment");
  assert.equal(combined.candidate.view.title, "Counter");
  assert.deepEqual(combined.candidate.presentation, {
    mode: "docked",
    dock: "right",
    preferred_size: [360, 640],
    user_adjustable: true
  });
  assert.equal(combined.source_provenance.slice(0, 4).every((item) => item.status === "CANDIDATE"), true);
  assert.deepEqual(combined.source_provenance.slice(0, 4).map((item) => item.machine.id), [
    "axm.morphtile.machine.form",
    "axm.morphtile.machine.surface",
    "axm.morphtile.machine.capability",
    "axm.morphtile.machine.interface"
  ]);
  assert.match(combined.closure_hash.value, /^[0-9a-f]{64}$/);

  const tile = MT.createTile(combined.candidate);
  assert.deepEqual(MT.validateTile(tile), { ok: true, errors: [] });
  assert.equal(tile.id, "mt_current_machine");
  assert.equal(tile.form_hints.includes("ui_panel"), true);
  assert.deepEqual(tile.view, combined.candidate.view);
  assert.deepEqual(tile.presentation, combined.candidate.presentation);
  assert.equal(tile.facets.logic.data.vars.count, 7);

  const world = MT.createWorld("Assembly current-main proof");
  world.tiles[tile.id] = tile;
  assert.deepEqual(MT.validateWorld(world), { ok: true, errors: [] });
});
