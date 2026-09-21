"use strict";

const { types: { isProxy } } = require("node:util");

class PortableDataError extends Error {
  constructor(code, path, detail) {
    super(detail);
    this.name = "PortableDataError";
    this.code = code;
    this.path = path;
  }

  toHold() {
    return {
      code: this.code,
      path: this.path,
      detail: this.message
    };
  }
}

function nonportable(path, detail) {
  throw new PortableDataError("HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE", path, detail);
}

function shapeError(code, path, detail) {
  throw new PortableDataError(code, path, detail);
}

function isPlainRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertAssemblySemanticShape(value, path) {
  if (path === "request.inputs" && !Array.isArray(value)) {
    shapeError("HOLD_INPUTS_SHAPE_INVALID", path, "Assembly request.inputs must be an authored array; Assembly will not inherit iterable/string container semantics.");
  }

  if (/^request\.inputs\[\d+\]$/.test(path) && !isPlainRecord(value)) {
    shapeError("HOLD_INPUT_SHAPE_INVALID", path, "Each Assembly input entry must be an authored plain object.");
  }

  if (
    value != null &&
    (path === "request.dependencies" || /^request\.inputs\[\d+\]\.dependencies$/.test(path)) &&
    !Array.isArray(value)
  ) {
    shapeError("HOLD_DEPENDENCIES_SHAPE_INVALID", path, "Assembly dependency collections must be authored arrays; objects and strings are not reinterpreted as dependency sequences.");
  }

  if (value != null && /^request\.inputs\[\d+\]\.warnings$/.test(path) && !Array.isArray(value)) {
    shapeError("HOLD_WARNINGS_SHAPE_INVALID", path, "Upstream warning collections must be authored arrays.");
  }

  if (value != null && /^request\.inputs\[\d+\]\.candidate\.form_hints$/.test(path) && !Array.isArray(value)) {
    shapeError("HOLD_FORM_HINTS_SHAPE_INVALID", path, "candidate.form_hints must be an authored array of non-empty strings.");
  }

  if (/^request\.inputs\[\d+\]\.candidate\.form_hints\[\d+\]$/.test(path) && (typeof value !== "string" || !value)) {
    shapeError("HOLD_FORM_HINTS_SHAPE_INVALID", path, "Every candidate.form_hints entry must be a non-empty string.");
  }

  if (value != null && /^request\.inputs\[\d+\]\.candidate\.facets$/.test(path) && !isPlainRecord(value)) {
    shapeError("HOLD_FACETS_SHAPE_INVALID", path, "candidate.facets must be an authored plain map; array indices are not facet identities.");
  }

  if (
    value != null &&
    (
      path === "request.world_requirements" ||
      /^request\.inputs\[\d+\]\.world_requirements$/.test(path) ||
      path === "request.world_requirements.words" ||
      path === "request.world_requirements.definitions" ||
      path === "request.world_requirements.defs" ||
      /^request\.inputs\[\d+\]\.world_requirements\.(words|definitions|defs)$/.test(path)
    ) &&
    !isPlainRecord(value)
  ) {
    shapeError("HOLD_WORLD_REQUIREMENTS_SHAPE_INVALID", path, "World requirements and their named word/definition collections must be authored plain maps when present; null retains the established omitted-field meaning.");
  }
}

function clonePortableValue(value, path = "value", stack = new Set()) {
  // Proxy detection must happen before semantic shape checks: even seemingly
  // harmless reflection such as Array.isArray/getPrototypeOf can throw or trap
  // on revoked/intercepted values.
  if (value && typeof value === "object" && isProxy(value)) {
    nonportable(path, "Assembly input uses a Proxy object whose traps could execute during authored-data inspection.");
  }

  // Portability and semantic container identity are separate promises. A value
  // can be JSON-portable while still being the wrong authored container type.
  // Reject those shapes before host iteration/Object.keys semantics can silently
  // reinterpret strings, arrays or objects as another Assembly grammar.
  assertAssemblySemanticShape(value, path);

  if (value === null || typeof value === "string" || typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new PortableDataError(
        "HOLD_ASSEMBLY_INPUT_NONFINITE_VALUE",
        path,
        "Assembly input contains a non-finite number that portable JSON would rewrite instead of preserve exactly."
      );
    }
    if (Object.is(value, -0)) {
      nonportable(path, "Assembly input contains -0, which portable JSON would rewrite to 0.");
    }
    return value;
  }

  if (value === undefined || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    nonportable(path, "Assembly input contains a value type that portable JSON would rewrite, drop, or reject.");
  }

  if (typeof value !== "object") {
    nonportable(path, "Assembly input contains an unsupported portable value.");
  }

  if (stack.has(value)) {
    nonportable(path, "Assembly input contains a cycle that portable JSON cannot represent.");
  }
  stack.add(value);

  try {
    if (Array.isArray(value)) {
      if (Object.getOwnPropertySymbols(value).length) {
        nonportable(path, "Assembly input contains symbol-keyed array properties that portable JSON would drop.");
      }

      const ownNames = Object.getOwnPropertyNames(value);
      const unexpected = ownNames.filter((name) => {
        if (name === "length") return false;
        if (!/^(0|[1-9][0-9]*)$/.test(name)) return true;
        return Number(name) >= value.length;
      });
      if (unexpected.length) {
        nonportable(path, "Assembly input contains array properties that portable JSON would not preserve: " + unexpected.sort().join(", "));
      }

      const out = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) {
          nonportable(path + "[" + index + "]", "Assembly input contains a sparse array slot that portable JSON would rewrite to null.");
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor || !("value" in descriptor)) {
          nonportable(path + "[" + index + "]", "Assembly input uses an accessor instead of portable authored data.");
        }
        if (!descriptor.enumerable) {
          nonportable(path + "[" + index + "]", "Assembly input contains a non-enumerable array item that portable JSON would not preserve as authored.");
        }
        out.push(clonePortableValue(descriptor.value, path + "[" + index + "]", stack));
      }
      return out;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      nonportable(path, "Assembly input uses a non-plain object that portable JSON would reinterpret.");
    }
    if (Object.getOwnPropertySymbols(value).length) {
      nonportable(path, "Assembly input contains symbol-keyed properties that portable JSON would drop.");
    }

    const descriptors = Object.getOwnPropertyDescriptors(value);
    const out = Object.create(null);
    for (const name of Object.getOwnPropertyNames(value)) {
      const descriptor = descriptors[name];
      if (!descriptor.enumerable) {
        nonportable(path + "." + name, "Assembly input contains a non-enumerable property that portable JSON would drop.");
      }
      if (!("value" in descriptor)) {
        nonportable(path + "." + name, "Assembly input uses an accessor instead of portable authored data.");
      }
      Object.defineProperty(out, name, {
        value: clonePortableValue(descriptor.value, path + "." + name, stack),
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    return out;
  } finally {
    stack.delete(value);
  }
}

function safeRequestId(request) {
  if (!request || typeof request !== "object") return null;
  if (isProxy(request)) return null;
  if (Array.isArray(request)) return null;
  const descriptor = Object.getOwnPropertyDescriptor(request, "request_id");
  if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "string" || !descriptor.value) return null;
  return descriptor.value;
}

module.exports = { PortableDataError, clonePortableValue, safeRequestId };
