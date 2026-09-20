"use strict";

const { createHash } = require("node:crypto");
const { assertRequest, clone, result } = require("./envelope");
const MACHINE = { id: "axm.morphtile.machine.assembly", version: "0.2.1" };
const SUPPORTED_SCHEMAS = new Set([
  "morphtile.tile-spec/v0.4",
  "morphtile.facet-candidate/v0.4",
  "morphtile.capability-candidate/v0.4"
]);

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

function candidateOf(input) {
  return input && input.candidate ? input.candidate : input;
}

function mergeCandidate(assembled, input, conflicts, holds, warnings) {
  const candidate = candidateOf(input) || {};
  const schema = candidate.schema || null;
  if (schema && !SUPPORTED_SCHEMAS.has(schema)) {
    holds.push({
      code: "HOLD_UNASSEMBLABLE_CANDIDATE_SCHEMA",
      schema,
      detail: "Assembly Machine only folds tile, facet, and capability candidates into a tile spec; operation bundles must remain explicit operations."
    });
    return;
  }
  if (!schema) warnings.push({ code: "LEGACY_SCHEMALESS_FRAGMENT" });

  mergeFormHints(assembled.form_hints, candidate.form_hints);

  if (schema === "morphtile.facet-candidate/v0.4" || (candidate.facet && Object.prototype.hasOwnProperty.call(candidate, "value"))) {
    mergeObject(assembled.facets, { [candidate.facet]: candidate.value }, "facets", conflicts);
    return;
  }

  mergeObject(assembled.facets, candidate.facets || {}, "facets", conflicts);
  for (const field of ["view", "presentation", "params", "capabilities"]) {
    if (candidate[field] !== undefined) mergeObject(assembled, { [field]: candidate[field] }, "", conflicts);
  }
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

function mergeNamed(target, source, kind, inputIndex, holds) {
  for (const name of Object.keys(source || {}).sort()) {
    if (!(name in target)) {
      target[name] = clone(source[name]);
      continue;
    }
    if (!same(target[name], source[name])) {
      holds.push({
        code: kind === "word" ? "HOLD_WORD_CONFLICT" : "HOLD_DEFINITION_CONFLICT",
        identity: name,
        source: "input[" + inputIndex + "]"
      });
    }
  }
}

function collectWorldRequirements(inputs, holds) {
  const words = {};
  const definitions = {};
  inputs.forEach((input, index) => {
    const req = (input && input.world_requirements) || {};
    mergeNamed(words, req.words || {}, "word", index, holds);
    mergeNamed(definitions, req.definitions || req.defs || {}, "definition", index, holds);
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
      machine: input && input.machine ? clone(input.machine) : null,
      request_id: input && input.request_id ? input.request_id : null,
      candidate_schema: candidate.schema || null,
      provenance: input && input.provenance ? clone(input.provenance) : null
    };
  });
}

function run(request) {
  assertRequest(request);
  const inputs = request.inputs || [];
  if (!inputs.length) return result(request, MACHINE, "HOLD", { holds: [{ code: "HOLD_NO_CANDIDATES" }] });

  const assembled = {
    schema: "morphtile.tile-spec/v0.4",
    name: (request.intent || {}).name || "Assembled candidate",
    form_hints: [],
    facets: {}
  };
  const conflicts = [];
  const holds = [];
  const warnings = [];

  for (const input of inputs) mergeCandidate(assembled, input, conflicts, holds, warnings);
  const dependencies = collectDependencies(request, inputs, holds);
  const worldRequirements = collectWorldRequirements(inputs, holds);
  const sourceProvenance = collectSourceProvenance(inputs);

  if (conflicts.length) holds.push({ code: "HOLD_ASSEMBLY_CONFLICT", paths: Array.from(new Set(conflicts)).sort() });
  if (holds.length) {
    return result(request, MACHINE, "HOLD", {
      dependencies,
      world_requirements: worldRequirements,
      source_provenance: sourceProvenance,
      warnings,
      holds,
      evidence: [{ kind: "INPUTS", status: "PASS", check: "inputs retained outside output and not mutated" }]
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
      { kind: "ASSEMBLY", status: "PASS", check: "deterministic compatible candidate union without overwrite" },
      { kind: "CLOSURE", status: "PASS", check: "dependency, world-requirement, and source-provenance closure preserved without silent replacement" },
      { kind: "HASH", status: "PASS", check: "candidate + dependencies + world requirements are bound by canonical SHA-256; provenance/evidence are intentionally outside content identity" }
    ]
  });
}

module.exports = { MACHINE, canonical, sha256Canonical, closureHash, run };
