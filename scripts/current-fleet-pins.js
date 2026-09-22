"use strict";

const LANES = Object.freeze(["form", "surface", "capability", "interface", "core"]);
const SCHEMA = "axm.morphtile.assembly-current-fleet/v1";
const OBSERVATION_SCHEMA = "axm.morphtile.assembly-current-fleet-observation/v1";
const EXACT_SHA = /^[0-9a-f]{40}$/;
const MANIFEST_FIELDS = new Set(["schema", ...LANES]);

function unsupportedFields(value) {
  return Object.getOwnPropertyNames(value).filter((key) => !MANIFEST_FIELDS.has(key)).sort();
}

function ownDataValue(value, key) {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, "value")) {
    return { present: false, value: undefined };
  }
  return { present: true, value: descriptor.value };
}

function validateFleet(fleet) {
  if (!fleet || typeof fleet !== "object" || Array.isArray(fleet)) {
    return ["manifest: expected a plain object-like record"];
  }

  const errors = [];
  const unexpected = unsupportedFields(fleet);
  if (unexpected.length) {
    errors.push(`manifest: unsupported authored field(s): ${unexpected.join(", ")}`);
  }
  const schema = ownDataValue(fleet, "schema");
  if (!schema.present || schema.value !== SCHEMA) {
    errors.push(`manifest: schema must equal ${SCHEMA}`);
  }

  for (const lane of LANES) {
    const commit = ownDataValue(fleet, lane);
    if (!commit.present || typeof commit.value !== "string" || !EXACT_SHA.test(commit.value)) {
      errors.push(`${lane}: expected an exact lowercase 40-character commit sha`);
    }
  }

  return errors;
}

function validateObservedFleet(observed) {
  if (!observed || typeof observed !== "object" || Array.isArray(observed)) {
    return ["observation: expected a plain object-like record"];
  }

  const errors = [];
  const unexpected = unsupportedFields(observed);
  if (unexpected.length) {
    errors.push(`observation: unsupported authored field(s): ${unexpected.join(", ")}`);
  }
  const schema = ownDataValue(observed, "schema");
  if (!schema.present || schema.value !== OBSERVATION_SCHEMA) {
    errors.push(`observation: schema must equal ${OBSERVATION_SCHEMA}`);
  }

  for (const lane of LANES) {
    const commit = ownDataValue(observed, lane);
    if (!commit.present || typeof commit.value !== "string" || !EXACT_SHA.test(commit.value)) {
      errors.push(`${lane}: expected an exact lowercase 40-character observed commit sha`);
    }
  }

  return errors;
}

function assessFleetDrift(fleet, observed) {
  const manifestErrors = validateFleet(fleet);
  if (manifestErrors.length) {
    throw new Error(`Invalid current-fleet manifest:\n- ${manifestErrors.join("\n- ")}`);
  }

  const observationErrors = validateObservedFleet(observed);
  if (observationErrors.length) {
    return {
      status: "HOLD",
      drift: [],
      holds: [{
        code: "HOLD_CURRENT_FLEET_OBSERVATION_INVALID",
        errors: observationErrors,
        detail: "Observed fleet identity evidence is malformed or incomplete; Assembly will not compare, infer movement, or advance pins from it."
      }]
    };
  }

  const drift = LANES.filter((lane) => fleet[lane] !== observed[lane]);
  if (!drift.length) {
    return { status: "PASS", drift: [], holds: [] };
  }

  return {
    status: "HOLD",
    drift,
    holds: drift.map((lane) => ({
      code: "HOLD_CURRENT_FLEET_DRIFT",
      lane,
      pinned_commit: fleet[lane],
      observed_commit: observed[lane],
      detail: "Observed integrated identity differs from the pinned Assembly current-fleet receipt; inspection may justify a new candidate, but this comparison does not advance authority or rewrite the manifest."
    }))
  };
}

function outputLines(fleet) {
  const errors = validateFleet(fleet);
  if (errors.length) {
    throw new Error(`Invalid current-fleet manifest:\n- ${errors.join("\n- ")}`);
  }

  return `${LANES.map((lane) => `${lane}=${fleet[lane]}`).join("\n")}\n`;
}

if (require.main === module) {
  const fleet = require("../fixtures/current-fleet.json");
  process.stdout.write(outputLines(fleet));
}

module.exports = {
  LANES,
  SCHEMA,
  OBSERVATION_SCHEMA,
  validateFleet,
  validateObservedFleet,
  assessFleetDrift,
  outputLines
};
