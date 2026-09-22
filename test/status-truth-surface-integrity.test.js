"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const statusPath = path.join(__dirname, "..", "STATUS.md");
const status = fs.readFileSync(statusPath, "utf8");

test("persistent status names executable current-fleet authority instead of duplicating identities", () => {
  assert.match(status, /fixtures\/current-fleet\.json/);
  assert.match(status, /scripts\/current-fleet-pins\.js/);
  assert.doesNotMatch(
    status,
    /\b[0-9a-f]{40}\b/,
    "persistent status must not duplicate exact commit identities that belong in the executable receipt or exact-head evidence"
  );
});

test("persistent status does not encode transient candidate lifecycle or activation-local gates", () => {
  const forbidden = [
    /\bCANDIDATE\b/i,
    /FRESH VERIFICATION REQUIRED/i,
    /Assembly integrated main\/base:/i,
    /PAUSE_RECOMMENDED\s*:/i
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
