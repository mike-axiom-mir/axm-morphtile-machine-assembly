"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fleet = require("../fixtures/current-fleet.json");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const formPath = process.env.CURRENT_FORM_MACHINE_PATH;
const corePath = process.env.CURRENT_MORPHTILE_CORE_PATH;
const formCommit = process.env.CURRENT_FORM_COMMIT;
const coreCommit = process.env.CURRENT_MORPHTILE_COMMIT;
const ready = Boolean(formPath && corePath);

const EXPECTED_FORM = fleet.form;
const EXPECTED_CORE = fleet.core;

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-current-form-position-proof" }
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

test("current integrated Form repeat position state survives complete Assembly receiver closure", { skip: !ready }, () => {
  assert.equal(formCommit, EXPECTED_FORM,
    "current position proof must bind the exact integrated Form identity that owns repeat-position generated state");
  assert.equal(coreCommit, EXPECTED_CORE,
    "current position proof must bind the exact integrated MorphTile receiver identity");

  const Form = require(path.resolve(formPath));
  const MT = require(path.resolve(corePath));
  const id = "mt_current_position_repeat";

  const form = Form.run(req(
    "current-form-position",
    "Create current integrated repeat primitive position progression",
    {
      repeat: {
        count: 3,
        step: [0.5, 0, -1],
        part: { shape: "box", pos: [10, -2, 3], size: [1, 1, 0.5] }
      }
    }
  ));
  assert.equal(form.status, "CANDIDATE", JSON.stringify(form.holds));

  const authoredLeaf = recipeLeaf(form.candidate);
  assert.deepEqual(authoredLeaf.pos, [
    ["+", 10, ["*", ["var", "i"], 0.5]],
    -2,
    ["+", 3, ["*", ["var", "i"], -1]]
  ], "current Form must expose its integrated repeat-position state as explicit lexical-i recipe matter");

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-current-form-position",
    goal: "Prove current integrated Form position state through complete Assembly transport",
    intent: { id, name: "Current position repeat" },
    inputs: [form],
    provenance: { caller: "assembly-current-form-position-proof" }
  });
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.deepEqual(recipeLeaf(assembled.candidate), authoredLeaf,
    "Assembly must preserve the exact current Form primitive repeat recipe leaf");

  const portable = materializeKit(assembled, MT, { name: "Current Form position receiver kit" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  for (const kind of ["KIT_IMPORT_PLAN_COVERAGE", "KIT_APPLY", "KIT_RECEIVER_CLOSURE"]) {
    assert.equal(portable.evidence.some((entry) => entry.kind === kind && entry.status === "PASS"), true,
      `current Form position proof must earn ${kind}`);
  }
  assert.deepEqual(recipeLeaf(portable.kit.tile), authoredLeaf,
    "kit materialization must preserve the exact current Form primitive repeat recipe leaf");

  const receiver = MT.createWorld("Current Form position receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  applyImported(MT, receiver, imported);

  const received = MT.resolveTile(receiver, id);
  assert.ok(received, "fresh receiver must resolve the imported current Form tile");
  assert.deepEqual(recipeLeaf(received), authoredLeaf,
    "fresh-world import must preserve the exact current Form primitive repeat recipe leaf");

  const mesh = MT.compileMesh(received, receiver);
  assert.equal(mesh.hold, null, JSON.stringify(mesh));
  assert.equal(mesh.recipe_parts, 3,
    "current repeat count=3 must compile to three concrete primitive instances");
  assert.equal(mesh.P.every(Number.isFinite), true,
    "receiver execution of the transported position progression must remain finite");
});
