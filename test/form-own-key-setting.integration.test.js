"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const formPath = process.env.FORM_MACHINE_PATH;
const corePath = process.env.MORPHTILE_CORE_PATH;
const ready = Boolean(formPath && corePath);
const EXPECTED_FORM = "bd67179e2aebd20708b02152d07752b37df16e66";
const EXPECTED_CORE = "2bdf8eade1376055473b9cc1b11734b72a5566e5";

function ownProto(value) {
  return JSON.parse(`{"__proto__":${value}}`);
}

function panelDefinition() {
  return {
    id: "panel",
    name: "Own-key panel",
    created_by: "assembly-form-own-key-setting-integration",
    body: {
      facets: {
        mesh: {
          type: "generated",
          source: null,
          data: {
            generator: "recipe",
            vars: ownProto(1),
            parts: [{ shape: "plane", size: [["var", "__proto__"], 1, 1] }]
          }
        }
      }
    }
  };
}

function widthSpan(compiled) {
  const xs = [];
  for (let i = 0; i < compiled.P.length; i += 3) xs.push(compiled.P[i]);
  return Math.max(...xs) - Math.min(...xs);
}

test("merged Form own-key definition setting survives Assembly closure, kit transport and fresh-world compile", { skip: !ready }, () => {
  assert.equal(process.env.FORM_COMMIT, EXPECTED_FORM, "CI Form checkout must match the merged own-key setting head");
  assert.equal(process.env.MORPHTILE_COMMIT, EXPECTED_CORE, "CI MorphTile checkout must match the merged own-key registry head");
  const Form = require(path.resolve(formPath));
  const MT = require(path.resolve(corePath));

  const form = Form.run({
    envelope_version: "0.1",
    request_id: "form-own-key-setting-through-assembly",
    goal: "preserve authored own-key definition settings as portable data",
    intent: {
      name: "Own-key setting transport",
      instances: [{ use: "panel", with: ownProto(2) }]
    },
    provenance: { caller: "assembly-form-own-key-setting-integration" }
  });
  assert.equal(form.status, "CANDIDATE", JSON.stringify(form.holds));
  const emitted = form.candidate.facets.mesh.data.parts[0].with;
  assert.equal(Object.prototype.hasOwnProperty.call(emitted, "__proto__"), true);
  assert.equal(emitted.__proto__, 2);

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-form-own-key-setting",
    goal: "carry exact Form own-key settings with explicit definition closure",
    intent: { id: "mt_form_own_key_setting", name: "Own-key setting transport" },
    inputs: [form],
    world_requirements: { definitions: { panel: panelDefinition() } },
    provenance: { caller: "assembly-form-own-key-setting-integration" }
  });
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.equal(Object.prototype.hasOwnProperty.call(assembled.candidate.facets.mesh.data.parts[0].with, "__proto__"), true);
  assert.equal(assembled.candidate.facets.mesh.data.parts[0].with.__proto__, 2);
  assert.equal(Object.prototype.hasOwnProperty.call(assembled.world_requirements.definitions.panel.body.facets.mesh.data.vars, "__proto__"), true);

  const portable = materializeKit(assembled, MT, { name: "Form own-key setting portable kit" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  assert.equal(Object.prototype.hasOwnProperty.call(portable.kit.tile.facets.mesh.data.parts[0].with, "__proto__"), true);
  assert.equal(portable.kit.tile.facets.mesh.data.parts[0].with.__proto__, 2);

  const receiver = MT.createWorld("Form own-key setting receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  for (const operation of imported.ops || []) MT.applyStructOp(receiver, operation);

  const tile = MT.resolveTile(receiver, "mt_form_own_key_setting");
  assert.ok(tile);
  assert.equal(Object.prototype.hasOwnProperty.call(tile.facets.mesh.data.parts[0].with, "__proto__"), true);
  assert.equal(tile.facets.mesh.data.parts[0].with.__proto__, 2);

  const compiled = MT.compileMesh(tile, receiver);
  assert.equal(compiled.hold, null, JSON.stringify(compiled));
  assert.equal(compiled.recipe_parts, 1);
  assert.equal(compiled.P.every((value) => Number.isFinite(value)), true);
  assert.equal(widthSpan(compiled), 2, "the transported own-key override must remain effective after fresh-world import");
});
