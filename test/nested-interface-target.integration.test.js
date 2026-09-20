"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const interfacePath = process.env.INTERFACE_NESTED_MACHINE_PATH;
const interfaceCommit = process.env.INTERFACE_NESTED_COMMIT;
const corePath = process.env.MORPHTILE_CORE_PATH;
const coreCommit = process.env.MORPHTILE_COMMIT;
const EXPECTED_INTERFACE_COMMIT = "271fbf2abe6fc214d30076b9417655f084221eac";
const EXPECTED_MORPHTILE_COMMIT = "2bdf8eade1376055473b9cc1b11734b72a5566e5";
const ready = Boolean(interfacePath && corePath);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-nested-interface-integration" }
  };
}

function uiEligibility() {
  return {
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      form_hints: ["ui_panel"],
      facets: {}
    },
    provenance: { caller: "explicit-ui-eligibility" }
  };
}

function nestedInterface(Interface, placement) {
  return Interface.run(req(
    "interface-nested-target",
    "Author interface matter for a nested MorphTile target",
    {
      tile_path: "mt_shell/mt_inner",
      title: "Nested Assembly proof",
      text: "Nested target survives Assembly",
      ...(placement ? { placement } : {})
    }
  ));
}

test("integrated nested Interface target requires explicit Assembly path binding and remains HELD at kit export when parent context is absent", { skip: !ready }, () => {
  assert.equal(interfaceCommit, EXPECTED_INTERFACE_COMMIT, "CI nested Interface checkout must match the exact integrated Interface head");
  assert.equal(coreCommit, EXPECTED_MORPHTILE_COMMIT, "CI MorphTile checkout must match the exact current runtime head");
  const Interface = require(path.resolve(interfacePath));
  const MT = require(path.resolve(corePath));
  const interfaceOut = nestedInterface(Interface, {
    mode: "docked",
    dock: "right",
    preferred_size: [320, 480],
    user_adjustable: true
  });

  assert.equal(interfaceOut.status, "CANDIDATE", JSON.stringify(interfaceOut.holds));
  assert.equal(interfaceOut.candidate.schema, "morphtile.interface-operations/v0.5");
  assert.deepEqual(interfaceOut.candidate.operations.map((operation) => operation.id), ["mt_shell/mt_inner", "mt_shell/mt_inner"]);
  assert.equal(interfaceOut.dependencies.some((dependency) => dependency.kind === "morphtile.interface-target-proof/v0.1"), true);

  const unbound = assemble({
    envelope_version: "0.1",
    request_id: "assembly-nested-unbound",
    goal: "Do not infer nested parent context from a matching local id",
    intent: { id: "mt_inner", name: "Nested target" },
    inputs: [uiEligibility(), interfaceOut],
    provenance: { caller: "assembly-nested-interface-integration" }
  });
  assert.equal(unbound.status, "HOLD");
  assert.equal(unbound.holds.some((hold) => hold.code === "HOLD_INTERFACE_OPERATIONS_TARGET_PATH_UNBOUND"), true);

  const combined = assemble({
    envelope_version: "0.1",
    request_id: "assembly-nested-bound",
    goal: "Fold exact nested Interface matter only with explicit canonical target binding",
    intent: { id: "mt_inner", tile_path: "mt_shell/mt_inner", name: "Nested target" },
    inputs: [uiEligibility(), interfaceOut],
    provenance: { caller: "assembly-nested-interface-integration" }
  });

  assert.equal(combined.status, "CANDIDATE", JSON.stringify(combined.holds));
  assert.deepEqual(combined.target_binding, { id: "mt_inner", path: "mt_shell/mt_inner" });
  assert.deepEqual(combined.candidate.view, interfaceOut.candidate.operations[0].view);
  assert.deepEqual(combined.candidate.presentation, interfaceOut.candidate.operations[1].presentation);

  const kitResult = materializeKit(combined, MT, { name: "Nested Interface Assembly kit" });
  assert.equal(kitResult.status, "HOLD");
  assert.equal(kitResult.holds[0].code, "HOLD_KIT_DEPENDENCY_UNSATISFIED");
  const targetReceipt = kitResult.dependency_resolution.find((receipt) => receipt.kind === "morphtile.interface-target-proof/v0.1");
  assert.ok(targetReceipt);
  assert.equal(targetReceipt.status, "UNSATISFIED");
  assert.equal(targetReceipt.proof_scope, "staged_morphtile_world");
  assert.match(targetReceipt.reasons[0], /not present in the isolated MorphTile staging world/);
  assert.match(targetReceipt.reasons[0], /contextual parent matter is not part of this kit/);
});

