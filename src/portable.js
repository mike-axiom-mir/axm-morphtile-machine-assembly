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

function clonePortableValue(value, path = "value", stack = new Set()) {
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

  // Descriptor-safe reflection is still executable for JavaScript Proxy values:
  // prototype/key/descriptor operations can dispatch caller-controlled traps.
  // Detect Proxy interception before any reflective inspection so source-integrity
  // validation itself cannot become a caller-code execution surface.
  if (isProxy(value)) {
    nonportable(path, "Assembly input uses a Proxy object whose traps could execute during authored-data inspection.");
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
