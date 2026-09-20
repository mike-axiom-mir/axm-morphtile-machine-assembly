# MorphTile Assembly Machine

Combines compatible machine candidates into one MorphTile tile candidate while preserving dependency closure, world requirements, source provenance, upstream warnings, and unresolved conflicts as explicit HOLDs.

## Boundary answers

1. **What it does:** Combines compatible tile/facet/capability candidates and folds only explicitly proven Interface operation contracts onto an explicitly matching eligible tile.
2. **What it does not own:** Silent conflict overwrite, canonical merge, arbitrary operation execution, invention of target identity or `ui_panel` eligibility, aesthetic acceptance, producer internals, or automatic CANON.
3. **What it accepts:** `axm.morphtile.assembly-request/v0.1` containing inspectable candidate packets.
4. **What it produces:** A `morphtile.tile-spec/v0.4` candidate plus dependency, world-requirement, source-provenance, closure-hash, evidence, warning and HOLD fields in the provisional envelope.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and normal authority path. MorphTile does not depend on this repository.
6. **Evidence:** deterministic compatible union, canonical object comparison, input non-mutation, lossless conflict reporting, provenance/upstream-warning preservation, upstream-HOLD propagation, addressed Interface validation, unsupported-schema HOLDs, canonical closure hashing, pinned sibling integration, and real MorphTile kit materialization/import.
7. **When it cannot satisfy a request:** unresolved upstream state, malformed candidates, incompatible content, dependency/word/definition drift, unbound or mismatched operations, missing `ui_panel` eligibility, unsupported schemas, and kit-unrepresentable dependencies remain explicit HOLDs.

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

Same-identity dependency drift and conflicting named words/definitions HOLD rather than selecting a winner. As of v0.5.1 candidate, HOLD reports also carry both exact competing variants and both source lanes. Generic candidate conflicts do the same for conflicting facet/view/presentation/parameter/capability matter.

The first-seen value remains in the held partial closure only to keep reporting deterministic; its presence is not acceptance or CANON. The competing value is preserved in the HOLD evidence.

A successful candidate carries `closure_hash` using SHA-256 over canonical sorted-key JSON with scope `candidate+dependencies+world_requirements`. Provenance, evidence, warnings, and failed conflict alternatives remain inspectable metadata outside successful content identity.

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

Arbitrary Assembly dependency records are not representable in the current MorphTile kit shape, so any non-empty dependency closure causes `HOLD_KIT_DEPENDENCY_UNREPRESENTABLE` instead of silent loss.

## Pinned integration lane

Current CI pins exact revisions of:

- Form Machine: `492db62109756f137d1e1a8bfa8ed03db7769447`
- Surface Machine: `50d7f606ffb9a1847cf011391f9acf0f923ecef2`
- Capability Machine: `48915b6602142d263629ca5db87052f82fdf9a0c`
- Interface Machine: `34ee5a3293e551a6b49295e1efa7908d7de783ed`
- MorphTile core: `a579182ae585e5722ac87dd0cc8209963b18d000`

These test-time checkouts are evidence only; sibling repositories and MorphTile core are not runtime dependencies of Assembly.

Unmerged sibling candidates are not treated as canonical inputs. When a sibling contract is integrated, Assembly must re-earn compatibility against the new exact head rather than infer it.

## Run

```text
npm test
```

Node 18 or later; zero third-party runtime dependencies; no secrets or network required for the machine's runtime path.

## Truth boundary

- IMPLEMENTED ON MAIN: deterministic tile/facet/capability folding, fail-closed upstream-envelope handling, request/input closure collection, source provenance, upstream-warning preservation, canonical closure hashing, exact addressed Interface view/presentation folding, schema gating, and runtime-backed MorphTile kit materialization.
- CANDIDATE IN v0.5.1: lossless conflict evidence for candidate, word, and definition clashes.
- PINNED TEST HARNESS: four stable sibling machines plus MorphTile v0.4 are checked out at exact commits in CI and exercised together.
- EXPERIMENTAL: envelope v0.1, `world_requirements`, `source_provenance`, `held_candidates`, `closure_hash`, and candidate schemas in this repository.
- NOT CLAIMED: compatibility outside pinned revisions, arbitrary operation composition, automatic `ui_panel` invention, visual quality, automatic CANON, or merge authority.
- HELD: unmerged sibling candidate contracts, arbitrary dependency transport through MorphTile kits, and any conflict auto-resolution policy.

This is candidate machinery, not automatic canon and not evidence that MorphTile can autonomously manufacture MorphTile.
