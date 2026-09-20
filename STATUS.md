# Status

- Foundation version: 0.5.1 candidate
- State: CANDIDATE — EXACT-HEAD CI REQUIRED
- Local/CI test command: `npm test`
- MorphTile runtime target: v0.4 at `ef2b3c6986aa1a333247feffc43a8443f17239d0`
- Envelope: provisional v0.1
- Visual proof: none

## Implemented on current main before this candidate

- Deterministic compatible tile/facet/capability union.
- Canonical object comparison so object key order does not create false conflicts.
- Dependency closure from the assembly request plus machine input packets.
- Same-identity dependency conflicts HOLD instead of selecting a winner, preserving both variants and sources.
- `world_requirements.words` and `world_requirements.definitions` are preserved as sidecars.
- Input machine/request/provenance metadata is preserved in `source_provenance`.
- Unsupported explicit candidate schemas HOLD instead of being silently discarded.
- Successful candidates carry canonical SHA-256 `closure_hash` over candidate + dependencies + world requirements.
- Stable Interface `view.set` and the exact current `view.set + presentation.set` operation bundle can be folded only onto an explicitly matching tile with caller-owned `ui_panel` eligibility.
- Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with runtime validation, MorphTile-owned kit hashing, and fresh-world verified import.
- Arbitrary dependency records that MorphTile kits cannot represent still HOLD rather than being dropped.

## Added in this candidate

- Generic candidate conflicts preserve the exact competing values and their input sources in `HOLD_ASSEMBLY_CONFLICT`, not only the conflicting path.
- Word and definition conflicts preserve both meanings plus both source lanes, matching the already lossless dependency-conflict pattern.
- First-seen values remain deterministic in the held closure, but rejected alternatives remain inspectable; a HOLD never pretends one variant won.
- Direct and transitive MorphTile definition references in generated recipe matter and capability `grants_ref` are discovered deterministically. Missing referenced definitions now produce `HOLD_DEFINITION_CLOSURE_INCOMPLETE` instead of a false complete candidate.
- `required_definitions` is exposed as derived deterministic envelope metadata; it does not create a second content identity.
- Kit materialization preserves `source_closure_hash`, `source_provenance`, and `source_warnings` on both candidate and HOLD outputs while keeping those transport/history sidecars outside MorphTile kit content identity.
- Exact regressions cover candidate/word/definition conflict evidence, direct/transitive definition closure, capability definition references, source-trace preservation, and provenance-vs-content hash separation.
- A real current Form v0.6 definition-reference output is exercised through Assembly HOLD/completion and real MorphTile kit materialization/import.
- The integration lane is pinned to integrated Form `ec3072738d9b5ab371a62852132dd6c14af09d5a`, Surface `ac8e551fb9e8ba266024fcbca473b8491996ea63`, Capability `0e0f60eb477d8cb20f8dbe259f546fa7c5b36e24`, Interface `260e45599c91cbcb0ec8a5a54153323e4e5d0c6a`, and MorphTile core `ef2b3c6986aa1a333247feffc43a8443f17239d0`.

## Placement decision

These rules belong in Assembly Machine, not MorphTile core. MorphTile already owns reusable definitions, recipe `use`, runtime resolution, `needsOf`, portable kits, and hash/import verification. Assembly owns deciding whether the creation-side closure is complete before claiming assembly success, and must preserve source trace when translating that closure into a kit.

## Evidence boundary

Current compatibility is earned only if the exact updated Assembly candidate head passes CI with all five pinned integrated inputs above. No compatibility is inferred from earlier green runs on superseded pins.

## HELD / open

- No auto-resolution or priority policy for incompatible candidate, word, definition, or dependency variants.
- Definition discovery is intentionally bounded to MorphTile v0.4 generated-recipe `use` references and capability `grants_ref.def`; Assembly does not invent or fetch missing definitions.
- No arbitrary Interface operation composition beyond explicitly proven contracts.
- No invented `ui_panel` eligibility or target identity.
- No transport of arbitrary dependency records through the current MorphTile kit format.
- No compatibility claim beyond exact pinned sibling/core revisions exercised by CI.
- No visual-quality proof, automatic CANON, or merge authority.
