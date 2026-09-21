"use strict";

const { clone } = require("./envelope");
const { inspectWorldRequirementIdentities } = require("./index");
const { PortableDataError, clonePortableValue } = require("./portable");

const INTERFACE_TARGET_PROOF = "morphtile.interface-target-proof/v0.1";
const PRESENTATION_ANCHOR_PROOF = "morphtile.presentation-anchor-proof/v0.1";
const TARGET_PROOF_FIELDS = new Set([
  "tile_exists",
  "form_hints_include",
  "readout_logic_vars",
  "control_param_ids",
  "action_input_signal_socket_ids"
]);
const ANCHOR_PROOF_FIELDS = new Set(["tile_exists"]);

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
    dependency_resolution: clone(fields.dependency_resolution || []),
    runtime_contract: fields.runtime_contract || null,
    evidence: clone(fields.evidence || []),
    holds: [{ code, detail, ...clone(fields.hold || {}) }]
  };
}

function kitPortableHold(error, trace = {}) {
  const code = error.code === "HOLD_ASSEMBLY_INPUT_NONFINITE_VALUE"
    ? "HOLD_KIT_INPUT_NONFINITE_VALUE"
    : "HOLD_KIT_INPUT_NONPORTABLE_VALUE";
  return hold(code, "Kit materialization input cannot be preserved exactly by the portable MorphTile transport boundary.", {
    ...trace,
    hold: {
      path: error.path,
      source_code: error.code,
      source_detail: error.message
    },
    evidence: [{
      kind: "KIT_INPUT_PORTABILITY",
      status: "HOLD",
      check: "Assembly result/options were inspected without invoking serialization hooks or accessors before kit translation"
    }]
  });
}

function runtimeContract(runtime, shell) {
  return {
    engine_version: runtime && runtime.VERSION ? String(runtime.VERSION) : null,
    kit_format: shell && shell.format ? shell.format : null,
    kit_version: shell && shell.version ? shell.version : null
  };
}

function stringSet(value) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item)) return null;
  return [...new Set(value)].sort();
}

function stringIdentity(value) {
  return typeof value === "string" && value ? value : null;
}

function targetFacts(candidate, runtime, stagedWorld) {
  const facts = {
    form_hints_include: new Set(),
    readout_logic_vars: new Set(),
    control_param_ids: new Set(),
    action_input_signal_socket_ids: new Set()
  };

  const addMatter = (matter, extraSockets) => {
    if (!matter || typeof matter !== "object" || Array.isArray(matter)) return;
    const facets = matter.facets && typeof matter.facets === "object" ? matter.facets : {};
    const logic = facets.logic && facets.logic.data && typeof facets.logic.data === "object" ? facets.logic.data : {};
    const vars = logic.vars && typeof logic.vars === "object" && !Array.isArray(logic.vars) ? Object.keys(logic.vars) : [];
    const params = Array.isArray(matter.params) ? matter.params : [];
    const baseSockets = facets.connect && Array.isArray(facets.connect.sockets) ? facets.connect.sockets : [];
    const sockets = baseSockets.concat(Array.isArray(extraSockets) ? extraSockets : []);

    for (const hint of Array.isArray(matter.form_hints) ? matter.form_hints : []) {
      if (typeof hint === "string") facts.form_hints_include.add(hint);
    }
    for (const name of vars) facts.readout_logic_vars.add(name);
    for (const param of params) {
      if (param && typeof param.id === "string" && param.id) facts.control_param_ids.add(param.id);
    }
    for (const socket of sockets) {
      if (socket && socket.kind === "signal" && socket.dir === "in" && typeof socket.id === "string" && socket.id) {
        facts.action_input_signal_socket_ids.add(socket.id);
      }
    }
  };

  addMatter(candidate);

  for (const capability of Array.isArray(candidate && candidate.capabilities) ? candidate.capabilities : []) {
    let grants = capability && capability.grants ? capability.grants : null;
    if (runtime && stagedWorld && typeof runtime.grantsOf === "function") {
      const resolved = runtime.grantsOf(stagedWorld, capability);
      if (resolved && resolved.grants) grants = resolved.grants;
    }
    if (!grants || typeof grants !== "object" || Array.isArray(grants)) continue;
    addMatter({
      facets: grants.facets || {},
      params: grants.params || [],
      form_hints: grants.form_hints || []
    }, grants.sockets);
  }

  return {
    form_hints_include: [...facts.form_hints_include].sort(),
    readout_logic_vars: [...facts.readout_logic_vars].sort(),
    control_param_ids: [...facts.control_param_ids].sort(),
    action_input_signal_socket_ids: [...facts.action_input_signal_socket_ids].sort()
  };
}

