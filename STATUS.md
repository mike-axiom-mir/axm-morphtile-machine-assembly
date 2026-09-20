# Status

- Candidate version: 0.6.3
- State: CANDIDATE — MERGED FORM 0.11 PORTABLE-ASSEMBLY RE-PROOF OPEN
- Test command: `npm test`
- Assembly PR base: `688a39fc9762b2192d7db9f777416dafe5bf6ed7`
- MorphTile runtime target: v0.4 at `429a344f7d9333bef01cf9de1c292c3af09abec2`
- Form integrated evidence: `6adea73ea3a396aa60fc6207372ba7ea611c60fc`
- Surface integrated evidence: `5184275314503333912cf30c97c203323a1ab7e1`
- Capability integrated evidence: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface integrated evidence: `0e47cd09d613c6c934cd7adbdb6c7a18eeaaf6ed`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and the exact reviewed Interface transport candidates. It preserves dependency closure, words, definitions, upstream warnings, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas HOLD rather than disappearing.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Explicit falsey content remains content-bearing rather than being collapsed into omission.

Interface target identity is separated from contextual address. A local tile id and a full canonical path may be bound together only when the caller supplies the exact path; Assembly does not infer missing parent context from a matching leaf. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with MorphTile-owned hashing and verified fresh-world import. Arbitrary dependency records that the current kit format cannot represent HOLD rather than being dropped.

## 0.6.3 integrated source-integrity boundary

Both public authored-data trust boundaries perform descriptor-safe portable-data preflight before JSON-backed transport can change meaning:

- the complete Assembly request before candidate union, dependency/world-requirement closure, provenance capture or hashing;
- the supplied Assembly result and kit options before source-trace capture, dependency discharge, MorphTile translation or kit hashing.

Accessors and `toJSON` hooks are not executed while deciding whether input is portable. Non-finite numbers HOLD as `HOLD_ASSEMBLY_INPUT_NONFINITE_VALUE` or `HOLD_KIT_INPUT_NONFINITE_VALUE`. Other values/structures that portable JSON would invoke, rewrite, drop or reinterpret HOLD as `HOLD_ASSEMBLY_INPUT_NONPORTABLE_VALUE` or `HOLD_KIT_INPUT_NONPORTABLE_VALUE`, with the authored path retained. The kit boundary independently rechecks supplied Assembly-result objects; a `CANDIDATE` label alone is not proof that externally supplied or older result matter is transport-safe.

JavaScript Proxy values are rejected with Node's non-trapping `util.types.isProxy()` check before prototype lookup, key enumeration, descriptor reads or array checks can execute caller-controlled traps. Root/nested/revoked request and kit boundary regressions preserve fail-closed behavior and zero caller trap execution. Independent Verification #31 replayed the exact integrated Assembly PR #20 head and PASSed these boundaries before Creation Director integration; Assembly main `688a39fc...` is the resulting merged state.

## PR #21 candidate — merged Form 0.11 portable rotation convergence

Form main moved from `9f43f9e3...` to integrated Form 0.11 `6adea73e...`, adding bounded `repeat.rot_step` progression while retaining definition-backed `with_step` progression. Assembly main still named the prior Form identity in its exact integration lane, so compatibility evidence had expired even though no Assembly runtime behavior had changed.

PR #21 re-pins the exact Form checkout and receipt to `6adea73e...`. It also adds an end-to-end receiver proof for a definition-backed repeat that uses both `rot_step` and `with_step`: the Form-emitted loop expressions must remain byte-for-structure equivalent through Assembly combination and kit materialization, the reusable `panel` definition must remain required rather than silently synthesized, fresh-world MorphTile kit import must verify its payload hash, and imported-world mesh compilation must remain finite without dropping the rotation expression.

No Assembly runtime source is widened by this candidate. The purpose is to turn producer semantic growth into exact portable-closure evidence at the Assembly boundary.

## Reusable rules learned

**Authorship must be established before transport can transform it.** Serialization is not validation.

**Interception must be rejected before reflection.** Descriptor-safe reads do not protect a boundary when the reflection primitive itself can execute caller-controlled Proxy traps.

**Implementation correctness and ecosystem-evidence freshness are separate claims.** A previously verified implementation does not make stale sibling pins current; once sibling candidates merge, Assembly re-proves against those merged identities without treating later unmerged work as CANON.

**New producer semantics need receiver proof when portability is part of the product claim.** Producer/runtime success alone does not prove Assembly preserved the exact recipe plus reusable-definition closure through kit transport and fresh-world import.

## Placement decision

The current Form 0.11 work belongs in Assembly integration/evidence. Form owns `rot_step` producer vocabulary and MorphTile already owns expression-valued recipe execution; Assembly only needs to prove that its closure and kit path preserve the merged producer output exactly. No new universal MorphTile representation/runtime primitive is required by this Assembly candidate.

## HELD / open

- Exact-head producer CI is required for PR #21; independent Verification should replay the final exact Assembly head before integration.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External or contextual dependencies not present in the portable kit remain HOLD.
- No arbitrary future Interface schema compatibility without separate proof.
- Compatibility is limited to exact pinned sibling/core revisions exercised by CI.
- Open sibling candidates such as Surface #16, Interface #13 and MorphTile core #15 are evidence only and are not treated as integrated CANON before merge.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
