"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fleet = require("../fixtures/current-fleet.json");
const {
  LANES,
  OBSERVATION_SCHEMA,
  validateFleet,
  validateObservedFleet
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
