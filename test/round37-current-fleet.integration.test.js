"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const paths = {
  form: process.env.ROUND37_FORM_MACHINE_PATH,
  surface: process.env.ROUND37_SURFACE_MACHINE_PATH,
  capability: process.env.ROUND37_CAPABILITY_MACHINE_PATH,
  interface: process.env.ROUND37_INTERFACE_MACHINE_PATH,
  core: process.env.ROUND37_MORPHTILE_CORE_PATH
};
const commits = {
  form: process.env.ROUND37_FORM_COMMIT,
  surface: process.env.ROUND37_SURFACE_COMMIT,
  capability: process.env.ROUND37_CAPABILITY_COMMIT,
  interface: process.env.ROUND37_INTERFACE_COMMIT,
  core: process.env.ROUND37_MORPHTILE_COMMIT
};
const expected = {
  form: "565798b682b60907ecea91a646df1bbb35157a28",
  surface: "4e4495182aa83e5dfba37722fc3756a70cfaafaa",
  capability: "edc07af182ee26ca1ceb64b5d5205591ec6aca9d",
  interface: "935774d6f2cca71f528d008f8805397a6333eaea",
  core: "2bdf8eade1376055473b9cc1b11734b72a5566e5"
};
const ready = Object.values(paths).every(Boolean);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-round37-current-fleet" }
  };
}

function uiEligibility(id, name) {
  return {
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      id,
      name,
      form_hints: ["ui_panel"],
      facets: {}
    },
    provenance: { caller: "explicit-round37-ui-eligibility" }
  };
}

function panelDefinition() {
  return {
    id: "panel",
    name: "Round 37 scalable panel",
    created_by: "assembly-round37-current-fleet",
    body: {
      facets: {
        mesh: {
          type: "generated",
          source: null,
          data: {
            generator: "recipe",
            vars: {},
            parts: [{ shape: "plane", size: [1, 1, 1] }]
          }
        }
      }
    }
  };
}

function recipeLeaf(candidate) {
  const repeat = candidate.facets.mesh.data.parts[0];
  assert.equal(repeat.as, "i");
  assert.equal(repeat.repeat, 3);
  return repeat.body[0];
}

function applyImported(MT, receiver, imported) {
  for (const operation of imported.ops || []) MT.applyStructOp(receiver, operation);
}

test("current integrated fleet preserves Form repeat-scale state through Assembly plan coverage and receiver closure", { skip: !ready }, () => {
  assert.deepEqual(commits, expected, "round37 receiver proof must bind exact integrated producer/runtime identities");

  const Form = require(path.resolve(paths.form));
  const Surface = require(path.resolve(paths.surface));
  const Capability = require(path.resolve(paths.capability));
  const Interface = require(path.resolve(paths.interface));
  const MT = require(path.resolve(paths.core));
  const id = "mt_round37_scale_panel";

  const form = Form.run(req("round37-form-scale", "Create the integrated repeat-scale definition form", {
    repeat: {
      count: 3,
      step: [4, 0, 0],
      scale_step: 0.5,
      instance: {
        use: "panel",
        scale: 1,
        pos: [0, 0, 0]
      }
    }
  }));
  const surface = Surface.run(req("round37-surface", "Keep current base-only Surface authorship", {
    base_color: [0.16, 0.44, 0.7]
  }));
  const capability = Capability.run(req("round37-capability", "Provide canonical count state for the current receiver proof", {
    kind: "counter",
    initial: 3
  }));
  const interfaceOut = Interface.run(req("round37-interface", "Render the current Interface repeat from canonical count", {
    tile_path: id,
    title: "Round 37 scale panel",
    elements: [{
      kind: "repeat",
      binding: "count",
      step: 1,
      max: 4,
      children: [{ kind: "text", text: "scale-cell" }]
    }],
    bindings: { readouts: ["count"] }
  }));

  for (const [name, output] of Object.entries({ form, surface, capability, interface: interfaceOut })) {
    assert.equal(output.status, "CANDIDATE", `${name}: ${JSON.stringify(output.holds)}`);
  }

  const authoredLeaf = recipeLeaf(form.candidate);
  assert.deepEqual(authoredLeaf.scale, ["+", 1, ["*", ["var", "i"], 0.5]]);
  assert.equal(Object.prototype.hasOwnProperty.call(surface.candidate.value.data, "paint"), false,
    "current base-only Surface output must not invent fallback paint");

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-round37-current-fleet",
    goal: "Re-earn exact current integrated producer semantics through complete Assembly transport and receiver closure",
    intent: { id, name: "Round 37 scale panel" },
    inputs: [uiEligibility(id, "Round 37 scale panel"), form, surface, capability, interfaceOut],
    world_requirements: { definitions: { panel: panelDefinition() } },
    provenance: { caller: "assembly-round37-current-fleet" }
  });

  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.deepEqual(assembled.required_definitions, ["panel"]);
  assert.deepEqual(recipeLeaf(assembled.candidate), authoredLeaf,
    "Assembly must preserve the exact current Form repeat-scale recipe leaf");
  assert.deepEqual(assembled.candidate.facets.material.data.color, [0.16, 0.44, 0.7]);
  assert.equal(Object.prototype.hasOwnProperty.call(assembled.candidate.facets.material.data, "paint"), false);
  assert.equal(assembled.candidate.facets.logic.data.vars.count, 3);
  assert.deepEqual(assembled.candidate.view, interfaceOut.candidate.operation.view);

  const portable = materializeKit(assembled, MT, { name: "Round 37 current fleet portable kit" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  for (const kind of ["KIT_IMPORT_PLAN_COVERAGE", "KIT_APPLY", "KIT_RECEIVER_CLOSURE"]) {
    assert.equal(portable.evidence.some((entry) => entry.kind === kind && entry.status === "PASS"), true,
      `current Assembly must earn ${kind} for the complete kit`);
  }
  assert.equal(portable.kit.expect.defs, 1);
  assert.deepEqual(recipeLeaf(portable.kit.tile), authoredLeaf,
    "kit materialization must preserve the exact current Form repeat-scale recipe leaf");
  assert.equal(portable.dependency_resolution.length, 1);
  assert.equal(portable.dependency_resolution[0].status, "SATISFIED");

  const receiver = MT.createWorld("Round 37 receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  assert.equal(imported.evidence, "verified_payload_sha256");
  applyImported(MT, receiver, imported);

  const received = MT.resolveTile(receiver, id);
  assert.ok(received, "fresh receiver must resolve the imported complete tile");
  assert.deepEqual(recipeLeaf(received), authoredLeaf,
    "fresh-world import must preserve the exact current Form repeat-scale recipe leaf");
  assert.equal(Object.prototype.hasOwnProperty.call(received.facets.material.data, "paint"), false);

  const mesh = MT.compileMesh(received, receiver);
  assert.equal(mesh.hold, null, JSON.stringify(mesh));
  assert.equal(mesh.recipe_parts, 3, "repeat count=3 must compile to three concrete definition instances");
  assert.equal(mesh.P.every(Number.isFinite), true,
    "receiver compile must stay finite without inventing a geometric meaning for transported scale state");

  const beforeRender = MT.structHash(receiver);
  const html = MT.vnodeToHTML(MT.compilePanel(receiver).root);
  assert.equal((html.match(/scale-cell/g) || []).length, 3,
    "canonical count=3 must drive the current Interface receiver view");
  assert.equal(MT.structHash(receiver), beforeRender, "receiver rendering must remain structurally read-only");
});
