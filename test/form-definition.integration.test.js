const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const formPath = process.env.FORM_MACHINE_PATH;
const formCommit = process.env.FORM_COMMIT;
const corePath = process.env.MORPHTILE_CORE_PATH;
const ready = !!formPath && !!corePath;
const EXPECTED_FORM_COMMIT = "fd0f8fbee80fe68dc076aa793407e3f59ee5f286";

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

function planeWidthSpans(compiled, count) {
  const scalarsPerPlane = 18;
  return Array.from({ length: count }, (_, index) => {
    const chunk = compiled.P.slice(index * scalarsPerPlane, (index + 1) * scalarsPerPlane);
    const xs = [];
    for (let i = 0; i < chunk.length; i += 3) xs.push(chunk[i]);
    return Math.max(...xs) - Math.min(...xs);
  });
}

function applyImported(MT, receiver, imported) {
  for (const operation of imported.ops || []) MT.applyStructOp(receiver, operation);
}

test("current Form definition references remain HOLD until Assembly receives complete definition closure, then survive verified kit import", { skip: !ready }, () => {
  assert.equal(formCommit, EXPECTED_FORM_COMMIT, "CI Form checkout must match the exact merged v0.9 evidence head");
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

test("Form v0.9 repeat setting progression remains definition-closed through Assembly kit transport and imported-world compile", { skip: !ready }, () => {
  assert.equal(formCommit, EXPECTED_FORM_COMMIT, "CI Form checkout must match the exact merged v0.9 evidence head");
  const Form = require(path.resolve(formPath));
  const MT = require(path.resolve(corePath));

  const form = Form.run(req("form-repeat-setting-progression", {
    name: "Progressive definition-backed panels",
    repeat: {
      count: 3,
      step: [4, 0, 0],
      instance: { use: "panel", with: { width: 1 } },
      with_step: { width: 1 }
    }
  }));
  assert.equal(form.status, "CANDIDATE", JSON.stringify(form.holds));
  assert.equal(form.machine.id, "axm.morphtile.machine.form");
  assert.equal(form.warnings.some((warning) => warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"), true);
  assert.deepEqual(form.candidate.facets.mesh.data.parts, [{
    repeat: 3,
    as: "i",
    body: [{
      use: "panel",
      with: { width: ["+", 1, ["*", ["var", "i"], 1]] },
      pos: [["+", 0, ["*", ["var", "i"], 4]], 0, 0]
    }]
  }]);

  const missing = assemble({
    envelope_version: "0.1",
    request_id: "assembly-repeat-setting-progression-missing",
    goal: "keep loop-scoped Form definition references HELD until their reusable matter is explicit",
    intent: { id: "mt_progressive_panel", name: "Progressive panels" },
    inputs: [form]
  });
  assert.equal(missing.status, "HOLD");
  assert.deepEqual(missing.required_definitions, ["panel"]);
  assert.deepEqual(missing.holds.find((hold) => hold.code === "HOLD_DEFINITION_CLOSURE_INCOMPLETE").missing, ["panel"]);

  const complete = assemble({
    envelope_version: "0.1",
    request_id: "assembly-repeat-setting-progression-complete",
    goal: "carry the exact Form v0.9 scoped progression together with its reusable definition closure",
    intent: { id: "mt_progressive_panel", name: "Progressive panels" },
    inputs: [form],
    world_requirements: { definitions: { panel: panelDefinition() } }
  });
  assert.equal(complete.status, "CANDIDATE", JSON.stringify(complete.holds));
  assert.deepEqual(complete.required_definitions, ["panel"]);
  assert.deepEqual(complete.candidate.facets.mesh.data.parts, form.candidate.facets.mesh.data.parts);

  const materialized = materializeKit(complete, MT, { name: "Progressive definition closure kit" });
  assert.equal(materialized.status, "CANDIDATE", JSON.stringify(materialized.holds));
  assert.equal(materialized.kit.expect.defs, 1);
  assert.deepEqual(materialized.kit.tile.facets.mesh.data.parts, form.candidate.facets.mesh.data.parts);
  assert.deepEqual(materialized.kit.defs.panel, panelDefinition());

  const receiver = MT.createWorld("Progressive definition receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(materialized.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  applyImported(MT, receiver, imported);

  const received = MT.resolveTile(receiver, "mt_progressive_panel");
  assert.ok(received, "imported kit must resolve the transported progressive tile");
  const compiled = MT.compileMesh(received, receiver);
  assert.equal(compiled.hold, null, JSON.stringify(compiled));
  assert.equal(compiled.recipe_parts, 3);
  assert.equal(compiled.P.length, 54);
  assert.equal(compiled.T.length, 6);
  assert.deepEqual(planeWidthSpans(compiled, 3), [1, 2, 3], "Assembly transport must preserve the exact loop-scoped definition-setting progression");
});
