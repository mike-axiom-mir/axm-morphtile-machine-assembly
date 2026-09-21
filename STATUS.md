# Status

- State: KIT RECEIVER-APPLICATION CLOSURE CANDIDATE — EXACT-HEAD CI + INDEPENDENT VERIFICATION GATE
- Test command: `npm test`
- Assembly integrated main/base: `9fe8b53daf3e572c596c142859cca2199a976553`
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and reviewed Interface transport candidates. It preserves dependency closure, words, definitions, upstream warnings/HOLD evidence, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas or malformed compatibility wrappers HOLD rather than disappearing through fallback behavior.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with MorphTile-owned hashing. Known local Interface target/presentation proof dependencies are deterministically discharged against staged matter; unresolved arbitrary dependency records that the current kit format cannot represent HOLD rather than being dropped.

## Current candidate: complete receiver application proof

A concrete proof gap existed after kit verification: `materializeKit` treated fresh-world `importKit(...).status === "READY"` as sufficient evidence that the generated kit could actually be integrated by the receiver. MorphTile `READY` is an ordered import plan, not proof that every planned structural operation is valid when executed.

The regression demonstrates the difference with a portable authored word named `2legs`. Assembly and kit hashing can preserve that word and the pinned MorphTile runtime can plan the kit as `READY`, but the runtime rejects the corresponding `word.define` operation because the word name violates MorphTile's own grammar. Before this candidate, Assembly incorrectly returned materialization `CANDIDATE` without executing that operation.

The candidate converts that repeated receiver reasoning into deterministic machinery:

- the supplied runtime contract must expose `applyStructOp`;
- fresh-world `importKit` must still return `READY` without overwrite/partial mode;
- the returned operation list must be inspectable;
- every operation is cloned and executed in order against the isolated fresh receiver;
- missing operation evidence returns `HOLD_KIT_RUNTIME_IMPORT_OPS_INVALID`;
- receiver rejection returns `HOLD_KIT_RUNTIME_APPLY_FAILED` with exact operation index, operation and runtime error preserved;
- successful materialization includes explicit `KIT_APPLY` PASS evidence.

A positive control proves that an ordinary portable word kit remains compatible through the same complete path.

## Evidence

Regression-first branch head `a9182e46acabe09de49cdff36d037f6fbb196194` intentionally failed Actions run `35619102556`: the invalid receiver word was still promoted to `CANDIDATE`, and no `KIT_APPLY` receipt existed.

Implementation head `338b0ebc7010df734d98b8dfb5bde8db50142c3b` passed Actions run `35619596574`. The exact suite reported 148 tests, 148 pass, 0 fail, 0 skipped and 0 TODO; both new receiver-application regressions passed.

Documentation is part of this candidate because the previous README/materialization note incorrectly described `READY` as the terminal receiver acceptance proof. Final exact-head push/PR CI must be re-earned after documentation commits before this candidate can be handed to Verification.

## Reusable rules learned

**An import plan is not receiver closure.** A machine claiming a complete portable kit must execute the exact ordered import operations against an isolated fresh receiver before returning `CANDIDATE`.

**Failure evidence stays specific.** If a receiver rejects a planned operation, preserve the exact operation, its order and the runtime error rather than collapsing the failure into a generic import rejection.

**Historical exact receipts stay historical.** Existing round-8, round-10, round-19 and round-22 lanes remain exact evidence for their pinned producer/runtime heads. Internal sibling movement that does not change emitted representation is not by itself justification to relabel or duplicate a receiver lane.

**Merged sibling growth becomes evidence, not automatic authority.** Unmerged Form/Interface candidates remain outside Assembly authority and are not absorbed merely because they exist.

## Placement decision

This candidate belongs in Assembly because the missing proof was in Assembly's claim that it had produced a complete receiver-usable kit. MorphTile core already exposes the authoritative `importKit` plan and `applyStructOp` execution contract; no new universal core representation/runtime primitive is required.

MorphTile core #17 remains the separately owned repeat-text lexical-scope regression/HOLD. Presentation z-order remains a core-level HOLD without a canonical primitive. Unmerged sibling candidates remain independent evidence lanes.

## HELD / open

- Final exact-head push and PR-triggered CI must be green, and independent Verification must verify that same exact head before Creation Director integration.
- MorphTile core #17 remains core-owned; Assembly does not duplicate or hide it.
- Presentation z-order remains HOLD because no evidenced canonical MorphTile-core primitive/schema exists.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External/contextual dependencies not present in portable matter remain HOLD.
- No arbitrary future Interface schema compatibility without separate proof.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
