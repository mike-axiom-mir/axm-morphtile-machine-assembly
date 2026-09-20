# MorphTile Assembly Machine

Combines compatible machine candidates into one MorphTile tile candidate while preserving dependency closure, world requirements, source provenance, and unresolved conflicts as explicit HOLDs.

## Boundary answers

1. **What it does:** Combines compatible tile/facet/capability candidates and preserves their assembly-side closure data.
2. **What it does not own:** Silent conflict overwrite, canonical merge, automatic application of world words/definitions, operation-bundle execution, aesthetic acceptance, or producer internals.
3. **What it accepts:** `axm.morphtile.assembly-request/v0.1` containing inspectable candidate packets.
4. **What it produces:** A `morphtile.tile-spec/v0.4` candidate plus dependency, world-requirement, source-provenance, closure-hash, evidence, warning and HOLD fields in the provisional envelope.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and normal authority path. MorphTile does not depend on this repository.
6. **Evidence:** deterministic compatible union, canonical object comparison, input non-mutation, dependency conflict detection, word/definition conflict detection, provenance preservation, unsupported-schema HOLD tests, and canonical closure-hash tests.
7. **When it cannot satisfy a request:** empty input returns `HOLD_NO_CANDIDATES`; incompatible paths return `HOLD_ASSEMBLY_CONFLICT`; same-identity dependency drift returns `HOLD_DEPENDENCY_CONFLICT`; conflicting words/definitions return typed HOLDs; explicit candidate schemas that cannot safely fold into a tile spec return `HOLD_UNASSEMBLABLE_CANDIDATE_SCHEMA`.

## v0.2 closure rule

Assembly treats a machine output as more than its `candidate` field.

For every input packet it preserves:

- declared dependencies;
- optional `world_requirements.words`;
- optional `world_requirements.definitions`;
- source machine/request/provenance metadata.

Exact duplicate dependencies are deduplicated deterministically. If two records identify the same dependency but disagree on content, Assembly HOLDS instead of choosing one. Words and definitions follow the same rule by name/id.

World requirements are preserved as sidecar requirements only. Assembly does not apply `word.define` or `def.put` by itself.

## Closure hash

A successful candidate now carries `closure_hash` with:

- `algorithm: sha256`;
- `canonicalization: sorted-key-json/v1`;
- `scope: candidate+dependencies+world_requirements`;
- the 64-character digest in `value`.

The hash binds the assembled candidate plus the dependency and world-requirement closure. Object key insertion order does not affect the digest. A real content mutation does.

`source_provenance`, evidence, warnings, request ids and caller annotations are deliberately outside this content identity. They remain inspectable metadata but do not make semantically identical assembled matter hash differently merely because it travelled through another source path.

This is an Assembly Machine content receipt, **not** a claim that the candidate is already a canonical `morphtile-kit` or that MorphTile has imported it.

## Candidate schema boundary

The tile-folding path currently accepts explicit:

- `morphtile.tile-spec/v0.4`;
- `morphtile.facet-candidate/v0.4`;
- `morphtile.capability-candidate/v0.4`.

Other explicit schemas HOLD. This matters for Interface Machine `morphtile.interface-operations/v0.4`: silently dropping those operations would be false assembly, so the bundle remains held until an operation-aware assembly contract is grounded and tested.

Schema-less legacy fragments remain accepted for the existing foundation path but are labeled `LEGACY_SCHEMALESS_FRAGMENT`.

## Run

    npm test

Node 18 or later; zero third-party runtime dependencies; no secrets or network required. The closure hash uses Node's built-in `node:crypto` SHA-256 implementation.

## Truth boundary

- IMPLEMENTED: deterministic tile/facet/capability folding, closure collection, conflict HOLDs, source-provenance sidecar, canonical closure hashing, and explicit candidate-schema gating.
- TESTED LOCALLY: 9/9 Node tests on the exact candidate contents before push.
- SOURCE-INSPECTED: MorphTile core already uses sorted-key canonical JSON for hashing and hashes kit content from tile/defs/words rather than provenance metadata; Verification Machine independently repaired its candidate receipt hashing to the same sorted-key principle.
- EXPERIMENTAL: envelope v0.1, `world_requirements`, `source_provenance`, `closure_hash`, and every candidate schema in this foundation.
- RUNTIME COMPATIBILITY TARGET REMAINS: MorphTile commit `13d83a2b2c0d12644442d3d9e45bcbe0af19876a`; this pass did not promote source inspection of newer core into runtime compatibility evidence.
- HELD: no application of world requirements into a real MorphTile workspace, no safe composition of interface operation bundles, no MorphTile-compatible kit export/import proof, and no visual proof.

This is candidate machinery, not automatic canon and not evidence that MorphTile can autonomously manufacture MorphTile.
