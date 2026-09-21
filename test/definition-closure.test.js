const test = require("node:test");
const assert = require("node:assert/strict");
const { inspectDefinitionClosure, run } = require("../src");

function request(candidate, definitions) {
  const out = {
    envelope_version: "0.1",
    request_id: "definition-closure",
    goal: "assemble definition-backed matter without losing closure",
    intent: { id: "mt_definition_closure", name: "Definition closure proof" },
    inputs: [{
      envelope_version: "0.1",
      request_id: "upstream-form",
      machine: { id: "axm.morphtile.machine.form", version: "0.5.0" },
      status: "CANDIDATE",
      candidate,
      warnings: [{ code: "DEFINITION_RUNTIME_RESOLUTION_REQUIRED" }],
      evidence: [],
      holds: []
    }]
  };
  if (definitions) out.world_requirements = { definitions };
  return out;
}

function definition(id, parts) {
  return {
    id,
    name: id,
    created_by: "definition-closure-test",
    body: {
      facets: {
        mesh: {
          type: "generated",
          source: null,
          data: { generator: "recipe", vars: {}, parts }
        }
      }
    }
  };
}

function formCandidate(parts) {
  return {
    schema: "morphtile.tile-spec/v0.4",
    name: "Definition-backed form",
    form_hints: ["game_asset"],
    facets: {
      mesh: {
        type: "generated",
        source: null,
        data: { generator: "recipe", vars: {}, parts }
      }
    }
  };
}

test("definition-backed candidate HOLDS until its direct definition closure is supplied", () => {
  const candidate = formCandidate([{ use: "panel", with: { width: 2 } }]);
  const held = run(request(candidate));
  assert.equal(held.status, "HOLD");
  const closureHold = held.holds.find((item) => item.code === "HOLD_DEFINITION_CLOSURE_INCOMPLETE");
  assert.deepEqual(closureHold.missing, ["panel"]);
  assert.deepEqual(closureHold.required, ["panel"]);
  assert.deepEqual(held.required_definitions, ["panel"]);
  assert.equal(held.warnings.some((entry) => entry.code === "UPSTREAM_WARNING" && entry.warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"), true);

  const complete = run(request(candidate, {
    panel: definition("panel", [{ shape: "plane", size: [1, 1, 1] }])
  }));
  assert.equal(complete.status, "CANDIDATE", JSON.stringify(complete.holds));
  assert.deepEqual(complete.required_definitions, ["panel"]);
});

test("definition closure follows nested recipe use references transitively and sorts the receipt", () => {
  const candidate = formCandidate([{ repeat: 2, as: "i", body: [{ use: "panel" }] }]);
  const definitions = {
    panel: definition("panel", [{ use: "bolt" }])
  };

  const held = run(request(candidate, definitions));
  assert.equal(held.status, "HOLD");
  const closureHold = held.holds.find((item) => item.code === "HOLD_DEFINITION_CLOSURE_INCOMPLETE");
  assert.deepEqual(closureHold.missing, ["bolt"]);
  assert.deepEqual(closureHold.required, ["bolt", "panel"]);

  definitions.bolt = definition("bolt", [{ shape: "cylinder", size: [0.1, 0.1, 0.2] }]);
  const complete = run(request(candidate, definitions));
  assert.equal(complete.status, "CANDIDATE", JSON.stringify(complete.holds));
  assert.deepEqual(complete.required_definitions, ["bolt", "panel"]);
});

test("definition closure requires authored own definitions instead of inherited host keys", () => {
  const candidate = formCandidate([{ use: "__proto__" }]);
  assert.deepEqual(inspectDefinitionClosure(candidate, null), {
    required: ["__proto__"],
    missing: ["__proto__"]
  });

  const held = run(request(candidate));
  assert.equal(held.status, "HOLD");
  const closureHold = held.holds.find((item) => item.code === "HOLD_DEFINITION_CLOSURE_INCOMPLETE");
  assert.deepEqual(closureHold.missing, ["__proto__"]);
  assert.deepEqual(closureHold.required, ["__proto__"]);
});

test("definition and defs aliases are both preserved and conflicting authored aliases HOLD", () => {
  const candidate = formCandidate([{ use: "panel" }]);
  const completeRequest = request(candidate);
  completeRequest.world_requirements = {
    definitions: {
      panel: definition("panel", [{ use: "bolt" }])
    },
    defs: {
      bolt: definition("bolt", [{ shape: "cylinder", size: [0.1, 0.1, 0.2] }])
    }
  };

  const complete = run(completeRequest);
  assert.equal(complete.status, "CANDIDATE", JSON.stringify(complete.holds));
  assert.deepEqual(complete.required_definitions, ["bolt", "panel"]);
  assert.equal(complete.world_requirements.definitions.panel.id, "panel");
  assert.equal(complete.world_requirements.definitions.bolt.id, "bolt");

  const conflictRequest = request(candidate);
  conflictRequest.world_requirements = {
    definitions: {
      panel: definition("panel", [{ shape: "plane", size: [1, 1, 1] }])
    },
    defs: {
      panel: definition("panel", [{ shape: "sphere", size: [1, 1, 1] }])
    }
  };

  const held = run(conflictRequest);
  assert.equal(held.status, "HOLD");
  const conflict = held.holds.find((item) => item.code === "HOLD_DEFINITION_CONFLICT");
  assert.equal(conflict.identity, "panel");
  assert.deepEqual(conflict.variants.map((entry) => entry.body.facets.mesh.data.parts[0].shape), ["plane", "sphere"]);
});

test("capability grants_ref participates in the same definition closure rule", () => {
  const closure = inspectDefinitionClosure({
    schema: "morphtile.tile-spec/v0.4",
    facets: {},
    capabilities: [{ id: "detail", name: "Detail", grants_ref: { def: "detail_pack" } }]
  }, null);
  assert.deepEqual(closure, { required: ["detail_pack"], missing: ["detail_pack"] });
});

test("definition requirement discovery is derived metadata and does not change canonical closure identity", () => {
  const candidate = formCandidate([{ use: "panel" }]);
  const definitions = { panel: definition("panel", [{ shape: "plane", size: [1, 1, 1] }]) };
  const first = run(request(candidate, definitions));
  const second = run(request(candidate, definitions));
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.match(first.closure_hash.value, /^[0-9a-f]{64}$/);
});
