# MorphTile Assembly Machine

Combines compatible candidate fragments into one candidate tile spec while preserving conflicts as HOLDs.

## Boundary answers

1. **What it does:** Combines compatible candidate fragments into one candidate tile spec while preserving conflicts as HOLDs.
2. **What it does not own:** Silent conflict overwrite, canonical merge, aesthetic acceptance, or ownership of producer internals.
3. **What it accepts:** axm.morphtile.assembly-request/v0.1 containing inspectable candidates.
4. **What it produces:** A morphtile.tile-spec/v0.4 candidate and dependency/evidence fields.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and clone → plan → commit → receipt → rollback path. MorphTile does not depend on this repository.
6. **Evidence:** Deterministic union, input non-mutation, and conflict tests.
7. **When it cannot satisfy a request:** Conflicting paths return HOLD_ASSEMBLY_CONFLICT; empty input returns HOLD_NO_CANDIDATES.

## Run

    npm test

Node 18 or later; zero runtime dependencies; no secrets or network required.

## Truth boundary

- IMPLEMENTED: the tiny adapter and local envelope used by the fixtures.
- TESTED: the claims named by the local test files.
- EXPERIMENTAL: envelope v0.1 and every candidate schema in this foundation.
- NOT TESTED: compatibility beyond MorphTile commit 13d83a2b2c0d12644442d3d9e45bcbe0af19876a.
- HELD: No runtime MorphTile validation, kit hashing, provenance merge, or visual proof.

This is a foundation, not evidence that MorphTile can autonomously manufacture MorphTile.

