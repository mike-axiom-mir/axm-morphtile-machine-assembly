"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function request(candidate, id, wrapped = false) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal: "Preserve authored structured MorphTile matter without host-language omission or container reinterpretation",
    intent: { name: "Structured container proof" },
    inputs: [wrapped ? { candidate } : candidate],
    provenance: { caller: "tile-structured-container-integrity-regression" }
  };
}

function tile(extra = {}) {
  return {
    schema: "morphtile.tile-spec/v0.4",
    form_hints: ["game_asset", "ui_panel"],
    facets: {
      mesh: {
        type: "primitive",
        source: null,
        data: { shape: "box", size: [1, 1, 1] }
      }
    },
    ...extra
  };
}

function expectShapeHold(field, value, wrapped, label) {
  const source = request(tile({ [field]: value }), `${wrapped ? "wrapped" : "direct"}-${field}-${label}`, wrapped);
  const before = JSON.stringify(source);
  const out = run(source);

  assert.equal(out.status, "HOLD", `${field}/${label}`);
  const code = `HOLD_${field.toUpperCase()}_SHAPE_INVALID`;
  const hold = out.holds.find((item) => item.code === code);
  assert.ok(hold, `${field}/${label}: missing ${code}`);
  assert.equal(
    hold.path,
    wrapped ? `request.inputs[0].candidate.${field}` : `request.inputs[0].${field}`,
    `${field}/${label}`
  );
  assert.equal(JSON.stringify(source), before, `${field}/${label}: caller input must remain unchanged`);
}

test("tile params preserve authored array identity across direct and wrapped candidates", () => {
  for (const [label, value] of [
    ["null", null],
    ["false", false],
    ["zero", 0],
    ["empty-string", ""],
    ["object", { id: "speed", type: "number" }]
  ]) {
    expectShapeHold("params", value, false, label);
    expectShapeHold("params", value, true, label);
  }
});

test("tile view preserves authored object identity across direct and wrapped candidates", () => {
  for (const [label, value] of [
    ["null", null],
    ["false", false],
    ["zero", 0],
    ["empty-string", ""],
    ["array", []]
  ]) {
    expectShapeHold("view", value, false, label);
    expectShapeHold("view", value, true, label);
  }
});

test("tile presentation preserves authored object identity across direct and wrapped candidates", () => {
  for (const [label, value] of [
    ["null", null],
    ["false", false],
    ["zero", 0],
    ["empty-string", ""],
    ["array", []]
  ]) {
    expectShapeHold("presentation", value, false, label);
    expectShapeHold("presentation", value, true, label);
  }
});

test("valid structured tile containers retain established Assembly behavior", () => {
  const source = request(tile({
    params: [{ id: "speed", type: "number", min: 0, max: 10, value: 2 }],
    view: { title: "Controls", body: [] },
    presentation: { mode: "screen" }
  }), "valid-structured-containers");
  const before = JSON.stringify(source);
  const out = run(source);

  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(out.candidate.params, [{ id: "speed", type: "number", min: 0, max: 10, value: 2 }]);
  assert.deepEqual(out.candidate.view, { title: "Controls", body: [] });
  assert.deepEqual(out.candidate.presentation, { mode: "screen" });
  assert.equal(JSON.stringify(source), before);
});
