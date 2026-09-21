const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.assembly.json");
const { run } = require("../src");

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

test("authored Assembly intent.name is not rewritten by truthiness or admitted as structured candidate matter", () => {
  for (const [label, value] of [
    ["empty", ""],
    ["null", null],
    ["false", false],
    ["zero", 0],
    ["object", { text: "not-a-name" }]
  ]) {
    const request = copy(baseRequest);
    request.request_id = "assembly-name-" + label;
    request.intent.name = value;
    const before = JSON.stringify(request);

    const out = run(request);

    assert.equal(out.status, "HOLD", label);
    const hold = out.holds.find((item) => item.code === "HOLD_ASSEMBLY_NAME_INVALID");
    assert.ok(hold, label);
    assert.equal(hold.path, "request.intent.name", label);
    assert.match(hold.detail, /authored Assembly name must be a non-empty string/, label);
    assert.equal(JSON.stringify(request), before, label);
  }
});

test("absent Assembly name keeps the established default while a valid authored name survives exactly", () => {
  const absent = copy(baseRequest);
  absent.request_id = "assembly-name-absent-control";
  delete absent.intent.name;
  const absentOut = run(absent);
  assert.equal(absentOut.status, "CANDIDATE");
  assert.equal(absentOut.candidate.name, "Assembled candidate");

  const authored = copy(baseRequest);
  authored.request_id = "assembly-name-authored-control";
  authored.intent.name = "Authored tile name";
  const authoredOut = run(authored);
  assert.equal(authoredOut.status, "CANDIDATE");
  assert.equal(authoredOut.candidate.name, "Authored tile name");
});

test("upstream HOLD collections fail closed when authored with a non-array container", () => {
  for (const [label, value] of [
    ["empty-string", ""],
    ["false", false],
    ["zero", 0],
    ["object", { code: "HOLD_NOT_AN_ARRAY" }]
  ]) {
    const request = copy(baseRequest);
    request.request_id = "assembly-upstream-holds-" + label;
    request.inputs.push({
      envelope_version: "0.1",
      request_id: "held-source-" + label,
      status: "HOLD",
      machine: { id: "axm.morphtile.machine.test", version: "0.1.0" },
      candidate: null,
      holds: value
    });
    const before = JSON.stringify(request);

    const out = run(request);

    assert.equal(out.status, "HOLD", label);
    assert.equal(out.holds[0].code, "HOLD_HOLDS_SHAPE_INVALID", label);
    assert.equal(out.holds[0].path, "request.inputs[2].holds", label);
    assert.equal(JSON.stringify(request), before, label);
  }
});
