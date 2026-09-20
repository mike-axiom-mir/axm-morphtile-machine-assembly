"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const manifest = require("../machine.json");
const pkg = require("../package.json");
const { MACHINE } = require("../src");

test("published Assembly identity reports one exact version across runtime, manifest and package", () => {
  assert.equal(MACHINE.id, manifest.id);
  assert.equal(MACHINE.version, manifest.version);
  assert.equal(pkg.version, manifest.version);
});
