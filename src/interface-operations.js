"use strict";

const TILE_ID = /^[A-Za-z0-9_-]+$/;
const CANDIDATE_KEYS = new Set(["schema", "operations"]);
const OPERATION_KEYS = {
  "view.set": new Set(["op", "id", "view"]),
  "presentation.set": new Set(["op", "id", "presentation"])
};
const PRESENTATION_KEYS = new Set(["mode", "dock", "preferred_size", "preferred_position", "user_adjustable", "anchor"]);
const PRESENTATION_MODES = new Set(["screen", "docked", "floating", "fullscreen", "embedded", "world", "tile"]);
const DOCKS = new Set(["left", "right", "top", "bottom"]);

function finiteVector(value, length) {
  return Array.isArray(value) && value.length === length && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function fail(input, detail, extra) {
  return {
    ok: false,
    holds: [{ code: "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID", input, detail, ...(extra || {}) }]
  };
}

function validatePresentation(value, input) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fail(input, "presentation.set presentation must be an object");
  const unknown = Object.keys(value).filter((key) => !PRESENTATION_KEYS.has(key)).sort();
  if (unknown.length) return fail(input, "presentation.set contains unsupported presentation field(s)", { fields: unknown });
  if (!PRESENTATION_MODES.has(value.mode)) return fail(input, "presentation.mode must be screen|docked|floating|fullscreen|embedded|world|tile");
  if (value.dock != null && !DOCKS.has(value.dock)) return fail(input, "presentation.dock must be left|right|top|bottom");
  if (value.preferred_size != null && (!finiteVector(value.preferred_size, 2) || value.preferred_size.some((item) => item <= 0))) return fail(input, "presentation.preferred_size must be two positive finite numbers");
  if (value.preferred_position != null && !(finiteVector(value.preferred_position, 2) || finiteVector(value.preferred_position, 3))) return fail(input, "presentation.preferred_position must be two or three finite numbers");
  if (value.user_adjustable != null && typeof value.user_adjustable !== "boolean") return fail(input, "presentation.user_adjustable must be boolean");
  if (value.anchor != null && typeof value.anchor !== "string") return fail(input, "presentation.anchor must be a tile path string");
  return { ok: true };
}

function parseInterfaceOperations(assembledId, candidate, input) {
  const unknownCandidate = Object.keys(candidate || {}).filter((key) => !CANDIDATE_KEYS.has(key)).sort();
  if (unknownCandidate.length) return fail(input, "interface-operations candidate contains unsupported field(s)", { fields: unknownCandidate });
  if (!Array.isArray(candidate.operations)) return fail(input, "interface-operations candidate.operations must be an array");
  if (candidate.operations.length !== 2) return fail(input, "current proven interface-operations contract requires exactly view.set plus presentation.set", { operation_count: candidate.operations.length });

  const byType = {};
  for (const operation of candidate.operations) {
    if (!operation || typeof operation !== "object" || Array.isArray(operation)) return fail(input, "every interface operation must be an object");
    if (!OPERATION_KEYS[operation.op]) return fail(input, "unsupported interface operation; only view.set and presentation.set are proven", { operation: operation.op == null ? null : String(operation.op) });
    if (byType[operation.op]) return fail(input, "duplicate interface operation", { operation: operation.op });
    const unknownOperation = Object.keys(operation).filter((key) => !OPERATION_KEYS[operation.op].has(key)).sort();
    if (unknownOperation.length) return fail(input, operation.op + " contains unsupported field(s)", { fields: unknownOperation });
    if (typeof operation.id !== "string" || !TILE_ID.test(operation.id)) return fail(input, operation.op + " target id is invalid", { target: operation.id == null ? null : operation.id });
    byType[operation.op] = operation;
  }

  const view = byType["view.set"];
  const presentation = byType["presentation.set"];
  if (!view || !presentation) return fail(input, "current proven interface-operations contract requires one view.set and one presentation.set");
  if (!view.view || typeof view.view !== "object" || Array.isArray(view.view)) return fail(input, "view.set view must be an object");
  const presentationCheck = validatePresentation(presentation.presentation, input);
  if (!presentationCheck.ok) return presentationCheck;
  if (view.id !== presentation.id) return fail(input, "interface operations target different tile identities", { targets: [view.id, presentation.id] });
  if (!assembledId) {
    return {
      ok: false,
      holds: [{
        code: "HOLD_INTERFACE_OPERATIONS_TARGET_UNBOUND",
        input,
        target: view.id,
        detail: "Assembly requires an explicit tile identity before folding addressed operations into new matter."
      }]
    };
  }
  if (view.id !== assembledId) {
    return {
      ok: false,
      holds: [{ code: "HOLD_INTERFACE_OPERATIONS_TARGET_MISMATCH", input, target: view.id, assembled_id: assembledId }]
    };
  }

  return { ok: true, view: view.view, presentation: presentation.presentation, target: view.id };
}

module.exports = { parseInterfaceOperations, validatePresentation };
