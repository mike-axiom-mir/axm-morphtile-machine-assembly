# Status

- State: UPSTREAM WARNING SOURCE-IDENTITY CANDIDATE — EXACT-HEAD CI + INDEPENDENT VERIFICATION GATE
- Test command: `npm test`
- Assembly integrated main/base: `c45f8305196d149362045cef339ff1634f9095fe`
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Current integrated Assembly capability

Assembly deterministically combines compatible tile, facet, capability and reviewed Interface transport candidates. It preserves dependency closure, words, definitions, source provenance, upstream warnings/HOLD evidence and canonical SHA-256 closure identity. Same-identity conflicts HOLD with both variants and sources instead of selecting a winner. Unsupported candidate schemas, malformed compatibility wrappers and malformed structured tile containers HOLD instead of disappearing through fallback, truthiness or receiver normalization.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. Named word/definition identity is checked against the authored map key. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Integrated main now separates three complete-kit proof layers. The portable kit hash proves what Assembly handed to MorphTile; `KIT_IMPORT_PLAN_COVERAGE` proves a READY plan still represents every declared kit word, definition and root tile; ordered `KIT_APPLY` plus `KIT_RECEIVER_CLOSURE` prove the receiver accepted the plan and installed every supported postcondition. READY is therefore neither source truth nor completion by itself.

The independently verified Assembly #41 plan-coverage work and #42 structured-container integrity work were both integrated by Creation Director round 29. Combined Assembly main `c45f8305196d149362045cef339ff1634f9095fe` passed post-merge run `35641284603`. Historical candidate receipts remain historical rather than being relabelled as current.

## Current candidate: preserve exact upstream warning source identity

Assembly already preserves each input machine object exactly in `source_provenance`, but the sourced `UPSTREAM_WARNING` record derived its `machine` field through JavaScript truthiness. When an upstream packet authored a machine `id` of `""`, `0`, or `false`, the warning record rewrote that authored value to `null`, making authored presence indistinguishable from absence in that evidence lane even though source provenance retained the original value.

The candidate removes that rewrite without inventing a machine-id validity policy:

- warning source identity is selected by authored own-key presence rather than truthiness;
- the exact portable authored `machine.id` value is cloned into the `UPSTREAM_WARNING` record;
- `null` remains the warning-source sentinel only when no machine `id` key was authored;
- full source provenance remains unchanged and caller-owned input remains unchanged;
- no candidate eligibility, CANON, dependency, Interface, kit, or MorphTile-core semantics change.

Regression-first head `0374b6da4fbd7ebf6ba4cc8762f8f7ae72cf754b` intentionally failed PR Actions run `35644879452`, proving integrated main rewrote falsey authored warning-source ids to `null`. Repair head `81f1d487ebeb081240b48422896ee67d58def7de` changes only that source-selection rule; final exact-head evidence will be recorded after documentation convergence.

## Reusable rules learned

**Diagnostic provenance is still provenance.** If Assembly publishes a source identity beside preserved upstream evidence, it must not use host-language truthiness to rewrite an authored value into absence.

**Presence and validity are separate questions.** This lane preserves whatever portable value the producer actually authored; it does not infer that falsey ids are valid producer identities or grant them authority.

**Full provenance and convenience provenance must not contradict.** A compact sourced warning may carry less metadata than `source_provenance`, but where both report the same authored field they must agree on its exact value.

**Historical exact receipts stay historical.** Integrated #41/#42 evidence remains attached to its exact heads and does not become evidence for this candidate automatically.

## Placement decision

This belongs in Assembly because the rewrite is created by Assembly while wrapping upstream warnings. MorphTile core does not participate in that metadata path and no universal representation/runtime primitive is missing. No core PR is warranted.

Current sibling movement is independent: Interface #36 is an Interface-owned current-Assembly positive-control receiver-evidence lane, while Form #43 is Form-owned internal state convergence. Surface and Capability expose no new Assembly transport contract. None is absorbed here.

## HELD / open

- Final exact-head push/PR CI must be green and independent Verification must attack that same exact head before Creation Director integration.
- MorphTile core #17 remains core-owned regression evidence; Assembly does not duplicate or hide it.
- Presentation z-order remains HOLD because no evidenced canonical MorphTile-core primitive/schema exists.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External/contextual dependencies not present in portable matter remain HOLD.
- No arbitrary future Interface schema compatibility or future READY operation semantics without separate proof.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
