# Changelog

## Unreleased — 2026-09-21

- Generic Assembly candidate-object merging now decides identity from authored own keys rather than JavaScript prototype-chain membership.
- New candidate keys are inserted as explicit own data properties, so `__proto__`, `constructor`, and `toString` cannot be confused with inherited host properties or trigger the legacy `__proto__` setter.
- Equal authored values still deduplicate deterministically; true same-own-key disagreement still returns `HOLD_ASSEMBLY_CONFLICT` with both source lanes and both exact variants.
- Added fail-first regressions for inherited-looking facet names and their conflict evidence. This is Assembly merge behavior only; it does not claim new MorphTile facet vocabulary or CANON status.

## 0.6.2 — 2026-09-20

- Added the bounded MorphTile full-path grammar for proven Interface v0.4/v0.5 operation targets while keeping assembled tile `id` as a one-segment local identity.
- Nested Interface targets now require explicit `request.intent.tile_path`; Assembly will not infer parent context merely because the operation path ends in the same local tile id.
- Added `target_binding` result metadata so the exact local id + canonical path used during folding remains inspectable without pretending address context is part of portable tile content identity.
- Rejects malformed target paths, malformed presentation anchors, local-id/path disagreement, and same-leaf/different-parent mismatches as explicit HOLDs.
- Added exact candidate-head integration proof against Interface PR #7 (`92cee3a9cbe823bcd2ca6a587f8b116c13e0ba99`) and re-pinned merged Surface evidence to repaired main `20821976e042a42d6cab591bcb9b6a011bad6e47`.

## 0.6.1 — 2026-09-20

- Added fail-closed identity checks for named MorphTile world requirements: an explicit word `name` must match its `words` map key and an explicit definition `id` must match its `definitions` map key.
- Preserved contradictory authored closure exactly in HOLD output instead of relying on MorphTile import normalization to silently rewrite the embedded identity.
- Kept implicit identities compatible: a word/definition body that omits its embedded identity is not rejected merely because the map key is authoritative.
- Added deterministic regressions for mismatched word/definition identity, matching identity, request immutability, and implicit-identity compatibility.

## 0.6.0 — 2026-09-20

- Added fail-closed compatibility for the exact Interface Machine v0.5 transport schemas `morphtile.view-operation/v0.5` and `morphtile.interface-operations/v0.5` without accepting arbitrary future Interface schemas.
- Preserved nested `row` / `group` view matter as ordinary MorphTile view content instead of interpreting or flattening Interface-owned layout semantics inside Assembly.
- Kept target identity, `ui_panel` eligibility, unknown-field, operation-count, presentation-shape and conflict boundaries unchanged.
- Added exact candidate-head integration evidence against Interface `5dd11a33ed15a86f995fc47333c3822d94f5ec68` and MorphTile `ef2b3c6986aa1a333247feffc43a8443f17239d0`, including kit materialization and fresh-world import.
- Kept Interface v0.6 and other unproven schemas explicit HOLDs.

## 0.5.1 — 2026-09-20

- Made Assembly HOLD reports lossless for candidate, word, and definition conflicts by preserving both exact competing values and their source lanes.
- Kept deterministic first-seen closure semantics while exposing rejected variants instead of hiding them behind path-only conflict codes.
- Added regression coverage for material-facet conflicts, word conflicts, and definition conflicts.
- Kept conflict evidence outside successful content identity: only successful candidate + dependency + world-requirement closure remains hashed.

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