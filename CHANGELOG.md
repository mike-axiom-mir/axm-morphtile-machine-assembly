# Changelog

## 0.5.0 — 2026-09-20

- Added fail-closed folding for the exact current Interface Machine `morphtile.interface-operations/v0.4` contract: one `view.set` plus one `presentation.set` targeting the same explicit tile.
- Preserved the existing `ui_panel` eligibility boundary; Assembly still refuses to invent product intent merely to make Interface composition pass.
- Rejects unknown candidate, operation, or presentation fields and rejects extra operation types instead of becoming an arbitrary operation composer.
- Added conflict-safe presentation merging so existing different presentation matter HOLDs rather than being overwritten.
- Retargeted exact cross-repository conformance to current integrated Form, Surface, Capability, Interface, and MorphTile revisions, including Capability authored `initial` state and Interface symbolic binding declarations.

## 0.2.1 — 2026-09-20

- Added a canonical SHA-256 `closure_hash` for successful assembly candidates.
- Hash scope is explicitly candidate + dependencies + world requirements; provenance/evidence remain metadata rather than content identity.
- Added object-key-order invariance and content-mutation sensitivity tests for the closure digest.
- Raised the focused suite from 7 to 9 tests.

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
