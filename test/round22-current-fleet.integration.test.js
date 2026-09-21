"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const paths = {
  form: process.env.ROUND22_FORM_MACHINE_PATH,
  surface: process.env.ROUND22_SURFACE_MACHINE_PATH,
  capability: process.env.ROUND22_CAPABILITY_MACHINE_PATH,
  interface: process.env.ROUND22_INTERFACE_MACHINE_PATH,
  core: process.env.ROUND22_MORPHTILE_CORE_PATH
};
const commits = {
  form: process.env.ROUND22_FORM_COMMIT,
  surface: process.env.ROUND22_SURFACE_COMMIT,
  capability: process.env.ROUND22_CAPABILITY_COMMIT,
  interface: process.env.ROUND22_INTERFACE_COMMIT,
  core: process.env.ROUND22_MORPHTILE_COMMIT
};
const expected = {
  form: "d4da0515c290b0b504c02b9d29e974d3add4e6b5",
  surface: "4e4495182aa83e5dfba37722fc3756a70cfaafaa",
  capability: "edc07af182ee26ca1ceb64b5d5205591ec6aca9d",
  interface: "96dfea316216922dffca872ec083a549e4777c96",
  core: "2bdf8eade1376055473b9cc1b11734b72a5566e5"
};
const ready = Object.values(paths).every(Boolean);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-round22-current-fleet" }
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
    provenance: { caller: "explicit-round22-ui-eligibility" }
  };
}

function panelDefinition() {
  return {
    id: "panel",
    name: "Round 22 variable-width panel",
    created_by: "assembly-round22-current-fleet",
    body: {
      facets: {
        mesh: {
          type: "generated",
          source: null,
          data: {
            generator: "recipe",
            vars: { width: 1 },
            parts: [{ shape: "plane", size: [["var", "width"], 1, 1] }]
          }
        }
      }
    }
  };
}

function recipeLeaf(candidate) {
  const gx = candidate.facets.mesh.data.parts[0];
  assert.equal(gx.as, "gx");
  const gz = gx.body[0];
  assert.equal(gz.as, "gz");
  return gz.body[0];
}

function applyImported(MT, receiver, imported) {
  for (const operation of imported.ops || []) MT.applyStructOp(receiver, operation);
}

test("current integrated fleet preserves Form definition-grid position convergence through complete Assembly kit transport", { skip: !ready }, () => {
  assert.deepEqual(commits, expected, "round22 receiver proof must bind exact integrated producer/runtime identities");

  const Form = require(path.resolve(paths.form));
  const Surface = require(path.resolve(paths.surface));
  const Capability = require(path.resolve(paths.capability));
  const Interface = require(path.resolve(paths.interface));
  const MT = require(path.resolve(paths.core));
  const id = "mt_round22_grid_panel";

  const form = Form.run(req("round22-form-grid-settings", "Create the integrated definition-setting grid position form", {
    grid: {
      counts: [2, 1, 3],
      step: [0.5, 99, -1],
      with_step: { x: { width: 0.25 } },
      instance: {
        use: "panel",
        with: { width: 1 },
        pos: [10, -2, 3]
      }
    }
  }));
  const surface = Surface.run(req("round22-surface", "Keep one ordinary base material color", {
    base_color: [0.18, 0.42, 0.68]
  }));
  const capability = Capability.run(req("round22-capability", "Provide canonical count state for receiver UI proof", {
    kind: "counter",
    initial: 3
  }));
  const interfaceOut = Interface.run(req("round22-interface", "Render a bounded current Interface view on the complete tile", {
    tile_path: id,
    title: "Round 22 grid panel",
    elements: [{
      kind: "repeat",
      binding: "count",
      step: 1,
      max: 4,
      children: [{ kind: "text", text: "grid-cell" }]
    }],
    bindings: { readouts: ["count"] }
  }));

  for (const [name, output] of Object.entries({ form, surface, capability, interface: interfaceOut })) {
    assert.equal(output.status, "CANDIDATE", `${name}: ${JSON.stringify(output.holds)}`);
  }

  const authoredLeaf = recipeLeaf(form.candidate);
  assert.deepEqual(authoredLeaf.pos, [
    ["+", 10, ["*", ["var", "gx"], 0.5]],
    -2,
    ["+", 3, ["*", ["var", "gz"], -1]]
  ]);
  assert.deepEqual(authoredLeaf.with.width, ["+", 1, ["*", ["var", "gx"], 0.25]]);

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-round22-current-fleet",
    goal: "Prove exact current integrated producer semantics compose and preserve Form grid-setting position meaning through a portable receiver",
    intent: { id, name: "Round 22 grid panel" },
    inputs: [uiEligibility(id, "Round 22 grid panel"), form, surface, capability, interfaceOut],
    world_requirements: { definitions: { panel: panelDefinition() } },
    provenance: { caller: "assembly-round22-current-fleet" }
  });

  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.deepEqual(assembled.required_definitions, ["panel"]);
  assert.deepEqual(recipeLeaf(assembled.candidate), authoredLeaf, "Assembly must preserve the integrated Form recipe leaf exactly");
  assert.deepEqual(assembled.candidate.facets.material.data.color, [0.18, 0.42, 0.68]);
  assert.equal(assembled.candidate.facets.logic.data.vars.count, 3);
  assert.deepEqual(assembled.candidate.view, interfaceOut.candidate.operation.view);

  const portable = materializeKit(assembled, MT, { name: "Round 22 current fleet portable kit" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  assert.equal(portable.kit.expect.defs, 1);
  assert.deepEqual(recipeLeaf(portable.kit.tile), authoredLeaf, "kit materialization must preserve the Form recipe leaf exactly");
  assert.equal(portable.dependency_resolution.length, 1);
  assert.equal(portable.dependency_resolution[0].status, "SATISFIED");

  const receiver = MT.createWorld("Round 22 receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  assert.equal(imported.evidence, "verified_payload_sha256");
  applyImported(MT, receiver, imported);

  const received = MT.resolveTile(receiver, id);
  assert.ok(received, "fresh receiver must resolve the imported complete tile");
  assert.deepEqual(recipeLeaf(received), authoredLeaf, "fresh-world import must preserve the Form recipe leaf exactly");

  const mesh = MT.compileMesh(received, receiver);
  assert.equal(mesh.hold, null, JSON.stringify(mesh));
  assert.equal(mesh.recipe_parts, 6, "2 x 1 x 3 definition grid must compile to six concrete parts");
  assert.equal(mesh.P.every(Number.isFinite), true);

  const beforeRender = MT.structHash(receiver);
  const html = MT.vnodeToHTML(MT.compilePanel(receiver).root);
  assert.equal((html.match(/grid-cell/g) || []).length, 3, "canonical count=3 must drive the current Interface receiver view");
  assert.equal(MT.structHash(receiver), beforeRender, "receiver rendering must remain structurally read-only");
});