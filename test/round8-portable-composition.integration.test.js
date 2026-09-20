"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const paths = {
  form: process.env.ROUND8_FORM_MACHINE_PATH,
  surface: process.env.ROUND8_SURFACE_MACHINE_PATH,
  capability: process.env.ROUND8_CAPABILITY_MACHINE_PATH,
  interface: process.env.ROUND8_INTERFACE_MACHINE_PATH,
  core: process.env.ROUND8_MORPHTILE_CORE_PATH
};
const commits = {
  form: process.env.ROUND8_FORM_COMMIT,
  surface: process.env.ROUND8_SURFACE_COMMIT,
  capability: process.env.ROUND8_CAPABILITY_COMMIT,
  interface: process.env.ROUND8_INTERFACE_COMMIT,
  core: process.env.ROUND8_MORPHTILE_COMMIT
};
const expected = {
  form: "33625a6e98cdeb985635e0cdcfd5c754ad8505fe",
  surface: "536a745ddea4d996d0daf193649db939fe3ade83",
  capability: "edc07af182ee26ca1ceb64b5d5205591ec6aca9d",
  interface: "3f29f98b4125fe3376f02aabc509dc3da610deae",
  core: "2bdf8eade1376055473b9cc1b11734b72a5566e5"
};
const ready = Object.values(paths).every(Boolean);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-round8-portable-composition" }
  };
}

function uiEligibility(id) {
  return {
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      id,
      name: "Round 8 portable panel",
      form_hints: ["ui_panel"],
      facets: {}
    },
    provenance: { caller: "explicit-round8-ui-eligibility" }
  };
}

function applyImported(MT, receiver, imported) {
  for (const operation of imported.ops || []) MT.applyStructOp(receiver, operation);
}

test("merged round-8 Form, Surface, Capability and Interface semantics survive one complete portable Assembly kit", { skip: !ready }, () => {
  assert.deepEqual(commits, expected, "round-8 receiver proof must name the exact merged ecosystem identities");

  const Form = require(path.resolve(paths.form));
  const Surface = require(path.resolve(paths.surface));
  const Capability = require(path.resolve(paths.capability));
  const Interface = require(path.resolve(paths.interface));
  const MT = require(path.resolve(paths.core));
  const id = "mt_round8_portable_panel";

  const form = Form.run(req("round8-form-size", "Create bounded repeated geometry whose size changes per copy", {
    repeat: {
      count: 4,
      step: [0, 1.2, 0],
      size_step: [0.2, 0.1, 0],
      part: { shape: "box", size: [1, 0.5, 0.5] }
    }
  }));
  const surface = Surface.run(req("round8-surface", "Create explicit patterned material for the assembled tile", {
    base_color: [0.3, 0.4, 0.5],
    pattern: { kind: "checker", scale: 2.25 }
  }));
  const capability = Capability.run(req("round8-capability", "Provide canonical count state for the repeated interface", {
    kind: "counter",
    initial: 3
  }));
  const interfaceOut = Interface.run(req("round8-interface-repeat", "Repeat a bounded marker from canonical count state", {
    tile_path: id,
    title: "Round 8 portable panel",
    elements: [{
      kind: "repeat",
      binding: "count",
      step: 1,
      max: 4,
      children: [{ kind: "text", text: "Count marker" }]
    }],
    bindings: { readouts: ["count"] }
  }));

  for (const [name, output] of Object.entries({ form, surface, capability, interface: interfaceOut })) {
    assert.equal(output.status, "CANDIDATE", `${name}: ${JSON.stringify(output.holds)}`);
  }

  assert.deepEqual(form.candidate.facets.mesh.data.parts[0].body[0].size, [
    ["+", 1, ["*", ["var", "i"], 0.2]],
    ["+", 0.5, ["*", ["var", "i"], 0.1]],
    0.5
  ]);
  assert.deepEqual(interfaceOut.candidate.operation.view.body, [{
    repeat: ["max", 0, ["min", 4, ["floor", ["/", ["var", "count"], 1]]]],
    as: "i",
    body: [{ text: "Count marker" }]
  }]);

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-round8-complete",
    goal: "Combine the exact merged round-8 producer semantics into one portable tile without rewriting their meaning",
    intent: { id, name: "Round 8 portable panel" },
    inputs: [uiEligibility(id), form, surface, capability, interfaceOut],
    provenance: { caller: "assembly-round8-portable-composition" }
  });

  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.equal(assembled.candidate.form_hints.includes("ui_panel"), true);
  assert.deepEqual(assembled.candidate.facets.mesh.data.parts, form.candidate.facets.mesh.data.parts);
  assert.equal(assembled.candidate.facets.material.data.pattern, "checker");
  assert.equal(assembled.candidate.facets.material.data.scale, 2.25);
  assert.deepEqual(assembled.candidate.view, interfaceOut.candidate.operation.view);
  assert.equal(assembled.candidate.facets.logic.data.vars.count, 3);
  assert.equal(assembled.dependencies.length, 1);
  assert.equal(assembled.dependencies[0].kind, "morphtile.interface-target-proof/v0.1");
  assert.deepEqual(assembled.dependencies[0].requires.readout_logic_vars, ["count"]);

  const portable = materializeKit(assembled, MT, { name: "Round 8 complete portable kit" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  assert.equal(portable.dependency_resolution.length, 1);
  assert.equal(portable.dependency_resolution[0].status, "SATISFIED");
  assert.equal(portable.dependency_resolution[0].proof_scope, "staged_morphtile_world");
  assert.deepEqual(portable.kit.tile.facets.mesh.data.parts, form.candidate.facets.mesh.data.parts);
  assert.deepEqual(portable.kit.tile.view, interfaceOut.candidate.operation.view);
  assert.deepEqual(portable.source_provenance, assembled.source_provenance);

  const receiver = MT.createWorld("Round 8 receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  assert.equal(imported.evidence, "verified_payload_sha256");
  applyImported(MT, receiver, imported);

  const received = MT.resolveTile(receiver, id);
  assert.ok(received, "fresh receiver must resolve the complete imported tile");
  assert.deepEqual(received.facets.mesh.data.parts, form.candidate.facets.mesh.data.parts);
  assert.deepEqual(received.view, interfaceOut.candidate.operation.view);
  assert.equal(received.facets.material.data.pattern, "checker");

  const mesh = MT.compileMesh(received, receiver);
  assert.equal(mesh.hold, null, JSON.stringify(mesh));
  assert.equal(mesh.recipe_parts, 4);
  assert.equal(mesh.P.every(Number.isFinite), true);

  const beforeRender = MT.structHash(receiver);
  const html = MT.vnodeToHTML(MT.compilePanel(receiver).root);
  assert.equal((html.match(/Count marker/g) || []).length, 3, "imported Interface repeat must read the imported canonical count=3 state");
  assert.equal(MT.structHash(receiver), beforeRender, "rendering imported repeated interface matter must remain structurally read-only");
});
