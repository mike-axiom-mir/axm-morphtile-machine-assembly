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

test("kit materialization refuses to drop arbitrary dependency closure", () => {
  const request = JSON.parse(JSON.stringify(baseRequest));
  request.request_id = "assembly-kit-dependency-hold";
  request.dependencies = [{ id: "external-pack", ref: "sha256:abc" }];
  const assembled = run(request);
  assert.equal(assembled.status, "CANDIDATE");
  const out = materializeKit(assembled, MT || {});
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, MT ? "HOLD_KIT_DEPENDENCY_UNREPRESENTABLE" : "HOLD_MORPHTILE_RUNTIME_CONTRACT_MISSING");
});

test("pinned MorphTile runtime accepts the generated complete kit with verified hash", { skip: !MT }, () => {
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

  const receiver = MT.createWorld("Elsewhere");
  const imported = MT.importKit(receiver, JSON.parse(JSON.stringify(out.kit)));
  assert.equal(imported.status, "READY");
  assert.equal(imported.evidence, "verified_payload_sha256");
  assert.deepEqual(imported.ops.map((op) => op.op), ["word.define", "tile.add"]);
  assert.equal(out.runtime_contract.engine_version, MT.VERSION);
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
