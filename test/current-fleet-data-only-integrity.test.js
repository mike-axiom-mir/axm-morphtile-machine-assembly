"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fleet = require("../fixtures/current-fleet.json");
const {
  LANES,
  OBSERVATION_SCHEMA,
  validateFleet,
  validateObservedFleet,
  assessFleetDrift,
  outputLines
} = require("../scripts/current-fleet-pins");

function observation() {
  return {
    schema: OBSERVATION_SCHEMA,
    ...Object.fromEntries(LANES.map((lane) => [lane, fleet[lane]]))
  };
}

test("current-fleet manifest requires lane identity to be an own data property without executing getters", () => {
  const candidate = { ...fleet };
  delete candidate.form;
  let reads = 0;
  Object.defineProperty(candidate, "form", {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return fleet.form;
    }
  });

  assert.deepEqual(validateFleet(candidate), [
    "form: expected an exact lowercase 40-character commit sha"
  ]);
  assert.equal(reads, 0, "fleet validation must not execute authored accessors");
});

test("current-fleet manifest does not execute inherited lane getters while rejecting inherited identity", () => {
  let reads = 0;
  const prototype = {};
  Object.defineProperty(prototype, "form", {
    configurable: true,
    get() {
      reads += 1;
      return fleet.form;
    }
  });
  const candidate = Object.create(prototype);
  candidate.schema = fleet.schema;
  candidate.surface = fleet.surface;
  candidate.capability = fleet.capability;
  candidate.interface = fleet.interface;
  candidate.core = fleet.core;

  assert.deepEqual(validateFleet(candidate), [
    "form: expected an exact lowercase 40-character commit sha"
  ]);
  assert.equal(reads, 0, "inherited identity must be rejected without reading prototype code");
});

test("observed-fleet identity must also be own data, not executable accessor evidence", () => {
  const observed = observation();
  delete observed.interface;
  let reads = 0;
  Object.defineProperty(observed, "interface", {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return fleet.interface;
    }
  });

  assert.deepEqual(validateObservedFleet(observed), [
    "interface: expected an exact lowercase 40-character observed commit sha"
  ]);
  assert.equal(reads, 0, "observation validation must not execute authored accessors");
});

test("non-enumerable authored fields cannot hide outside the exact fleet evidence grammar", () => {
  const candidate = { ...fleet };
  Object.defineProperty(candidate, "verification", {
    enumerable: false,
    configurable: true,
    value: "0".repeat(40)
  });
  assert.deepEqual(validateFleet(candidate), [
    "manifest: unsupported authored field(s): verification"
  ]);

  const observed = observation();
  Object.defineProperty(observed, "verification", {
    enumerable: false,
    configurable: true,
    value: "1".repeat(40)
  });
  assert.deepEqual(validateObservedFleet(observed), [
    "observation: unsupported authored field(s): verification"
  ]);
});

test("accepted observation identity is consumed from validated data descriptors without re-entering property lookup", () => {
  const target = observation();
  const reads = [];
  const observed = new Proxy(target, {
    get(object, key, receiver) {
      if (LANES.includes(key)) {
        reads.push(key);
        if (key === "interface") return "1".repeat(40);
      }
      return Reflect.get(object, key, receiver);
    }
  });

  assert.deepEqual(validateObservedFleet(observed), []);
  assert.deepEqual(reads, [], "validation must not execute proxy get traps for lane identity");

  const result = assessFleetDrift(fleet, observed);
  assert.deepEqual(reads, [], "drift assessment must consume the descriptor snapshot rather than ordinary lookup");
  assert.deepEqual(result, {
    status: "PASS",
    drift: [],
    holds: []
  });
});

test("accepted manifest identity is emitted from validated data descriptors without re-entering property lookup", () => {
  const target = JSON.parse(JSON.stringify(fleet));
  const reads = [];
  const manifest = new Proxy(target, {
    get(object, key, receiver) {
      if (LANES.includes(key)) reads.push(key);
      return Reflect.get(object, key, receiver);
    }
  });

  assert.deepEqual(validateFleet(manifest), []);
  assert.deepEqual(reads, [], "validation must not execute proxy get traps for manifest identity");

  const lines = outputLines(manifest);
  assert.deepEqual(reads, [], "pin emission must consume the descriptor snapshot rather than ordinary lookup");
  assert.equal(lines, LANES.map((lane) => `${lane}=${fleet[lane]}`).join("\n") + "\n");
});
