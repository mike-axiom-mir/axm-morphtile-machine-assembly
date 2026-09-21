# Status

- Candidate version: 0.6.4 + current-merged receiver evidence candidate
- State: CURRENT MERGED RECEIVER EVIDENCE — SEMANTIC TEST HEAD GREEN, FINAL-HEAD REPLAY + INDEPENDENT VERIFICATION REQUIRED
- Test command: `npm test`
- Assembly integrated main: `fae372da63ceeb1b4c3711f0b2b0b22b68bb909d` (merged PR #24)
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Form current merged ecosystem head: `378e7896acfdf8d4bd28d08127c1f57546e3eef1`
- Surface current merged ecosystem head: `4349ba0d926aee1d36dde86fc7f69d04a58bf924`
- Capability current merged ecosystem head: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface current merged ecosystem head: `1a941f8ff88ca590952571e3eeeeeeef6daefd77`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and reviewed Interface transport candidates. It preserves dependency closure, words, definitions, upstream warnings, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas HOLD rather than disappearing.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Explicit falsey content remains content-bearing rather than being collapsed into omission.

Interface target identity is separated from contextual address. A local tile id and a full canonical path may be bound together only when the caller supplies the exact path; Assembly does not infer missing parent context from a matching leaf. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with MorphTile-owned hashing and verified fresh-world import. Arbitrary dependency records that the current kit format cannot represent HOLD rather than being dropped.

## 0.6.3 source-integrity boundary

Both public authored-data trust boundaries perform descriptor-safe portable-data preflight before JSON-backed transport can change meaning. Accessors and `toJSON` hooks are not executed while deciding whether input is portable, non-finite/unsupported values HOLD with authored paths retained, and JavaScript Proxy values are rejected before reflection can execute caller-controlled traps. These boundaries remain unchanged in 0.6.4.

## 0.6.4 integrated — named own-key closure identity

Assembly previously used prototype-aware membership while merging named word/definition closure into ordinary objects. That could confuse inherited JavaScript names such as `__proto__`, `constructor`, or `toString` with authored world requirements. The integrated repair uses own-entry existence plus explicit own-property insertion, preserving those authored names as data and still HOLDing true own-entry conflicts.

The original receiver proof exposed a separate universal MorphTile runtime gap in world/kit registries and merge-unit diff/apply. That repair is integrated to MorphTile main `2bdf8eade1376055473b9cc1b11734b72a5566e5`. Independent Verification round 8 replayed exact Assembly PR #22 head `d4483ae7d3f282e16903c76704e46ec4521e76d1`; Creation Director merged PR #22 and the subsequent portable-composition/identity work into Assembly main before PR #24.

## Round-8 portable composition evidence — integrated through PR #23

Round 8 merged three producer-side semantics without changing MorphTile core: Form added bounded primitive `repeat.size_step`, Interface added bounded canonical-state `repeat`, and Surface promoted own-key/source-integrity regressions. Capability stayed at its already integrated head.

Assembly does not rewrite its historical exact compatibility receipts to pretend they originally tested newer producer identities. The workflow therefore keeps the older exact checkout lane used by existing regressions and a separate `ROUND8_*` lane pinned to the producer heads actually covered by that receiver proof.

The receiver proof combines one complete compatible tile from the pinned Form, Surface, Capability and Interface outputs. It checks exact Form size-progression expressions, Surface pattern matter, canonical counter state, and Interface's native state-bound repeat expression before Assembly. It then proves the combined candidate preserves those parts, carries the Interface target-proof dependency, materializes a portable kit, discharges that dependency only in an isolated staged MorphTile world, imports/applies the kit into a fresh receiver, compiles the transported changing geometry as finite, renders exactly three repeated markers from imported canonical `count=3`, and leaves receiver structural matter unchanged by render.

This is Assembly integration/evidence only. It does not grant Assembly ownership of Form sizing, Surface material vocabulary, Capability state, Interface layout semantics, or MorphTile runtime behavior.

A metadata-integrity regression asserts that the runtime-exported Assembly identity, `machine.json`, and `package.json` report one exact version. It previously exposed that runtime `MACHINE.version` had remained at `0.6.3` after the 0.6.4 manifest/package promotion; PR #23 repaired that source identity to `0.6.4`.

## 0.6.4 integrated — generic own-key candidate merge identity

PR #24 repaired the general candidate merge path so JavaScript prototype-chain names are never mistaken for authored candidate matter. First-seen values are created as explicit own data properties; equal authored values deduplicate; different authored values under the same own key still produce `HOLD_ASSEMBLY_CONFLICT` with both source lanes and exact variants.

The repair was independently replayed in Verification round 10 before Creation Director integration, then merged as Assembly main `fae372da63ceeb1b4c3711f0b2b0b22b68bb909d`. It remains an Assembly merge rule, not permission to invent arbitrary MorphTile facet vocabulary.

## Current-merged receiver evidence candidate

A new separately pinned evidence lane now targets the exact integrated ecosystem after round 10 without relabelling historical receipts:

- Form `378e7896acfdf8d4bd28d08127c1f57546e3eef1` — bounded vector definition `repeat.scale_step` integrated;
- Surface `4349ba0d926aee1d36dde86fc7f69d04a58bf924` — raw-paint signed-zero transport boundary integrated;
- Capability `edc07af182ee26ca1ceb64b5d5205591ec6aca9d` — unchanged integrated state producer;
- Interface `1a941f8ff88ca590952571e3eeeeeeef6daefd77` — bounded same-root tile-path composition integrated;
- MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5` — unchanged universal receiver.

The complete positive-path proof combines Form vector definition-scale progression, ordinary Surface patterned material, Capability canonical counter state and Interface canonical-state repeat into one Assembly candidate with explicit reusable-definition closure. It materializes a real kit, discharges Interface proof only in staged MorphTile matter, imports/applies into a fresh world, then proves the transported Form progression remains semantically active as finite three-part geometry with X width spans `[1, 1.5, 2]`; the imported Interface repeat reads canonical `count=2` and renders exactly two markers without structural mutation.

A separate current-Interface proof carries exact same-root embedded path matter (`/mt_shell/mt_inner`) through Assembly while binding the owner to `mt_shell/mt_panel`. Kit materialization intentionally HOLDs when that parent world is absent rather than fabricating the external context; the explicit embedded path remains unchanged on the HOLD.

A current-Surface negative proof confirms the integrated raw-paint signed-zero rejection remains visible to Assembly as upstream `HOLD_SURFACE_PAINT_NONPORTABLE_VALUE`; Assembly returns `HOLD_INPUT_NOT_CANDIDATE` and preserves the exact upstream HOLD instead of promoting rejected source into candidate matter.

Semantic test head `4824116b32534cc46a31fa1a0d6b97579114904e` ran Actions `35547596022`; its `npm test` step passed. This documentation commit moves the candidate head, so exact final-head replay remains required before technical validity is claimed for the PR.

## Reusable rules learned

**Authorship must be established before transport can transform it.** Serialization is not validation.

**Interception must be rejected before reflection.** Descriptor-safe reads do not protect a boundary when the reflection primitive itself can execute caller-controlled Proxy traps.

**Named closure identity is determined by own data keys, never prototype inheritance.** An inherited JavaScript property is not evidence that a word or definition was authored.

**Generic candidate merge identity follows the same rule.** Presence in a JavaScript prototype is not authored candidate matter; first-seen own data must be inserted without invoking host setters.

**Own-key integrity is end-to-end.** Producer normalization, Assembly closure, portable kit storage, fresh-world import/apply and runtime use must all preserve authored own keys where the relevant format actually defines those keys.

**Portable Assembly proof must continue through the receiver runtime.** Assembler-local preservation is not enough when the claim is portability; kit materialization, verified fresh-world import/apply and real runtime use are part of that claim.

**Historical exact receipts stay historical.** When a newer merged producer changes semantics, add a separately pinned receiver proof instead of relabelling an older exact-revision test as if it covered the new producer.

**Contextual references are not dependency closure by implication.** Preserving an exact same-root Interface path does not authorize Assembly to manufacture the absent parent/world that would make the path resolvable.

**Upstream HOLDs are part of provenance.** Rejected producer matter must remain visibly rejected through Assembly rather than being treated as an empty or legacy fragment.

**Machine identity is provenance.** Runtime result metadata, machine manifest and package identity must not disagree about the version that produced an Assembly candidate or HOLD.

**Merged sibling growth becomes evidence, not automatic authority.** Assembly may re-prove exact merged producer behavior while still HOLDing schemas or semantics it has not explicitly proven.

## Placement decision

This candidate changes receiver evidence and status provenance only; it does not change Assembly runtime semantics. The complete-kit and HOLD-path proofs belong in Assembly because they establish how exact integrated producer outputs compose, close, transport or remain explicitly context-held.

No new universal MorphTile runtime/representation primitive was exposed. No MorphTile-core candidate is justified by this pass.

Open Form #23, Surface #21 and Interface #18 are newer candidate-only sibling lanes. They were inspected but are not treated as integrated authority and are not absorbed into this Assembly candidate. Capability and MorphTile core currently have no newer integrated change relevant to this proof.

## HELD / open

- Exact final-head CI replay is required after documentation updates, then independent Verification must replay that exact PR head before Creation Director integration.
- Open Form #23, Surface #21 and Interface #18 remain candidate-only evidence and are not treated as integrated authority by this lane.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External or contextual dependencies not present in the portable kit remain HOLD.
- No arbitrary future Interface schema compatibility without separate proof.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