test("exact Interface v0.5.1 nested view-only candidate follows the same explicit path boundary", { skip: !ready }, () => {
  assert.equal(interfaceCommit, EXPECTED_INTERFACE_COMMIT, "CI nested Interface checkout must match the exact integrated Interface head");
  const Interface = require(path.resolve(interfacePath));
  const interfaceOut = nestedInterface(Interface, null);
  assert.equal(interfaceOut.status, "CANDIDATE", JSON.stringify(interfaceOut.holds));
  assert.equal(interfaceOut.candidate.schema, "morphtile.view-operation/v0.5");
  assert.equal(interfaceOut.candidate.operation.id, "mt_shell/mt_inner");

  const unbound = assemble({
    envelope_version: "0.1",
    request_id: "assembly-nested-view-unbound",
    goal: "Keep nested view target unbound without explicit path context",
    intent: { id: "mt_inner", name: "Nested target" },
    inputs: [uiEligibility(), interfaceOut]
  });
  assert.equal(unbound.status, "HOLD");
  assert.equal(unbound.holds.some((hold) => hold.code === "HOLD_VIEW_OPERATION_TARGET_PATH_UNBOUND"), true);

  const combined = assemble({
    envelope_version: "0.1",
    request_id: "assembly-nested-view-bound",
    goal: "Fold nested view target after exact path binding",
    intent: { id: "mt_inner", tile_path: "mt_shell/mt_inner", name: "Nested target" },
    inputs: [uiEligibility(), interfaceOut]
  });
  assert.equal(combined.status, "CANDIDATE", JSON.stringify(combined.holds));
  assert.deepEqual(combined.candidate.view, interfaceOut.candidate.operation.view);
});

test("nested target matching compares the full path, not only the leaf id", () => {
  const out = assemble({
    envelope_version: "0.1",
    request_id: "assembly-nested-full-path-mismatch",
    goal: "Reject a different parent path even when the local tile id matches",
    intent: { id: "mt_inner", tile_path: "mt_shell/mt_inner", name: "Nested target" },
    inputs: [
      uiEligibility(),
      {
        status: "CANDIDATE",
        candidate: {
          schema: "morphtile.view-operation/v0.5",
          operation: {
            op: "view.set",
            id: "mt_other_shell/mt_inner",
            view: { title: "Wrong parent", body: [] }
          }
        }
      }
    ]
  });

  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_VIEW_OPERATION_TARGET_MISMATCH");
  assert.equal(hold.target, "mt_other_shell/mt_inner");
  assert.equal(hold.assembled_path, "mt_shell/mt_inner");
});

test("malformed Interface target paths and anchors remain fail-closed", () => {
  for (const invalid of ["/mt_shell/mt_inner", "mt_shell/mt_inner/", "mt_shell//mt_inner", "mt_shell/../mt_inner", "mt_shell/mt inner"]) {
    const out = assemble({
      envelope_version: "0.1",
      request_id: "invalid-target-" + invalid,
      goal: "Reject malformed nested Interface target path",
      intent: { id: "mt_inner", tile_path: "mt_shell/mt_inner", name: "Nested target" },
      inputs: [
        uiEligibility(),
        {
          status: "CANDIDATE",
          candidate: {
            schema: "morphtile.view-operation/v0.5",
            operation: { op: "view.set", id: invalid, view: { title: "Invalid", body: [] } }
          }
        }
      ]
    });
    assert.equal(out.status, "HOLD");
    assert.equal(out.holds.some((hold) => hold.code === "HOLD_VIEW_OPERATION_TARGET_INVALID"), true, invalid);
  }

  const badAnchor = assemble({
    envelope_version: "0.1",
    request_id: "invalid-presentation-anchor",
    goal: "Reject malformed presentation anchor instead of preserving an invalid address",
    intent: { id: "mt_inner", tile_path: "mt_shell/mt_inner", name: "Nested target" },
    inputs: [
      uiEligibility(),
      {
        status: "CANDIDATE",
        candidate: {
          schema: "morphtile.interface-operations/v0.5",
          operations: [
            { op: "view.set", id: "mt_shell/mt_inner", view: { title: "Nested", body: [] } },
            { op: "presentation.set", id: "mt_shell/mt_inner", presentation: { mode: "tile", anchor: "mt_shell//mt_inner" } }
          ]
        }
      }
    ]
  });
  assert.equal(badAnchor.status, "HOLD");
  assert.equal(badAnchor.holds.some((hold) => hold.code === "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID"), true);
});

test("Assembly target path must end in the assembled local id", () => {
  const out = assemble({
    envelope_version: "0.1",
    request_id: "assembly-target-path-id-drift",
    goal: "Reject contradictory local and canonical target identities",
    intent: { id: "mt_other", tile_path: "mt_shell/mt_inner", name: "Contradictory target" },
    inputs: [uiEligibility()]
  });

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds.some((hold) => hold.code === "HOLD_ASSEMBLY_TARGET_PATH_ID_MISMATCH"), true);
  assert.deepEqual(out.target_binding, { id: "mt_other", path: "mt_shell/mt_inner" });
});
