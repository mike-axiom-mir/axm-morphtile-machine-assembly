# Status

- Candidate version: 0.6.4
- State: INTEGRATED OWN-KEY CLOSURE + ROUND-8 PORTABLE COMPOSITION EVIDENCE OPEN
- Test command: `npm test`
- Assembly integrated main: `e62e299f18588ef0146b7db3a864dcad8c06c125` (merged PR #22)
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Form current merged evidence: `33625a6e98cdeb985635e0cdcfd5c754ad8505fe`
- Surface current merged evidence: `536a745ddea4d996d0daf193649db939fe3ade83`
- Capability current merged evidence: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface current merged evidence: `3f29f98b4125fe3376f02aabc509dc3da610deae`
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

The original receiver proof exposed a separate universal MorphTile runtime gap in world/kit registries and merge-unit diff/apply. That repair is integrated to MorphTile main `2bdf8eade1376055473b9cc1b11734b72a5566e5`. Independent Verification round 8 then replayed exact Assembly PR #22 head `d4483ae7d3f282e16903c76704e46ec4521e76d1`; Creation Director merged PR #22 to Assembly main `e62e299f18588ef0146b7db3a864dcad8c06c125`.

## Round-8 portable composition evidence candidate

Round 8 merged three new producer-side semantics without changing MorphTile core: Form added bounded primitive `repeat.size_step`, Interface added bounded canonical-state `repeat`, and Surface promoted own-key/source-integrity regressions. Capability stayed at its already integrated head.

Assembly does not rewrite its historical exact compatibility receipts to pretend they originally tested those newer producer identities. The workflow therefore keeps the older exact checkout lane used by existing regressions and adds a separate `ROUND8_*` lane pinned to the current merged producer heads.

The new receiver proof combines one complete compatible tile from current merged Form, Surface, Capability and Interface outputs. It checks exact Form size-progression expressions, Surface pattern matter, canonical counter state, and Interface's native state-bound repeat expression before Assembly. It then proves the combined candidate preserves those parts, carries the Interface target-proof dependency, materializes a portable kit, discharges that dependency only in an isolated staged MorphTile world, imports/applies the kit into a fresh receiver, compiles the transported changing geometry as finite, renders exactly three repeated markers from imported canonical `count=3`, and leaves receiver structural matter unchanged by render.

This is Assembly integration/evidence only. It does not grant Assembly ownership of Form sizing, Surface material vocabulary, Capability state, Interface layout semantics, or MorphTile runtime behavior.

A separate metadata-integrity regression now asserts that the runtime-exported Assembly identity, `machine.json`, and `package.json` report one exact version. It exposed that runtime `MACHINE.version` had remained at `0.6.3` after the 0.6.4 manifest/package promotion; the candidate repairs that single source identity to `0.6.4` rather than allowing provenance envelopes to advertise a stale machine version.

## Reusable rules learned

**Authorship must be established before transport can transform it.** Serialization is not validation.

**Interception must be rejected before reflection.** Descriptor-safe reads do not protect a boundary when the reflection primitive itself can execute caller-controlled Proxy traps.

**Named closure identity is determined by own data keys, never prototype inheritance.** An inherited JavaScript property is not evidence that a word or definition was authored.

**Own-key integrity is end-to-end.** Producer normalization, Assembly closure, portable kit storage, fresh-world import/apply and runtime use must all preserve authored own keys.

**Portable Assembly proof must continue through the receiver runtime.** Assembler-local preservation is not enough; kit materialization, verified fresh-world import/apply and real runtime use are part of the portability claim.

**Historical exact receipts stay historical.** When a newer merged producer changes semantics, add a separately pinned receiver proof instead of relabelling an older exact-revision test as if it covered the new producer.

**Machine identity is provenance.** Runtime result metadata, machine manifest and package identity must not disagree about the version that produced an Assembly candidate or HOLD.

**Merged sibling growth becomes evidence, not automatic authority.** Assembly may re-prove exact merged producer behavior while still HOLDing schemas or semantics it has not explicitly proven.

## Placement decision

The new round-8 proof belongs in Assembly because it answers whether compatible outputs from several independently owned creation machines survive combination into one complete portable tile/kit and still retain their exact meaning after fresh-world import. The version-identity repair also belongs in Assembly because it is the machine's own provenance metadata. No new universal MorphTile representation/runtime gap was exposed by this pass, so no core candidate is justified.

## HELD / open

- The round-8 portable-composition and version-identity candidate needs exact-head CI and independent Verification before Creation Director integration.
- Open Form #21, Surface #19 and Interface #16 remain candidate-only evidence and are not treated as integrated authority by this lane.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External or contextual dependencies not present in the portable kit remain HOLD.
- No arbitrary future Interface schema compatibility without separate proof.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
