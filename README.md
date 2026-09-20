# MorphTile Assembly Machine

Combines compatible machine candidates into one MorphTile tile candidate while preserving dependency closure, world requirements, source provenance, upstream warnings, and unresolved conflicts as explicit HOLDs.

## Boundary answers

1. **What it does:** Combines compatible tile/facet/capability candidates and, when identity and form eligibility are already explicit, folds the stable `morphtile.view-operation/v0.4` `view.set` contract into the same tile candidate.
2. **What it does not own:** Silent conflict overwrite, canonical merge, automatic application of world words/definitions, arbitrary operation-bundle execution, invention of target identity or `ui_panel` eligibility, aesthetic acceptance, or producer internals.
3. **What it accepts:** `axm.morphtile.assembly-request/v0.1` containing inspectable candidate packets.
4. **What it produces:** A `morphtile.tile-spec/v0.4` candidate plus dependency, world-requirement, source-provenance, closure-hash, evidence, warning and HOLD fields in the provisional envelope.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and normal authority path. MorphTile does not depend on this repository.
6. **Evidence:** deterministic compatible union, canonical object comparison, input non-mutation, dependency/word/definition conflict detection, provenance and upstream-warning preservation, upstream-HOLD propagation, addressed-view validation, unsupported-schema HOLD tests, canonical closure hashing, and a pinned four-sibling integration lane.
7. **When it cannot satisfy a request:** unresolved upstream machine state, malformed candidate envelopes, incompatible content, dependency/definition drift, unbound or mismatched operation targets, missing `ui_panel` eligibility, and unsupported candidate schemas all remain explicit HOLDs.

## Upstream truth rule

Assembly never treats the presence of an input packet as proof that it is eligible to become matter.

An upstream envelope participates in assembly only when it declares `status: CANDIDATE` and carries an object candidate. Upstream HOLD/FAIL state is carried forward rather than being reinterpreted as an empty legacy fragment. Unsupported candidate payloads remain inspectable in `held_candidates`.

Bare legacy candidate fragments are still accepted for backward compatibility and are marked `LEGACY_SCHEMALESS_FRAGMENT`.

See `docs/INPUT_CLOSURE.md`.

## Closure rule

Assembly preserves:

- request-level and input-level dependencies;
- request-level and input-level `world_requirements.words`;
- request-level and input-level `world_requirements.definitions`;
- source machine/request/provenance metadata;
- upstream warnings as sourced `UPSTREAM_WARNING` records.

Same-identity dependency drift and conflicting named words/definitions HOLD rather than selecting a winner.

A successful candidate carries `closure_hash` using SHA-256 over canonical sorted-key JSON with scope `candidate+dependencies+world_requirements`. Provenance, evidence and warnings remain inspectable metadata outside content identity.

## Stable view-operation folding

The exact stable Interface Machine schema `morphtile.view-operation/v0.4` is supported narrowly.

Assembly accepts only an operation shaped as:

```json
{"op":"view.set","id":"<tile-id>","view":{}}
```

and only when:

- the assembled tile identity is explicit through `request.intent.id` or an input tile spec;
- all declared tile identities agree;
- the operation target equals that exact identity;
- no unknown operation fields would be silently dropped;
- compatible input matter already declares `ui_panel` in `form_hints`.

Assembly does **not** add `ui_panel` merely to make Interface output fit. The current stable Form Machine declares `game_asset` only, while stable Interface warns that its target must declare `ui_panel`; therefore the raw four-current-machine combination correctly HOLDS until that compatibility is explicitly supplied by an owning input/caller.

`morphtile.interface-operations/v0.4` and other operation bundles remain unsupported and explicit HOLD territory.

## Pinned integration lane

CI pins exact revisions of:

- Form Machine: `bcf7f0c6637c95a6ddd4ad9a9c9d178b05f9963f`
- Surface Machine: `c636a7ab32805a0ac1cbe95f7b4c1c71a5f6bba4`
- Capability Machine: `f5559c6c70642a521252a2ed29365fefd4ef428f`
- Interface Machine: `d30525787bb6c598dce401be8d5640fb002958ac`
- MorphTile core: `4346df01ed18cd1336064f9323d7766ff4f6338a`

The integration test first proves that the four raw sibling outputs expose the missing `ui_panel` compatibility as a HOLD while preserving Interface's warning. It then supplies one explicit `ui_panel` eligibility fragment, assembles all four sibling outputs, and validates the resulting tile/world through the pinned MorphTile runtime.

This test-time checkout is evidence only; none of the sibling repositories or MorphTile core become runtime dependencies of Assembly.

## Run

```text
npm test
```

Node 18 or later; zero third-party runtime dependencies; no secrets or network required for the machine's runtime path.

## Truth boundary

- IMPLEMENTED: deterministic tile/facet/capability folding, fail-closed upstream-envelope handling, request/input closure collection, source provenance, upstream-warning preservation, canonical closure hashing, exact addressed `view.set` folding, and explicit schema gating.
- PINNED TEST HARNESS: four stable sibling machines plus MorphTile v0.4 are checked out at exact commits in CI and exercised together.
- EXPERIMENTAL: envelope v0.1, `world_requirements`, `source_provenance`, `held_candidates`, `closure_hash`, and candidate schemas in this repository.
- NOT CLAIMED: compatibility outside the pinned revisions, arbitrary operation composition, automatic `ui_panel` invention, visual quality, automatic canon, or merge authority.
- HELD: Interface Machine's newer multi-operation presentation bundle remains outside this proven contract until its lane is integrated/stable and Assembly gains matching evidence.

This is candidate machinery, not automatic canon and not evidence that MorphTile can autonomously manufacture MorphTile.
