"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { run: assemble } = require("../src");
const { materializeKit } = require("../src/kit");

function baseRequest(id) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal: "Reject intercepted Assembly input before reflective source inspection",
    intent: { id: "mt_proxy_safe", name: "Proxy source proof" },
    inputs: [{
      status: "CANDIDATE",
      candidate: {
        schema: "morphtile.tile-spec/v0.4",
        id: "mt_proxy_safe",
        form_hints: [],
        facets: {}
      },
      provenance: { caller: "proxy-source-integrity-test" }
    }],
    provenance: { caller: "proxy-source-integrity-test" }
  };
}

function assemblyResult() {
  return {
    status: "CANDIDATE",
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      id: "mt_proxy_kit",
      name: "Proxy kit proof",
      form_hints: [],
      facets: {}
    },
    target_binding: { id: "mt_proxy_kit", path: "mt_proxy_kit" },
    dependencies: [],
    world_requirements: null,
    closure_hash: {
      algorithm: "sha256",
      canonicalization: "sorted-key-json/v1",
      scope: "candidate+dependencies+world_requirements",
      value: "proxy-source-integrity-test"
    },
    source_provenance: [{ input: 0, provenance: { caller: "proxy-source-integrity-test" } }],
    warnings: []
  };
}

function trappingProxy(target, counter) {
  return new Proxy(target, {
    getPrototypeOf(value) {
      counter.calls += 1;
      return Reflect.getPrototypeOf(value);
    },
    ownKeys(value) {
      counter.calls += 1;
      return Reflect.ownKeys(value);
    },
    getOwnPropertyDescriptor(value, key) {
      counter.calls += 1;
      return Reflect.getOwnPropertyDescriptor(value, key);
    }
  });
}

function hold(out, code) {
  assert.equal(out.status, "HOLD");
  const found = out.holds.find((item) => item.code === code);
  assert.ok(found, JSON.stringify(out.holds));
  return found;
}

test("root Assembly request Proxy HOLDS before reflective traps or safe request-id inspection execute", () => {
  const counter = { calls: 0 };
  const request = trappingProxy(baseRequest("assembly-root-proxy"), counter);

  const out = assemble(request);
  const found = hold(out, "HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE");
  assert.equal(counter.calls, 0, "Assembly source preflight and HOLD metadata must not execute Proxy traps");
  assert.equal(found.path, "request");
  assert.equal(out.candidate, null);
});

test("nested Assembly dependency Proxy HOLDS before reflective traps execute", () => {
  const counter = { calls: 0 };
  const request = baseRequest("assembly-nested-proxy");
  request.dependencies = [trappingProxy({ id: "dep.proxy", ref: "abc123" }, counter)];

  const out = assemble(request);
  const found = hold(out, "HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE");
  assert.equal(counter.calls, 0, "nested Proxy traps must not execute during authored closure inspection");
  assert.equal(found.path, "request.dependencies[0]");
});

test("revoked root Assembly request Proxy returns HOLD instead of throwing during fallback metadata inspection", () => {
  const revocable = Proxy.revocable(baseRequest("assembly-revoked-root-proxy"), {});
  revocable.revoke();

  const out = assemble(revocable.proxy);
  const found = hold(out, "HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE");
  assert.equal(found.path, "request");
  assert.equal(out.request_id, "assembly-nonportable-input");
});

test("kit candidate Proxy HOLDS before reflective traps execute", () => {
  const counter = { calls: 0 };
  const input = assemblyResult();
  input.candidate = trappingProxy(input.candidate, counter);

  const out = materializeKit(input, null);
  const found = hold(out, "HOLD_KIT_INPUT_NONPORTABLE_VALUE");
  assert.equal(counter.calls, 0, "kit source preflight must not execute Proxy traps");
  assert.equal(found.path, "assembly_result.candidate");
  assert.equal(found.source_code, "HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE");
});

test("revoked root Assembly result Proxy returns kit HOLD instead of throwing before portable preflight", () => {
  const revocable = Proxy.revocable(assemblyResult(), {});
  revocable.revoke();

  const out = materializeKit(revocable.proxy, null);
  const found = hold(out, "HOLD_KIT_INPUT_NONPORTABLE_VALUE");
  assert.equal(found.path, "assembly_result");
  assert.equal(out.kit, null);
});

test("revoked kit options Proxy HOLDS while retaining an already-safe source trace", () => {
  const input = assemblyResult();
  const revocable = Proxy.revocable({ name: "never read" }, {});
  revocable.revoke();

  const out = materializeKit(input, null, revocable.proxy);
  const found = hold(out, "HOLD_KIT_INPUT_NONPORTABLE_VALUE");
  assert.equal(found.path, "options");
  assert.deepEqual(out.source_closure_hash, input.closure_hash);
  assert.deepEqual(out.source_provenance, input.source_provenance);
});
