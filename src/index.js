"use strict";

const { createHash } = require("node:crypto");
const { assertRequest, clone, result } = require("./envelope");
const { isTilePath, pathLeaf, parseInterfaceOperations } = require("./interface-operations");
const { PortableDataError, clonePortableValue, safeRequestId } = require("./portable");

const MACHINE = { id: "axm.morphtile.machine.assembly", version: "0.6.3" };
const SUPPORTED_SCHEMAS = new Set([
  "morphtile.tile-spec/v0.4",
  "morphtile.facet-candidate/v0.4",
  "morphtile.capability-candidate/v0.4",
  "morphtile.view-operation/v0.4",
  "morphtile.view-operation/v0.5",
  "morphtile.interface-operations/v0.4",
  "morphtile.interface-operations/v0.5"
]);
const VIEW_OPERATION_SCHEMAS = new Set([
  "morphtile.view-operation/v0.4",
  "morphtile.view-operation/v0.5"
]);
const INTERFACE_OPERATION_SCHEMAS = new Set([
  "morphtile.interface-operations/v0.4",
  "morphtile.interface-operations/v0.5"
]);
const TILE_ID = /^[A-Za-z0-9_-]+$/;
const VIEW_CANDIDATE_KEYS = new Set(["schema", "operation"]);
const VIEW_OPERATION_KEYS = new Set(["op", "id", "view"]);

function canonical(value) {
  if (value === null || value === undefined || typeof value !== "object") {
    return JSON.stringify(value === undefined ? null : value);
  }
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  const keys = Object.keys(value).filter((key) => value[key] !== undefined).sort();
  return "{" + keys.map((key) => JSON.stringify(key) + ":" + canonical(value[key])).join(",") + "}";
}

function same(a, b) {
  return canonical(a) === canonical(b);
}

function sha256Canonical(value) {
  return createHash("sha256").update(canonical(value), "utf8").digest("hex");
}

function closureHash(candidate, dependencies, worldRequirements) {
  return {
    algorithm: "sha256",
    canonicalization: "sorted-key-json/v1",
    scope: "candidate+dependencies+world_requirements",
    value: sha256Canonical({
      candidate,
      dependencies: dependencies || [],
      world_requirements: worldRequirements || null
    })
  };
}

function mergeObject(target, source, path, conflicts, owners, sourceLabel) {
  for (const key of Object.keys(source || {}).sort()) {
    const at = path ? path + "." + key : key;
    if (!(key in target)) {
      target[key] = clone(source[key]);
      if (owners) owners.set(at, sourceLabel || null);
    } else if (!same(target[key], source[key])) {
      conflicts.push({
        path: at,
        variants: [clone(target[key]), clone(source[key])],
        sources: [owners && owners.has(at) ? owners.get(at) : "assembly-base", sourceLabel || null]
      });
    }
  }
}

function mergeFormHints(target, hints) {
  for (const hint of hints || []) if (!target.includes(hint)) target.push(hint);
}

function hasOwn(value, key) {
  return !!value && Object.prototype.hasOwnProperty.call(value, key);
}

function candidateOf(input) {
  return hasOwn(input, "candidate") ? input.candidate : input;
}

function preserveInputWarnings(input, inputIndex, warnings) {
  for (const warning of (input && input.warnings) || []) {
    warnings.push({
      code: "UPSTREAM_WARNING",
      input: inputIndex,
      machine: input && input.machine && input.machine.id ? input.machine.id : null,
      warning: clone(warning)
    });
  }
}

