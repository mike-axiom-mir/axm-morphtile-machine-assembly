# Status

- State: ROUND-19 CURRENT-MERGED RECEIVER EVIDENCE CANDIDATE — PUSH GREEN; FINAL EXACT-HEAD + PR REPLAY + INDEPENDENT VERIFICATION REQUIRED
- Test command: `npm test`
- Assembly integrated main/base: `e72c625d8dad99b2021e9ddf3782cf90f158a46b` (through merged PR #32)
- Current candidate PR: #33
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Form exact integrated receiver head: `dd6975f29390e3175642a7d510b3c5320415b620`
- Surface exact integrated receiver head: `4e4495182aa83e5dfba37722fc3756a70cfaafaa`
- Capability exact integrated receiver head: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface exact integrated receiver head: `8516da3a414c416ec1f76b1078901c56c49b04db`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and reviewed Interface transport candidates. It preserves dependency closure, words, definitions, upstream warnings, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas HOLD rather than disappearing.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Explicit falsey content remains content-bearing rather than being collapsed into omission. Request/intent own-key grammar, semantic container identity, candidate schema presence, source provenance and upstream source identity are all checked/preserved by authored presence instead of host-language truthiness.

Interface target identity is separated from contextual address. A local tile id and a full canonical path may be bound together only when the caller supplies the exact path; Assembly does not infer missing parent context from a matching leaf. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with MorphTile-owned hashing and verified fresh-world import. Known local Interface target/presentation proof dependencies are deterministically discharged against staged matter; unresolved arbitrary dependency records that the current kit format cannot represent HOLD rather than being dropped.

## Source-integrity boundary integrated through PR #32

Both public authored-data trust boundaries perform descriptor-safe portable-data preflight before JSON-backed transport can change meaning. Accessors and `toJSON` hooks are not executed while deciding whether input is portable, non-finite/unsupported values HOLD with authored paths retained, and JavaScript Proxy values are rejected before reflection can execute caller-controlled traps.

Assembly now consistently separates authored presence from JavaScript truthiness where the semantic contract is established: request/intent fields cannot disappear because they are falsey; semantic containers cannot masquerade as another shape; candidate schema presence cannot fall through to the legacy schemaless path; provenance defaults apply only on absence; and source traces preserve admitted upstream `machine`, `request_id`, provenance and rejected schema identity exactly by presence. Preserving source identity is evidence preservation, not a claim that every unusual identity value is a valid producer.

Named world closure and generic candidate merge identity use own data keys rather than prototype inheritance. Authored names such as `__proto__`, `constructor`, or `toString` are therefore data when genuinely authored, while true own-entry conflicts remain HOLDs with competing matter and provenance visible.

## Round-8 portable composition evidence — integrated through PR #23

Round 8 merged producer semantics without changing MorphTile core. Assembly kept the older exact checkout lane used by historical regressions and added a separate `ROUND8_*` lane pinned to the producer heads actually covered by that receiver proof.

The receiver proof combines one complete compatible tile from pinned Form, Surface, Capability and Interface outputs, materializes a portable kit, discharges its Interface target proof only in isolated staged MorphTile matter, imports/applies into a fresh receiver, compiles transported changing geometry as finite, renders state-bound repeated markers, and proves rendering does not mutate receiver structural matter.

A metadata-integrity regression also keeps runtime-exported Assembly identity, `machine.json`, and `package.json` aligned.

## Round-10 current receiver evidence — integrated

The round-10 lane is pinned separately to:

- Form `378e7896acfdf8d4bd28d08127c1f57546e3eef1`;
- Surface `4349ba0d926aee1d36dde86fc7f69d04a58bf924`;
- Capability `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`;
- Interface `1a941f8ff88ca590952571e3eeeeeeef6daefd77`;
- MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`.

That complete positive-path proof combines Form vector definition-scale progression, Surface patterned material, Capability canonical counter state and Interface canonical-state repeat into one Assembly candidate with explicit reusable-definition closure. It materializes a real kit, discharges the Interface target proof in staged matter, imports/applies into a fresh world, proves finite three-part geometry with X-width spans `[1, 1.5, 2]`, and proves imported Interface repeat reads canonical `count=2` without structural mutation.

Separate round-10 negative proofs preserve exact same-root Interface path matter while HOLDing missing external parent context, and preserve Surface's signed-zero source HOLD instead of promoting rejected producer matter.

## Round-19 current-merged receiver evidence candidate — PR #33

The exact integrated ecosystem has moved again, so PR #33 adds another receiver lane instead of rewriting round-10 receipts:

- Form `dd6975f29390e3175642a7d510b3c5320415b620`;
- Surface `4e4495182aa83e5dfba37722fc3756a70cfaafaa`;
- Capability `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`;
- Interface `8516da3a414c416ec1f76b1078901c56c49b04db`;
- MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`.

The new complete-kit proof exercises current merged semantics that round 10 did not cover. Surface base-color-only authorship must remain an ordinary color with no invented `paint` before Assembly, in the combined candidate, inside the materialized kit, and after fresh-world import. Interface repeat-local relational predicates (`index >= 1`, `index < 2`, and lexical repeat `count >= 3`) must survive Assembly transport and evaluate in receiver lexical scope without copying repeat locals into canonical state. Capability supplies canonical `count=3`, which both satisfies the Interface readout proof and drives exactly three repeated bodies. Current Form output must still compile as finite receiver geometry. Rendering must leave the receiver structural hash unchanged.

Push run `35583273211` passed `npm test` on intermediate head `ef4e9496ce58a146864de1615a4801c25936e4d4`. README/STATUS convergence moves the candidate head after that evidence, so final exact-head replay and the independent PR-triggered run remain required before this candidate can be described as exact-head green.

This pass changes Assembly receiver evidence and documented truth only. It does not change Assembly runtime semantics and does not grant Assembly ownership of Form geometry, Surface material vocabulary, Capability state, Interface expression semantics, or MorphTile runtime behavior.

## Reusable rules learned

**Authorship must be established before transport can transform it.** Serialization is not validation.

**Interception must be rejected before reflection.** Descriptor-safe reads do not protect a boundary when the reflection primitive itself can execute caller-controlled Proxy traps.

**Named closure and generic candidate identity are determined by own data keys, never prototype inheritance.** Host prototype membership is not authored matter.

**Authored presence and validity are separate promises.** A trace may preserve unusual admitted source identity exactly without granting that identity producer validity.

**Portable Assembly proof must continue through the receiver runtime.** Assembler-local preservation is not enough when the claim is portability; kit materialization, verified fresh-world import/apply and real runtime use are part of that claim.

**Historical exact receipts stay historical.** When a newer merged producer changes semantics, add a separately pinned receiver proof instead of relabelling an older exact-revision test as if it covered the new producer.

**Contextual references are not dependency closure by implication.** Preserving an exact same-root Interface path does not authorize Assembly to manufacture absent parent/world matter.

**Upstream HOLDs are part of provenance.** Rejected producer matter must remain visibly rejected through Assembly rather than being treated as an empty or legacy fragment.

**Merged sibling growth becomes evidence, not automatic authority.** Assembly may re-prove exact merged producer behavior while still HOLDing schemas or semantics it has not explicitly proven.

**Producer omission is authored meaning.** If a current producer deliberately stops emitting optional matter (for example Surface base-only material no longer inventing `paint`), Assembly and kit transport must preserve that omission rather than restoring an older default.

**Lexical runtime meaning is part of complete-kit acceptance.** Transporting Interface syntax is insufficient when the semantic claim concerns repeat-local scope; receiver rendering must demonstrate the lexical predicate behavior and structural read-only boundary.

## Placement decision

PR #33 belongs in Assembly because it establishes how exact integrated producer outputs compose, close, transport, import and execute together. No new universal MorphTile runtime/representation primitive was exposed, so no MorphTile-core candidate is justified by this pass.

Unmerged Form #33 and Interface #27 remain independent candidate/HOLD lanes and are not absorbed. MorphTile core #17 remains the separately owned repeat-text lexical-scope regression/HOLD and is not worked around by this Assembly proof.

## HELD / open

- PR #33 requires final exact-head CI and independent PR-triggered replay after the documentation commits, then independent Verification of that exact head before Creation Director integration.
- Unmerged Form #33 and Interface #27 are not treated as integrated authority by this lane.
- MorphTile core #17 remains core-owned; Assembly does not duplicate or hide it.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External/contextual dependencies not present in portable matter remain HOLD.
- No arbitrary future Interface schema compatibility without separate proof.
- No visual-quality proof, automatic CANON, self-merge or merge authority.