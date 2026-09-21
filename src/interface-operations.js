"use strict";

const TILE_PATH = /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/;
const CANDIDATE_KEYS = new Set(["schema", "operations"]);
const OPERATION_KEYS = {
  "view.set": new Set(["op", "id", "view"]),
  "presentation.set": new Set(["op", "id", "presentation"])
};
const PRESENTATION_KEYS = new Set(["mode", "dock", "preferred_size", "preferred_position", "user_adjustable", "anchor"]);
const PRESENTATION_MODES = new Set(["screen", "docked", "floating", "fullscreen", "embedded", "world", "tile"]);
const DOCKS = new Set(["left", "right", "top", "bottom"]);
const CURRENT_INTERFACE_OPERATIONS_SCHEMA = "morphtile.interface-operations/v0.5";

function isTilePath(value) {
  return typeof value === "string" && TILE_PATH.test(value);
}

function pathLeaf(value) {
  return isTilePath(value) ? value.split("/").at(-1) : null;
}

function finiteVector(value, length) {
  return Array.isArray(value) && value.length === length && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function fail(input, detail, extra) {
  return {
    ok: false,
    holds: [{ code: "HOLD_INTERFACE_OPERATIONS_SHAPE_INVALID", input, detail, ...(extra || {}) }]
  };
}

function validatePresentation(value, input, schema) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fail(input, "presentation.set presentation must be an object");
  const unknown = Object.keys(value).filter((key) => !PRESENTATION_KEYS.has(key)).sort();
  if (unknown.length) return fail(input, "presentation.set contains unsupported presentation field(s)", { fields: unknown });
  if (!PRESENTATION_MODES.has(value.mode)) return fail(input, "presentation.mode must be screen|docked|floating|fullscreen|embedded|world|tile");

  // v0.5 is the exact currently-proven Interface transport contract. Its
  // optional presentation fields distinguish genuine omission from authored
  // invalid presence, and dock/anchor remain owned by the modes that consume
  // them. Keep the older v0.4 compatibility path on its historical nullish
  // semantics rather than silently rewriting legacy evidence while tightening
  // the current contract.
  const currentContract = schema === CURRENT_INTERFACE_OPERATIONS_SCHEMA;
  const authored = (key) => currentContract ? value[key] !== undefined : value[key] != null;

  if (authored("dock") && !DOCKS.has(value.dock)) return fail(input, "presentation.dock must be left|right|top|bottom");
  if (currentContract && authored("dock") && value.mode !== "docked") return fail(input, "presentation.dock is consumed only by docked presentation mode");
  if (authored("preferred_size") && (!finiteVector(value.preferred_size, 2) || value.preferred_size.some((item) => item <= 0))) return fail(input, "presentation.preferred_size must be two positive finite numbers");
  if (authored("preferred_position") && !(finiteVector(value.preferred_position, 2) || finiteVector(value.preferred_position, 3))) return fail(input, "presentation.preferred_position must be two or three finite numbers");
  if (authored("user_adjustable") && typeof value.user_adjustable !== "boolean") return fail(input, "presentation.user_adjustable must be boolean");
  if (authored("anchor") && !isTilePath(value.anchor)) return fail(input, "presentation.anchor must use the bounded MorphTile tile-path grammar");
  if (currentContract && authored("anchor") && value.mode !== "tile") return fail(input, "presentation.anchor is consumed only by tile presentation mode");
  return { ok: true };
}

function parseInterfaceOperations(assembledId, assembledPath, candidate, input) {
  const unknownCandidate = Object.keys(candidate || {}).filter((key) => !CANDIDATE_KEYS.has(key)).sort();
  if (unknownCandidate.length) return fail(input, "interface-operations candidate contains unsupported field(s)", { fields: unknownCandidate });
  if (!Array.isArray(candidate.operations)) return fail(input, "interface-operations candidate.operations must be an array");
  if (candidate.operations.length !== 2) return fail(input, "current proven interface-operations contract requires exactly view.set plus presentation.set", { operation_count: candidate.operations.length });

  const byType = Object.create(null);
  for (const operation of candidate.operations) {
    if (!operation || typeof operation !== "object" || Array.isArray(operation)) return fail(input, "every interface operation must be an object");
    if (typeof operation.op !== "string" || !operation.op) return fail(input, "unsupported interface operation; operation op must be a non-empty string");
    const operationKeys = Object.prototype.hasOwnProperty.call(OPERATION_KEYS, operation.op) ? OPERATION_KEYS[operation.op] : null;
    if (!operationKeys) return fail(input, "unsupported interface operation; only view.set and presentation.set are proven", { operation: operation.op });
    if (Object.prototype.hasOwnProperty.call(byType, operation.op)) return fail(input, "duplicate interface operation", { operation: operation.op });
    const unknownOperation = Object.keys(operation).filter((key) => !operationKeys.has(key)).sort();
    if (unknownOperation.length) return fail(input, operation.op + " contains unsupported field(s)", { fields: unknownOperation });
    if (!isTilePath(operation.id)) return fail(input, operation.op + " target path is invalid", { target: operation.id == null ? null : operation.id });
    byType[operation.op] = operation;
  }

  const view = byType["view.set"];
  const presentation = byType["presentation.set"];
  if (!view || !presentation) return fail(input, "current proven interface-operations contract requires one view.set and one presentation.set");
  if (!view.view || typeof view.view !== "object" || Array.isArray(view.view)) return fail(input, "view.set view must be an object");
  const presentationCheck = validatePresentation(presentation.presentation, input, candidate.schema);
  if (!presentationCheck.ok) return presentationCheck;
  if (view.id !== presentation.id) return fail(input, "interface operations target different tile paths", { targets: [view.id, presentation.id] });
  if (!assembledId) {
    return {
      ok: false,
      holds: [{
        code: "HOLD_INTERFACE_OPERATIONS_TARGET_UNBOUND",
        input,
        target: view.id,
        detail: "Assembly requires an explicit local tile identity before folding addressed operations into new matter."
      }]
    };
  }
  if (view.id.includes("/") && !assembledPath) {
    return {
      ok: false,
      holds: [{
        code: "HOLD_INTERFACE_OPERATIONS_TARGET_PATH_UNBOUND",
        input,
        target: view.id,
        assembled_id: assembledId,
        detail: "A nested Interface target requires request.intent.tile_path so Assembly does not infer parent context from a matching leaf id."
      }]
    };
  }

  const expectedTarget = assembledPath || assembledId;
  if (view.id !== expectedTarget) {
    return {
      ok: false,
      holds: [{
        code: "HOLD_INTERFACE_OPERATIONS_TARGET_MISMATCH",
        input,
        target: view.id,
        assembled_id: assembledId,
        assembled_path: assembledPath || null
      }]
    };
  }

  return { ok: true, view: view.view, presentation: presentation.presentation, target: view.id };
}

module.exports = { isTilePath, pathLeaf, parseInterfaceOperations, validatePresentation };