function inspectInputEnvelope(input, inputIndex, holds) {
  if (!input || typeof input !== "object" || Array.isArray(input) || !hasOwn(input, "status")) return true;

  if (input.status !== "CANDIDATE") {
    holds.push({
      code: "HOLD_INPUT_NOT_CANDIDATE",
      input: inputIndex,
      status: input.status == null ? null : String(input.status),
      upstream_holds: clone(input.holds || [])
    });
    return false;
  }

  if (!hasOwn(input, "candidate") || !input.candidate || typeof input.candidate !== "object" || Array.isArray(input.candidate)) {
    holds.push({
      code: "HOLD_INPUT_CANDIDATE_MISSING",
      input: inputIndex,
      detail: "An upstream CANDIDATE envelope must carry an object candidate."
    });
    return false;
  }

  return true;
}

function addAssemblyId(seen, value, source, holds) {
  if (value === undefined) return;
  if (typeof value !== "string" || !value || !TILE_ID.test(value)) {
    holds.push({ code: "HOLD_ASSEMBLY_ID_INVALID", source, value: clone(value) });
    return;
  }
  seen.push({ value, source });
}

function resolveAssemblyId(request, inputs, holds) {
  const seen = [];
  const intent = request.intent || {};
  addAssemblyId(seen, intent.id, "request.intent.id", holds);

  inputs.forEach((input, index) => {
    const candidate = candidateOf(input);
    if (candidate && candidate.schema === "morphtile.tile-spec/v0.4" && hasOwn(candidate, "id")) {
      addAssemblyId(seen, candidate.id, "input[" + index + "].candidate.id", holds);
    }
  });

  const values = [...new Set(seen.map((item) => item.value))];
  if (values.length > 1) {
    holds.push({
      code: "HOLD_ASSEMBLY_ID_CONFLICT",
      identities: seen.map((item) => ({ source: item.source, value: item.value }))
    });
    return null;
  }
  return values[0] || null;
}

function resolveAssemblyTargetPath(request, assemblyId, holds) {
  const intent = request.intent || {};
  if (!hasOwn(intent, "tile_path")) return null;
  const value = intent.tile_path;
  if (!isTilePath(value)) {
    holds.push({
      code: "HOLD_ASSEMBLY_TARGET_PATH_INVALID",
      source: "request.intent.tile_path",
      value: clone(value),
      detail: "Nested Assembly target paths must use one or more [A-Za-z0-9_-]+ segments separated by single '/'."
    });
    return null;
  }
  if (assemblyId && pathLeaf(value) !== assemblyId) {
    holds.push({
      code: "HOLD_ASSEMBLY_TARGET_PATH_ID_MISMATCH",
      assembled_id: assemblyId,
      assembled_path: value,
      detail: "The explicit Assembly tile path must end in the same local tile id as the assembled tile candidate."
    });
  }
  return value;
}

