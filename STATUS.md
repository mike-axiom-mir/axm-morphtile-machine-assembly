# Status

- State: UPSTREAM WARNING SOURCE-IDENTITY CANDIDATE — EXACT-HEAD CI + INDEPENDENT VERIFICATION GATE
- Test command: `npm test`
- Assembly integrated main/base: `21d87499e162da2b583959b8344d4c8ec80be74a`
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Current integrated Assembly capability

Assembly deterministically combines compatible tile, facet, capability and reviewed Interface transport candidates. It preserves dependency closure, words, definitions, source provenance, upstream warnings/HOLD evidence and canonical SHA-256 closure identity. Same-identity conflicts HOLD with both variants and sources instead of selecting a winner. Unsupported candidate schemas, malformed compatibility wrappers and malformed structured tile containers HOLD instead of disappearing through fallback, truthiness or receiver normalization.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. Named word/definition identity is checked against the authored map key. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Integrated main separates three complete-kit proof layers. The portable kit hash proves what Assembly handed to MorphTile; `KIT_IMPORT_PLAN_COVERAGE` proves a READY plan still represents every declared kit word, definition and root tile; ordered `KIT_APPLY` plus `KIT_RECEIVER_CLOSURE` prove the receiver accepted the plan and installed every supported postcondition. READY is therefore neither source truth nor completion by itself.

The independently verified Assembly #41 plan-coverage work and #42 structured-container integrity work are integrated. Assembly #44 is also integrated on main and adds a dedicated exact current-fleet receiver lane without relabelling historical receipts. Integrated main `21d87499e162da2b583959b8344d4c8ec80be74a` pins Form `e551c53f642ceaa77c89dcd5b907c95fd59463dc`, Surface `4e4495182aa83e5dfba37722fc3756a70cfaafaa`, Capability `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`, Interface `ec92507b82d855de49ba024ecfdd32aada24b186`, and MorphTile core `2bdf8eade1376055473b9cc1b11734b72a5566e5` in the moving current-fleet proof.

## Current candidate: preserve exact upstream warning source identity

Assembly already preserves each input machine object exactly in `source_provenance`, but the sourced `UPSTREAM_WARNING` record derives its `machine` field through JavaScript truthiness. When an upstream packet authors a machine `id` of `""`, `0`, or `false`, integrated main rewrites that authored value to `null`, making authored presence indistinguishable from absence in that evidence lane even though source provenance retains the original value.

The candidate removes that rewrite without inventing a machine-id validity policy:

- warning source identity is selected by authored own-key presence rather than truthiness;
- the exact portable authored `machine.id` value is cloned into the `UPSTREAM_WARNING` record;
- `null` remains the warning-source sentinel only when no machine `id` key was authored;
- full source provenance remains unchanged and caller-owned input remains unchanged;
- no candidate eligibility, CANON, dependency, Interface, kit, or MorphTile-core semantics change.

Regression-first head `0374b6da4fbd7ebf6ba4cc8762f8f7ae72cf754b` intentionally failed Actions run `35644879452`, proving the integrated behavior rewrote falsey authored warning-source ids to `null`. Original repaired head `b927da470b6ee92a9ce64c2f5697896dd4e8180c` passed its push and PR replay. This branch has now been explicitly converged onto integrated main `21d87499e162da2b583959b8344d4c8ec80be74a`; fresh exact-head CI is required again because evidence is attached to exact code identity, not to a feature name.

## Reusable rules learned

**Diagnostic provenance is still provenance.** If Assembly publishes a source identity beside preserved upstream evidence, it must not use host-language truthiness to rewrite an authored value into absence.

**Presence and validity are separate questions.** This lane preserves whatever portable value the producer actually authored; it does not infer that falsey ids are valid producer identities or grant them authority.

**Full provenance and convenience provenance must not contradict.** A compact sourced warning may carry less metadata than `source_provenance`, but where both report the same authored field they must agree on its exact value.

**Historical exact receipts stay historical.** Integrated #41/#42 and #44 evidence remains attached to its exact heads and does not become evidence for this candidate automatically. Likewise, a candidate that is rebased or merged onto newer integrated matter must earn fresh exact-head evidence.

## Placement decision

This belongs in Assembly because the rewrite is created by Assembly while wrapping upstream warnings. MorphTile core does not participate in that metadata path and no universal representation/runtime primitive is missing. No core PR is warranted.

Current Form grid-state convergence and Interface binding-namespace work are already represented by the exact integrated fleet pins above. Surface and Capability expose no newer Assembly transport contract in this activation. No sibling candidate is absorbed here.

## HELD / open

- Fresh exact-head CI must be green and independent Verification must attack that same exact head before Creation Director integration.
- MorphTile core #17 remains core-owned regression evidence; Assembly does not duplicate or hide it.
- Presentation z-order remains HOLD because no evidenced canonical MorphTile-core primitive/schema exists.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External/contextual dependencies not present in portable matter remain HOLD.
- No arbitrary future Interface schema compatibility or future READY operation semantics without separate proof.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
