const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const formPath = process.env.FORM_MACHINE_PATH;
const corePath = process.env.MORPHTILE_CORE_PATH;
const ready = !!formPath && !!corePath;

function req(id, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal: "prove current Form definition reuse through Assembly closure",
    intent,
    provenance: { caller: "assembly-form-definition-integration" }
  };
}

function panelDefinition() {
  return {
    id: "panel",
    name: "Parametric panel",
    created_by: "assembly-form-definition-integration",
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

test("current Form definition references remain HOLD until Assembly receives complete definition closure, then survive verified kit import", { skip: !ready }, () => {
  const Form = require(path.resolve(formPath));
  const MT = require(path.resolve(corePath));

  const form = Form.run(req("form-definition-current", {
    name: "Definition-backed current form",
    instances: [
      { use: "panel", with: { width: 2 }, pos: [0, 0, 0] },
      { use: "panel", with: { width: 3 }, pos: [4, 0, 0] }
    ]
  }));
  assert.equal(form.status, "CANDIDATE", JSON.stringify(form.holds));
  assert.equal(form.machine.id, "axm.morphtile.machine.form");
  assert.equal(form.warnings.some((warning) => warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"), true);

  const withoutDefinition = assemble({
    envelope_version: "0.1",
    request_id: "assembly-definition-missing",
    goal: "do not claim complete matter without referenced definitions",
    intent: { id: "mt_definition_current", name: "Definition-backed current form" },
    inputs: [form]
  });
  assert.equal(withoutDefinition.status, "HOLD");
  assert.deepEqual(withoutDefinition.required_definitions, ["panel"]);
  assert.deepEqual(withoutDefinition.holds.find((hold) => hold.code === "HOLD_DEFINITION_CLOSURE_INCOMPLETE").missing, ["panel"]);

  const complete = assemble({
    envelope_version: "0.1",
    request_id: "assembly-definition-complete",
    goal: "assemble current Form definition reference with explicit closure",
    intent: { id: "mt_definition_current", name: "Definition-backed current form" },
    inputs: [form],
    world_requirements: { definitions: { panel: panelDefinition() } }
  });
  assert.equal(complete.status, "CANDIDATE", JSON.stringify(complete.holds));
  assert.deepEqual(complete.required_definitions, ["panel"]);
  assert.deepEqual(Object.keys(complete.world_requirements.definitions), ["panel"]);

  const materialized = materializeKit(complete, MT, { name: "Definition closure portable kit" });
  assert.equal(materialized.status, "CANDIDATE", JSON.stringify(materialized.holds));
  assert.equal(materialized.kit.expect.defs, 1);
  assert.equal(materialized.kit.expect.sha256, MT.hashOf({
    tile: materialized.kit.tile,
    defs: materialized.kit.defs,
    words: materialized.kit.words
  }));
  assert.deepEqual(materialized.source_provenance, complete.source_provenance);

  const receiver = MT.createWorld("Definition receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(materialized.kit)));
  assert.equal(imported.status, "READY");
  assert.equal(imported.evidence, "verified_payload_sha256");
  assert.equal(imported.ops.some((operation) => operation.op === "def.put" || operation.op === "def.create"), true);
  assert.equal(imported.ops.some((operation) => operation.op === "tile.add"), true);
});
