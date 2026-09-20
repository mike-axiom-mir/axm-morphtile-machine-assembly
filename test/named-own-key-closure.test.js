const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function ownMap(entries) {
  const out = Object.create(null);
  for (const [key, value] of entries) out[key] = value;
  return out;
}

function definition(id, parts) {
  return {
    id,
    name: `Definition ${id}`,
    created_by: "assembly-own-key-closure-test",
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

function word(name, value) {
  return { name, args: [], body: value };
}

function request() {
  return {
    envelope_version: "0.1",
    request_id: "assembly-own-key-world-closure",
    goal: "preserve exact own-key identities while assembling named world closure",
    intent: { id: "mt_own_key_closure", name: "Own-key closure proof" },
    inputs: [{
      envelope_version: "0.1",
      request_id: "own-key-form",
      machine: { id: "axm.morphtile.machine.form", version: "test" },
      status: "CANDIDATE",
      candidate: {
        schema: "morphtile.tile-spec/v0.4",
        name: "Own-key definition user",
        form_hints: ["game_asset"],
        facets: {
          mesh: {
            type: "generated",
            source: null,
            data: {
              generator: "recipe",
              vars: {},
              parts: [{ use: "__proto__" }]
            }
          }
        }
      },
      warnings: [],
      holds: []
    }],
    world_requirements: {
      definitions: ownMap([
        ["__proto__", definition("__proto__", [{ use: "constructor" }])],
        ["constructor", definition("constructor", [{ use: "toString" }])],
        ["toString", definition("toString", [{ shape: "plane", size: [1, 1, 1] }])]
      ]),
      words: ownMap([
        ["__proto__", word("__proto__", 1)],
        ["constructor", word("constructor", 2)],
        ["toString", word("toString", 3)]
      ])
    }
  };
}

test("named world closure preserves authored own keys instead of inherited object identities", () => {
  const out = run(request());
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));

  for (const key of ["__proto__", "constructor", "toString"]) {
    assert.equal(Object.prototype.hasOwnProperty.call(out.world_requirements.definitions, key), true, `${key} definition must remain an own entry`);
    assert.equal(out.world_requirements.definitions[key].id, key);
    assert.equal(Object.prototype.hasOwnProperty.call(out.world_requirements.words, key), true, `${key} word must remain an own entry`);
    assert.equal(out.world_requirements.words[key].name, key);
  }

  assert.deepEqual(out.required_definitions, ["__proto__", "constructor", "toString"]);
  assert.equal(out.holds.length, 0);
});
