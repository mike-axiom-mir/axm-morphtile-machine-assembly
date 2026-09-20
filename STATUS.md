# Status

- Candidate version: 0.6.3
- State: CANDIDATE — PROXY SOURCE-INTEGRITY REPAIR OPEN; CURRENT-MAIN EVIDENCE RE-PROOF IN PROGRESS
- Test command: `npm test`
- Assembly base: `1b81da5e3c885a904236cc643c910b83ad0d7bc6`
- MorphTile runtime target: v0.4 at `429a344f7d9333bef01cf9de1c292c3af09abec2`
- Form integrated evidence: `9f43f9e3ffbaf1687419d90e7e8e3185092e48f5`
- Surface integrated evidence: `5184275314503333912cf30c97c203323a1ab7e1`
- Capability integrated evidence: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface integrated evidence: `0e47cd09d613c6c934cd7adbdb6c7a18eeaaf6ed`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and the exact reviewed Interface v0.4/v0.5 transport candidates. It preserves dependency closure, words, definitions, upstream warnings, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas HOLD rather than disappearing.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Explicit falsey content remains content-bearing rather than being collapsed into omission.

Interface target identity is separated from contextual address. A local tile id and a full canonical path may be bound together only when the caller supplies the exact path; Assembly does not infer missing parent context from a matching leaf. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with MorphTile-owned hashing and verified fresh-world import. Arbitrary dependency records that the current kit format cannot represent HOLD rather than being dropped.

## 0.6.3 integrated source-integrity boundary

Both public authored-data trust boundaries perform descriptor-safe portable-data preflight before JSON-backed transport can change meaning:

- the complete Assembly request before candidate union, dependency/world-requirement closure, provenance capture or hashing;
- the supplied Assembly result and kit options before source-trace capture, dependency discharge, MorphTile translation or kit hashing.

Accessors and `toJSON` hooks are not executed while deciding whether input is portable. Non-finite numbers HOLD as `HOLD_ASSEMBLY_INPUT_NONFINITE_VALUE` or `HOLD_KIT_INPUT_NONFINITE_VALUE`. Other values/structures that portable JSON would invoke, rewrite, drop or reinterpret HOLD as `HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE` or `HOLD_KIT_INPUT_NONPORTABLE_VALUE`, with the authored path retained. The kit boundary independently rechecks supplied Assembly-result objects; a `CANDIDATE` label alone is not proof that externally supplied or older result matter is transport-safe.

## PR #20 candidate — reject interception before reflection

Descriptor-safe validation is still insufficient for JavaScript `Proxy` values because prototype lookup, key enumeration, descriptor reads and array checks can themselves be intercepted. PR #20 rejects live or revoked Proxy values with Node's non-trapping `util.types.isProxy()` check before those reflective operations. The same ordering is used while deriving fallback HOLD metadata, and the kit path avoids revoked-Proxy-sensitive reflection before its own portability preflight.

The candidate regressions require root and nested request Proxies to HOLD with zero trap executions, revoked root requests to HOLD instead of throwing, proxied kit candidates to HOLD with zero traps, and revoked Assembly results / kit options to fail closed. Ordinary portable Assembly and kit flows remain the positive control.

Independent Verification #30 passed the Proxy implementation at Assembly head `2ac0df773c8318b46945fb5814b7c5d4b78a3e10` while exercising the then-current repaired sibling candidates. After Form #17, Surface #15 and Interface #12 merged, the producer evidence lane was intentionally re-pinned to their actual merged main identities listed above. Because that evidence refresh changes the Assembly candidate SHA, exact-head producer CI must be green again and any independent exact-head verification claim must name the refreshed head rather than inheriting the earlier SHA.

## Reusable rules learned

**Authorship must be established before transport can transform it.** Serialization is not validation.

**Interception must be rejected before reflection.** Descriptor-safe reads do not protect a boundary when the reflection primitive itself can execute caller-controlled Proxy traps.

**Implementation correctness and ecosystem-evidence freshness are separate claims.** A previously verified implementation does not make stale sibling pins current; once sibling candidates merge, Assembly re-proves against those merged identities without treating later unmerged work as CANON.

## Placement decision

The source-integrity and compatibility-evidence work belongs in Assembly Machine. Assembly owns preservation of the complete combined closure before its own serialization/hashing and at its kit handoff. MorphTile core already supplies the universal runtime/kit representation once data reaches it safely; no new universal core primitive is required by this change.

## HELD / open

- Exact-head producer CI is required after the current merged-sibling re-pin; independent Verification should replay the refreshed exact Assembly head before integration.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External or contextual dependencies not present in the portable kit remain HOLD.
- No arbitrary Interface operation composition or Interface v0.6+ compatibility without separate proof.
- Compatibility is limited to exact pinned sibling/core revisions exercised by CI.
- Open sibling candidates such as newer Interface/Form/Surface work are evidence only and are not treated as integrated CANON before merge.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
