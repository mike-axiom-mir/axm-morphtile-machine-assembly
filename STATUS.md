# Status

- Candidate version: 0.6.4
- State: CANDIDATE — NAMED OWN-KEY CLOSURE / PORTABLE KIT PROOF OPEN
- Test command: `npm test`
- Assembly base: `08836233457d90b571063a8342434c572b87cd5e`
- MorphTile runtime prerequisite candidate: PR #16 at `43a9eccf831a49aedc169a5ce0b6701e22ae4cc3`
- MorphTile prerequisite Verification: PASS in Verification round 7 / PR #33, exact replay against `43a9eccf831a49aedc169a5ce0b6701e22ae4cc3`
- Form integrated evidence: `6adea73ea3a396aa60fc6207372ba7ea611c60fc`
- Surface integrated evidence: `5184275314503333912cf30c97c203323a1ab7e1`
- Capability integrated evidence: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface integrated evidence: `0e47cd09d613c6c934cd7adbdb6c7a18eeaaf6ed`
- Envelope: provisional v0.1
- Visual proof: none

## Current Assembly capability

Assembly deterministically combines compatible tile, facet, capability and reviewed Interface transport candidates. It preserves dependency closure, words, definitions, upstream warnings, source provenance and a canonical SHA-256 closure hash. Same-identity conflicts HOLD with both variants and their sources instead of selecting a winner. Unsupported candidate schemas HOLD rather than disappearing.

Definition references in proven MorphTile recipe/capability forms are discovered and missing definitions HOLD. World-requirement word/definition identity is checked so an explicit embedded `name`/`id` cannot contradict the map key without a HOLD. Explicit falsey content remains content-bearing rather than being collapsed into omission.

Interface target identity is separated from contextual address. A local tile id and a full canonical path may be bound together only when the caller supplies the exact path; Assembly does not infer missing parent context from a matching leaf. Exact Interface target/anchor proof obligations may be discharged only against isolated staged MorphTile matter that actually satisfies them. Missing parent/world context remains a kit-time HOLD.

Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with MorphTile-owned hashing and verified fresh-world import. Arbitrary dependency records that the current kit format cannot represent HOLD rather than being dropped.

## 0.6.3 integrated source-integrity boundary

Both public authored-data trust boundaries perform descriptor-safe portable-data preflight before JSON-backed transport can change meaning. Accessors and `toJSON` hooks are not executed while deciding whether input is portable, non-finite/unsupported values HOLD with authored paths retained, and JavaScript Proxy values are rejected before reflection can execute caller-controlled traps. These boundaries remain unchanged in 0.6.4.

## 0.6.4 candidate — named own-key closure identity

Assembly previously used prototype-aware membership (`name in target`) while merging named word/definition closure into ordinary objects. That could confuse inherited JavaScript names such as `__proto__`, `constructor`, or `toString` with authored world requirements. The 0.6.4 candidate uses own-entry existence plus explicit own-property insertion, preserving those authored names as data and still HOLDing true own-entry conflicts.

The receiver proof exposed a separate universal MorphTile runtime gap: current merged core `63a65c70...` preserved recipe-scope own-key identity but its world/kit registries still treated inherited prototype names as already-present definitions/words. MorphTile core PR #16 is therefore a bounded prerequisite candidate for this Assembly portable-kit proof. Its exact candidate head `43a9eccf...` preserves own-key identity through kit import/export, world insertion and merge-unit diff/apply. Independent Verification round 7 reproduced two old inherited-registry failures and PASSed the repaired exact head; Assembly still does not claim the unmerged core candidate as CANON before Creation Director integration.

## Reusable rules learned

**Authorship must be established before transport can transform it.** Serialization is not validation.

**Interception must be rejected before reflection.** Descriptor-safe reads do not protect a boundary when the reflection primitive itself can execute caller-controlled Proxy traps.

**Named closure identity is determined by own data keys, never prototype inheritance.** An inherited JavaScript property is not evidence that a word or definition was authored.

**Portable Assembly proof must continue through the receiver runtime.** Assembler-local preservation can expose a universal substrate gap that is invisible until kit import, merge planning or runtime use.

## Placement decision

The named-closure merge repair belongs in Assembly because Assembly owns combining sibling/request world requirements. The kit/world registry own-key repair belongs in MorphTile core because every producer/consumer using MorphTile kits and merge units needs the same exact identity semantics. No sibling producer vocabulary is widened by this candidate.

## HELD / open

- MorphTile core PR #16 is independently Verification-PASSed at exact head `43a9eccf...` but remains unmerged and still requires Creation Director integration authority.
- The Assembly 0.6.4 candidate is unmerged and needs exact-head independent Verification before integration.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External or contextual dependencies not present in the portable kit remain HOLD.
- No arbitrary future Interface schema compatibility without separate proof.
- Unmerged sibling candidates remain evidence only and are not treated as integrated CANON.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
