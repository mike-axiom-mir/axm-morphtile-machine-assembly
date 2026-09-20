# Status

- Candidate version: 0.6.3
- State: CANDIDATE — PRODUCER CI GREEN; INDEPENDENT VERIFICATION REQUIRED
- Test command: `npm test`
- Assembly base: `3941fba9254f42c9856a9fcc1598180b2696437f`
- MorphTile runtime target: v0.4 at `429a344f7d9333bef01cf9de1c292c3af09abec2`
- Form integrated evidence: `fd0f8fbee80fe68dc076aa793407e3f59ee5f286`
- Surface integrated evidence: `1d5e13ec10245d7754d04612807fad095dc81500`
- Capability integrated evidence: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface integrated evidence: `bc4b6196b0a0f8a6df39c71cdd8db22c1f787f83`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and the exact reviewed Interface v0.4/v0.5 transport candidates. It preserves dependency closure, words, definitions, upstream warnings, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas HOLD rather than disappearing.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Explicit falsey content remains content-bearing rather than being collapsed into omission.

Interface target identity is separated from contextual address. A local tile id and a full canonical path may be bound together only when the caller supplies the exact path; Assembly does not infer missing parent context from a matching leaf. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with MorphTile-owned hashing and verified fresh-world import. Arbitrary dependency records that the current kit format cannot represent HOLD rather than being dropped.

## 0.6.3 candidate — source integrity before transport

Both public authored-data trust boundaries now perform descriptor-safe portable-data preflight before JSON-backed transport can change meaning:

- the complete Assembly request before candidate union, dependency/world-requirement closure, provenance capture or hashing;
- the supplied Assembly result and kit options before source-trace capture, dependency discharge, MorphTile translation or kit hashing.

Accessors and `toJSON` hooks are not executed while deciding whether input is portable. Non-finite numbers HOLD as `HOLD_ASSEMBLY_INPUT_NONFINITE_VALUE` or `HOLD_KIT_INPUT_NONFINITE_VALUE`. Other values/structures that portable JSON would invoke, rewrite, drop or reinterpret HOLD as `HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE` or `HOLD_KIT_INPUT_NONPORTABLE_VALUE`, with the authored path retained. This includes `undefined`, functions, symbols, bigint, `-0`, sparse arrays, unexpected array properties, accessors, symbol-keyed properties, cycles, non-plain objects and non-enumerable authored fields.

The kit boundary independently rechecks supplied Assembly-result objects; a `CANDIDATE` label alone is not proof that externally supplied or older result matter is transport-safe.

## Exact evidence boundary

PR #19 is rebased directly onto current Assembly main rather than stacked on stale PR #18. Its workflow uses only the integrated heads listed above; candidate-only Interface checkouts are not part of the integrated baseline. Exact producer CI for the current PR head must be green before any technical-validity claim, and independent Verification must replay accessor/`toJSON` non-execution plus portable controls before integration.

Producer-green is not CANON, does not establish visual quality, and does not authorize merge.

## Placement decision

The 0.6.3 repair belongs in Assembly Machine. Assembly owns preservation of the complete combined closure before its own serialization/hashing and at its kit handoff. MorphTile core already supplies the universal runtime/kit representation once data reaches it safely; no new universal core primitive is required by this change.

## HELD / open

- Independent Verification of the exact 0.6.3 PR head is required.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External or contextual dependencies not present in the portable kit remain HOLD.
- No arbitrary Interface operation composition or Interface v0.6+ compatibility without separate proof.
- Compatibility is limited to exact pinned sibling/core revisions exercised by CI.
- Surface/Form source-integrity candidates that are still unmerged are not treated as integrated CANON.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