function foldViewOperation(assembled, assembledPath, candidate, inputIndex, conflicts, holds, owners) {
  const candidateUnknown = Object.keys(candidate).filter((key) => !VIEW_CANDIDATE_KEYS.has(key)).sort();
  if (candidateUnknown.length) {
    holds.push({
      code: "HOLD_VIEW_OPERATION_SHAPE_INVALID",
      input: inputIndex,
      detail: "view-operation candidate contains unsupported field(s)",
      fields: candidateUnknown
    });
    return false;
  }

  const operation = candidate.operation;
  if (!operation || typeof operation !== "object" || Array.isArray(operation)) {
    holds.push({ code: "HOLD_VIEW_OPERATION_SHAPE_INVALID", input: inputIndex, detail: "operation must be an object" });
    return false;
  }

  const operationUnknown = Object.keys(operation).filter((key) => !VIEW_OPERATION_KEYS.has(key)).sort();
  if (operationUnknown.length) {
    holds.push({
      code: "HOLD_VIEW_OPERATION_SHAPE_INVALID",
      input: inputIndex,
      detail: "view.set contains unsupported field(s)",
      fields: operationUnknown
    });
    return false;
  }
  if (operation.op !== "view.set") {
    holds.push({ code: "HOLD_VIEW_OPERATION_SHAPE_INVALID", input: inputIndex, detail: "operation.op must be view.set" });
    return false;
  }
  if (!isTilePath(operation.id)) {
    holds.push({ code: "HOLD_VIEW_OPERATION_TARGET_INVALID", input: inputIndex, target: clone(operation.id) });
    return false;
  }
  if (!operation.view || typeof operation.view !== "object" || Array.isArray(operation.view)) {
    holds.push({ code: "HOLD_VIEW_OPERATION_SHAPE_INVALID", input: inputIndex, detail: "operation.view must be an object" });
    return false;
  }
  if (!assembled.id) {
    holds.push({
      code: "HOLD_VIEW_OPERATION_TARGET_UNBOUND",
      input: inputIndex,
      target: operation.id,
      detail: "Assembly requires an explicit local tile identity before folding an operation into new matter."
    });
    return false;
  }
  if (operation.id.includes("/") && !assembledPath) {
    holds.push({
      code: "HOLD_VIEW_OPERATION_TARGET_PATH_UNBOUND",
      input: inputIndex,
      target: operation.id,
      assembled_id: assembled.id,
      detail: "A nested Interface target requires request.intent.tile_path so Assembly does not infer parent context from a matching leaf id."
    });
    return false;
  }
  const expectedTarget = assembledPath || assembled.id;
  if (operation.id !== expectedTarget) {
    holds.push({
      code: "HOLD_VIEW_OPERATION_TARGET_MISMATCH",
      input: inputIndex,
      target: operation.id,
      assembled_id: assembled.id,
      assembled_path: assembledPath || null
    });
    return false;
  }

  mergeObject(assembled, { view: operation.view }, "", conflicts, owners, "input[" + inputIndex + "]");
  return true;
}

function foldInterfaceOperations(assembled, assembledPath, candidate, inputIndex, conflicts, holds, owners) {
  const parsed = parseInterfaceOperations(assembled.id, assembledPath, candidate, inputIndex);
  if (!parsed.ok) {
    holds.push(...parsed.holds);
    return false;
  }
  mergeObject(assembled, { view: parsed.view }, "", conflicts, owners, "input[" + inputIndex + "]");
  mergeObject(assembled, { presentation: parsed.presentation }, "", conflicts, owners, "input[" + inputIndex + "]");
  return true;
}

function mergeCandidate(assembled, assembledPath, input, inputIndex, conflicts, holds, warnings, heldCandidates, owners) {
  preserveInputWarnings(input, inputIndex, warnings);
  if (!inspectInputEnvelope(input, inputIndex, holds)) return false;

  const candidate = candidateOf(input) || {};
  const schema = candidate.schema || null;
  if (schema && !SUPPORTED_SCHEMAS.has(schema)) {
    holds.push({
      code: "HOLD_UNASSEMBLABLE_CANDIDATE_SCHEMA",
      input: inputIndex,
      schema,
      detail: "Assembly Machine only folds proven tile/facet/capability candidates plus the exact proven Interface v0.4/v0.5 view.set and view.set+presentation.set contracts into a tile spec; other operation candidates remain explicit until proven."
    });
    heldCandidates.push({ input: inputIndex, schema, candidate: clone(candidate) });
    return false;
  }
  if (!schema) warnings.push({ code: "LEGACY_SCHEMALESS_FRAGMENT", input: inputIndex });

  if (VIEW_OPERATION_SCHEMAS.has(schema)) {
    return foldViewOperation(assembled, assembledPath, candidate, inputIndex, conflicts, holds, owners);
  }
  if (INTERFACE_OPERATION_SCHEMAS.has(schema)) {
    return foldInterfaceOperations(assembled, assembledPath, candidate, inputIndex, conflicts, holds, owners);
  }

  mergeFormHints(assembled.form_hints, candidate.form_hints);

  if (schema === "morphtile.facet-candidate/v0.4" || (candidate.facet && hasOwn(candidate, "value"))) {
    mergeObject(assembled.facets, { [candidate.facet]: candidate.value }, "facets", conflicts, owners, "input[" + inputIndex + "]");
    return false;
  }

  mergeObject(assembled.facets, candidate.facets || {}, "facets", conflicts, owners, "input[" + inputIndex + "]");
  for (const field of ["view", "presentation", "params", "capabilities"]) {
    if (candidate[field] !== undefined) mergeObject(assembled, { [field]: candidate[field] }, "", conflicts, owners, "input[" + inputIndex + "]");
  }
  return false;
}

