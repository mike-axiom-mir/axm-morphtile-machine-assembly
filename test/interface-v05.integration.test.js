"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

const paths = {
  form: process.env.FORM_MACHINE_PATH,
  interfaceV05: process.env.INTERFACE_V05_MACHINE_PATH,
  core: process.env.MORPHTILE_CORE_PATH
};
const ready = Object.values(paths).every(Boolean);

function req(id, goal, intent) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal,
    intent,
    provenance: { caller: "assembly-interface-v05-integration" }
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

function formCandidate(Form, id) {
  const out = Form.run(req(id, "Create a bounded form for Interface v0.5 Assembly proof", {
    shape: "box",
    name: "Interface v0.5 proof",
    size: [1, 1, 1]
  }));
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  return out;
}

function nestedElements() {
  return [{
    kind: "group",
    children: [{
      kind: "row",
      children: [
        { kind: "text", text: "Nested left" },
        { kind: "text", text: "Nested right" }
      ]
    }]
  }];
}

test("exact Interface v0.5 nested view + presentation survives Assembly, kit materialization, and verified import", { skip: !ready }, () => {
  const Form = require(path.resolve(paths.form));
  const Interface = require(path.resolve(paths.interfaceV05));
  const MT = require(path.resolve(paths.core));

  const form = formCandidate(Form, "form-interface-v05-bundle");
  const interfaceOut = Interface.run(req(
    "interface-v05-bundle",
    "Create nested relative Interface v0.5 matter with placement",
    {
      tile_path: "mt_interface_v05_bundle",
      title: "Nested interface",
      elements: nestedElements(),
      placement: {
        mode: "docked",
        dock: "right",
        preferred_size: [360, 640],
        user_adjustable: true
      }
    }
  ));

  assert.equal(interfaceOut.status, "CANDIDATE", JSON.stringify(interfaceOut.holds));
  assert.equal(interfaceOut.candidate.schema, "morphtile.interface-operations/v0.5");
  assert.deepEqual(interfaceOut.candidate.operations.map((operation) => operation.op), ["view.set", "presentation.set"]);

  const raw = assemble({
    envelope_version: "0.1",
    request_id: "assembly-interface-v05-no-eligibility",
    goal: "Do not invent ui_panel eligibility for Interface v0.5",
    intent: { id: "mt_interface_v05_bundle", name: "Nested interface" },
    inputs: [form, interfaceOut],
    provenance: { caller: "assembly-interface-v05-integration" }
  });
  assert.equal(raw.status, "HOLD");
  assert.equal(raw.holds.some((hold) => hold.code === "HOLD_VIEW_TARGET_FORM_MISSING"), true);

  const combined = assemble({
    envelope_version: "0.1",
    request_id: "assembly-interface-v05-bundle",
    goal: "Preserve exact Interface v0.5 nested matter once ui_panel eligibility is explicit",
    intent: { id: "mt_interface_v05_bundle", name: "Nested interface" },
    inputs: [form, interfaceOut, uiEligibility()],
    provenance: { caller: "assembly-interface-v05-integration" }
  });

  assert.equal(combined.status, "CANDIDATE", JSON.stringify(combined.holds));
  assert.deepEqual(combined.candidate.view, interfaceOut.candidate.operations[0].view);
  assert.deepEqual(combined.candidate.presentation, interfaceOut.candidate.operations[1].presentation);
  assert.equal(combined.source_provenance[1].candidate_schema, "morphtile.interface-operations/v0.5");
  assert.equal(combined.warnings.some((entry) => entry.code === "UPSTREAM_WARNING" && entry.warning.code === "TARGET_MUST_EXIST_AND_DECLARE_UI_PANEL"), true);

  const kitResult = materializeKit(combined, MT, { name: "Interface v0.5 Assembly kit" });
  assert.equal(kitResult.status, "CANDIDATE", JSON.stringify(kitResult.holds));
  assert.deepEqual(kitResult.kit.tile.view, combined.candidate.view);
  assert.deepEqual(kitResult.kit.tile.presentation, combined.candidate.presentation);

  const receiver = MT.createWorld("Interface v0.5 receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(kitResult.kit)));
  assert.equal(imported.status, "READY", JSON.stringify(imported));
  const add = imported.ops.find((operation) => operation.op === "tile.add");
  assert.ok(add && add.tile, "verified import must carry tile.add matter");
  assert.deepEqual(add.tile.view, combined.candidate.view);
  assert.deepEqual(add.tile.presentation, combined.candidate.presentation);
});

test("exact Interface v0.5 view-only schema folds without widening beyond addressed view.set", { skip: !ready }, () => {
  const Form = require(path.resolve(paths.form));
  const Interface = require(path.resolve(paths.interfaceV05));
  const form = formCandidate(Form, "form-interface-v05-view");
  const interfaceOut = Interface.run(req(
    "interface-v05-view",
    "Create nested relative Interface v0.5 view matter",
    {
      tile_path: "mt_interface_v05_view",
      title: "Nested view",
      elements: nestedElements()
    }
  ));

  assert.equal(interfaceOut.status, "CANDIDATE", JSON.stringify(interfaceOut.holds));
  assert.equal(interfaceOut.candidate.schema, "morphtile.view-operation/v0.5");

  const combined = assemble({
    envelope_version: "0.1",
    request_id: "assembly-interface-v05-view",
    goal: "Fold only the proven Interface v0.5 view.set transport",
    intent: { id: "mt_interface_v05_view", name: "Nested view" },
    inputs: [form, interfaceOut, uiEligibility()],
    provenance: { caller: "assembly-interface-v05-integration" }
  });

  assert.equal(combined.status, "CANDIDATE", JSON.stringify(combined.holds));
  assert.deepEqual(combined.candidate.view, interfaceOut.candidate.operation.view);
  assert.equal(combined.source_provenance[1].candidate_schema, "morphtile.view-operation/v0.5");
});

test("Interface v0.5 still fails closed on operation fields outside the proven transport", () => {
  const out = assemble({
    envelope_version: "0.1",
    request_id: "assembly-interface-v05-extra-field",
    goal: "Reject unproven Interface v0.5 operation meaning",
    intent: { id: "mt_interface_v05_extra", name: "Extra field proof" },
    inputs: [
      uiEligibility(),
      {
        status: "CANDIDATE",
        candidate: {
          schema: "morphtile.view-operation/v0.5",
          operation: {
            op: "view.set",
            id: "mt_interface_v05_extra",
            view: { title: "View", body: [{ text: "safe" }] },
            authority_snapshot: { hidden: true }
          }
        }
      }
    ],
    provenance: { caller: "assembly-interface-v05-integration" }
  });

  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_VIEW_OPERATION_SHAPE_INVALID");
  assert.deepEqual(hold.fields, ["authority_snapshot"]);
});

test("future Interface v0.6 remains unsupported until separately proven", () => {
  const out = assemble({
    envelope_version: "0.1",
    request_id: "assembly-interface-v06-held",
    goal: "Keep future Interface schemas explicit",
    intent: { id: "mt_interface_v06", name: "Future schema proof" },
    inputs: [{
      status: "CANDIDATE",
      candidate: {
        schema: "morphtile.view-operation/v0.6",
        operation: { op: "view.set", id: "mt_interface_v06", view: { title: "Future", body: [] } }
      }
    }],
    provenance: { caller: "assembly-interface-v05-integration" }
  });

  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_UNASSEMBLABLE_CANDIDATE_SCHEMA");
  assert.equal(hold.schema, "morphtile.view-operation/v0.6");
  assert.equal(out.held_candidates[0].schema, "morphtile.view-operation/v0.6");
});