function resolveInterfaceTargetProof(dependency, candidate, targetBinding, runtime, stagedWorld) {
  const tilePath = dependency && dependency.tile_path;
  const expectedId = typeof tilePath === "string" && tilePath ? `morphtile.interface-target-proof:${tilePath}` : null;
  const targetPath = targetBinding && targetBinding.path ? targetBinding.path : candidate && candidate.id;
  const requires = dependency && dependency.requires;
  const malformed = [];

  if (!dependency || typeof dependency !== "object" || Array.isArray(dependency)) malformed.push("dependency must be an object");
  if (typeof dependency.id !== "string" || !dependency.id) malformed.push("dependency.id must be a non-empty string");
  if (typeof tilePath !== "string" || !tilePath) malformed.push("tile_path must be a non-empty string");
  if (expectedId && dependency.id !== expectedId) malformed.push("dependency.id must equal morphtile.interface-target-proof:<tile_path>");
  if (!requires || typeof requires !== "object" || Array.isArray(requires)) malformed.push("requires must be an object");

  const unknown = requires && typeof requires === "object" && !Array.isArray(requires)
    ? Object.keys(requires).filter((key) => !TARGET_PROOF_FIELDS.has(key)).sort()
    : [];
  if (unknown.length) malformed.push("requires contains unsupported fields: " + unknown.join(", "));
  if (requires && requires.tile_exists !== true) malformed.push("requires.tile_exists must be true");

  const requiredSets = {};
  for (const field of ["form_hints_include", "readout_logic_vars", "control_param_ids", "action_input_signal_socket_ids"]) {
    const normalized = stringSet(requires && requires[field]);
    if (normalized === null) malformed.push(`requires.${field} must be an array of non-empty strings`);
    else requiredSets[field] = normalized;
  }

  const dependencySha = runtime.hashOf(dependency);
  const candidateSha = runtime.hashOf(candidate);
  const proofScope = "staged_morphtile_world";
  if (malformed.length) {
    return {
      id: stringIdentity(dependency && dependency.id),
      kind: INTERFACE_TARGET_PROOF,
      status: "UNSATISFIED",
      proof_scope: proofScope,
      dependency_sha256: dependencySha,
      candidate_sha256: candidateSha,
      reasons: malformed
    };
  }

  if (tilePath !== targetPath) {
    return {
      id: dependency.id,
      kind: INTERFACE_TARGET_PROOF,
      status: "UNSATISFIED",
      proof_scope: proofScope,
      dependency_sha256: dependencySha,
      candidate_sha256: candidateSha,
      target: { id: candidate && candidate.id ? candidate.id : null, path: targetPath || null },
      reasons: [`proof target ${tilePath} does not equal the explicitly assembled target ${targetPath || "<unbound>"}`]
    };
  }

  const resolvedTile = stagedWorld && typeof runtime.resolveTile === "function"
    ? runtime.resolveTile(stagedWorld, tilePath)
    : null;
  if (!resolvedTile) {
    return {
      id: dependency.id,
      kind: INTERFACE_TARGET_PROOF,
      status: "UNSATISFIED",
      proof_scope: proofScope,
      dependency_sha256: dependencySha,
      candidate_sha256: candidateSha,
      target: { id: candidate && candidate.id ? candidate.id : null, path: targetPath || null },
      reasons: [`proof target ${tilePath} is not present in the isolated MorphTile staging world; contextual parent matter is not part of this kit`]
    };
  }

  const facts = targetFacts(resolvedTile, runtime, stagedWorld);
  const missing = {};
  for (const field of Object.keys(requiredSets)) {
    const have = new Set(facts[field] || []);
    const absent = requiredSets[field].filter((item) => !have.has(item));
    if (absent.length) missing[field] = absent;
  }

  if (Object.keys(missing).length) {
    return {
      id: dependency.id,
      kind: INTERFACE_TARGET_PROOF,
      status: "UNSATISFIED",
      proof_scope: proofScope,
      dependency_sha256: dependencySha,
      candidate_sha256: candidateSha,
      resolved_tile_sha256: runtime.hashOf(resolvedTile),
      target: { id: resolvedTile.id || null, path: tilePath },
      missing
    };
  }

  return {
    id: dependency.id,
    kind: INTERFACE_TARGET_PROOF,
    status: "SATISFIED",
    proof_scope: proofScope,
    dependency_sha256: dependencySha,
    candidate_sha256: candidateSha,
    resolved_tile_sha256: runtime.hashOf(resolvedTile),
    target: { id: resolvedTile.id, path: tilePath },
    proven: {
      tile_exists: true,
      form_hints_include: requiredSets.form_hints_include,
      readout_logic_vars: requiredSets.readout_logic_vars,
      control_param_ids: requiredSets.control_param_ids,
      action_input_signal_socket_ids: requiredSets.action_input_signal_socket_ids
    }
  };
}

