"use strict";

const { clone } = require("./envelope");
const { inspectWorldRequirementIdentities } = require("./index");

function sourceTrace(assemblyResult) {
  return {
    source_closure_hash: clone((assemblyResult && assemblyResult.closure_hash) || null),
    source_provenance: clone((assemblyResult && assemblyResult.source_provenance) || []),
    source_warnings: clone((assemblyResult && assemblyResult.warnings) || [])
  };
}

function hold(code, detail, fields = {}) {
  return {
    status: "HOLD",
    kit: null,
    source_closure_hash: clone(fields.source_closure_hash || null),
    source_provenance: clone(fields.source_provenance || []),
    source_warnings: clone(fields.source_warnings || []),
    runtime_contract: fields.runtime_contract || null,
    evidence: clone(fields.evidence || []),
    holds: [{ code, detail, ...clone(fields.hold || {}) }]
  };
}

function runtimeContract(runtime, shell) {
  return {
    engine_version: runtime && runtime.VERSION ? String(runtime.VERSION) : null,
    kit_format: shell && shell.format ? shell.format : null,
    kit_version: shell && shell.version ? shell.version : null
  };
}

function materializeKit(assemblyResult, runtime, options = {}) {
  const trace = sourceTrace(assemblyResult);
  if (!assemblyResult || assemblyResult.status !== "CANDIDATE" || !assemblyResult.candidate) {
    return hold("HOLD_ASSEMBLY_RESULT_NOT_CANDIDATE", "A MorphTile kit may only be materialized from a successful Assembly Machine candidate.", trace);
  }

  const required = ["createTile", "validateTile", "createWorld", "exportKit", "importKit", "hashOf"];
  const missingRuntime = required.filter((name) => !runtime || typeof runtime[name] !== "function");
  if (missingRuntime.length) {
    return hold("HOLD_MORPHTILE_RUNTIME_CONTRACT_MISSING", "The supplied runtime does not expose the public kit contract required by Assembly.", {
      ...trace,
      hold: { missing_functions: missingRuntime }
    });
  }

  const dependencies = assemblyResult.dependencies || [];
  if (dependencies.length) {
    return hold("HOLD_KIT_DEPENDENCY_UNREPRESENTABLE", "MorphTile kit v0.x does not carry Assembly's arbitrary dependency records; refusing to silently drop dependency closure.", {
      ...trace,
      hold: { dependencies: clone(dependencies) }
    });
  }

  const requirements = assemblyResult.world_requirements || {};
  const words = clone(requirements.words || {});
  const defs = clone(requirements.definitions || requirements.defs || {});
  const identityHolds = inspectWorldRequirementIdentities({ words, definitions: defs });
  if (identityHolds.length) {
    return hold("HOLD_KIT_WORLD_REQUIREMENT_IDENTITY_MISMATCH", "Named world requirements carry contradictory embedded identity; refusing kit export because MorphTile import would otherwise normalize by map key.", {
      ...trace,
      hold: { identity_holds: identityHolds }
    });
  }

  let tile;
  try {
    tile = runtime.createTile({
      ...clone(assemblyResult.candidate),
      created_by: options.created_by || "axm.morphtile.machine.assembly"
    });
  } catch (error) {
    return hold("HOLD_KIT_TILE_MATERIALIZATION_FAILED", "MorphTile runtime rejected tile materialization.", {
      ...trace,
      hold: { error: String(error && error.message ? error.message : error) }
    });
  }

  const validated = runtime.validateTile(tile);
  if (!validated || !validated.ok) {
    return hold("HOLD_KIT_TILE_INVALID", "The materialized tile does not satisfy the supplied MorphTile runtime.", {
      ...trace,
      hold: { errors: clone((validated && validated.errors) || []) }
    });
  }

  const staging = runtime.createWorld(options.world_name || "Assembly kit staging");
  staging.tiles[tile.id] = clone(tile);
  if (Object.keys(words).length) staging.words = clone(words);
  if (Object.keys(defs).length) staging.defs = clone(defs);

  const shell = runtime.exportKit(staging, tile.id, { name: options.name || tile.name });
  if (!shell || shell.format !== "morphtile-kit") {
    return hold("HOLD_KIT_RUNTIME_EXPORT_FAILED", "The supplied runtime did not produce a MorphTile kit shell for the materialized tile.", trace);
  }

  const contract = runtimeContract(runtime, shell);
  const kit = {
    format: shell.format,
    version: shell.version,
    name: options.name || shell.name || tile.name,
    tile: clone(tile),
    defs,
    words
  };

  const missingDefs = [];
  if (typeof runtime.needsOf === "function") {
    const need = runtime.needsOf(staging, tile) || {};
    for (const id of Object.keys(need.defs || {}).sort()) if (!need.defs[id]) missingDefs.push(id);
  }
  if (missingDefs.length) {
    return hold("HOLD_KIT_DEFINITION_MISSING", "The assembled tile references definitions that are absent from its declared world requirements.", {
      ...trace,
      runtime_contract: contract,
      hold: { missing: missingDefs }
    });
  }

  kit.expect = {
    sha256: runtime.hashOf({ tile: kit.tile, defs: kit.defs, words: kit.words }),
    defs: Object.keys(kit.defs).length,
    words: Object.keys(kit.words).length,
    missing: []
  };

  const receiver = runtime.createWorld(options.receiver_world_name || "Assembly kit receiver");
  const checked = runtime.importKit(receiver, clone(kit));
  if (!checked || checked.status !== "READY") {
    return hold("HOLD_KIT_RUNTIME_REJECTED", "The supplied MorphTile runtime did not accept the generated kit as READY.", {
      ...trace,
      runtime_contract: contract,
      hold: {
        runtime_status: checked && checked.status ? checked.status : null,
        conflicts: clone((checked && checked.conflicts) || []),
        claimed: checked && checked.claimed ? checked.claimed : null,
        observed: checked && checked.observed ? checked.observed : null
      }
    });
  }

  return {
    status: "CANDIDATE",
    kit,
    ...trace,
    runtime_contract: contract,
    evidence: [
      { kind: "TILE", status: "PASS", check: "assembly candidate materialized and validateTile accepted it" },
      { kind: "KIT_HASH", status: "PASS", check: "kit expect.sha256 uses the supplied MorphTile runtime hashOf over tile + defs + words; Assembly provenance and warnings remain sidecars outside portable content identity" },
      { kind: "KIT_IMPORT", status: "PASS", check: "fresh-world importKit returned READY without overwrite or partial mode" }
    ],
    holds: []
  };
}

module.exports = { materializeKit };
