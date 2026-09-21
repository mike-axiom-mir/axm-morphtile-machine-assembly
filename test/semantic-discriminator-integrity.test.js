const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.assembly.json");
const { run } = require("../src");
const {
  resolveInterfaceTargetProof,
  resolvePresentationAnchorProof
} = require("../src/kit");

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function structured(value = "authored") {
  return { value, toString: null, valueOf: null };
}

function nullProtoStructured(value = "authored") {
  const out = Object.create(null);
  out.value = value;
  out.toString = null;
  out.valueOf = null;
  return out;
}

test("structured upstream status HOLDs without primitive coercion", () => {
  const request = copy(baseRequest);
  request.request_id = "structured-upstream-status";
  request.inputs[0].status = structured("CANDIDATE");

  let out;
  assert.doesNotThrow(() => { out = run(request); });
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds.some((hold) => hold.code === "HOLD_INPUT_STATUS_INVALID"), true);
});

test("structured facet identity HOLDs before computed-property coercion", () => {
  const request = copy(baseRequest);
  request.request_id = "structured-facet-identity";
  request.inputs.push({
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.facet-candidate/v0.4",
      facet: structured("mesh"),
      value: { type: "primitive", data: { shape: "box" } }
    }
  });

  let out;
  assert.doesNotThrow(() => { out = run(request); });
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds.some((hold) => hold.code === "HOLD_FACET_CANDIDATE_ID_INVALID"), true);
});

test("structured Interface operation discriminator HOLDs before property-key coercion", () => {
  const request = copy(baseRequest);
  request.request_id = "structured-interface-op";
  request.intent = { id: "mt_structured_op", name: "Structured op proof" };
  request.inputs[0].candidate.form_hints.push("ui_panel");
  request.inputs.push({
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.interface-operations/v0.4",
      operations: [
        { op: structured("view.set"), id: "mt_structured_op", view: { title: "No coercion" } },
        { op: "presentation.set", id: "mt_structured_op", presentation: { mode: "screen" } }
      ]
    }
  });

  let out;
  assert.doesNotThrow(() => { out = run(request); });
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds.some((hold) => hold.code === "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID"), true);
});

test("structured Interface proof dependency id becomes UNSATISFIED without String coercion", () => {
  const dependency = {
    id: nullProtoStructured("proof-id"),
    kind: "morphtile.interface-target-proof/v0.1",
    tile_path: "mt_target",
    requires: {
      tile_exists: true,
      form_hints_include: [],
      readout_logic_vars: [],
      control_param_ids: [],
      action_input_signal_socket_ids: []
    }
  };
  const runtime = { hashOf: () => "sha256:test" };

  let receipt;
  assert.doesNotThrow(() => {
    receipt = resolveInterfaceTargetProof(
      dependency,
      { id: "mt_target" },
      { path: "mt_target" },
      runtime,
      null
    );
  });
  assert.equal(receipt.status, "UNSATISFIED");
  assert.equal(receipt.id, null);
  assert.equal(receipt.reasons.includes("dependency.id must be a non-empty string"), true);
});

test("structured presentation proof dependency id becomes UNSATISFIED without String coercion", () => {
  const dependency = {
    id: nullProtoStructured("anchor-id"),
    kind: "morphtile.presentation-anchor-proof/v0.1",
    anchor_path: "mt_anchor",
    requires: { tile_exists: true }
  };
  const runtime = { hashOf: () => "sha256:test" };

  let receipt;
  assert.doesNotThrow(() => {
    receipt = resolvePresentationAnchorProof(
      dependency,
      { id: "mt_target", presentation: { mode: "tile", anchor: "mt_anchor" } },
      runtime,
      null
    );
  });
  assert.equal(receipt.status, "UNSATISFIED");
  assert.equal(receipt.id, null);
  assert.equal(receipt.reasons.includes("dependency.id must be a non-empty string"), true);
});
