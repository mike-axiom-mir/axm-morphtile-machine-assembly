"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fixture = require("../fixtures/request.assembly.json");
const { run } = require("../src");
const { materializeKit } = require("../src/kit");

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeTest = runtimePath ? test : test.skip;

function requestWithWords(words) {
  const request = JSON.parse(JSON.stringify(fixture));
  request.request_id = "kit-application-proof";
  request.intent = { id: "mt_kit_application_proof", name: "Kit application proof" };
  request.world_requirements = { words };
  return request;
}

runtimeTest("kit materialization HOLDS when READY import operations cannot actually be applied by the supplied runtime", () => {
  const MT = require(path.resolve(runtimePath));
  const assembled = run(requestWithWords({
    "2legs": { name: "2legs", args: [], body: 1, note: null }
  }));

  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));

  const materialized = materializeKit(assembled, MT, { name: "Invalid runtime word must not become a portable kit" });
  assert.equal(materialized.status, "HOLD");
  assert.equal(materialized.kit, null);
  assert.equal(materialized.holds[0].code, "HOLD_KIT_RUNTIME_APPLY_FAILED");
  assert.equal(materialized.holds[0].operation_index, 0);
  assert.equal(materialized.holds[0].operation.op, "word.define");
  assert.equal(materialized.holds[0].operation.name, "2legs");
  assert.match(materialized.holds[0].error, /word needs a plain name/);
});

runtimeTest("complete receiver application proof keeps an ordinary portable word kit compatible", () => {
  const MT = require(path.resolve(runtimePath));
  const assembled = run(requestWithWords({
    ease: { name: "ease", args: ["x"], body: ["var", "x"], note: "identity proof" }
  }));

  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));
  const materialized = materializeKit(assembled, MT, { name: "Valid runtime word application proof" });

  assert.equal(materialized.status, "CANDIDATE", JSON.stringify(materialized.holds));
  assert.equal(materialized.evidence.some((entry) => entry.kind === "KIT_APPLY" && entry.status === "PASS"), true);
  assert.equal(materialized.kit.words.ease.name, "ease");
});

runtimeTest("kit materialization HOLDS when READY operations return without installing the receiver closure", () => {
  const MT = require(path.resolve(runtimePath));
  const assembled = run(requestWithWords({
    ease: { name: "ease", args: ["x"], body: ["var", "x"], note: "receiver closure proof" }
  }));
  assert.equal(assembled.status, "CANDIDATE", JSON.stringify(assembled.holds));

  const silentRuntime = Object.assign({}, MT, {
    applyStructOp() {}
  });
  const materialized = materializeKit(assembled, silentRuntime, { name: "Silent apply must not count as receiver closure" });

  assert.equal(materialized.status, "HOLD");
  assert.equal(materialized.kit, null);
  assert.equal(materialized.holds[0].code, "HOLD_KIT_RUNTIME_RECEIVER_INCOMPLETE");
});
