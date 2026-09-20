# Status

- Candidate version: 0.6.0
- State: CANDIDATE — EXACT-HEAD CI REQUIRED
- Test command: `npm test`
- MorphTile runtime target: v0.4 at `ef2b3c6986aa1a333247feffc43a8443f17239d0`
- Merged Interface baseline: v0.4 at `260e45599c91cbcb0ec8a5a54153323e4e5d0c6a`
- Reviewed Interface v0.5 candidate target: `5dd11a33ed15a86f995fc47333c3822d94f5ec68`
- Envelope: provisional v0.1
- Visual proof: none

## Implemented on current main before this candidate

- Deterministic compatible tile/facet/capability union.
- Canonical object comparison so object key order does not create false conflicts.
- Dependency closure from the assembly request plus machine input packets.
- Same-identity dependency conflicts HOLD instead of selecting a winner, preserving both variants and sources.
- `world_requirements.words` and `world_requirements.definitions` are preserved as sidecars.
- Input machine/request/provenance metadata and upstream warnings are preserved.
- Unsupported explicit candidate schemas HOLD instead of being silently discarded.
- Successful candidates carry canonical SHA-256 `closure_hash` over candidate + dependencies + world requirements.
- Stable Interface v0.4 `view.set` and exact `view.set + presentation.set` bundles can be folded only onto an explicitly matching tile with caller-owned `ui_panel` eligibility.
- Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with runtime validation, MorphTile-owned kit hashing, and fresh-world verified import.
- Arbitrary dependency records that MorphTile kits cannot represent HOLD rather than being dropped.
- Conflict evidence is lossless for candidate, dependency, word and definition variants.
- Direct/transitive definition references in generated recipe matter and capability `grants_ref.def` are discovered; missing referenced definitions HOLD.
- Current Surface checker/scale semantics and Capability explicit `false` / `""` wake semantics are proven through Assembly candidate → kit → fresh-world import on current main.

## Added in this candidate

- Exact support for Interface v0.5 `morphtile.view-operation/v0.5` and `morphtile.interface-operations/v0.5` transport schemas.
- The schema widening is deliberately narrow: v0.5 is accepted only through the existing exact addressed `view.set` and exact two-operation `view.set + presentation.set` parsers.
- Nested `row` / `group` layout is preserved byte-for-structure as MorphTile view matter; Assembly does not interpret, flatten or recreate Interface-owned layout semantics.
- Existing target identity, `ui_panel`, unknown-field, presentation, conflict and provenance boundaries stay active for v0.5.
- A real Interface v0.5 candidate is exercised both with and without placement. The placement path is carried through Assembly → real MorphTile kit → verified fresh-world import.
- Future Interface v0.6 remains an explicit `HOLD_UNASSEMBLABLE_CANDIDATE_SCHEMA` until separately proven.
- Stable merged Interface v0.4 tests remain pinned separately so candidate compatibility does not rewrite the current baseline.

## Placement decision

This rule belongs in Assembly Machine, not MorphTile core. MorphTile already represents nested `row` / `group` view matter and ordinary `view.set` / `presentation.set` semantics. Interface owns generating bounded nested layout; Assembly owns recognizing which reviewed transport schemas it can safely combine without loss. No new universal representation/runtime primitive was exposed by this lane.

The separate custom-view action-authority issue remains core-owned and is intentionally not worked around here.

## Evidence boundary

Compatibility is earned only if the exact Assembly candidate head passes CI with both the merged Interface v0.4 baseline and the exact reviewed Interface v0.5 candidate head above, plus the pinned MorphTile runtime. An open Interface PR is not treated as merged CANON, and no compatibility is inferred from schema similarity alone.

## HELD / open

- No auto-resolution or priority policy for incompatible candidate, word, definition or dependency variants.
- Definition discovery remains bounded to proven MorphTile v0.4 reference forms; Assembly does not invent or fetch missing definitions.
- No arbitrary Interface operation composition beyond the exact proven contracts.
- No invented `ui_panel` eligibility or target identity.
- No transport of arbitrary dependency records through the current MorphTile kit format.
- No Interface v0.6+ compatibility claim without a separate proof.
- No compatibility claim beyond exact pinned sibling/core revisions exercised by CI.
- No visual-quality proof, automatic CANON, or merge authority.
