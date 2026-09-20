"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const interfacePath = process.env.INTERFACE_PROOF_MACHINE_PATH;
const interfaceCommit = process.env.INTERFACE_PROOF_COMMIT;
const capabilityPath = process.env.CAPABILITY_MACHINE_PATH;
const runtimePath = process.env.MORPHTILE_CORE_PATH;
const EXPECTED_INTERFACE_COMMIT = "3c715d8aa0138472000472d584f990a88a543ecf";
const EXPECTED_MORPHTILE_COMMIT = "d2d2df0e4ad88f1cda885e3eb1394151515e7946";

const MT = runtimePath ? require(runtimePath) : null;
const authorInterface = interfacePath ? require(path.resolve(interfacePath)).run : null;
const authorCapability = capabilityPath ? require(path.resolve(capabilityPath)).run : null;

function request(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-interface-proof-kit-integration" }
  };
}

function uiTile() {
  return {
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      id: "mt_panel",
      name: "Proof panel",
      form_hints: ["ui_panel"],
      facets: {}
    },
    provenance: { caller: "explicit-ui-panel-base" }
  };
}

function interfaceOutput(tilePath = "mt_panel", placement) {
  const intent = {
    tile_path: tilePath,
    title: "Counter",
    elements: [
      { kind: "readout", binding: "count", label: "Count" },
      { kind: "action", binding: "increment", label: "Increment" }
    ],
    bindings: { readouts: ["count"], actions: ["increment"], controls: [] }
  };
  if (placement) intent.placement = placement;
  return authorInterface(request(
    "interface-proof-kit-" + tilePath.replaceAll("/", "-") + (placement ? "-placement" : ""),
    "Author a panel whose bindings remain explicit proof obligations until Assembly sees the complete target",
    intent
  ));
}

function capabilityOutput() {
  return authorCapability(request(
    "capability-proof-kit",
    "Create the canonical count state and increment input signal required by the interface",
    { kind: "counter", initial: 3 }
  ));
}

function assembleInputs(inputs, id, intent = {}) {
  return assemble({
    envelope_version: "0.1",
    request_id: id,
    goal: "Assemble a complete portable UI tile without dropping target proof closure",
    intent: { id: "mt_panel", name: "Proof panel", ...intent },
    inputs,
    provenance: { caller: "assembly-interface-proof-kit-integration" }
  });
}

function applyImported(receiver, imported) {
  for (const operation of imported.ops || []) MT.applyStructOp(receiver, operation);
}

