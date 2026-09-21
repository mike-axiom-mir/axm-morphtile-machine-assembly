"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const paths = {
  form: process.env.ROUND10_FORM_MACHINE_PATH,
  surface: process.env.ROUND10_SURFACE_MACHINE_PATH,
  capability: process.env.ROUND10_CAPABILITY_MACHINE_PATH,
  interface: process.env.ROUND10_INTERFACE_MACHINE_PATH,
  core: process.env.ROUND10_MORPHTILE_CORE_PATH
};
const commits = {
  form: process.env.ROUND10_FORM_COMMIT,
  surface: process.env.ROUND10_SURFACE_COMMIT,
  capability: process.env.ROUND10_CAPABILITY_COMMIT,
  interface: process.env.ROUND10_INTERFACE_COMMIT,
  core: process.env.ROUND10_MORPHTILE_COMMIT
};
const expected = {
  form: "378e7896acfdf8d4bd28d08127c1f57546e3eef1",
  surface: "4349ba0d926aee1d36dde86fc7f69d04a58bf924",
  capability: "edc07af182ee26ca1ceb64b5d5205591ec6aca9d",
  interface: "1a941f8ff88ca590952571e3eeeeeeef6daefd77",
  core: "2bdf8eade1376055473b9cc1b11734b72a5566e5"
};
const ready = Object.values(paths).every(Boolean);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-round10-current-receiver" }
  };
}

function uiEligibility(id, name = "Round 10 portable panel") {
  return {
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      id,
      name,
      form_hints: ["ui_panel"],
      facets: {}
    },
    provenance: { caller: "explicit-round10-ui-eligibility" }
  };
}

function panelDefinition() {
  return {
    id: "panel",
    name: "Round 10 scalable panel definition",
    created_by: "assembly-round10-current-receiver",
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

function planeWidthSpans(compiled, count) {
  const scalarsPerPlane = 18;
  return Array.from({ length: count }, (_, index) => {
    const chunk = compiled.P.slice(index * scalarsPerPlane, (index + 1) * scalarsPerPlane);
    const xs = [];
    for (let i = 0; i < chunk.length; i += 3) xs.push(chunk[i]);
    return Math.max(...xs) - Math.min(...xs);
  });
}

test("current merged Form vector scale, Surface material, Capability state and Interface repeat survive one portable Assembly kit", { skip: !ready }, () => {
  assert.deepEqual(commits, expected, "current receiver proof must bind the exact merged producer/runtime identities");

  const Form = require(path.resolve(paths.form));
  const Surface = require(path.resolve(paths.surface));
  const Capability = require(path.resolve(paths.capability));
  const Interface = require(path.resolve(paths.interface));
  const MT = require(path.resolve(paths.core));
  const id = "mt_round10_portable_panel";

  const form = Form.run(req("round10-form-vector-scale", "Create a bounded reusable form whose anisotropic scale changes per copy", {
    repeat: {
      count: 3,
      step: [3, 0, 0],
      scale_step: [0.25, -0.1, 0],
      instance: { use: "panel", scale: [0.5, 1.2, 0.8] }
    }
  }));
  const surface = Surface.run(req("round10-surface", "Create explicit patterned material for the assembled tile", {
    base_color: [0.25, 0.4, 0.55],
    pattern: { kind: "checker", scale: 2.5 }
  }));
  const capability = Capability.run(req("round10-capability", "Provide canonical count state for the repeated interface", {
    kind: "counter",
    initial: 2
  }));
  const interfaceOut = Interface.run(req("round10-interface-repeat", "Repeat a bounded marker from canonical count state", {
    tile_path: id,
    title: "Round 10 portable panel",
    elements: [{
      kind: "repeat",
      binding: "count",
      step: 1,
      max: 3,
      children: [{ kind: "text", text: "Current marker" }]
    }],
    bindings: { readouts: ["count"] }
  }));

  for (const [name, output] of Object.entries({ form, surface, capability, interface: interfaceOut })) {
    assert.equal(output.status, "CANDIDATE", `${name}: ${JSON.stringify(output.holds)}`);
  }

  const expectedScale = [
    ["+", 0.5, ["*", ["var", "i"], 0.25]],
    ["+", 1.2, ["*", ["var", "i"], -0.1]],
    0.8
  ];
  assert.deepEqual(form.candidate.facets.mesh.data.parts[0].body[0].scale, expectedScale);
  assert.deepEqual(interfaceOut.candidate.operation.view.body, [{
    repeat: ["max", 0, ["min", 3, ["floor", ["/", ["var", "count"], 1]]]],
    as: "i",
    body: [{ text: "Current marker" }]
  }]);

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-round10-complete",
    goal: "Combine exact current merged producer semantics into one portable tile without rewriting their meaning",
    intent: { id, name: "Round 10 portable panel" },
    inputs: [uiEligibility(id), form, surface, capability, interfaceOut],
    world_requirements: { definitions: { panel: panelDefinition() } },
    provenance: { caller: "assembly-round10-current-receiver" }
  });

  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.deepEqual(assembled.required_definitions, ["panel"]);
  assert.deepEqual(assembled.candidate.facets.mesh.data.parts, form.candidate.facets.mesh.data.parts);
  assert.equal(assembled.candidate.facets.material.data.pattern, "checker");
  assert.equal(assembled.candidate.facets.material.data.scale, 2.5);
  assert.equal(assembled.candidate.facets.logic.data.vars.count, 2);
  assert.deepEqual(assembled.candidate.view, interfaceOut.candidate.operation.view);
  assert.equal(assembled.dependencies.length, 1);
  assert.equal(assembled.dependencies[0].kind, "morphtile.interface-target-proof/v0.1");
  assert.deepEqual(assembled.dependencies[0].requires.readout_logic_vars, ["count"]);

  const portable = materializeKit(assembled, MT, { name: "Round 10 current merged portable kit" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  assert.equal(portable.kit.expect.defs, 1);
  assert.deepEqual(portable.kit.defs.panel, panelDefinition());
  assert.equal(portable.dependency_resolution.length, 1);
  assert.equal(portable.dependency_resolution[0].status, "SATISFIED");
  assert.equal(portable.dependency_resolution[0].proof_scope, "staged_morphtile_world");
  assert.deepEqual(portable.kit.tile.facets.mesh.data.parts, form.candidate.facets.mesh.data.parts);
  assert.deepEqual(portable.kit.tile.view, interfaceOut.candidate.operation.view);
  assert.deepEqual(portable.source_provenance, assembled.source_provenance);

  const receiver = MT.createWorld("Round 10 receiver");
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
  assert.equal(mesh.recipe_parts, 3);
  assert.equal(mesh.P.every(Number.isFinite), true);
  assert.deepEqual(planeWidthSpans(mesh, 3), [1, 1.5, 2], "fresh-world runtime must retain vector X-scale progression rather than only its syntax");

  const beforeRender = MT.structHash(receiver);
  const html = MT.vnodeToHTML(MT.compilePanel(receiver).root);
  assert.equal((html.match(/Current marker/g) || []).length, 2, "imported Interface repeat must read imported canonical count=2 state");
  assert.equal(MT.structHash(receiver), beforeRender, "rendering imported repeated interface matter must remain structurally read-only");
});

test("current merged Interface same-root path composition remains explicit and does not make Assembly invent absent parent context", { skip: !ready }, () => {
  assert.deepEqual(commits, expected);
  const Interface = require(path.resolve(paths.interface));
  const MT = require(path.resolve(paths.core));

  const interfaceOut = Interface.run(req("round10-interface-same-root-path", "Compose an exact nested tile-owned view in the same MorphTile root", {
    tile_path: "mt_shell/mt_panel",
    title: "Owner with nested view",
    elements: [{ kind: "tile", tile_path: "mt_shell/mt_inner" }]
  }));
  assert.equal(interfaceOut.status, "CANDIDATE", JSON.stringify(interfaceOut.holds));
  assert.deepEqual(interfaceOut.candidate.operation.view.body, [{ tile: "/mt_shell/mt_inner" }]);

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-round10-same-root-path",
    goal: "Preserve exact same-root Interface path matter without fabricating its external parent world",
    intent: { id: "mt_panel", tile_path: "mt_shell/mt_panel", name: "Nested owner panel" },
    inputs: [uiEligibility("mt_panel", "Nested owner panel"), interfaceOut],
    provenance: { caller: "assembly-round10-current-receiver" }
  });

  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.deepEqual(assembled.target_binding, { id: "mt_panel", path: "mt_shell/mt_panel" });
  assert.deepEqual(assembled.candidate.view.body, [{ tile: "/mt_shell/mt_inner" }]);
  assert.equal(assembled.dependencies.length, 1);
  assert.equal(assembled.dependencies[0].kind, "morphtile.interface-target-proof/v0.1");

  const portable = materializeKit(assembled, MT, { name: "Nested path context boundary" });
  assert.equal(portable.status, "HOLD");
  assert.equal(portable.kit, null);
  assert.ok(portable.holds.some((hold) => hold.code === "HOLD_KIT_DEPENDENCY_UNSATISFIED"));
  assert.deepEqual(assembled.candidate.view.body, [{ tile: "/mt_shell/mt_inner" }], "failed portable closure must not rewrite the explicit same-root path");
});

