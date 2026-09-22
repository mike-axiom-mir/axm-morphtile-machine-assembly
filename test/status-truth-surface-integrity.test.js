"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const statusPath = path.join(__dirname, "..", "STATUS.md");
const status = fs.readFileSync(statusPath, "utf8");
const readmePath = path.join(__dirname, "..", "README.md");
const readme = fs.readFileSync(readmePath, "utf8");
const truthBoundary = readme.split("## Truth boundary")[1] || "";

test("persistent status names executable current-fleet authority instead of duplicating identities", () => {
  assert.match(status, /fixtures\/current-fleet\.json/);
  assert.match(status, /scripts\/current-fleet-pins\.js/);
  assert.doesNotMatch(
    status,
    /\b[0-9a-f]{40}\b/,
    "persistent status must not duplicate exact commit identities that belong in the executable receipt or exact-head evidence"
  );
});

test("persistent status does not encode transient candidate state or activation-local gates", () => {
  const forbidden = [
    /^- State:.*\bCANDIDATE\b/im,
    /^- State:.*FRESH VERIFICATION REQUIRED/im,
    /^- Assembly integrated main\/base:/im,
    /^`?PAUSE_RECOMMENDED\s*:/im
  ];

  for (const pattern of forbidden) {
    assert.doesNotMatch(status, pattern);
  }
});

test("persistent status keeps exact-head evidence and acceptance authority outside the moving file", () => {
  assert.match(status, /Exact-head CI and independent Verification receipts belong on the PR and durable handoff/i);
  assert.match(status, /producer evidence is not merge authority/i);
  assert.match(status, /does not auto-advance/i);
});

test("README truth boundary stays merge-stable instead of carrying candidate lifecycle state", () => {
  assert.ok(truthBoundary.trim(), "README must keep an explicit Truth boundary section");
  assert.match(truthBoundary, /fixtures\/current-fleet\.json/i);
  assert.doesNotMatch(truthBoundary, /^- CURRENT CANDIDATE:/im);
  assert.doesNotMatch(truthBoundary, /fresh independent Verification of the current Assembly candidate/i);
  assert.doesNotMatch(truthBoundary, /MorphTile core #\d+.*gap/i);
  assert.doesNotMatch(
    truthBoundary,
    /\b[0-9a-f]{40}\b/,
    "current truth boundary must refer to the executable fleet receipt rather than copy moving exact identities"
  );
});