test("exact Interface target proof is discharged against staged MorphTile matter before kit export", { skip: !MT || !authorInterface || !authorCapability }, () => {
  assert.equal(interfaceCommit, EXPECTED_INTERFACE_COMMIT, "CI Interface proof checkout must match the exact integrated Interface head");
  assert.equal(process.env.MORPHTILE_COMMIT, EXPECTED_MORPHTILE_COMMIT, "CI MorphTile checkout must match the exact current runtime head");

  const interfaceOut = interfaceOutput();
  const capabilityOut = capabilityOutput();
  assert.equal(interfaceOut.status, "CANDIDATE", JSON.stringify(interfaceOut.holds));
  assert.equal(capabilityOut.status, "CANDIDATE", JSON.stringify(capabilityOut.holds));
  assert.deepEqual(interfaceOut.dependencies.map((item) => item.kind), ["morphtile.interface-target-proof/v0.1"]);

  const assembled = assembleInputs([uiTile(), capabilityOut, interfaceOut], "assembly-proof-kit-complete");
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.equal(assembled.dependencies.length, 1);
  assert.equal(assembled.closure_hash.scope, "candidate+dependencies+world_requirements");

  const portable = materializeKit(assembled, MT, { name: "Verified proof panel" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  assert.equal(portable.dependency_resolution.length, 1);
  assert.equal(portable.dependency_resolution[0].status, "SATISFIED");
  assert.equal(portable.dependency_resolution[0].proof_scope, "staged_morphtile_world");
  assert.equal(portable.dependency_resolution[0].id, "morphtile.interface-target-proof:mt_panel");
  assert.deepEqual(portable.dependency_resolution[0].proven, {
    tile_exists: true,
    form_hints_include: ["ui_panel"],
    readout_logic_vars: ["count"],
    control_param_ids: [],
    action_input_signal_socket_ids: ["increment"]
  });
  assert.equal(typeof portable.dependency_resolution[0].resolved_tile_sha256, "string");
  assert.deepEqual(portable.source_closure_hash, assembled.closure_hash);

  const receiver = MT.createWorld("Proof receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY");
  const add = imported.ops.find((operation) => operation.op === "tile.add");
  assert.ok(add);
  assert.equal(add.tile.facets.logic.data.vars.count, 3);
  assert.equal(add.tile.facets.connect.sockets.some((socket) => socket.id === "increment" && socket.kind === "signal" && socket.dir === "in"), true);
  assert.deepEqual(add.tile.view, assembled.candidate.view);
});

test("known target proof that staged MorphTile matter does not satisfy HOLDS instead of disappearing during kit export", { skip: !MT || !authorInterface }, () => {
  assert.equal(interfaceCommit, EXPECTED_INTERFACE_COMMIT, "CI Interface proof checkout must match the exact integrated Interface head");
  const interfaceOut = interfaceOutput();
  const assembled = assembleInputs([uiTile(), interfaceOut], "assembly-proof-kit-incomplete");
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));

  const portable = materializeKit(assembled, MT);
  assert.equal(portable.status, "HOLD");
  assert.equal(portable.holds[0].code, "HOLD_KIT_DEPENDENCY_UNSATISFIED");
  assert.equal(portable.dependency_resolution.length, 1);
  assert.equal(portable.dependency_resolution[0].status, "UNSATISFIED");
  assert.equal(portable.dependency_resolution[0].proof_scope, "staged_morphtile_world");
  assert.deepEqual(portable.dependency_resolution[0].missing, {
    readout_logic_vars: ["count"],
    action_input_signal_socket_ids: ["increment"]
  });
  assert.deepEqual(portable.source_closure_hash, assembled.closure_hash);
});

test("explicit nested target binding cannot be upgraded into portable existence proof when parent context is outside the kit", { skip: !MT || !authorInterface || !authorCapability }, () => {
  assert.equal(interfaceCommit, EXPECTED_INTERFACE_COMMIT, "CI Interface proof checkout must match the exact integrated Interface head");
  const nestedPath = "mt_shell/mt_panel";
  const interfaceOut = interfaceOutput(nestedPath);
  const capabilityOut = capabilityOutput();
  const assembled = assembleInputs(
    [uiTile(), capabilityOut, interfaceOut],
    "assembly-proof-kit-contextual-target",
    { tile_path: nestedPath }
  );
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.deepEqual(assembled.target_binding, { id: "mt_panel", path: nestedPath });
  assert.equal(assembled.dependencies[0].tile_path, nestedPath);

  const portable = materializeKit(assembled, MT);
  assert.equal(portable.status, "HOLD");
  assert.equal(portable.holds[0].code, "HOLD_KIT_DEPENDENCY_UNSATISFIED");
  assert.equal(portable.dependency_resolution[0].status, "UNSATISFIED");
  assert.equal(portable.dependency_resolution[0].proof_scope, "staged_morphtile_world");
  assert.match(portable.dependency_resolution[0].reasons[0], /not present in the isolated MorphTile staging world/);
  assert.match(portable.dependency_resolution[0].reasons[0], /contextual parent matter is not part of this kit/);
});