test("current merged Surface signed-zero source HOLD remains inspectable through Assembly instead of being promoted", { skip: !ready }, () => {
  assert.deepEqual(commits, expected);
  const Surface = require(path.resolve(paths.surface));

  const source = req("round10-surface-negative-zero", "Keep raw authored paint numeric identity exact", {
    base_color: [0.5, 0.5, 0.5],
    paint: {
      color: [["/", 1, -0], 0.55, 0.2],
      vars: { threshold: 0.6 }
    }
  });
  assert.equal(Object.is(source.intent.paint.color[0][2], -0), true);
  const surfaceHold = Surface.run(source);
  assert.equal(surfaceHold.status, "HOLD");
  assert.equal(surfaceHold.candidate, null);
  assert.equal(surfaceHold.holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
  assert.equal(Object.is(source.intent.paint.color[0][2], -0), true, "producer must leave caller-owned signed zero unchanged on HOLD");

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-round10-upstream-hold",
    goal: "Preserve the exact upstream Surface HOLD rather than treating rejected source as candidate matter",
    intent: { id: "mt_surface_hold", name: "Surface HOLD evidence" },
    inputs: [surfaceHold],
    provenance: { caller: "assembly-round10-current-receiver" }
  });

  assert.equal(assembled.status, "HOLD");
  assert.equal(assembled.candidate, null);
  const upstream = assembled.holds.find((hold) => hold.code === "HOLD_INPUT_NOT_CANDIDATE");
  assert.ok(upstream);
  assert.equal(upstream.status, "HOLD");
  assert.equal(upstream.upstream_holds[0].code, "HOLD_SURFACE_PAINT_NONPORTABLE_VALUE");
});
