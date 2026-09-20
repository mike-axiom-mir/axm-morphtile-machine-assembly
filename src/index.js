"use strict";

const { createHash } = require("node:crypto");
const { assertRequest, clone, result } = require("./envelope");
const { parseInterfaceOperations } = require("./interface-operations");
const MACHINE = { id: "axm.morphtile.machine.assembly", version: "0.5.0" };
const SUPPORTED_SCHEMAS = new Set([
  "morphtile.tile-spec/v0.4",
  "morphtile.facet-candidate/v0.4",
  "morphtile.capability-candidate/v0.4",
  "morphtile.view-operation/v0.4",
  "morphtile.interface-operations/v0.4"
]);
const TILE_ID = /^[A-Za-z0-9_-]+$/;
const VIEW_CANDIDATE_KEYS = new Set(["schema", "operation"]);
const VIEW_OPERATION_KEYS = new Set(["op", "id", "view"]);

function canonical(value) {
  if (value === null || value === undefined || typeof value !== "object") return JSON.stringify(value === undefined ? null : value);
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

function mergeObject(target, source, path, conflicts) {
  for (const key of Object.keys(source || {}).sort()) {
    const at = path ? path + "." + key : key;
    if (!(key in target)) target[key] = clone(source[key]);
    else if (!same(target[key], source[key])) conflicts.push(at);
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

function foldViewOperation(assembled, candidate, inputIndex, conflicts, holds) {
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
  if (typeof operation.id !== "string" || !TILE_ID.test(operation.id)) {
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
      detail: "Assembly requires an explicit tile identity before folding an operation into new matter."
    });
    return false;
  }
  if (operation.id !== assembled.id) {
    holds.push({
      code: "HOLD_VIEW_OPERATION_TARGET_MISMATCH",
      input: inputIndex,
      target: operation.id,
      assembled_id: assembled.id
    });
    return false;
  }

  mergeObject(assembled, { view: operation.view }, "", conflicts);
  return true;
}

function foldInterfaceOperations(assembled, candidate, inputIndex, conflicts, holds) {
  const parsed = parseInterfaceOperations(assembled.id, candidate, inputIndex);
  if (!parsed.ok) {
    holds.push(...parsed.holds);
    return false;
  }
  mergeObject(assembled, { view: parsed.view }, "", conflicts);
  mergeObject(assembled, { presentation: parsed.presentation }, "", conflicts);
  return true;
}

function mergeCandidate(assembled, input, inputIndex, conflicts, holds, warnings, heldCandidates) {
  preserveInputWarnings(input, inputIndex, warnings);
  if (!inspectInputEnvelope(input, inputIndex, holds)) return false;

  const candidate = candidateOf(input) || {};
  const schema = candidate.schema || null;
  if (schema && !SUPPORTED_SCHEMAS.has(schema)) {
    holds.push({
      code: "HOLD_UNASSEMBLABLE_CANDIDATE_SCHEMA",
      input: inputIndex,
      schema,
      detail: "Assembly Machine only folds proven tile/facet/capability candidates plus the exact stable Interface view.set and view.set+presentation.set contracts into a tile spec; other operation candidates remain explicit until proven."
    });
    heldCandidates.push({ input: inputIndex, schema, candidate: clone(candidate) });
    return false;
  }
  if (!schema) warnings.push({ code: "LEGACY_SCHEMALESS_FRAGMENT", input: inputIndex });

  if (schema === "morphtile.view-operation/v0.4") {
    return foldViewOperation(assembled, candidate, inputIndex, conflicts, holds);
  }
  if (schema === "morphtile.interface-operations/v0.4") {
    return foldInterfaceOperations(assembled, candidate, inputIndex, conflicts, holds);
  }

  mergeFormHints(assembled.form_hints, candidate.form_hints);

  if (schema === "morphtile.facet-candidate/v0.4" || (candidate.facet && Object.prototype.hasOwnProperty.call(candidate, "value"))) {
    mergeObject(assembled.facets, { [candidate.facet]: candidate.value }, "facets", conflicts);
    return false;
  }

  mergeObject(assembled.facets, candidate.facets || {}, "facets", conflicts);
  for (const field of ["view", "presentation", "params", "capabilities"]) {
    if (candidate[field] !== undefined) mergeObject(assembled, { [field]: candidate[field] }, "", conflicts);
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

  return Array.from(seen.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, item]) => item.value);
}