test("tile presentation anchor proof is discharged only when the exact anchor exists in staged kit matter", { skip: !MT || !authorInterface || !authorCapability }, () => {
  assert.equal(interfaceCommit, EXPECTED_INTERFACE_COMMIT, "CI Interface proof checkout must match the exact integrated Interface head");
  const interfaceOut = interfaceOutput("mt_panel", { mode: "tile", anchor: "mt_panel", user_adjustable: false });
  const capabilityOut = capabilityOutput();
  assert.equal(interfaceOut.status, "CANDIDATE", JSON.stringify(interfaceOut.holds));
  assert.deepEqual(interfaceOut.dependencies.map((item) => item.kind), [
    "morphtile.interface-target-proof/v0.1",
    "morphtile.presentation-anchor-proof/v0.1"
  ]);

  const assembled = assembleInputs([uiTile(), capabilityOut, interfaceOut], "assembly-proof-kit-self-anchor");
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  const portable = materializeKit(assembled, MT, { name: "Self-anchored proof panel" });
  assert.equal(portable.status, "CANDIDATE", JSON.stringify(portable.holds));
  assert.equal(portable.dependency_resolution.length, 2);
  assert.equal(portable.dependency_resolution.every((receipt) => receipt.status === "SATISFIED"), true);
  const anchorReceipt = portable.dependency_resolution.find((receipt) => receipt.kind === "morphtile.presentation-anchor-proof/v0.1");
  assert.ok(anchorReceipt);
  assert.equal(anchorReceipt.proof_scope, "staged_morphtile_world");
  assert.deepEqual(anchorReceipt.anchor, { id: "mt_panel", path: "mt_panel" });
  assert.deepEqual(anchorReceipt.proven, { tile_exists: true });
  assert.equal(typeof anchorReceipt.resolved_anchor_sha256, "string");

  const receiver = MT.createWorld("Anchor receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(portable.kit)));
  assert.equal(imported.status, "READY");
  applyImported(receiver, imported);
  const presentation = MT.resolvePresentation(receiver, "mt_panel");
  assert.equal(presentation.status, "READY", JSON.stringify(presentation));
  assert.equal(presentation.anchor_frame.anchor, "mt_panel");
});

test("presentation anchor outside staged kit matter remains an explicit HOLD", { skip: !MT || !authorInterface || !authorCapability }, () => {
  assert.equal(interfaceCommit, EXPECTED_INTERFACE_COMMIT, "CI Interface proof checkout must match the exact integrated Interface head");
  const interfaceOut = interfaceOutput("mt_panel", { mode: "tile", anchor: "mt_shell/mt_mount", user_adjustable: false });
  const capabilityOut = capabilityOutput();
  const assembled = assembleInputs([uiTile(), capabilityOut, interfaceOut], "assembly-proof-kit-external-anchor");
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  assert.equal(assembled.dependencies.length, 2);

  const portable = materializeKit(assembled, MT);
  assert.equal(portable.status, "HOLD");
  assert.equal(portable.holds[0].code, "HOLD_KIT_DEPENDENCY_UNSATISFIED");
  const targetReceipt = portable.dependency_resolution.find((receipt) => receipt.kind === "morphtile.interface-target-proof/v0.1");
  const anchorReceipt = portable.dependency_resolution.find((receipt) => receipt.kind === "morphtile.presentation-anchor-proof/v0.1");
  assert.equal(targetReceipt.status, "SATISFIED");
  assert.equal(anchorReceipt.status, "UNSATISFIED");
  assert.equal(anchorReceipt.proof_scope, "staged_morphtile_world");
  assert.match(anchorReceipt.reasons[0], /not present in the isolated MorphTile staging world/);
  assert.match(anchorReceipt.reasons[0], /external or parent world context is not part of this kit/);
});

test("proof for a different canonical target cannot be discharged by matching local matter", { skip: !MT }, () => {
  const assembled = assembleInputs([uiTile()], "assembly-proof-kit-target-mismatch");
  assembled.dependencies = [{
    id: "morphtile.interface-target-proof:other/mt_panel",
    kind: "morphtile.interface-target-proof/v0.1",
    tile_path: "other/mt_panel",
    requires: {
      tile_exists: true,
      form_hints_include: ["ui_panel"],
      readout_logic_vars: [],
      control_param_ids: [],
      action_input_signal_socket_ids: []
    }
  }];

  const portable = materializeKit(assembled, MT);
  assert.equal(portable.status, "HOLD");
  assert.equal(portable.holds[0].code, "HOLD_KIT_DEPENDENCY_UNSATISFIED");
  assert.match(portable.dependency_resolution[0].reasons[0], /does not equal the explicitly assembled target/);
});
