const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.assembly.json");
const { run } = require("../src");
const { materializeKit } = require("../src/kit");

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const MT = runtimePath ? require(runtimePath) : null;

function requestWithWord() {
  const request = JSON.parse(JSON.stringify(baseRequest));
  request.request_id = "assembly-kit-runtime";
  request.inputs[0].world_requirements = {
    words: {
      ease: {
        name: "ease",
        args: ["x"],
        body: ["*", ["var", "x"], ["var", "x"]]
      }
    }
  };
  return request;
}

function requestWithInterfaceBundle() {
  const request = JSON.parse(JSON.stringify(baseRequest));
  request.request_id = "assembly-kit-interface-bundle";
  request.intent = { id: "mt_kit_interface", name: "Kit interface proof" };
  request.inputs[0].candidate.form_hints.push("ui_panel");
  request.inputs.push({
    envelope_version: "0.1",
    request_id: "interface-kit-bundle",
    machine: { id: "axm.morphtile.machine.interface", version: "0.2.0" },
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.interface-operations/v0.4",
      operations: [
        { op: "view.set", id: "mt_kit_interface", view: { title: "Kit UI", body: [{ text: "portable" }] } },
        { op: "presentation.set", id: "mt_kit_interface", presentation: { mode: "floating", preferred_size: [320, 200], user_adjustable: true } }
      ]
    },
    warnings: [{ code: "TARGET_MUST_EXIST_AND_DECLARE_UI_PANEL" }],
    evidence: [],
    holds: []
  });
  return request;
}

test("kit materialization refuses to drop arbitrary dependency closure and preserves source trace on HOLD", () => {
  const request = JSON.parse(JSON.stringify(baseRequest));
  request.request_id = "assembly-kit-dependency-hold";
  request.dependencies = [{ id: "external-pack", ref: "sha256:abc" }];
  const assembled = run(request);
  assert.equal(assembled.status, "CANDIDATE");
  const out = materializeKit(assembled, MT || {});
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, MT ? "HOLD_KIT_DEPENDENCY_UNREPRESENTABLE" : "HOLD_MORPHTILE_RUNTIME_CONTRACT_MISSING");
  assert.deepEqual(out.source_closure_hash, assembled.closure_hash);
  assert.deepEqual(out.source_provenance, assembled.source_provenance);
  assert.deepEqual(out.source_warnings, assembled.warnings);
});

test("pinned MorphTile runtime accepts the generated complete kit with verified hash and source trace", { skip: !MT }, () => {
  const assembled = run(requestWithWord());
  assert.equal(assembled.status, "CANDIDATE");
  assert.equal(assembled.dependencies.length, 0);

  const out = materializeKit(assembled, MT, { name: "Assembly portable kit" });
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.equal(out.kit.format, "morphtile-kit");
  assert.equal(out.kit.name, "Assembly portable kit");
  assert.equal(out.kit.expect.sha256, MT.hashOf({ tile: out.kit.tile, defs: out.kit.defs, words: out.kit.words }));
  assert.equal(out.kit.expect.words, 1);
  assert.deepEqual(out.kit.expect.missing, []);
  assert.equal(MT.validateTile(out.kit.tile).ok, true);
  assert.deepEqual(out.source_closure_hash, assembled.closure_hash);
  assert.deepEqual(out.source_provenance, assembled.source_provenance);
  assert.deepEqual(out.source_warnings, assembled.warnings);

  const receiver = MT.createWorld("Elsewhere");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(out.kit)));
  assert.equal(imported.status, "READY");
  assert.equal(imported.evidence, "verified_payload_sha256");
  assert.deepEqual(imported.ops.map((op) => op.op), ["word.define", "tile.add"]);
  assert.equal(out.runtime_contract.engine_version, MT.VERSION);
});

test("source provenance is inspectable but intentionally outside MorphTile kit content identity", { skip: !MT }, () => {
  const assembled = run(requestWithWord());
  const first = materializeKit(assembled, MT);
  assert.equal(first.status, "CANDIDATE", JSON.stringify(first.holds));

  const traced = JSON.parse(JSON.stringify(assembled));
  traced.source_provenance.push({ input: 99, provenance: { audit: "different transport history" } });
  traced.warnings.push({ code: "TRACE_ONLY_WARNING" });
  const second = materializeKit(traced, MT);
  assert.equal(second.status, "CANDIDATE", JSON.stringify(second.holds));

  assert.equal(second.kit.expect.sha256, first.kit.expect.sha256);
  assert.notDeepEqual(second.source_provenance, first.source_provenance);
  assert.notDeepEqual(second.source_warnings, first.source_warnings);
});

test("Interface view and presentation survive complete kit export and verified fresh-world import", { skip: !MT }, () => {
  const assembled = run(requestWithInterfaceBundle());
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  const out = materializeKit(assembled, MT, { name: "Portable interface kit" });
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(out.kit.tile.view, { title: "Kit UI", body: [{ text: "portable" }] });
  assert.deepEqual(out.kit.tile.presentation, { mode: "floating", preferred_size: [320, 200], user_adjustable: true });
  assert.equal(out.kit.expect.sha256, MT.hashOf({ tile: out.kit.tile, defs: out.kit.defs, words: out.kit.words }));

  const receiver = MT.createWorld("Interface receiver");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(out.kit)));
  assert.equal(imported.status, "READY");
  assert.equal(imported.evidence, "verified_payload_sha256");
  const add = imported.ops.find((operation) => operation.op === "tile.add");
  assert.deepEqual(add.tile.view, out.kit.tile.view);
  assert.deepEqual(add.tile.presentation, out.kit.tile.presentation);
});

test("pinned runtime rejects semantic kit tampering after materialization", { skip: !MT }, () => {
  const assembled = run(requestWithWord());
  const out = materializeKit(assembled, MT);
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));

  const tampered = JSON.parse(JSON.stringify(out.kit));
  tampered.words.ease.body = ["+", ["var", "x"], 1];
  const imported = MT.importKit(MT.createWorld("Careful"), tampered);
  assert.equal(imported.status, "HOLD_HASH_MISMATCH");
});
