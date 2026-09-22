"use strict";

const LANES = Object.freeze(["form", "surface", "capability", "interface", "core"]);
const SCHEMA = "axm.morphtile.assembly-current-fleet/v1";
const EXACT_SHA = /^[0-9a-f]{40}$/;

function validateFleet(fleet) {
  if (!fleet || typeof fleet !== "object" || Array.isArray(fleet)) {
    return ["manifest: expected a plain object-like record"];
  }

  const errors = [];
  if (fleet.schema !== SCHEMA) {
    errors.push(`manifest: schema must equal ${SCHEMA}`);
  }

  for (const lane of LANES) {
    const commit = fleet[lane];
    if (typeof commit !== "string" || !EXACT_SHA.test(commit)) {
      errors.push(`${lane}: expected an exact lowercase 40-character commit sha`);
    }
  }

  return errors;
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
  validateFleet,
  outputLines
};
