# Changelog

## 0.2.0 — 2026-09-20

- Added deterministic dependency closure across the assembly request and input machine envelopes.
- Added explicit HOLDs for same-identity dependency drift instead of silently choosing one version/ref.
- Preserved optional world words/definitions as sidecar requirements and HOLD conflicting definitions.
- Preserved source machine/request/provenance metadata for every assembled input.
- Replaced object-order-sensitive equality with canonical structural comparison.
- Added explicit candidate-schema gating so unsupported operation bundles are not silently discarded.
- Added 7 focused tests covering compatible union, candidate conflicts, closure preservation, dependency conflicts, word conflicts, unsupported interface bundles, and canonical key-order equality.

## 0.1.0 — 2026-09-19

- Established the isolated repository boundary.
- Added provisional envelope v0.1, machine manifest, fixture, executable proof, tests, and minimal CI.
- Pinned the exact MorphTile v0.4 commit tested as a contract target.
- Recorded unsupported work as HOLD or NOT TESTED.
