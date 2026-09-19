"use strict";

const { assertRequest, clone, result } = require("./envelope");
const MACHINE = { id: "axm.morphtile.machine.assembly", version: "0.1.0" };

function mergeObject(target, source, path, conflicts) {
  for (const key of Object.keys(source || {}).sort()) {
    const at = path ? path + "." + key : key;
    if (!(key in target)) target[key] = clone(source[key]);
    else if (JSON.stringify(target[key]) !== JSON.stringify(source[key])) conflicts.push(at);
  }
}

function run(request) {
  assertRequest(request);
  const inputs = request.inputs || [];
  if (!inputs.length) return result(request, MACHINE, "HOLD", { holds: [{ code: "HOLD_NO_CANDIDATES" }] });
  const assembled = { schema: "morphtile.tile-spec/v0.4", name: (request.intent || {}).name || "Assembled candidate", form_hints: [], facets: {} };
  const conflicts = [];
  for (const input of inputs) {
    const candidate = input.candidate || input;
    if (candidate.form_hints) for (const hint of candidate.form_hints) if (!assembled.form_hints.includes(hint)) assembled.form_hints.push(hint);
    mergeObject(assembled.facets, candidate.facets || (candidate.facet ? { [candidate.facet]: candidate.value } : {}), "facets", conflicts);
    mergeObject(assembled, candidate.view ? { view: candidate.view } : {}, "", conflicts);
    if (candidate.capabilities) mergeObject(assembled, { capabilities: candidate.capabilities }, "", conflicts);
  }
  if (conflicts.length) return result(request, MACHINE, "HOLD", { holds: [{ code: "HOLD_ASSEMBLY_CONFLICT", paths: conflicts }], evidence: [{ kind: "INPUTS", status: "PASS", check: "inputs retained outside output and not mutated" }] });
  return result(request, MACHINE, "CANDIDATE", {
    candidate: assembled,
    dependencies: clone(request.dependencies || []),
    evidence: [{ kind: "ASSEMBLY", status: "PASS", check: "deterministic facet union without overwrite" }]
  });
}

module.exports = { MACHINE, run };
