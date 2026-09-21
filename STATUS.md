# Status

- State: READY IMPORT-PLAN COVERAGE CANDIDATE — EXACT-HEAD CI + INDEPENDENT VERIFICATION GATE
- Test command: `npm test`
- Assembly integrated main/base: `8a2a7bf6adf40266438945ad1482001be9d68900`
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and reviewed Interface transport candidates. It preserves dependency closure, words, definitions, upstream warnings/HOLD evidence, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas or malformed compatibility wrappers HOLD rather than disappearing through fallback behavior.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Integrated Assembly main already treats `importKit: READY` as a plan rather than completion: it executes every inspectable READY operation in an isolated fresh receiver and verifies each supported operation's installed postcondition. That receiver-closure work is now integrated at base `8a2a7bf6adf40266438945ad1482001be9d68900`.

## Current candidate: READY plan coverage against declared kit matter

A deeper proof gap remained between portable-kit identity and receiver execution. Integrated Assembly verified whatever operations the runtime returned, but it did not first prove that the READY plan still represented everything the kit declared. A supplied runtime could omit a declared word or even the root tile from `checked.ops`; Assembly would then apply and verify only the surviving operations and could still call the kit complete. Likewise, a planner could substitute declared word semantics and the later receiver-closure proof would faithfully prove the substituted operation rather than the original kit declaration.

This candidate converts that repeated reasoning into deterministic machinery:

- Assembly snapshots the fresh receiver before `importKit` planning so pre-existing compatible word/definition matter can be distinguished from planner omission;
- after `READY` and before application, `inspectImportPlanCoverage` compares the ordered plan with the generated kit;
- every declared word, definition and root tile must be covered by the READY plan, except a compatible word/definition already present before planning;
- planned word/definition semantics must still match the declared kit semantics;
- root-tile content is compared after removing only the receiver-owned provenance hash field that MorphTile legitimately normalizes during planning;
- omitted, substituted, unexpected or duplicate named kit matter fails closed as `HOLD_KIT_RUNTIME_IMPORT_PLAN_INCOMPLETE` with deterministic `plan_coverage` evidence;
- successful materialization gains `KIT_IMPORT_PLAN_COVERAGE` PASS evidence before `KIT_APPLY` and `KIT_RECEIVER_CLOSURE`.

This keeps three evidence layers separate: the portable kit hash proves what Assembly handed to `importKit`; plan coverage proves what the runtime elected to execute still corresponds to that kit; receiver closure proves the accepted plan's postconditions are actually installed.

## Evidence

Regression-first head `d33e769489547aa55042b78db02fbdfd559a23f0` intentionally failed push Actions run `35632082686`: a READY planner that removed the declared `word.define` operation was still promoted by integrated Assembly behavior.

Implementation head `4d56a61412d55305f57bae1e06c612a1ac8d9834` added deterministic import-plan coverage. Follow-up head `a0f1495c022121bf57bd1b02003ba52b4f02935b` added focused coverage for semantic word substitution and root-tile omission in addition to the original omitted-word regression.

Documentation follows those implementation/test commits. Final exact-head push + PR-triggered CI must still be green before handoff can claim the candidate verified.

## Reusable rules learned

**A READY plan is authority, not source truth.** Before Assembly executes a runtime-selected plan, it must prove that the plan still covers the portable kit whose hash was accepted.

**Plan-relative receiver closure cannot detect omitted source matter by itself.** A perfect proof that every returned operation installed correctly says nothing about declared kit matter the planner never returned.

**Portable identity, plan authority and installed receiver identity are separate evidence layers.** Each transition requires its own proof and none may silently stand in for the next.

**Legitimate normalization must be bounded.** MorphTile may normalize receiver-owned provenance hashing during import planning, but that does not authorize semantic substitution of the declared tile/word/definition matter.

**Historical exact receipts stay historical.** Existing receiver lanes remain evidence for their pinned producer/runtime heads; this candidate does not relabel old receipts.

**Merged sibling growth becomes evidence, not automatic authority.** Current Form main has moved through its own verified/integrated lane, but Assembly does not absorb sibling implementation internals or infer new semantics without a receiver-relevant contract change.

## Placement decision

This candidate belongs in Assembly because the missing proof is in Assembly's claim that a generated portable kit remains complete after the supplied runtime turns it into a READY operation plan. MorphTile core already provides the authoritative `importKit`, `applyStructOp`, receiver world, lookup and hashing contracts and its current planner includes the declared kit matter. No new universal core representation/runtime primitive is required.

The current Form integrated change is an internal grid-scale owner-state convergence and does not declare new public intent/recipe transport syntax; Surface and Capability remain independent producer lanes; Interface's latest work is receiver evidence rather than new producer authority. None is absorbed into this Assembly candidate.

## HELD / open

- Final exact-head push and PR-triggered CI must be green, and independent Verification must verify that same exact head before Creation Director integration.
- MorphTile core #17 remains core-owned; Assembly does not duplicate or hide it.
- Presentation z-order remains HOLD because no evidenced canonical MorphTile-core primitive/schema exists.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External/contextual dependencies not present in portable matter remain HOLD.
- No arbitrary future Interface schema compatibility or future READY operation semantics without separate proof.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