function dependencyIdentity(value) {
  if (typeof value === "string") return "string:" + value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of ["id", "package", "repository", "url", "name"]) {
      if (typeof value[key] === "string" && value[key]) return key + ":" + value[key];
    }
  }
  return "opaque:" + canonical(value);
}

function collectDependencies(request, inputs, holds) {
  const seen = new Map();
  const add = (dependency, source) => {
    const identity = dependencyIdentity(dependency);
    if (!seen.has(identity)) {
      seen.set(identity, { value: clone(dependency), source });
      return;
    }
    const previous = seen.get(identity);
    if (!same(previous.value, dependency)) {
      holds.push({
        code: "HOLD_DEPENDENCY_CONFLICT",
        identity,
        variants: [clone(previous.value), clone(dependency)],
        sources: [previous.source, source]
      });
    }
  };

  for (const dependency of request.dependencies || []) add(dependency, "request");
  inputs.forEach((input, index) => {
    for (const dependency of (input && input.dependencies) || []) add(dependency, "input[" + index + "]");
  });

  return Array.from(seen.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, item]) => item.value);
}

function mergeNamed(target, source, kind, sourceLabel, sources, holds) {
  for (const name of Object.keys(source || {}).sort()) {
    if (!hasOwn(target, name)) {
      Object.defineProperty(target, name, {
        value: clone(source[name]),
        enumerable: true,
        configurable: true,
        writable: true
      });
      sources.set(name, sourceLabel);
      continue;
    }
    if (!same(target[name], source[name])) {
      holds.push({
        code: kind === "word" ? "HOLD_WORD_CONFLICT" : "HOLD_DEFINITION_CONFLICT",
        identity: name,
        source: sourceLabel,
        variants: [clone(target[name]), clone(source[name])],
        sources: [sources.get(name) || "unknown", sourceLabel]
      });
    }
  }
}

function collectWorldRequirements(request, inputs, holds) {
  const words = {};
  const definitions = {};
  const wordSources = new Map();
  const definitionSources = new Map();
  const requestRequirements = request.world_requirements || {};

  mergeNamed(words, requestRequirements.words || {}, "word", "request", wordSources, holds);
  mergeNamed(definitions, requestRequirements.definitions || requestRequirements.defs || {}, "definition", "request", definitionSources, holds);

  inputs.forEach((input, index) => {
    const req = (input && input.world_requirements) || {};
    mergeNamed(words, req.words || {}, "word", "input[" + index + "]", wordSources, holds);
    mergeNamed(definitions, req.definitions || req.defs || {}, "definition", "input[" + index + "]", definitionSources, holds);
  });

  const out = {};
  if (Object.keys(words).length) out.words = words;
  if (Object.keys(definitions).length) out.definitions = definitions;
  return Object.keys(out).length ? out : null;
}

function inspectWorldRequirementIdentities(worldRequirements) {
  const holds = [];
  const inspect = (kind, entries, embeddedField) => {
    for (const identity of Object.keys(entries || {}).sort()) {
      const value = entries[identity];
      if (!value || typeof value !== "object" || Array.isArray(value) || !hasOwn(value, embeddedField)) continue;
      if (value[embeddedField] === identity) continue;
      holds.push({
        code: kind === "word" ? "HOLD_WORD_IDENTITY_MISMATCH" : "HOLD_DEFINITION_IDENTITY_MISMATCH",
        identity,
        embedded_identity: clone(value[embeddedField]),
        detail: "Named world-requirement map identity and embedded " + embeddedField + " disagree; Assembly will not rely on downstream normalization to silently rewrite identity."
      });
    }
  };

  inspect("word", worldRequirements && worldRequirements.words, "name");
  inspect("definition", worldRequirements && worldRequirements.definitions, "id");
  return holds;
}