function resolvePresentationAnchorProof(dependency, candidate, runtime, stagedWorld) {
  const anchorPath = dependency && dependency.anchor_path;
  const expectedId = typeof anchorPath === "string" && anchorPath ? `morphtile.presentation-anchor-proof:${anchorPath}` : null;
  const requires = dependency && dependency.requires;
  const presentation = candidate && candidate.presentation;
  const dependencySha = runtime.hashOf(dependency);
  const candidateSha = runtime.hashOf(candidate);
  const proofScope = "staged_morphtile_world";
  const malformed = [];

  if (!dependency || typeof dependency !== "object" || Array.isArray(dependency)) malformed.push("dependency must be an object");
  if (typeof dependency.id !== "string" || !dependency.id) malformed.push("dependency.id must be a non-empty string");
  if (typeof anchorPath !== "string" || !anchorPath) malformed.push("anchor_path must be a non-empty string");
  if (expectedId && dependency.id !== expectedId) malformed.push("dependency.id must equal morphtile.presentation-anchor-proof:<anchor_path>");
  if (!requires || typeof requires !== "object" || Array.isArray(requires)) malformed.push("requires must be an object");
  const unknown = requires && typeof requires === "object" && !Array.isArray(requires)
    ? Object.keys(requires).filter((key) => !ANCHOR_PROOF_FIELDS.has(key)).sort()
    : [];
  if (unknown.length) malformed.push("requires contains unsupported fields: " + unknown.join(", "));
  if (requires && requires.tile_exists !== true) malformed.push("requires.tile_exists must be true");

  if (malformed.length) {
    return {
      id: stringIdentity(dependency && dependency.id),
      kind: PRESENTATION_ANCHOR_PROOF,
      status: "UNSATISFIED",
      proof_scope: proofScope,
      dependency_sha256: dependencySha,
      candidate_sha256: candidateSha,
      reasons: malformed
    };
  }

  if (!presentation || typeof presentation !== "object" || Array.isArray(presentation)) {
    return {
      id: dependency.id,
      kind: PRESENTATION_ANCHOR_PROOF,
      status: "UNSATISFIED",
      proof_scope: proofScope,
      dependency_sha256: dependencySha,
      candidate_sha256: candidateSha,
      anchor: { path: anchorPath },
      reasons: ["anchor proof exists but the assembled tile carries no presentation descriptor"]
    };
  }
  if (presentation.mode !== "tile" || presentation.anchor !== anchorPath) {
    return {
      id: dependency.id,
      kind: PRESENTATION_ANCHOR_PROOF,
      status: "UNSATISFIED",
      proof_scope: proofScope,
      dependency_sha256: dependencySha,
      candidate_sha256: candidateSha,
      anchor: { path: anchorPath },
      presentation: clone(presentation),
      reasons: [`anchor proof ${anchorPath} does not match the assembled tile-mode presentation anchor`]
    };
  }

  const resolvedAnchor = stagedWorld && typeof runtime.resolveTile === "function"
    ? runtime.resolveTile(stagedWorld, anchorPath)
    : null;
  if (!resolvedAnchor) {
    return {
      id: dependency.id,
      kind: PRESENTATION_ANCHOR_PROOF,
      status: "UNSATISFIED",
      proof_scope: proofScope,
      dependency_sha256: dependencySha,
      candidate_sha256: candidateSha,
      anchor: { path: anchorPath },
      reasons: [`presentation anchor ${anchorPath} is not present in the isolated MorphTile staging world; external or parent world context is not part of this kit`]
    };
  }

  return {
    id: dependency.id,
    kind: PRESENTATION_ANCHOR_PROOF,
    status: "SATISFIED",
    proof_scope: proofScope,
    dependency_sha256: dependencySha,
    candidate_sha256: candidateSha,
    resolved_anchor_sha256: runtime.hashOf(resolvedAnchor),
    anchor: { id: resolvedAnchor.id || null, path: anchorPath },
    proven: { tile_exists: true }
  };
}

