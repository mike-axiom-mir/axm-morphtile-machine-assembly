# MorphTile Assembly Machine

Combines compatible machine candidates into one MorphTile tile candidate while preserving dependency closure, world requirements, source provenance, upstream warnings, and unresolved conflicts as explicit HOLDs.

## Boundary answers

1. **What it does:** Combines compatible tile/facet/capability candidates, proves bounded definition closure, and folds only explicitly proven Interface operation contracts onto an explicitly matching eligible tile.
2. **What it does not own:** Silent conflict overwrite, canonical merge, arbitrary operation execution, invention/fetching of missing definitions, invention of target identity or `ui_panel` eligibility, aesthetic acceptance, producer internals, or automatic CANON.
3. **What it accepts:** `axm.morphtile.assembly-request/v0.1` containing inspectable candidate packets plus optional dependency/world-requirement closure.
4. **What it produces:** A `morphtile.tile-spec/v0.4` candidate plus dependency, world-requirement, derived required-definition, source-provenance, closure-hash, evidence, warning and HOLD fields in the provisional envelope.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and normal authority path. MorphTile does not depend on this repository.
6. **Evidence:** deterministic compatible union, canonical object comparison, input non-mutation, lossless conflict reporting, definition-closure proof, provenance/upstream-warning preservation, upstream-HOLD propagation, addressed Interface validation, unsupported-schema HOLDs, canonical closure hashing, pinned sibling integration, and real MorphTile kit materialization/import.
7. **When it cannot satisfy a request:** unresolved upstream state, malformed candidates, incompatible content, dependency/word/definition drift, missing referenced definitions, unbound or mismatched operations, missing `ui_panel` eligibility, unsupported schemas, and kit-unrepresentable dependencies remain explicit HOLDs.

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

Same-identity dependency drift and conflicting named words/definitions HOLD rather than selecting a winner. As of v0.5.1, HOLD reports also carry both exact competing variants and both source lanes. Generic candidate conflicts do the same for conflicting facet/view/presentation/parameter/capability matter.

The first-seen value remains in the held partial closure only to keep reporting deterministic; its presence is not acceptance or CANON. The competing value is preserved in the HOLD evidence.

A successful candidate carries `closure_hash` using SHA-256 over canonical sorted-key JSON with scope `candidate+dependencies+world_requirements`. Provenance, evidence, warnings, derived requirement indexes, and failed conflict alternatives remain inspectable metadata outside successful content identity.

## Definition closure

Current Form v0.5 can intentionally emit MorphTile recipe `use` references without copying foreign definition bodies. Assembly now turns the repeated question “is everything this candidate refers to actually present?” into deterministic machine capability.

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

The adapter uses MorphTile's own public `createTile`, `validateTile`, `createWorld`, `exportKit`, `importKit`, `hashOf`, and when available `needsOf` contracts. Declared words/definitions travel into the staging world and generated kit. The generated kit is accepted only after fresh-world `importKit` returns `READY`.

Assembly's `closure_hash` and MorphTile's `kit.expect.sha256` are intentionally separate receipts. The first identifies creation-side candidate closure; the second identifies MorphTile's portable kit payload.

Materialization now carries Assembly `source_closure_hash`, `source_provenance`, and `source_warnings` on success and HOLD outputs. Those source-history sidecars remain outside the MorphTile kit payload hash, so changing provenance alone does not pretend the content changed.

Arbitrary Assembly dependency records are not representable in the current MorphTile kit shape, so any non-empty dependency closure causes `HOLD_KIT_DEPENDENCY_UNREPRESENTABLE` instead of silent loss.

See `KIT_MATERIALIZATION.md`.

## Pinned integration lane

Current CI pins exact integrated revisions of:

- Form Machine: `574e0dd348942507685f2892bdebbf2fb5170a03`
- Surface Machine: `ac8e551fb9e8ba266024fcbca473b8491996ea63`
- Capability Machine: `0e0f60eb477d8cb20f8dbe259f546fa7c5b36e24`
- Interface Machine: `260e45599c91cbcb0ec8a5a54153323e4e5d0c6a`
- MorphTile core: `b6b086edb70fd4657495fcf01cb9fcdedceafdaf`

These test-time checkouts are evidence only; sibling repositories and MorphTile core are not runtime dependencies of Assembly.

When a sibling contract is integrated or MorphTile core moves, Assembly must re-earn compatibility against the new exact heads rather than infer it.

## Run

```text
npm test
```

Node 18 or later; zero third-party runtime dependencies; no secrets or network required for the machine's runtime path.

## Truth boundary

- IMPLEMENTED ON MAIN: deterministic tile/facet/capability folding, fail-closed upstream-envelope handling, request/input closure collection, source provenance, upstream-warning preservation, canonical closure hashing, exact addressed Interface view/presentation folding, schema gating, and runtime-backed MorphTile kit materialization.
- CANDIDATE IN v0.5.1: lossless conflict evidence; deterministic direct/transitive definition-closure proof; kit-side source-trace preservation.
- PINNED TEST HARNESS: four integrated sibling machines plus MorphTile v0.4 are checked out at exact commits in CI and exercised together, including a current Form definition-reference path through verified kit import.
- EXPERIMENTAL: envelope v0.1, `world_requirements`, `required_definitions`, `source_provenance`, `held_candidates`, `closure_hash`, and candidate schemas in this repository.
- NOT CLAIMED: compatibility outside pinned revisions, arbitrary operation composition, automatic definition discovery/fetch, automatic `ui_panel` invention, visual quality, automatic CANON, or merge authority.
- HELD: arbitrary dependency transport through MorphTile kits and any conflict auto-resolution policy.

This is candidate machinery, not automatic canon and not evidence that MorphTile can autonomously manufacture MorphTile.
