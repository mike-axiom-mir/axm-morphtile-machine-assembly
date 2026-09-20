"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function definition(id) {
  return {
    id,
    name: id,
    created_by: "world-requirement-identity-test",
    body: {
      facets: {
        mesh: {
          type: "generated",
          source: null,
          data: {
            generator: "recipe",
            vars: {},
            parts: [{ shape: "plane", size: [1, 1, 1] }]
          }
        }
      }
    }
  };
}

function word(name) {
  return {
    name,
    args: ["x"],
    body: ["var", "x"],
    note: null
  };
}

function candidate() {
  return {
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      name: "Identity closure proof",
      form_hints: ["game_asset"],
      facets: {
        mesh: {
          type: "generated",
          source: null,
          data: {
            generator: "recipe",
            vars: {},
            parts: [{ use: "panel" }]
          }
        }
      }
    }
  };
}

function request(worldRequirements) {
  return {
    envelope_version: "0.1",
    request_id: "world-requirement-identity",
    goal: "Preserve named closure identity without downstream rewrite",
    intent: { id: "mt_world_requirement_identity", name: "Identity closure proof" },
    inputs: [candidate()],
    world_requirements: worldRequirements,
    provenance: { caller: "world-requirement-identity-test" }
  };
}

test("definition map key and explicit embedded id must agree", () => {
  const mismatched = definition("beam");
  const out = run(request({ definitions: { panel: mismatched } }));

  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_DEFINITION_IDENTITY_MISMATCH");
  assert.ok(hold, JSON.stringify(out.holds));
  assert.equal(hold.identity, "panel");
  assert.equal(hold.embedded_identity, "beam");
  assert.deepEqual(out.required_definitions, ["panel"]);
  assert.deepEqual(out.world_requirements.definitions.panel, mismatched, "conflicting authored identity must remain inspectable, not rewritten");
});

test("word map key and explicit embedded name must agree", () => {
  const req = request({
    definitions: { panel: definition("panel") },
    words: { clamp: word("mix") }
  });
  const out = run(req);

  assert.equal(out.status, "HOLD");
  const hold = out.holds.find((item) => item.code === "HOLD_WORD_IDENTITY_MISMATCH");
  assert.ok(hold, JSON.stringify(out.holds));
  assert.equal(hold.identity, "clamp");
  assert.equal(hold.embedded_identity, "mix");
  assert.deepEqual(out.world_requirements.words.clamp, req.world_requirements.words.clamp, "authored word identity must remain inspectable, not rewritten");
});

test("matching explicit word and definition identities remain deterministic candidate content", () => {
  const req = request({
    definitions: { panel: definition("panel") },
    words: { clamp: word("clamp") }
  });
  const before = JSON.stringify(req);
  const first = run(req);
  const second = run(req);

  assert.equal(first.status, "CANDIDATE", JSON.stringify(first.holds));
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(req), before, "Assembly must not mutate caller closure while validating identities");
  assert.deepEqual(first.required_definitions, ["panel"]);
  assert.equal(first.world_requirements.definitions.panel.id, "panel");
  assert.equal(first.world_requirements.words.clamp.name, "clamp");
  assert.match(first.closure_hash.value, /^[0-9a-f]{64}$/);
});

test("absence of an embedded identity remains compatible; only contradictory explicit identity HOLDS", () => {
  const implicit = definition("panel");
  delete implicit.id;
  const out = run(request({ definitions: { panel: implicit } }));

  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(out.required_definitions, ["panel"]);
  assert.equal(Object.prototype.hasOwnProperty.call(out.world_requirements.definitions.panel, "id"), false);
});
