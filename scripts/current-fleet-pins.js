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

function inspectFleetRecord(value, {
  label,
  schema,
  commitLabel
}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      errors: [`${label}: expected a plain object-like record`],
      snapshot: null
    };
  }

  const errors = [];
  const unexpected = unsupportedFields(value);
  if (unexpected.length) {
    errors.push(`${label}: unsupported authored field(s): ${unexpected.join(", ")}`);
  }

  const snapshot = Object.create(null);
  const authoredSchema = ownDataValue(value, "schema");
  if (!authoredSchema.present || authoredSchema.value !== schema) {
    errors.push(`${label}: schema must equal ${schema}`);
  } else {
    snapshot.schema = authoredSchema.value;
  }

  for (const lane of LANES) {
    const commit = ownDataValue(value, lane);
    if (!commit.present || typeof commit.value !== "string" || !EXACT_SHA.test(commit.value)) {
      errors.push(`${lane}: expected an exact lowercase 40-character${commitLabel} commit sha`);
    } else {
      snapshot[lane] = commit.value;
    }
  }

  return {
    errors,
    snapshot: errors.length ? null : Object.freeze(snapshot)
  };
}

function inspectManifest(fleet) {
  return inspectFleetRecord(fleet, {
    label: "manifest",
    schema: SCHEMA,
    commitLabel: ""
  });
}

function inspectObservation(observed) {
  return inspectFleetRecord(observed, {
    label: "observation",
    schema: OBSERVATION_SCHEMA,
    commitLabel: " observed"
  });
}

function validateFleet(fleet) {
  return inspectManifest(fleet).errors;
}

function validateObservedFleet(observed) {
  return inspectObservation(observed).errors;
}

function assessFleetDrift(fleet, observed) {
  const manifest = inspectManifest(fleet);
  if (manifest.errors.length) {
    throw new Error(`Invalid current-fleet manifest:\n- ${manifest.errors.join("\n- ")}`);
  }

  const observation = inspectObservation(observed);
  if (observation.errors.length) {
    return {
      status: "HOLD",
      drift: [],
      holds: [{
        code: "HOLD_CURRENT_FLEET_OBSERVATION_INVALID",
        errors: observation.errors,
        detail: "Observed fleet identity evidence is malformed or incomplete; Assembly will not compare, infer movement, or advance pins from it."
      }]
    };
  }

  const pinned = manifest.snapshot;
  const current = observation.snapshot;
  const drift = LANES.filter((lane) => pinned[lane] !== current[lane]);
  if (!drift.length) {
    return { status: "PASS", drift: [], holds: [] };
  }

  return {
    status: "HOLD",
    drift,
    holds: drift.map((lane) => ({
      code: "HOLD_CURRENT_FLEET_DRIFT",
      lane,
      pinned_commit: pinned[lane],
      observed_commit: current[lane],
      detail: "Observed integrated identity differs from the pinned Assembly current-fleet receipt; inspection may justify a new candidate, but this comparison does not advance authority or rewrite the manifest."
    }))
  };
}

function outputLines(fleet) {
  const manifest = inspectManifest(fleet);
  if (manifest.errors.length) {
    throw new Error(`Invalid current-fleet manifest:\n- ${manifest.errors.join("\n- ")}`);
  }

  return `${LANES.map((lane) => `${lane}=${manifest.snapshot[lane]}`).join("\n")}\n`;
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