function addRecipeDefinitionRefs(parts, refs) {
  for (const part of parts || []) {
    if (!part || typeof part !== "object" || Array.isArray(part)) continue;
    if (typeof part.use === "string" && part.use) refs.add(part.use);
    if (Array.isArray(part.body)) addRecipeDefinitionRefs(part.body, refs);
  }
}

function addMatterDefinitionRefs(matter, refs) {
  if (!matter || typeof matter !== "object" || Array.isArray(matter)) return;
  const mesh = matter.facets && matter.facets.mesh;
  if (mesh && mesh.type === "generated" && mesh.data && mesh.data.generator === "recipe") {
    addRecipeDefinitionRefs(mesh.data.parts, refs);
  }
  for (const capability of matter.capabilities || []) {
    const def = capability && capability.grants_ref && capability.grants_ref.def;
    if (typeof def === "string" && def) refs.add(def);
  }
}

function inspectDefinitionClosure(candidate, worldRequirements) {
  const definitions = (worldRequirements && worldRequirements.definitions) || {};
  const pending = new Set();
  addMatterDefinitionRefs(candidate, pending);
  const required = new Set();
  const missing = new Set();

  while (pending.size) {
    const id = Array.from(pending).sort()[0];
    pending.delete(id);
    if (required.has(id)) continue;
    required.add(id);
    const definition = definitions[id];
    if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
      missing.add(id);
      continue;
    }
    const nested = new Set();
    addMatterDefinitionRefs(definition.body || {}, nested);
    for (const nestedId of nested) if (!required.has(nestedId)) pending.add(nestedId);
  }

  return {
    required: Array.from(required).sort(),
    missing: Array.from(missing).sort()
  };
}

function collectSourceProvenance(inputs) {
  return inputs.map((input, index) => {
    const candidate = candidateOf(input) || {};
    return {
      input: index,
      status: input && hasOwn(input, "status") ? input.status : null,
      machine: input && input.machine ? clone(input.machine) : null,
      request_id: input && input.request_id ? input.request_id : null,
      candidate_schema: candidate && candidate.schema ? candidate.schema : null,
      provenance: input && input.provenance ? clone(input.provenance) : null
    };
  });
}

function portableInputHold(request, error) {
  const safeRequest = {
    envelope_version: "0.1",
    request_id: safeRequestId(request) || "assembly-nonportable-input",
    goal: "Reject non-portable Assembly input before transport",
    provenance: {}
  };
  return result(safeRequest, MACHINE, "HOLD", {
    holds: [error.toHold()],
    provenance: {},
    evidence: [{
      kind: "INPUT_PORTABILITY",
      status: "HOLD",
      check: "caller-authored Assembly request data is rejected before JSON serialization can invoke hooks or rewrite/drop values"
    }]
  });
}