function resolveKitDependencies(assemblyResult, runtime, stagedWorld) {
  const dependencies = clone((assemblyResult && assemblyResult.dependencies) || []);
  const receipts = [];
  const unresolved = [];
  const unsatisfied = [];

  for (const dependency of dependencies) {
    let receipt = null;
    if (dependency && dependency.kind === INTERFACE_TARGET_PROOF) {
      receipt = resolveInterfaceTargetProof(
        dependency,
        assemblyResult.candidate,
        assemblyResult.target_binding,
        runtime,
        stagedWorld
      );
    } else if (dependency && dependency.kind === PRESENTATION_ANCHOR_PROOF) {
      receipt = resolvePresentationAnchorProof(
        dependency,
        assemblyResult.candidate,
        runtime,
        stagedWorld
      );
    }
    if (receipt) {
      receipts.push(receipt);
      if (receipt.status !== "SATISFIED") unsatisfied.push(clone(dependency));
      continue;
    }
    unresolved.push(clone(dependency));
  }

  return { receipts, unresolved, unsatisfied };
}

function inspectImportPlanCoverage(runtime, receiverBeforeImport, kit, operations) {
  const own = (container, key) => Boolean(container && typeof container === "object" && !Array.isArray(container) && Object.prototype.hasOwnProperty.call(container, key));
  const expected = {
    tile: kit && kit.tile && typeof kit.tile.id === "string" && kit.tile.id ? [kit.tile.id] : [],
    definitions: Object.keys((kit && kit.defs) || {}).sort(),
    words: Object.keys((kit && kit.words) || {}).sort()
  };
  const counts = { tile: new Map(), definitions: new Map(), words: new Map() };
  const changed = { tile: [], definitions: [], words: [] };
  const unexpected = { tile: [], definitions: [], words: [] };

  const increment = (map, id) => map.set(id, (map.get(id) || 0) + 1);
  const normalizeWord = (id, value) => ({
    name: id,
    args: clone((value && value.args) || []),
    body: clone(value && value.body),
    note: value && value.note ? value.note : null
  });
  const normalizeDefinition = (id, value) => ({
    id,
    name: value && value.name ? value.name : id,
    body: clone(value && value.body),
    created_by: value && value.created_by ? value.created_by : "human"
  });
  const normalizeTile = (value) => {
    const out = clone(value);
    if (out && out.provenance && typeof out.provenance === "object" && !Array.isArray(out.provenance)) delete out.provenance.sha256;
    return out;
  };

  for (let operationIndex = 0; operationIndex < operations.length; operationIndex += 1) {
    const operation = operations[operationIndex];
    if (!operation || typeof operation !== "object" || Array.isArray(operation)) continue;

    if (operation.op === "word.define" && typeof operation.name === "string" && operation.name) {
      const id = operation.name;
      if (!expected.words.includes(id)) {
        unexpected.words.push({ id, operation_index: operationIndex });
        continue;
      }
      increment(counts.words, id);
      const expectedSha = runtime.hashOf(normalizeWord(id, kit.words[id]));
      const plannedSha = runtime.hashOf(normalizeWord(id, operation));
      if (expectedSha !== plannedSha) changed.words.push({ id, operation_index: operationIndex, expected_sha256: expectedSha, planned_sha256: plannedSha });
      continue;
    }

    if (operation.op === "def.put" && typeof operation.id === "string" && operation.id) {
      const id = operation.id;
      if (!expected.definitions.includes(id)) {
        unexpected.definitions.push({ id, operation_index: operationIndex });
        continue;
      }
      increment(counts.definitions, id);
      const expectedSha = runtime.hashOf(normalizeDefinition(id, kit.defs[id]));
      const plannedSha = runtime.hashOf(normalizeDefinition(id, {
        name: operation.name,
        body: operation.body,
        created_by: operation.by
      }));
      if (expectedSha !== plannedSha) changed.definitions.push({ id, operation_index: operationIndex, expected_sha256: expectedSha, planned_sha256: plannedSha });
      continue;
    }

    if (operation.op === "tile.add" && (operation.in || "") === "" && operation.tile && typeof operation.tile.id === "string" && operation.tile.id) {
      const id = operation.tile.id;
      if (!expected.tile.includes(id)) {
        unexpected.tile.push({ id, operation_index: operationIndex });
        continue;
      }
      increment(counts.tile, id);
      const expectedSha = runtime.hashOf(normalizeTile(kit.tile));
      const plannedSha = runtime.hashOf(normalizeTile(operation.tile));
      if (expectedSha !== plannedSha) changed.tile.push({ id, operation_index: operationIndex, expected_sha256: expectedSha, planned_sha256: plannedSha });
    }
  }

  const preexisting = { definitions: [], words: [] };
  const missing = { tile: [], definitions: [], words: [] };
  const duplicates = { tile: [], definitions: [], words: [] };

  for (const id of expected.words) {
    const count = counts.words.get(id) || 0;
    if (count > 1) duplicates.words.push({ id, count });
    if (count) continue;
    if (own(receiverBeforeImport && receiverBeforeImport.words, id) && runtime.hashOf(normalizeWord(id, receiverBeforeImport.words[id])) === runtime.hashOf(normalizeWord(id, kit.words[id]))) {
      preexisting.words.push(id);
    } else {
      missing.words.push(id);
    }
  }

  for (const id of expected.definitions) {
    const count = counts.definitions.get(id) || 0;
    if (count > 1) duplicates.definitions.push({ id, count });
    if (count) continue;
    if (own(receiverBeforeImport && receiverBeforeImport.defs, id) && runtime.hashOf(receiverBeforeImport.defs[id] && receiverBeforeImport.defs[id].body) === runtime.hashOf(kit.defs[id] && kit.defs[id].body)) {
      preexisting.definitions.push(id);
    } else {
      missing.definitions.push(id);
    }
  }

  for (const id of expected.tile) {
    const count = counts.tile.get(id) || 0;
    if (count > 1) duplicates.tile.push({ id, count });
    if (!count) missing.tile.push(id);
  }

  const incomplete = missing.tile.length || missing.definitions.length || missing.words.length || changed.tile.length || changed.definitions.length || changed.words.length || unexpected.tile.length || unexpected.definitions.length || unexpected.words.length || duplicates.tile.length || duplicates.definitions.length || duplicates.words.length;
  return {
    status: incomplete ? "UNSATISFIED" : "SATISFIED",
    plan_sha256: runtime.hashOf(operations),
    expected,
    preexisting,
    missing,
    changed,
    unexpected,
    duplicates
  };
}

