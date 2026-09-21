"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const paths = {
  form: process.env.ROUND19_FORM_MACHINE_PATH,
  surface: process.env.ROUND19_SURFACE_MACHINE_PATH,
  capability: process.env.ROUND19_CAPABILITY_MACHINE_PATH,
  interface: process.env.ROUND19_INTERFACE_MACHINE_PATH,
  core: process.env.ROUND19_MORPHTILE_CORE_PATH
};
const commits = {
  form: process.env.ROUND19_FORM_COMMIT,
  surface: process.env.ROUND19_SURFACE_COMMIT,
  capability: process.env.ROUND19_CAPABILITY_COMMIT,
  interface: process.env.ROUND19_INTERFACE_COMMIT,
  core: process.env.ROUND19_MORPHTILE_COMMIT
};
const expected = {
  form: "dd6975f29390e3175642a7d510b3c5320415b620",
  surface: "4e4495182aa83e5dfba37722fc3756a70cfaafaa",
  capability: "edc07af182ee26ca1ceb64b5d5205591ec6aca9d",
  interface: "8516da3a414c416ec1f76b1078901c56c49b04db",
  core: "2bdf8eade1376055473b9cc1b11734b72a5566e5"
};
const ready = Object.values(paths).every(Boolean);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-round19-current-receiver" }
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
    provenance: { caller: "explicit-round19-ui-eligibility" }
  };
}

function panelDefinition() {
  return {
    id: "panel",
    name: "Round 19 receiver panel definition",
    created_by: "assembly-round19-current-receiver",
    body: {
      facets: {
        mesh: {
          type: "generated",
          source: null,
          data: {
            generator: "recipe",
            vars: {},
            parts: [{ shape: "plane", size: [2, 1, 1] }]
          }
        }
      }
    }
  };
}

function applyImported(MT, receiver, imported) {
  for (const operation of imported.ops || []) MT.applyStructOp(receiver, operation);
}

test("current merged producer semantics close into one portable Assembly kit without invented material paint or lexical state", { skip: !ready }, () => {
  assert.deepEqual(commits, expected, "round19 receiver proof must bind exact integrated producer/runtime identities");

  const Form = require(path.resolve(paths.form));
  const Surface = require(path.resolve(paths.surface));
  const Capability = require(path.resolve(paths.capability));
  const Interface = require(path.resolve(paths.interface));
  const MT = require(path.resolve(paths.core));
  const id = "mt_round19_portable_panel";

  const form = Form.run(req("round19-form", "Create a bounded reusable two-copy panel form", {
    repeat: {
      count: 2,
      step: [3, 0, 0],
      instance: { use: "panel", scale: [0.5, 1, 1] }
    }
  }));
  const surface = Surface.run(req("round19-surface-base-only", "Author only an ordinary base material color", {
    base_color: [0.2, 0.45, 0.7]
  }));
  const capability = Capability.run(req("round19-capability", "Provide canonical count state for the current Interface receiver proof", {
    kind: "counter",
    initial: 3
  }));
  const interfaceOut = Interface.run(req("round19-interface-relational", "Render bounded repeat-local relational markers without copying lexical locals into canonical state", {
    tile_path: id,
    title: "Round 19 portable panel",
    elements: [{
      kind: "repeat",
      binding: "count",
      step: 1,
      max: 4,
      children: [
        { kind: "text", text: "slot" },
        { kind: "repeat_when", source: "index", comparison: "at_least", value: 1, children: [{ kind: "text", text: "after-first" }] },
        { kind: "repeat_when", source: "index", comparison: "below", value: 2, children: [{ kind: "text", text: "first-two" }] },
        { kind: "repeat_when", source: "count", comparison: "at_least", value: 3, children: [{ kind: "text", text: "crowded" }] }
      ]
    }],
    bindings: { readouts: ["count"] }
  }));

  for (const [name, output] of Object.entries({ form, surface, capability, interface: interfaceOut })) {
    assert.equal(output.status, "CANDIDATE", `${name}: ${JSON.stringify(output.holds)}`);
  }

  assert.deepEqual(surface.candidate.value.data.color, [0.2, 0.45, 0.7]);
  assert.equal(Object.prototype.hasOwnProperty.call(surface.candidate.value.data, "paint"), false, "current Surface base-only authorship must remain base-only before Assembly");
  assert.deepEqual(interfaceOut.dependencies[0].requires.readout_logic_vars, ["count"]);

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-round19-complete",
    goal: "Prove exact current integrated producer semantics compose and transport without Assembly rewriting their meaning",
    intent: { id, name: "Round 19 portable panel" },
    inputs: [uiEligibility(id, "Round 19 portable panel"), form, surface, capability, interfaceOut],
    world_requirements: { definitions: { panel: panelDefinition() } },
    provenance: { caller: "assembly-round19-current-receiver" }
  });

  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.deepEqual(assembled.required_definitions, ["panel"]);
  assert.deepEqual(assembled.candidate.facets.material.data.color, [0.2, 0.45, 0.7]);
  assert.equal(Object.prototype.hasOwnProperty.call(assembled.candidate.facets.material.data, "paint"), false, "Assembly must not invent the Surface paint that the current producer deliberately omitted");
  assert.equal(assembled.candidate.facets.logic.data.vars.count, 3);
  assert.deepEqual(assembled.candidate.view, interfaceOut.candidate.operation.view);
  assert.equal(assembled.dependencies.length, 1);
  assert.equal(assembled.dependencies[0].kind, "morphtile.interface-target-proof/v0.1");

  const portable = materializeKit(assembled, MT, { name: "Round 19 current merged portable kit" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  assert.equal(portable.kit.expect.defs, 1);
  assert.equal(portable.dependency_resolution.length, 1);
  assert.equal(portable.dependency_resolution[0].status, "SATISFIED");
  assert.equal(portable.dependency_resolution[0].proof_scope, "staged_morphtile_world");
  assert.deepEqual(portable.source_provenance, assembled.source_provenance);
  assert.equal(Object.prototype.hasOwnProperty.call(portable.kit.tile.facets.material.data, "paint"), false);

  const receiver = MT.createWorld("Round 19 receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  assert.equal(imported.evidence, "verified_payload_sha256");
  applyImported(MT, receiver, imported);

  const received = MT.resolveTile(receiver, id);
  assert.ok(received, "fresh receiver must resolve the imported complete tile");
  assert.equal(received.facets.logic.data.vars.count, 3);
  assert.deepEqual(received.facets.material.data.color, [0.2, 0.45, 0.7]);
  assert.equal(Object.prototype.hasOwnProperty.call(received.facets.material.data, "paint"), false, "fresh-world import must preserve base-only material authorship");

  const mesh = MT.compileMesh(received, receiver);
  assert.equal(mesh.hold, null, JSON.stringify(mesh));
  assert.equal(mesh.recipe_parts, 2);
  assert.equal(mesh.P.every(Number.isFinite), true);

  const beforeRender = MT.structHash(receiver);
  const html = MT.vnodeToHTML(MT.compilePanel(receiver).root);
  assert.equal((html.match(/slot/g) || []).length, 3, "canonical count=3 must drive three repeated bodies");
  assert.equal((html.match(/after-first/g) || []).length, 2, "index >= 1 must use lexical repeat indices without canonical-state pollution");
  assert.equal((html.match(/first-two/g) || []).length, 2, "index < 2 must use lexical repeat indices 0 and 1");
  assert.equal((html.match(/crowded/g) || []).length, 3, "repeat-local count >= 3 must hold across all three repeated bodies");
  assert.equal(MT.structHash(receiver), beforeRender, "receiver rendering must remain structurally read-only");
});
