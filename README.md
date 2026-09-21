# MorphTile Assembly Machine

Combines compatible machine candidates into one MorphTile tile candidate while preserving dependency closure, world requirements, source provenance, upstream warnings, and unresolved conflicts as explicit HOLDs.

## Boundary answers

1. **What it does:** Combines compatible tile/facet/capability candidates, proves bounded definition closure, and folds only explicitly proven Interface operation contracts onto an explicitly matching eligible tile.
2. **What it does not own:** Silent conflict overwrite, canonical merge, arbitrary operation execution, invention/fetching of missing definitions, invention of target identity or `ui_panel` eligibility, aesthetic acceptance, producer internals, or automatic CANON.
3. **What it accepts:** `axm.morphtile.assembly-request/v0.1` containing inspectable candidate packets plus optional dependency/world-requirement closure.
4. **What it produces:** A `morphtile.tile-spec/v0.4` candidate plus dependency, world-requirement, derived required-definition, source-provenance, closure-hash, evidence, warning and HOLD fields in the provisional envelope.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and normal authority path. MorphTile does not depend on this repository.
6. **Evidence:** deterministic compatible union, canonical object comparison, input non-mutation, lossless conflict reporting, definition-closure proof, provenance/upstream-warning preservation, upstream-HOLD propagation, addressed Interface validation, unsupported-schema HOLDs, canonical closure hashing, pinned sibling integration, and real MorphTile kit materialization/import/application.
7. **When it cannot satisfy a request:** unresolved upstream state, malformed candidates, incompatible content, dependency/word/definition drift, missing referenced definitions, unbound or mismatched operations, missing `ui_panel` eligibility, unsupported schemas, kit-unrepresentable dependencies, or receiver-rejected import operations remain explicit HOLDs.

## Upstream truth rule

Assembly never treats the presence of an input packet as proof that it is eligible to become matter.

An upstream envelope participates in assembly only when it declares `status: CANDIDATE` and carries an object candidate. Upstream HOLD/FAIL state is carried forward rather than being reinterpreted as an empty legacy fragment. Unsupported candidate payloads remain inspectable in `held_candidates`.

Bare legacy candidate fragments are still accepted for backward compatibility and are marked `LEGACY_SCHEMALESS_FRAGMENT`.

See `docs/INPUT_CLOSURE.md`.

## Closure and conflict rule

Assembly preserves:

- request-level and input-level dependencies;
- request-level and input-level `world_requirements.words`;
- request-level and input-level `world_requirements.definitions`;
- source machine/request/provenance metadata;
- upstream warnings as sourced `UPSTREAM_WARNING` records.

Same-identity dependency drift and conflicting named words/definitions HOLD rather than selecting a winner. HOLD reports carry both exact competing variants and both source lanes. Generic candidate conflicts do the same for conflicting facet/view/presentation/parameter/capability matter.

The first-seen value remains in the held partial closure only to keep reporting deterministic; its presence is not acceptance or CANON. The competing value is preserved in the HOLD evidence.

A successful candidate carries `closure_hash` using SHA-256 over canonical sorted-key JSON with scope `candidate+dependencies+world_requirements`. Provenance, evidence, warnings, derived requirement indexes, and failed conflict alternatives remain inspectable metadata outside successful content identity.

## Definition closure

Current Form output can intentionally emit MorphTile recipe `use` references without copying foreign definition bodies. Assembly turns the repeated question “is everything this candidate refers to actually present?” into deterministic machine capability.

For MorphTile v0.4 matter it discovers:

- generated-recipe `use` references, including references nested in loop `body` arrays;
- transitive `use` references inside supplied definitions;
- capability `grants_ref.def` references.

The sorted derived list is returned as `required_definitions`. If any referenced definition is absent from declared `world_requirements.definitions`, Assembly returns `HOLD_DEFINITION_CLOSURE_INCOMPLETE` with both the full required set and the missing set.

Assembly does not fetch, synthesize, guess, or silently substitute definitions. MorphTile runtime resolution remains authoritative; kit materialization additionally cross-checks with runtime `needsOf` when available.

