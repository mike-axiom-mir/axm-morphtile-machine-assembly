# Status

- State: KIT RECEIVER-POSTCONDITION CLOSURE CANDIDATE — EXACT-HEAD CI + INDEPENDENT VERIFICATION GATE
- Test command: `npm test`
- Assembly integrated main/base: `4996d524e05ff50a7305c2ebce81b81954f4ac05`
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and reviewed Interface transport candidates. It preserves dependency closure, words, definitions, upstream warnings/HOLD evidence, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas or malformed compatibility wrappers HOLD rather than disappearing through fallback behavior.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with MorphTile-owned hashing. A fresh receiver must first accept the kit as a `READY` import plan, every planned operation must execute, and Assembly now also verifies the exact installed postcondition of every supported READY import operation before materialization may return `CANDIDATE`.

## Current candidate: receiver postcondition closure

Integrated Assembly already executed every `READY` import operation after PR #39, but one proof gap remained: returning normally from `applyStructOp` was treated as evidence that the operation actually installed the intended matter. A supplied runtime could silently no-op an operation, or install only part of the READY plan, and Assembly would still emit `KIT_APPLY` PASS.

This candidate converts that repeated receiver reasoning into deterministic machinery:

- the exact ordered READY plan remains the receiver authority after `importKit` has verified the portable package;
- every operation is still cloned and executed in order against an isolated fresh receiver;
- after execution, Assembly checks the public postcondition of each supported kit-import operation: `word.define`, `def.put`, and root `tile.add`;
- a missing or changed planned word, definition or tile now returns `HOLD_KIT_RUNTIME_RECEIVER_INCOMPLETE` with deterministic missing/changed evidence;
- an unexpected READY operation type also fails closed rather than being silently treated as proven;
- successful materialization adds `KIT_RECEIVER_CLOSURE` PASS evidence containing the READY-plan hash and exact count of verified postconditions.

The receiver proof is deliberately plan-relative rather than a byte-for-byte comparison against the pre-import kit. MorphTile's public import operations normalize some portable matter while installing it, so transport identity and receiver-installed identity are separate evidence layers.

## Evidence

Regression-first head `6dac7da089a38e28f9034778753a51c231c26abe` intentionally failed PR Actions run `35625734996`: a runtime whose `applyStructOp` returned successfully without installing anything was still promoted by the integrated behavior.

The first repair head `287171867c71d8f555baa626e7187436a6b9a24b` also failed push Actions run `35625955815`. That implementation compared the post-import receiver directly to the pre-import kit hash, which was too strict because MorphTile's public receiver operations intentionally normalize installed word/definition matter. That failed repair is retained as evidence: receiver closure must not silently equate transport identity with installed representation identity.

A second focused test head `ae2cdde36155410a54ea154b007d2ef009954bf3` kept the failure visible while adding partial-install coverage: a receiver that installs the tile but silently drops the planned word must also HOLD.

Corrected implementation head `ae7d0de178e230240f2ce89e75f90feb2cd38876` verifies the receiver against the normalized READY operation plan instead. Both PR Actions run `35626512602` and push Actions run `35626507962` completed successfully; `npm test` succeeded in the PR job.

Documentation changes follow that green implementation and therefore final exact-head push + PR CI must be re-earned before handoff.

## Reusable rules learned

**Execution success is not installation proof.** A complete kit claim requires proving that every READY operation's intended receiver postcondition is actually present after application.

**Transport identity and receiver identity are separate evidence layers.** `kit.expect.sha256` proves the portable package that entered `importKit`; receiver closure must be checked against the receiver-normalized READY plan rather than blindly comparing the installed world to the pre-import bytes.

**Receiver proof follows the public operation contract.** Assembly may verify only the operation forms it has exact evidence for. A future or unknown READY operation fails closed until its receiver postcondition has an explicit proof rule.

**Failure evidence stays specific.** Missing matter, changed matter, unsupported operations, operation rejection and transport-hash rejection remain distinct HOLDs rather than collapsing into one generic receiver failure.

**Historical exact receipts stay historical.** Existing receiver lanes remain evidence for their pinned producer/runtime heads; this candidate does not relabel old receipts.

**Merged sibling growth becomes evidence, not automatic authority.** Unmerged Form/Interface candidates remain outside Assembly authority and are not absorbed merely because they exist.

## Placement decision

This candidate belongs in Assembly because the missing proof was in Assembly's claim that it had produced a complete receiver-usable kit. MorphTile core already exposes the authoritative `importKit` READY plan, `applyStructOp`, receiver world and lookup/hash contracts. No new universal core representation/runtime primitive is required.

Current Form PR #40 remains an independent producer-side generated-grid-scale convergence candidate requiring Verification. Current Interface receiver-evidence work remains independent. MorphTile core #17 remains the separately owned repeat-text lexical-scope regression/HOLD. Presentation z-order remains a core-level HOLD without a canonical primitive.

## HELD / open

- Final exact-head push and PR-triggered CI must be green, and independent Verification must verify that same exact head before Creation Director integration.
- MorphTile core #17 remains core-owned; Assembly does not duplicate or hide it.
- Presentation z-order remains HOLD because no evidenced canonical MorphTile-core primitive/schema exists.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External/contextual dependencies not present in portable matter remain HOLD.
- No arbitrary future Interface schema compatibility or future READY operation semantics without separate proof.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