function run(request) {
  let portableRequest;
  try {
    portableRequest = clonePortableValue(request, "request");
  } catch (error) {
    if (error instanceof PortableDataError) return portableInputHold(request, error);
    throw error;
  }
  request = portableRequest;
  assertRequest(request);
  const inputs = request.inputs || [];
  if (!inputs.length) {
    return result(request, MACHINE, "HOLD", { holds: [{ code: "HOLD_NO_CANDIDATES" }] });
  }

  const conflicts = [];
  const conflictOwners = new Map();
  const holds = [];
  const warnings = [];
  const heldCandidates = [];
  const assemblyId = resolveAssemblyId(request, inputs, holds);
  const assemblyPath = resolveAssemblyTargetPath(request, assemblyId, holds);
  const targetBinding = assemblyId ? { id: assemblyId, path: assemblyPath || assemblyId } : null;
  const assembled = {
    schema: "morphtile.tile-spec/v0.4",
    name: (request.intent || {}).name || "Assembled candidate",
    form_hints: [],
    facets: {}
  };
  if (assemblyId) assembled.id = assemblyId;

  let foldedInterfaceMatter = false;
  inputs.forEach((input, index) => {
    if (mergeCandidate(assembled, assemblyPath, input, index, conflicts, holds, warnings, heldCandidates, conflictOwners)) {
      foldedInterfaceMatter = true;
    }
  });

  const dependencies = collectDependencies(request, inputs, holds);
  const worldRequirements = collectWorldRequirements(request, inputs, holds);
  holds.push(...inspectWorldRequirementIdentities(worldRequirements));
  const definitionClosure = inspectDefinitionClosure(assembled, worldRequirements);
  const sourceProvenance = collectSourceProvenance(inputs);

  if (definitionClosure.missing.length) {
    holds.push({
      code: "HOLD_DEFINITION_CLOSURE_INCOMPLETE",
      missing: definitionClosure.missing,
      required: definitionClosure.required,
      detail: "Assembled MorphTile matter references definitions that are absent from the declared world-requirement closure; Assembly will not claim a complete candidate until those definitions are supplied."
    });
  }

  if (foldedInterfaceMatter && !assembled.form_hints.includes("ui_panel")) {
    holds.push({
      code: "HOLD_VIEW_TARGET_FORM_MISSING",
      required_form: "ui_panel",
      detail: "The proven Interface contracts require the assembled target to declare ui_panel; Assembly will not invent that form hint."
    });
  }

  if (conflicts.length) {
    holds.push({
      code: "HOLD_ASSEMBLY_CONFLICT",
      paths: Array.from(new Set(conflicts.map((item) => item.path))).sort(),
      conflicts: clone(conflicts)
    });
  }

  if (holds.length) {
    return result(request, MACHINE, "HOLD", {
      target_binding: targetBinding,
      dependencies,
      world_requirements: worldRequirements,
      required_definitions: definitionClosure.required,
      source_provenance: sourceProvenance,
      held_candidates: heldCandidates,
      warnings,
      holds,
      evidence: [{
        kind: "INPUTS",
        status: "PASS",
        check: "input envelopes, upstream HOLDs/warnings, unsupported candidates, addressed Interface path bindings, named world-requirement identities, definition closure, and all conflicting variants/sources remain inspectable and are not promoted without proof"
      }]
    });
  }

  const hash = closureHash(assembled, dependencies, worldRequirements);
  return result(request, MACHINE, "CANDIDATE", {
    target_binding: targetBinding,
    candidate: assembled,
    dependencies,
    world_requirements: worldRequirements,
    required_definitions: definitionClosure.required,
    source_provenance: sourceProvenance,
    closure_hash: hash,
    warnings,
    evidence: [
      {
        kind: "ASSEMBLY",
        status: "PASS",
        check: "deterministic compatible candidate union without overwrite; proven Interface v0.4/v0.5 view and presentation operations are folded only when exact local/nested target binding matches and ui_panel eligibility already exists"
      },
      {
        kind: "CLOSURE",
        status: "PASS",
        check: "request/input dependency and world-requirement closure plus source provenance and upstream warnings are preserved; explicit word/definition identities agree with their map keys and direct/transitive definition references are present before completion is claimed"
      },
      {
        kind: "HASH",
        status: "PASS",
        check: "candidate + dependencies + world requirements are bound by canonical SHA-256; address binding, derived requirement indexes, provenance/evidence/warnings are intentionally outside portable content identity"
      }
    ]
  });
}

module.exports = {
  MACHINE,
  canonical,
  sha256Canonical,
  closureHash,
  inspectWorldRequirementIdentities,
  inspectDefinitionClosure,
  resolveAssemblyId,
  resolveAssemblyTargetPath,
  run
};