## Proven Interface folding

Assembly supports two narrow Interface contracts:

- `morphtile.view-operation/v0.4`: exactly one addressed `view.set`;
- `morphtile.interface-operations/v0.4`: exactly one addressed `view.set` plus one `presentation.set` for the same tile.

Both require:

- explicit assembled tile identity;
- agreement between all declared tile identities;
- exact operation target match;
- no unknown fields that would be silently discarded;
- compatible input matter that already declares `ui_panel`.

Assembly does **not** add `ui_panel` merely to make Interface output fit and does not become an arbitrary operation composer. Future operation types and widened bundle shapes remain HOLD until separately proven.

## MorphTile kit materialization

`src/kit.js` can materialize a successful Assembly result through an explicitly supplied MorphTile runtime.

The adapter uses MorphTile's own public `createTile`, `validateTile`, `createWorld`, `exportKit`, `importKit`, `applyStructOp`, `hashOf`, `resolveTile`, and when available `needsOf`/`grantsOf` contracts. Declared words/definitions travel into the staging world and generated kit. A generated kit is accepted only after fresh-world `importKit` returns `READY`, Assembly proves that the returned READY plan still covers the declared kit matter, every accepted ordered import operation executes successfully against that isolated receiver, and every supported operation's receiver postcondition is present exactly. `READY` is an import plan, not source truth or receiver completion: missing plan coverage, a missing operation list, a rejected operation, or incomplete installed closure remains an explicit HOLD with exact evidence preserved.

Assembly's `closure_hash` and MorphTile's `kit.expect.sha256` are intentionally separate receipts. The first identifies creation-side candidate closure; the second identifies MorphTile's portable kit payload. Import-plan coverage then proves that runtime-selected authority still corresponds to that portable payload before receiver execution, and receiver closure proves the selected plan was actually installed.

Materialization carries Assembly `source_closure_hash`, `source_provenance`, and `source_warnings` on success and HOLD outputs. Those source-history sidecars remain outside the MorphTile kit payload hash, so changing provenance alone does not pretend the content changed.

Known local Interface target-proof and presentation-anchor dependencies can be deterministically discharged against isolated staged MorphTile matter. If a known proof is not actually satisfied, materialization returns `HOLD_KIT_DEPENDENCY_UNSATISFIED`. Other unresolved dependency records are not representable in the current MorphTile kit shape and return `HOLD_KIT_DEPENDENCY_UNREPRESENTABLE` instead of being silently dropped.

See `KIT_MATERIALIZATION.md`.

## Pinned integration lanes

The workflow keeps historical exact receipts historical. New producer/runtime integration is re-earned in separately pinned receiver lanes rather than retroactively relabelling older tests.

Historical exact lane used by the existing integration regressions:

- Form Machine: `bd67179e2aebd20708b02152d07752b37df16e66`
- Surface Machine: `67599d08938c8aac236dfa1421c25856f4b962ba`
- Capability Machine: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface Machine: `271fbf2abe6fc214d30076b9417655f084221eac`
- MorphTile core: `2bdf8eade1376055473b9cc1b11734b72a5566e5`

Round-8 portable-composition lane:

- Form Machine: `33625a6e98cdeb985635e0cdcfd5c754ad8505fe`
- Surface Machine: `536a745ddea4d996d0daf193649db939fe3ade83`
- Capability Machine: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface Machine: `3f29f98b4125fe3376f02aabc509dc3da610deae`
- MorphTile core: `2bdf8eade1376055473b9cc1b11734b72a5566e5`

Round-10 current-receiver lane:

- Form Machine: `378e7896acfdf8d4bd28d08127c1f57546e3eef1`
- Surface Machine: `4349ba0d926aee1d36dde86fc7f69d04a58bf924`
- Capability Machine: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface Machine: `1a941f8ff88ca590952571e3eeeeeeef6daefd77`
- MorphTile core: `2bdf8eade1376055473b9cc1b11734b72a5566e5`

Round-19 integrated receiver lane:

- Form Machine: `dd6975f29390e3175642a7d510b3c5320415b620`
- Surface Machine: `4e4495182aa83e5dfba37722fc3756a70cfaafaa`
- Capability Machine: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface Machine: `8516da3a414c416ec1f76b1078901c56c49b04db`
- MorphTile core: `2bdf8eade1376055473b9cc1b11734b72a5566e5`

The round-19 receiver proof checks that Surface base-color-only authorship stays free of invented `paint`, Interface repeat-local relational comparisons survive complete Assembly/kit transport and evaluate from lexical repeat scope, Capability `count=3` closes the Interface readout proof, Form output compiles as finite geometry, and fresh-world rendering remains structurally read-only.

Round-22 current-fleet historical lane:

- Form Machine: `d4da0515c290b0b504c02b9d29e974d3add4e6b5`
- Surface Machine: `4e4495182aa83e5dfba37722fc3756a70cfaafaa`
- Capability Machine: `edc07af182ee26ca1ceb64b5d5205591ec6aca9d`
- Interface Machine: `96dfea316216922dffca872ec083a549e4777c96`
- MorphTile core: `2bdf8eade1376055473b9cc1b11734b72a5566e5`

The round-22 proof re-earns the integrated Form definition-setting grid position representation through Assembly closure, a real MorphTile kit, fresh-world import/application and runtime compile. It preserves active X/Z position expressions, the inactive Y position constant, X-only definition-setting width progression, current Surface/Capability/Interface matter, six finite compiled recipe parts, and structurally read-only Interface rendering from canonical `count=3`.

These checkouts are evidence only; sibling repositories and MorphTile core are not runtime dependencies of Assembly. When a sibling contract is integrated or MorphTile core moves, Assembly must re-earn compatibility against the new exact heads rather than infer it. An unmerged sibling candidate is inspectable evidence, never automatic authority.

## Run

```text
npm test
```

Node 18 or later; zero third-party runtime dependencies; no secrets or network required for the machine's runtime path.

## Truth boundary

- IMPLEMENTED ON MAIN: deterministic tile/facet/capability folding; fail-closed upstream-envelope and authored-wrapper handling; exact request/intent grammar; semantic container validation across wrapped and direct candidate paths, including authored `params`/`view`/`presentation` container identity; authored-presence source tracing; request/input closure collection; source provenance; upstream-warning/HOLD preservation; canonical closure hashing; exact addressed Interface view/presentation folding; schema gating; source-integrity preflight; lossless conflict evidence; named own-key world closure; generic own-key candidate merge identity; and runtime-backed MorphTile kit materialization with bounded local Interface proof discharge, READY import-plan coverage, ordered receiver application, and installed receiver-postcondition closure.
- CURRENT CANDIDATE: exact upstream-warning source identity. Sourced `UPSTREAM_WARNING.machine` now follows authored own-key presence and clones the exact portable `machine.id` value instead of rewriting falsey authored ids to `null`; absence still maps to `null`. This preserves evidence without inventing an id-validity or authority policy.
- PINNED TEST HARNESS: historical exact receipts plus separately pinned round-8, round-10, round-19, and round-22 receiver lanes are checked out in CI.
- EXPERIMENTAL: envelope v0.1, `world_requirements`, `required_definitions`, `source_provenance`, `held_candidates`, `closure_hash`, and candidate schemas in this repository.
- NOT CLAIMED: compatibility outside pinned revisions, unmerged sibling semantics, arbitrary new MorphTile facet vocabulary, arbitrary operation composition, automatic definition discovery/fetch, automatic `ui_panel` invention, visual quality, automatic CANON, or merge authority.
- HELD: final exact-head/PR replay and independent Verification of the current Assembly candidate; unmerged sibling candidates remain outside Assembly authority; unresolved arbitrary dependency transport through MorphTile kits; any conflict auto-resolution policy; MorphTile core #17's separately owned repeat-text lexical-scope gap; and presentation z-order until a canonical core primitive/schema exists.

This is candidate machinery, not automatic canon and not evidence that MorphTile can autonomously manufacture MorphTile.
