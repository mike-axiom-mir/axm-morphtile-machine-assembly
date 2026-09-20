# Status

- Candidate version: 0.6.4
- State: CANDIDATE — NAMED OWN-KEY CLOSURE / CURRENT MERGED RECEIVER PROOF OPEN
- Test command: `npm test`
- Assembly base: `08836233457d90b571063a8342434c572b87cd5e`
- MorphTile integrated receiver: `2bdf8eade1376055473b9cc1b11734b72a5566e5` (merged core PR #16)
- MorphTile own-key prerequisite Verification: PASS in Verification round 7 / merged Verification PR #33
- Form integrated evidence: `bd67179e2aebd20708b02152d07752b37df16e66`
- Surface integrated evidence: `67599d08938c8aac236dfa1421c25856f4b962ba`
- Capability integrated evidence: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface integrated evidence: `271fbf2abe6fc214d30076b9417655f084221eac`
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

The original receiver proof exposed a separate universal MorphTile runtime gap in world/kit registries and merge-unit diff/apply. That repair is now integrated to MorphTile main as `2bdf8eade...` after independent Verification round 7. Assembly's portable own-key proof is therefore re-bound to the merged receiver identity rather than the pre-merge candidate SHA.

Form has also integrated its own producer-side definition-setting own-key repair at `bd67179e...`. Assembly now carries an exact Form-authored own `__proto__` definition override through candidate combination, explicit definition closure, kit materialization, verified fresh-world import and runtime mesh compilation, proving the override remains effective after transport rather than merely present as a key.

The current evidence lane also re-pins Surface and Interface to their latest merged heads. This is compatibility evidence only; it does not silently widen Assembly to unproven future candidate schemas or grant any sibling new authority inside Assembly.

## Reusable rules learned

**Authorship must be established before transport can transform it.** Serialization is not validation.

**Interception must be rejected before reflection.** Descriptor-safe reads do not protect a boundary when the reflection primitive itself can execute caller-controlled Proxy traps.

**Named closure identity is determined by own data keys, never prototype inheritance.** An inherited JavaScript property is not evidence that a word or definition was authored.

**Own-key integrity is end-to-end.** Producer normalization, Assembly closure, portable kit storage, fresh-world import/apply and runtime use must all preserve authored own keys; preserving the spelling at only one layer is insufficient.

**Portable Assembly proof must continue through the receiver runtime.** Assembler-local preservation can expose a universal substrate gap that is invisible until kit import, merge planning or runtime use.

**Merged sibling growth becomes evidence, not automatic authority.** Assembly may re-pin and re-prove exact merged producer behavior while still HOLDing schemas or semantics it has not explicitly proven.

## Placement decision

The named-closure merge repair belongs in Assembly because Assembly owns combining sibling/request world requirements. The kit/world registry own-key repair belongs in MorphTile core because every producer/consumer using MorphTile kits and merge units needs the same exact identity semantics. Form owns definition-setting normalization. Assembly owns proving that these independently merged semantics remain exact through complete portable closure.

No new universal MorphTile representation/runtime gap is exposed by the current convergence pass, so no additional core candidate is justified.

## HELD / open

- The Assembly 0.6.4 candidate remains unmerged and needs exact-head producer CI plus independent Verification against the current merged MorphTile receiver before Creation Director integration.
- Independent Verification should replay the exact PR #22 head, including `__proto__ -> constructor -> toString` definition closure, the merged Form own-key setting transport, verified fresh-world kit import/apply, runtime resolution and finite mesh compilation.
- No automatic conflict winner or priority policy for incompatible candidate, word, definition or dependency variants.
- Assembly does not invent, fetch or synthesize missing definitions, dependencies, `ui_panel` eligibility, target identity or parent/world context.
- External or contextual dependencies not present in the portable kit remain HOLD.
- No arbitrary future Interface schema compatibility without separate proof.
- Unmerged sibling candidates remain evidence only and are not treated as integrated CANON.
- No visual-quality proof, automatic CANON, self-merge or merge authority.