function mergeNamed(target, source, kind, sourceLabel, holds) {
  for (const name of Object.keys(source || {}).sort()) {
    if (!(name in target)) {
      target[name] = clone(source[name]);
      continue;
    }
    if (!same(target[name], source[name])) {
      holds.push({
        code: kind === "word" ? "HOLD_WORD_CONFLICT" : "HOLD_DEFINITION_CONFLICT",
        identity: name,
        source: sourceLabel
      });
    }
  }
}

function collectWorldRequirements(request, inputs, holds) {
  const words = {};
  const definitions = {};
  const requestRequirements = request.world_requirements || {};
  mergeNamed(words, requestRequirements.words || {}, "word", "request", holds);
  mergeNamed(definitions, requestRequirements.definitions || requestRequirements.defs || {}, "definition", "request", holds);

  inputs.forEach((input, index) => {
    const req = (input && input.world_requirements) || {};
    mergeNamed(words, req.words || {}, "word", "input[" + index + "]", holds);
    mergeNamed(definitions, req.definitions || req.defs || {}, "definition", "input[" + index + "]", holds);
  });
  const out = {};
  if (Object.keys(words).length) out.words = words;
  if (Object.keys(definitions).length) out.definitions = definitions;
  return Object.keys(out).length ? out : null;
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

function run(request) {
  assertRequest(request);
  const inputs = request.inputs || [];
  if (!inputs.length) return result(request, MACHINE, "HOLD", { holds: [{ code: "HOLD_NO_CANDIDATES" }] });

  const conflicts = [];
  const holds = [];
  const warnings = [];
  const heldCandidates = [];
  const assemblyId = resolveAssemblyId(request, inputs, holds);
  const assembled = {
    schema: "morphtile.tile-spec/v0.4",
    name: (request.intent || {}).name || "Assembled candidate",
    form_hints: [],
    facets: {}
  };
  if (assemblyId) assembled.id = assemblyId;

  let foldedInterfaceMatter = false;
  inputs.forEach((input, index) => {
    if (mergeCandidate(assembled, input, index, conflicts, holds, warnings, heldCandidates)) foldedInterfaceMatter = true;
  });
  const dependencies = collectDependencies(request, inputs, holds);
  const worldRequirements = collectWorldRequirements(request, inputs, holds);
  const sourceProvenance = collectSourceProvenance(inputs);

  if (foldedInterfaceMatter && !assembled.form_hints.includes("ui_panel")) {
    holds.push({
      code: "HOLD_VIEW_TARGET_FORM_MISSING",
      required_form: "ui_panel",
      detail: "The proven Interface contracts require the assembled target to declare ui_panel; Assembly will not invent that form hint."
    });
  }
  if (conflicts.length) holds.push({ code: "HOLD_ASSEMBLY_CONFLICT", paths: Array.from(new Set(conflicts)).sort() });
  if (holds.length) {
    return result(request, MACHINE, "HOLD", {
      dependencies,
      world_requirements: worldRequirements,
      source_provenance: sourceProvenance,
      held_candidates: heldCandidates,
      warnings,
      holds,
      evidence: [{ kind: "INPUTS", status: "PASS", check: "input envelopes, upstream HOLDs/warnings, unsupported candidates, and addressed operation boundaries remain inspectable and are not promoted without proof" }]
    });
  }

  const hash = closureHash(assembled, dependencies, worldRequirements);
  return result(request, MACHINE, "CANDIDATE", {
    candidate: assembled,
    dependencies,
    world_requirements: worldRequirements,
    source_provenance: sourceProvenance,
    closure_hash: hash,
    warnings,
    evidence: [
      { kind: "ASSEMBLY", status: "PASS", check: "deterministic compatible candidate union without overwrite; proven Interface view and presentation operations are folded only when target identity matches and ui_panel eligibility already exists" },
      { kind: "CLOSURE", status: "PASS", check: "request/input dependency and world-requirement closure plus source provenance and upstream warnings are preserved without silent replacement" },
      { kind: "HASH", status: "PASS", check: "candidate + dependencies + world requirements are bound by canonical SHA-256; provenance/evidence/warnings are intentionally outside content identity" }
    ]
  });
}

module.exports = { MACHINE, canonical, sha256Canonical, closureHash, resolveAssemblyId, run };
