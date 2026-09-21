const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function requestWithUpstreamHolds(holds) {
  return {
    envelope_version: "0.1",
    request_id: "assembly-upstream-holds",
    goal: "Refuse contradictory upstream candidate authority",
    intent: { id: "held_tile", name: "Held tile" },
    inputs: [{
      envelope_version: "0.1",
      request_id: "upstream-held-candidate",
      machine: { id: "axm.morphtile.machine.form", version: "test" },
      status: "CANDIDATE",
      candidate: {
        schema: "morphtile.tile-spec/v0.4",
        id: "held_tile",
        form_hints: ["game_asset"],
        facets: {}
      },
      holds
    }]
  };
}

test("does not fold a CANDIDATE envelope that still carries upstream HOLD evidence", () => {
  const request = requestWithUpstreamHolds([
    { code: "HOLD_UPSTREAM_UNRESOLVED", detail: "producer still has an unresolved boundary" }
  ]);
  const before = JSON.stringify(request);
  const out = run(request);

  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_INPUT_CANDIDATE_HAS_HOLDS");
  assert.ok(hold);
  assert.equal(hold.input, 0);
  assert.deepEqual(hold.upstream_holds, request.inputs[0].holds);
  assert.equal(JSON.stringify(request), before);
});

test("keeps an explicitly empty upstream HOLD collection compatible", () => {
  const request = requestWithUpstreamHolds([]);
  request.request_id = "assembly-upstream-empty-holds";
  const out = run(request);

  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.holds.length, 0);
});
