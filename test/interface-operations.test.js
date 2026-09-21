const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.assembly.json");
const { run } = require("../src");

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function interfaceBundle(id = "mt_interface_bundle") {
  return {
    envelope_version: "0.1",
    request_id: "interface-bundle",
    machine: { id: "axm.morphtile.machine.interface", version: "0.2.0" },
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.interface-operations/v0.4",
      operations: [
        { op: "view.set", id, view: { title: "Counter", body: [{ value: "count" }, { button: "increment", label: "Increment" }] } },
        { op: "presentation.set", id, presentation: { mode: "docked", dock: "right", preferred_size: [360, 640], user_adjustable: true } }
      ]
    },
    warnings: [
      { code: "TARGET_MUST_EXIST_AND_DECLARE_UI_PANEL" },
      { code: "CALLER_MUST_PROVE_BINDINGS_MATCH_TARGET" }
    ],
    evidence: [],
    holds: [],
    provenance: { caller: "interface-bundle-fixture" }
  };
}

function requestWithBundle() {
  const request = copy(baseRequest);
  request.request_id = "assembly-interface-bundle";
  request.intent = { id: "mt_interface_bundle", name: "Interface bundle proof" };
  request.inputs[0].candidate.form_hints.push("ui_panel");
  request.inputs.push(interfaceBundle());
  return request;
}

function currentInterfaceRequest() {
  const request = requestWithBundle();
  request.inputs[2].machine.version = "0.5.14";
  request.inputs[2].candidate.schema = "morphtile.interface-operations/v0.5";
  return request;
}

test("folds the exact current Interface view.set + presentation.set bundle", () => {
  const out = run(requestWithBundle());
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.equal(out.candidate.id, "mt_interface_bundle");
  assert.equal(out.candidate.view.title, "Counter");
  assert.deepEqual(out.candidate.presentation, { mode: "docked", dock: "right", preferred_size: [360, 640], user_adjustable: true });
  assert.equal(out.source_provenance[2].candidate_schema, "morphtile.interface-operations/v0.4");
  assert.equal(out.warnings.filter((item) => item.code === "UPSTREAM_WARNING" && item.input === 2).length, 2);
});

test("folds a valid current v0.5 mode-owned presentation bundle", () => {
  const out = run(currentInterfaceRequest());
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(out.candidate.presentation, { mode: "docked", dock: "right", preferred_size: [360, 640], user_adjustable: true });
  assert.equal(out.source_provenance[2].candidate_schema, "morphtile.interface-operations/v0.5");
});

test("current v0.5 authored null presentation fields HOLD instead of becoming pseudo-omission", () => {
  const cases = [
    ["dock", { mode: "docked", dock: null }],
    ["preferred_size", { mode: "screen", preferred_size: null }],
    ["preferred_position", { mode: "screen", preferred_position: null }],
    ["user_adjustable", { mode: "screen", user_adjustable: null }],
    ["anchor", { mode: "tile", anchor: null }]
  ];

  for (const [field, presentation] of cases) {
    const request = currentInterfaceRequest();
    request.inputs[2].candidate.operations[1].presentation = presentation;
    const out = run(request);
    assert.equal(out.status, "HOLD", `${field} should reject authored null`);
    const hold = out.holds.find((item) => item.code === "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID");
    assert.ok(hold, `${field} should fail in the Interface operation contract before later closure`);
    assert.match(hold.detail, new RegExp(`presentation\\.${field}`));
  }
});

test("current v0.5 presentation mode ownership fails closed before later closure", () => {
  const cases = [
    ["dock", { mode: "screen", dock: "left" }, /consumed only by docked/],
    ["anchor", { mode: "screen", anchor: "mt_interface_bundle" }, /consumed only by tile/]
  ];

  for (const [field, presentation, detail] of cases) {
    const request = currentInterfaceRequest();
    request.inputs[2].candidate.operations[1].presentation = presentation;
    const out = run(request);
    assert.equal(out.status, "HOLD", `${field} should remain owned by its consuming presentation mode`);
    const hold = out.holds.find((item) => item.code === "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID");
    assert.ok(hold, `${field} should fail in the Interface operation contract before later closure`);
    assert.match(hold.detail, detail);
  }
});

test("holds a valid bundle when compatible matter never declared ui_panel", () => {
  const request = requestWithBundle();
  request.inputs[0].candidate.form_hints = request.inputs[0].candidate.form_hints.filter((hint) => hint !== "ui_panel");
  const out = run(request);
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds.some((hold) => hold.code === "HOLD_VIEW_TARGET_FORM_MISSING"), true);
});

test("holds future bundle fields instead of silently dropping them", () => {
  const request = requestWithBundle();
  request.inputs[2].candidate.authority_snapshot = { count: 42 };
  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID");
  assert.deepEqual(hold.fields, ["authority_snapshot"]);
});

test("holds extra operations instead of becoming an arbitrary operation composer", () => {
  const request = requestWithBundle();
  request.inputs[2].candidate.operations.push({ op: "frame.set", id: "mt_interface_bundle", place: [1, 2, 3] });
  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID");
  assert.equal(hold.operation_count, 3);
});

test("holds presentation fields outside the current proven Interface contract", () => {
  const request = requestWithBundle();
  request.inputs[2].candidate.operations[1].presentation.hidden_authority = true;
  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID");
  assert.deepEqual(hold.fields, ["hidden_authority"]);
});

test("holds bundles whose operations address different targets", () => {
  const request = requestWithBundle();
  request.inputs[2].candidate.operations[1].id = "mt_other";
  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID");
  assert.deepEqual(hold.targets, ["mt_interface_bundle", "mt_other"]);
});

test("a pre-existing different presentation conflicts instead of being overwritten", () => {
  const request = requestWithBundle();
  request.inputs[0].candidate.presentation = { mode: "screen" };
  const out = run(request);
  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_ASSEMBLY_CONFLICT");
  assert.deepEqual(hold.paths, ["presentation"]);
});