function inspectReceiverClosure(runtime, receiver, operations) {
  const own = (container, key) => Boolean(container && typeof container === "object" && !Array.isArray(container) && Object.prototype.hasOwnProperty.call(container, key));
  const missing = { tile: [], definitions: [], words: [] };
  const changed = { tile: [], definitions: [], words: [] };
  const unsupported_operations = [];
  let verifiedOperations = 0;

  for (let operationIndex = 0; operationIndex < operations.length; operationIndex += 1) {
    const operation = operations[operationIndex];
    if (!operation || typeof operation !== "object" || Array.isArray(operation)) {
      unsupported_operations.push({ operation_index: operationIndex, op: null, reason: "operation must be an object" });
      continue;
    }

    if (operation.op === "word.define") {
      const id = operation.name;
      const expected = {
        name: id,
        args: clone(operation.args || []),
        body: clone(operation.body),
        note: operation.note || null
      };
      if (!own(receiver && receiver.words, id)) {
        missing.words.push(id);
        continue;
      }
      const expectedSha = runtime.hashOf(expected);
      const observedSha = runtime.hashOf(receiver.words[id]);
      if (expectedSha !== observedSha) {
        changed.words.push({ id, operation_index: operationIndex, expected_sha256: expectedSha, observed_sha256: observedSha });
        continue;
      }
      verifiedOperations += 1;
      continue;
    }

    if (operation.op === "def.put") {
      const id = operation.id;
      const expected = {
        id,
        name: operation.name || id,
        body: clone(operation.body),
        created_by: operation.by || "human"
      };
      if (!own(receiver && receiver.defs, id)) {
        missing.definitions.push(id);
        continue;
      }
      const expectedSha = runtime.hashOf(expected);
      const observedSha = runtime.hashOf(receiver.defs[id]);
      if (expectedSha !== observedSha) {
        changed.definitions.push({ id, operation_index: operationIndex, expected_sha256: expectedSha, observed_sha256: observedSha });
        continue;
      }
      verifiedOperations += 1;
      continue;
    }

    if (operation.op === "tile.add") {
      if ((operation.in || "") !== "" || !operation.tile || typeof operation.tile.id !== "string" || !operation.tile.id) {
        unsupported_operations.push({ operation_index: operationIndex, op: "tile.add", reason: "Assembly fresh-receiver kit proof only accepts a root tile.add with an inspectable tile id" });
        continue;
      }
      const id = operation.tile.id;
      const observedTile = runtime.resolveTile(receiver, id);
      if (!observedTile) {
        missing.tile.push(id);
        continue;
      }
      const expectedSha = runtime.hashOf(operation.tile);
      const observedSha = runtime.hashOf(observedTile);
      if (expectedSha !== observedSha) {
        changed.tile.push({ id, operation_index: operationIndex, expected_sha256: expectedSha, observed_sha256: observedSha });
        continue;
      }
      verifiedOperations += 1;
      continue;
    }

    unsupported_operations.push({ operation_index: operationIndex, op: operation.op || null, reason: "operation is outside the exact READY kit-import receiver proof contract" });
  }

  const incomplete = missing.tile.length || missing.definitions.length || missing.words.length || changed.tile.length || changed.definitions.length || changed.words.length || unsupported_operations.length || verifiedOperations !== operations.length;
  return {
    status: incomplete ? "UNSATISFIED" : "SATISFIED",
    plan_sha256: runtime.hashOf(operations),
    planned_operations: operations.length,
    verified_operations: verifiedOperations,
    missing,
    changed,
    unsupported_operations
  };
}

