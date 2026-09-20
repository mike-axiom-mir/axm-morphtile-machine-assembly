# Status

- Foundation version: 0.2.1
- State: TESTED CANDIDATE — CI REQUIRED ON EXACT BRANCH HEAD
- Local tests: `npm test`
- Local exact-content result before push: 9/9 passed
- MorphTile runtime target remains: v0.4 at `13d83a2b2c0d12644442d3d9e45bcbe0af19876a`
- Envelope: provisional v0.1
- Visual proof: none

## Implemented and tested

- Deterministic compatible tile/facet/capability union.
- Canonical object comparison so object key order does not create false conflicts.
- Dependency closure from the assembly request plus machine input packets.
- Same-identity dependency conflicts HOLD instead of selecting a winner.
- `world_requirements.words` and `world_requirements.definitions` are preserved as sidecars and conflicting definitions HOLD.
- Input machine/request/provenance metadata is preserved in `source_provenance`.
- Unsupported explicit candidate schemas HOLD instead of being silently discarded.
- Successful candidates carry a canonical SHA-256 `closure_hash` over candidate + dependencies + world requirements.
- Closure hashing is invariant to object-key insertion order and changes on semantic closure mutation.
- Provenance-only changes do not alter content identity.
- Inputs remain unmutated.

## Placement decision

These rules belong in Assembly Machine, not MorphTile core. MorphTile already represents words and definitions as explicit world-level units, has its own merge/conflict machinery, and already has canonical hashing. The missing capability was creation-side closure preservation plus a content receipt for the closure being handed downstream.

## HELD / open

- No runtime application of `world_requirements` into MorphTile has been proved in this pass.
- No safe folding of Interface Machine operation bundles into a tile spec; those candidates still HOLD explicitly.
- `closure_hash` is not a MorphTile `morphtile-kit.expect.sha256`; no kit import/export compatibility is claimed.
- No visual proof.
- No compatibility claim beyond the pinned runtime target.

No claim of autonomous creation, production readiness, canon, or visual quality is made.
