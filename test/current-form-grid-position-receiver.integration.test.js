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
    provenance: { caller: "assembly-current-form-grid-position-proof" }
  };
}

function findPrimitiveLeaf(value, shape) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPrimitiveLeaf(item, shape);
      if (found) return found;
    }
    return null;
  }
  if (!value || typeof value !== "object") return null;
  if (value.shape === shape) return value;
  for (const item of Object.values(value)) {
    const found = findPrimitiveLeaf(item, shape);
    if (found) return found;
  }
  return null;
}

function applyImported(MT, receiver, imported) {
  for (const operation of imported.ops || []) MT.applyStructOp(receiver, operation);
}

test("current integrated Form grid position state survives complete Assembly receiver closure", { skip: !ready }, () => {
  assert.equal(formCommit, EXPECTED_FORM,
    "current grid-position proof must bind the exact integrated Form identity that owns downstream grid-position state");
  assert.equal(coreCommit, EXPECTED_CORE,
    "current grid-position proof must bind the exact integrated MorphTile receiver identity");

  const Form = require(path.resolve(formPath));
  const MT = require(path.resolve(corePath));
  const id = "mt_current_grid_position";

  const form = Form.run(req(
    "current-form-grid-position",
    "Create current integrated bounded grid position progression",
    {
      grid: {
        counts: [3, 1, 2],
        step: [2, 9, -1],
        part: { shape: "box", pos: [10, -2, 3], size: [1, 1, 0.5] }
      }
    }
  ));
  assert.equal(form.status, "CANDIDATE", JSON.stringify(form.holds));

  const authoredLeaf = findPrimitiveLeaf(form.candidate.facets.mesh.data.parts, "box");
  assert.ok(authoredLeaf, "current Form grid output must contain the authored box recipe leaf");
  assert.deepEqual(authoredLeaf.pos, [
    ["+", 10, ["*", ["var", "gx"], 2]],
    -2,
    ["+", 3, ["*", ["var", "gz"], -1]]
  ], "current Form must expose integrated grid-position state with canonical active-axis lexical expressions only");

  const assembled = assemble({
    envelope_version: "0.1",
    request_id: "assembly-current-form-grid-position",
    goal: "Prove current integrated Form grid position state through complete Assembly transport",
    intent: { id, name: "Current grid position" },
    inputs: [form],
    provenance: { caller: "assembly-current-form-grid-position-proof" }
  });
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));

  const assembledLeaf = findPrimitiveLeaf(assembled.candidate.facets.mesh.data.parts, "box");
  assert.ok(assembledLeaf, "Assembly must retain the current Form grid primitive leaf");
  assert.deepEqual(assembledLeaf, authoredLeaf,
    "Assembly must preserve the exact current Form grid recipe leaf");

  const portable = materializeKit(assembled, MT, { name: "Current Form grid-position receiver kit" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  for (const kind of ["KIT_IMPORT_PLAN_COVERAGE", "KIT_APPLY", "KIT_RECEIVER_CLOSURE"]) {
    assert.equal(portable.evidence.some((entry) => entry.kind === kind && entry.status === "PASS"), true,
      `current Form grid-position proof must earn ${kind}`);
  }

  const kitLeaf = findPrimitiveLeaf(portable.kit.tile.facets.mesh.data.parts, "box");
  assert.ok(kitLeaf, "portable kit must retain the current Form grid primitive leaf");
  assert.deepEqual(kitLeaf, authoredLeaf,
    "kit materialization must preserve the exact current Form grid recipe leaf");

  const receiver = MT.createWorld("Current Form grid-position receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  applyImported(MT, receiver, imported);

  const received = MT.resolveTile(receiver, id);
  assert.ok(received, "fresh receiver must resolve the imported current Form grid tile");
  const receivedLeaf = findPrimitiveLeaf(received.facets.mesh.data.parts, "box");
  assert.ok(receivedLeaf, "fresh receiver must retain the current Form grid primitive leaf");
  assert.deepEqual(receivedLeaf, authoredLeaf,
    "fresh-world import must preserve the exact current Form grid recipe leaf");

  const mesh = MT.compileMesh(received, receiver);
  assert.equal(mesh.hold, null, JSON.stringify(mesh));
  assert.equal(mesh.recipe_parts, 6,
    "current 3x1x2 grid must compile to six concrete primitive instances");
  assert.equal(mesh.P.every(Number.isFinite), true,
    "receiver execution of the transported grid-position state must remain finite");
});