function materializeKit(assemblyResult, runtime, options = {}) {
  if (!assemblyResult || typeof assemblyResult !== "object") {
    return hold("HOLD_ASSEMBLY_RESULT_NOT_CANDIDATE", "A MorphTile kit may only be materialized from a successful Assembly Machine candidate.");
  }

  let portableAssemblyResult;
  try {
    portableAssemblyResult = clonePortableValue(assemblyResult, "assembly_result");
  } catch (error) {
    if (error instanceof PortableDataError) return kitPortableHold(error);
    throw error;
  }
  assemblyResult = portableAssemblyResult;
  const trace = sourceTrace(assemblyResult);

  let portableOptions;
  try {
    portableOptions = clonePortableValue(options == null ? {} : options, "options");
  } catch (error) {
    if (error instanceof PortableDataError) return kitPortableHold(error, trace);
    throw error;
  }
  options = portableOptions;

  if (assemblyResult.status !== "CANDIDATE" || !assemblyResult.candidate) {
    return hold("HOLD_ASSEMBLY_RESULT_NOT_CANDIDATE", "A MorphTile kit may only be materialized from a successful Assembly Machine candidate.", trace);
  }

  const required = ["createTile", "validateTile", "createWorld", "exportKit", "importKit", "applyStructOp", "hashOf", "resolveTile"];
  const missingRuntime = required.filter((name) => !runtime || typeof runtime[name] !== "function");
  if (missingRuntime.length) {
    return hold("HOLD_MORPHTILE_RUNTIME_CONTRACT_MISSING", "The supplied runtime does not expose the public kit contract required by Assembly.", {
      ...trace,
      hold: { missing_functions: missingRuntime }
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

  const dependencyResolution = resolveKitDependencies(assemblyResult, runtime, staging);
  if (dependencyResolution.unsatisfied.length) {
    return hold("HOLD_KIT_DEPENDENCY_UNSATISFIED", "A known local Interface proof dependency was inspectable against isolated staged MorphTile matter but could not be proven exactly; refusing to export an under-proven kit.", {
      ...trace,
      dependency_resolution: dependencyResolution.receipts,
      hold: { dependencies: dependencyResolution.unsatisfied }
    });
  }
  if (dependencyResolution.unresolved.length) {
    return hold("HOLD_KIT_DEPENDENCY_UNREPRESENTABLE", "MorphTile kit v0.x does not carry unresolved arbitrary dependency records; refusing to silently drop dependency closure.", {
      ...trace,
      dependency_resolution: dependencyResolution.receipts,
      hold: { dependencies: dependencyResolution.unresolved }
    });
  }

  const shell = runtime.exportKit(staging, tile.id, { name: options.name || tile.name });
  if (!shell || shell.format !== "morphtile-kit") {
    return hold("HOLD_KIT_RUNTIME_EXPORT_FAILED", "The supplied runtime did not produce a MorphTile kit shell for the materialized tile.", {
      ...trace,
      dependency_resolution: dependencyResolution.receipts
    });
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
      dependency_resolution: dependencyResolution.receipts,
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
  const receiverBeforeImport = clone(receiver);
  const checked = runtime.importKit(receiver, clone(kit));
  if (!checked || checked.status !== "READY") {
    return hold("HOLD_KIT_RUNTIME_REJECTED", "The supplied MorphTile runtime did not accept the generated kit as READY.", {
      ...trace,
      dependency_resolution: dependencyResolution.receipts,
      runtime_contract: contract,
      hold: {
        runtime_status: checked && checked.status ? checked.status : null,
        conflicts: clone((checked && checked.conflicts) || []),
        claimed: checked && checked.claimed ? checked.claimed : null,
        observed: checked && checked.observed ? checked.observed : null
      }
    });
  }
  if (!Array.isArray(checked.ops)) {
    return hold("HOLD_KIT_RUNTIME_IMPORT_OPS_INVALID", "The supplied MorphTile runtime reported READY without an inspectable ordered operation list, so receiver application cannot be proven.", {
      ...trace,
      dependency_resolution: dependencyResolution.receipts,
      runtime_contract: contract,
      hold: { runtime_status: checked.status }
    });
  }

  const planCoverage = inspectImportPlanCoverage(runtime, receiverBeforeImport, kit, checked.ops);
  if (planCoverage.status !== "SATISFIED") {
    return hold("HOLD_KIT_RUNTIME_IMPORT_PLAN_INCOMPLETE", "The supplied MorphTile runtime reported READY, but its ordered import plan does not cover the declared kit words, definitions, and root tile without omission, substitution, unexpected matter, or duplicate authority.", {
      ...trace,
      dependency_resolution: dependencyResolution.receipts,
      runtime_contract: contract,
      hold: { plan_coverage: planCoverage }
    });
  }

  for (let operationIndex = 0; operationIndex < checked.ops.length; operationIndex += 1) {
    const operation = clone(checked.ops[operationIndex]);
    try {
      runtime.applyStructOp(receiver, operation);
    } catch (error) {
      return hold("HOLD_KIT_RUNTIME_APPLY_FAILED", "The supplied MorphTile runtime planned a READY kit import but rejected one of its own import operations during isolated receiver application.", {
        ...trace,
        dependency_resolution: dependencyResolution.receipts,
        runtime_contract: contract,
        hold: {
          operation_index: operationIndex,
          operation,
          error: String(error && error.message ? error.message : error)
        }
      });
    }
  }

  const receiverClosure = inspectReceiverClosure(runtime, receiver, checked.ops);
  if (receiverClosure.status !== "SATISFIED") {
    return hold("HOLD_KIT_RUNTIME_RECEIVER_INCOMPLETE", "The supplied MorphTile runtime returned from every READY import operation but the isolated receiver does not contain the exact postconditions declared by that READY operation plan.", {
      ...trace,
      dependency_resolution: dependencyResolution.receipts,
      runtime_contract: contract,
      hold: { receiver_closure: receiverClosure }
    });
  }

  return {
    status: "CANDIDATE",
    kit,
    ...trace,
    dependency_resolution: dependencyResolution.receipts,
    runtime_contract: contract,
    evidence: [
      { kind: "DEPENDENCY_CLOSURE", status: "PASS", check: "every dependency was either deterministically discharged against isolated staged MorphTile matter, including exact declared capability grants resolved by the runtime contract, or materialization would have HELD" },
      { kind: "TILE", status: "PASS", check: "assembly candidate materialized and validateTile accepted it" },
      { kind: "KIT_HASH", status: "PASS", check: "kit expect.sha256 uses the supplied MorphTile runtime hashOf over tile + defs + words; Assembly provenance, warnings and discharged-proof receipts remain sidecars outside portable content identity" },
      { kind: "KIT_IMPORT", status: "PASS", check: "fresh-world importKit returned READY without overwrite or partial mode" },
      { kind: "KIT_IMPORT_PLAN_COVERAGE", status: "PASS", check: `READY plan ${planCoverage.plan_sha256} covers every declared kit word, definition, and root tile exactly once unless the runtime proved the named word/definition already existed compatibly before planning` },
      { kind: "KIT_APPLY", status: "PASS", check: `all ${checked.ops.length} READY import operations executed in order against the isolated fresh receiver` },
      { kind: "KIT_RECEIVER_CLOSURE", status: "PASS", check: `all ${receiverClosure.verified_operations} READY operation postconditions are present exactly in the isolated fresh receiver; plan ${receiverClosure.plan_sha256}` }
    ],
    holds: []
  };
}

module.exports = {
  INTERFACE_TARGET_PROOF,
  PRESENTATION_ANCHOR_PROOF,
  targetFacts,
  resolveInterfaceTargetProof,
  resolvePresentationAnchorProof,
  resolveKitDependencies,
  inspectImportPlanCoverage,
  inspectReceiverClosure,
  materializeKit
};