# Status

- State: ROUND-22 CURRENT-FLEET RECEIVER EVIDENCE CANDIDATE — CURRENT-HEAD CI + INDEPENDENT VERIFICATION GATE
- Test command: `npm test`
- Assembly integrated main/base: `3a4af4417de21fff862bf309e3576c362bcac7f5` (through merged PR #34)
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Form exact integrated receiver head: `d4da0515c290b0b504c02b9d29e974d3add4e6b5`
- Surface exact integrated receiver head: `4e4495182aa83e5dfba37722fc3756a70cfaafaa`
- Capability exact integrated receiver head: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface exact integrated receiver head: `96dfea316216922dffca872ec083a549e4777c96`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and reviewed Interface transport candidates. It preserves dependency closure, words, definitions, upstream warnings, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas HOLD rather than disappearing.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Explicit falsey content remains content-bearing rather than being collapsed into omission. Request/intent own-key grammar, semantic container identity, candidate schema presence, source provenance and upstream source identity are checked/preserved by authored presence instead of host-language truthiness.

Interface target identity is separated from contextual address. A local tile id and a full canonical path may be bound together only when the caller supplies the exact path; Assembly does not infer missing parent context from a matching leaf. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with MorphTile-owned hashing and verified fresh-world import. Known local Interface target/presentation proof dependencies are deterministically discharged against staged matter; unresolved arbitrary dependency records that the current kit format cannot represent HOLD rather than being dropped.

## Source-integrity boundary integrated through PR #34

Both public authored-data trust boundaries perform descriptor-safe portable-data preflight before JSON-backed transport can change meaning. Accessors and `toJSON` hooks are not executed while deciding whether input is portable, non-finite/unsupported values HOLD with authored paths retained, and JavaScript Proxy values are rejected before reflection can execute caller-controlled traps.

Assembly consistently separates authored presence from JavaScript truthiness where the semantic contract is established. Request/intent fields cannot disappear because they are falsey; semantic containers cannot masquerade as another shape; candidate schema presence cannot fall through to the legacy schemaless path; provenance defaults apply only on absence; source traces preserve admitted upstream identity exactly by presence; and direct legacy candidate fragments receive the same established `form_hints`, `facets`, and `capabilities` container checks as wrapped candidate packets.

Named world closure and generic candidate merge identity use own data keys rather than prototype inheritance. Authored names such as `__proto__`, `constructor`, or `toString` are therefore data when genuinely authored, while true own-entry conflicts remain HOLDs with competing matter and provenance visible.

## Historical exact receiver receipts

Historical exact receipts remain historical rather than being rewritten when producer heads move. CI retains separately pinned lanes for the original integration regressions, round 8, round 10 and round 19.

Round 19 pins Form `dd6975f29390e3175642a7d510b3c5320415b620`, Surface `4e4495182aa83e5dfba37722fc3756a70cfaafaa`, Capability `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`, Interface `8516da3a414c416ec1f76b1078901c56c49b04db`, and MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`. That integrated receipt preserves Surface base-only omission, Interface repeat-local comparison behavior, Capability count state, finite Form geometry, complete kit import, and structurally read-only rendering.

## Round-22 current-fleet receiver evidence candidate

The integrated fleet moved after round 19. The current exact receipt now pins:

- Form `d4da0515c290b0b504c02b9d29e974d3add4e6b5`;
- Surface `4e4495182aa83e5dfba37722fc3756a70cfaafaa`;
- Capability `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`;
- Interface `96dfea316216922dffca872ec083a549e4777c96`;
- MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`.

The new receiver proof specifically re-earns Form's integrated definition-setting grid position convergence through the entire consumer path. It asks current Form for a 2 x 1 x 3 definition grid whose active X/Z position expressions and X-only `width` setting progression are authored from the shared Form position kernel. Assembly must preserve the exact recipe leaf, close the explicit `panel` definition, combine current Surface/Capability/Interface matter, materialize a real MorphTile kit, import/apply it into a fresh world, preserve the exact leaf again, compile six finite concrete recipe parts, and render the current Interface repeat from canonical `count=3` without mutating receiver structure.

Intermediate branch head `5ebe3483b1f56fba3420b8bb71d821fc99032ba8` passed Actions run `35596842221`, including the full `npm test` suite. Candidate authority remains blocked unless the current exact head has green push and PR-triggered CI and independent Verification verifies that same head; CI success alone is evidence, not integration authority.

This pass changes Assembly receiver evidence, CI pins and documented truth only. It does not change Assembly runtime semantics and does not grant Assembly ownership of Form geometry, Surface material vocabulary, Capability state, Interface semantics, or MorphTile runtime behavior.

## Reusable rules learned

**Authorship must be established before transport can transform it.** Serialization is not validation.

**Interception must be rejected before reflection.** Descriptor-safe reads do not protect a boundary when the reflection primitive itself can execute caller-controlled Proxy traps.

**Named closure and generic candidate identity are determined by own data keys, never prototype inheritance.** Host prototype membership is not authored matter.

**Authored presence and validity are separate promises.** A trace may preserve unusual admitted source identity exactly without granting that identity producer validity.

**Portable Assembly proof must continue through the receiver runtime.** Assembler-local preservation is not enough when the claim is portability; kit materialization, verified fresh-world import/apply and real runtime use are part of that claim.

**Historical exact receipts stay historical.** When a newer merged producer changes semantics, add a separately pinned receiver proof instead of relabelling an older exact-revision test as if it covered the new producer.

**Merged sibling growth becomes evidence, not automatic authority.** Assembly may re-prove exact merged producer behavior while still HOLDing schemas or semantics it has not explicitly proven.

**Internal producer convergence still deserves receiver proof when it changes emitted representation.** A producer may add no public syntax while changing how equivalent portable recipe matter is generated; Assembly's claim is about preserved transported meaning, so the exact new output representation must survive closure, kit transport and receiver execution before compatibility is re-earned.

**Contextual references are not dependency closure by implication.** Preserving an exact same-root Interface path does not authorize Assembly to manufacture absent parent/world matter.

**Upstream HOLDs are part of provenance.** Rejected producer matter must remain visibly rejected through Assembly rather than being treated as an empty or legacy fragment.

## Placement decision

This candidate belongs in Assembly because it establishes how exact integrated producer outputs compose, close, transport, import and execute together. Form's new position-kernel convergence remains Form-owned. No new universal MorphTile runtime/representation primitive was exposed, so no MorphTile-core candidate is justified by this pass.

Interface PR #29 remains an independent evidence/documentation receiver lane requiring its own Verification; it is not absorbed here. MorphTile core #17 remains the separately owned repeat-text lexical-scope regression/HOLD, and presentation z-order remains a core-level HOLD without a canonical primitive.

## HELD / open

- Current exact-head push and PR-triggered CI must be green, and independent Verification must verify that same exact head before Creation Director integration.
- Interface PR #29 exact candidate remains outside Assembly authority and still requires its independent Verification path.
- MorphTile core #17 remains core-owned; Assembly does not duplicate or hide it.
- Presentation z-order remains HOLD because no evidenced canonical MorphTile-core primitive/schema exists.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External/contextual dependencies not present in portable matter remain HOLD.
- No arbitrary future Interface schema compatibility without separate proof.
- No visual-quality proof, automatic CANON, self-merge or merge authority.