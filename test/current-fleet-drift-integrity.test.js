"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fleet = require("../fixtures/current-fleet.json");
const {
  LANES,
  OBSERVATION_SCHEMA,
  validateFleet,
  validateObservedFleet,
  assessFleetDrift
} = require("../scripts/current-fleet-pins");

function observation(overrides = {}) {
  return {
    schema: OBSERVATION_SCHEMA,
    ...Object.fromEntries(LANES.map((lane) => [lane, fleet[lane]])),
    ...overrides
  };
}

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

test("current-fleet manifest fails closed on authored fields outside its exact identity grammar", () => {
  const extra = { ...fleet, verification: "0".repeat(40) };
  assert.deepEqual(validateFleet(extra), [
    "manifest: unsupported authored field(s): verification"
  ]);
});

test("explicit observed fleet snapshot validates the same exact lane set without gaining authority", () => {
  assert.deepEqual(validateObservedFleet(observation()), []);

  const missing = observation();
  delete missing.interface;
  assert.deepEqual(validateObservedFleet(missing), [
    "interface: expected an exact lowercase 40-character observed commit sha"
  ]);

  const extra = observation({ verification: "1".repeat(40) });
  assert.deepEqual(validateObservedFleet(extra), [
    "observation: unsupported authored field(s): verification"
  ]);
});

test("matching explicit observation passes without rewriting the pinned manifest", () => {
  const pinned = copy(fleet);
  const observed = observation();
  const beforePinned = copy(pinned);
  const beforeObserved = copy(observed);

  const result = assessFleetDrift(pinned, observed);

  assert.deepEqual(result, {
    status: "PASS",
    drift: [],
    holds: []
  });
  assert.deepEqual(pinned, beforePinned);
  assert.deepEqual(observed, beforeObserved);
});

test("observed producer movement becomes explicit HOLD evidence and never auto-advances pins", () => {
  const pinned = copy(fleet);
  const observedForm = fleet.form === "f".repeat(40) ? "e".repeat(40) : "f".repeat(40);
  const observed = observation({ form: observedForm });
  const beforePinned = copy(pinned);

  const result = assessFleetDrift(pinned, observed);

  assert.equal(result.status, "HOLD");
  assert.deepEqual(result.drift, ["form"]);
  assert.deepEqual(result.holds, [{
    code: "HOLD_CURRENT_FLEET_DRIFT",
    lane: "form",
    pinned_commit: fleet.form,
    observed_commit: observedForm,
    detail: "Observed integrated identity differs from the pinned Assembly current-fleet receipt; inspection may justify a new candidate, but this comparison does not advance authority or rewrite the manifest."
  }]);
  assert.deepEqual(pinned, beforePinned, "drift assessment must never mutate or auto-canonize the pinned fleet");
});

test("invalid observations HOLD as invalid evidence instead of being interpreted as drift", () => {
  const observed = observation();
  observed.surface = "not-a-sha";

  const result = assessFleetDrift(fleet, observed);

  assert.equal(result.status, "HOLD");
  assert.deepEqual(result.drift, []);
  assert.deepEqual(result.holds, [{
    code: "HOLD_CURRENT_FLEET_OBSERVATION_INVALID",
    errors: ["surface: expected an exact lowercase 40-character observed commit sha"],
    detail: "Observed fleet identity evidence is malformed or incomplete; Assembly will not compare, infer movement, or advance pins from it."
  }]);
});
