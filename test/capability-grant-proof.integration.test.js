"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { materializeKit, resolveInterfaceTargetProof } = require("../src/kit");

const corePath = process.env.MORPHTILE_CORE_PATH;
const coreCommit = process.env.MORPHTILE_COMMIT;
const EXPECTED_CORE = "26b89a77f6a90715a6742dc4d084008ba63731b6";

function sleepingCandidate(socketDir = "in") {
  return {
    id: "mt_sleeping_panel",
    name: "Sleeping panel",
    schema: "morphtile.tile-spec/v0.4",
    form_hints: ["ui_panel"],
    capabilities: [{
      id: "counter",
      wake: { on: "near", within: 4, hysteresis: 1.5 },
      grants: {
        facets: {
          logic: {
            type: "rule",
            data: {
              vars: { count: 7 },
              rules: [{ on: "increment", do: [{ set: ["count", ["+", ["var", "count"], 1]] }] }]
            }
          }
        },
        sockets: [{ id: "increment", kind: "signal", dir: socketDir, signal: "increment", label: "Increment" }]
      }
    }],
    view: {
      type: "panel",
      title: "Sleeping panel",
      elements: [
        { kind: "readout", binding: "count", label: "Count" },
        { kind: "action", binding: "increment", label: "Increment" }
      ]
    }
  };
}

function dependency() {
  return {
    id: "morphtile.interface-target-proof:mt_sleeping_panel",
    kind: "morphtile.interface-target-proof/v0.1",
    tile_path: "mt_sleeping_panel",
    requires: {
      tile_exists: true,
      form_hints_include: ["ui_panel"],
      readout_logic_vars: ["count"],
      control_param_ids: [],
      action_input_signal_socket_ids: ["increment"]
    }
  };
}

function assemblyResult(candidate) {
  return {
    status: "CANDIDATE",
    candidate,
    target_binding: { id: "mt_sleeping_panel", path: "mt_sleeping_panel" },
    dependencies: [dependency()],
    world_requirements: null,
    closure_hash: { algorithm: "sha256", canonicalization: "sorted-key-json/v1", scope: "candidate+dependencies+world_requirements", value: "test" },
    source_provenance: [],
    warnings: []
  };
}

test("staged proof accepts exact input-signal and readout facts declared by a sleeping capability grant without waking it", { skip: !corePath }, () => {
  assert.equal(coreCommit, EXPECTED_CORE);
  const MT = require(path.resolve(corePath));
  const tile = MT.createTile(sleepingCandidate("in"));
  const world = MT.createWorld("Capability grant proof");
  world.tiles[tile.id] = tile;

  assert.equal(MT.isAwake(world, tile.id, "counter"), false, "proof must not wake or mutate the sleeping capability");
  const receipt = resolveInterfaceTargetProof(dependency(), tile, { id: tile.id, path: tile.id }, MT, world);
  assert.equal(receipt.status, "SATISFIED", JSON.stringify(receipt));
  assert.deepEqual(receipt.proven.readout_logic_vars, ["count"]);
  assert.deepEqual(receipt.proven.action_input_signal_socket_ids, ["increment"]);
  assert.equal(MT.isAwake(world, tile.id, "counter"), false, "proof remains a read");
});

test("portable materialization closes the same local Interface proof through declared capability grants", { skip: !corePath }, () => {
  assert.equal(coreCommit, EXPECTED_CORE);
  const MT = require(path.resolve(corePath));
  const out = materializeKit(assemblyResult(sleepingCandidate("in")), MT, { name: "Sleeping panel" });
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.equal(out.dependency_resolution.length, 1);
  assert.equal(out.dependency_resolution[0].status, "SATISFIED");
  assert.equal(out.kit.tile.capabilities[0].id, "counter");
  assert.equal(out.kit.tile.facets.connect.sockets.length, 0, "latent grant must not be rewritten into always-awake base matter");
});

test("an output-only capability grant cannot satisfy Interface input-action authority", { skip: !corePath }, () => {
  assert.equal(coreCommit, EXPECTED_CORE);
  const MT = require(path.resolve(corePath));
  const out = materializeKit(assemblyResult(sleepingCandidate("out")), MT, { name: "Sleeping panel" });
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_KIT_DEPENDENCY_UNSATISFIED");
  assert.deepEqual(out.dependency_resolution[0].missing, { action_input_signal_socket_ids: ["increment"] });
});
