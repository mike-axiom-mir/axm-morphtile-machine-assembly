# MorphTile kit materialization candidate

Assembly v0.2 already preserves candidate + dependency + world-requirement closure and binds that creation-side closure with `closure_hash`.

This candidate adds one narrower next step: `src/kit.js` can materialize a successful Assembly result into a real `morphtile-kit` **only when a caller supplies an explicit MorphTile runtime**.

The adapter has no static MorphTile dependency. It discovers the runtime's actual kit format/version through the public `exportKit` contract and uses the runtime's own `createTile`, `validateTile`, `hashOf` and `importKit` functions.

## Fail-closed rules

- Only an Assembly `CANDIDATE` may be materialized.
- The supplied runtime must expose the public tile/kit functions used by the adapter.
- Arbitrary Assembly `dependencies` are **not** representable in the current MorphTile kit contract, so any non-empty dependency closure returns `HOLD_KIT_DEPENDENCY_UNREPRESENTABLE` rather than silently dropping it.
- Declared world words/definitions are preserved in the kit.
- If the tile references a definition absent from the declared world requirements, materialization HOLDS when the runtime exposes `needsOf`.
- The tile must pass the supplied runtime's `validateTile`.
- `kit.expect.sha256` is produced with the supplied runtime's own `hashOf({ tile, defs, words })` contract.
- A fresh-world `importKit` must return `READY`; partial/overwrite modes are never enabled automatically.

## Identity boundary

`closure_hash` and `morphtile-kit.expect.sha256` intentionally remain different receipts.

- `closure_hash` identifies the Assembly creation-side closure: candidate + dependencies + world requirements.
- `kit.expect.sha256` identifies the runtime-materialized portable payload: concrete tile + defs + words.

The materialization result carries `source_closure_hash` so the two identities stay linked without pretending they are interchangeable.

## Evidence target

CI checks out the exact MorphTile commit already pinned by this machine:

`13d83a2b2c0d12644442d3d9e45bcbe0af19876a`

The integration test proves that runtime:

1. validates the materialized tile;
2. computes the same kit SHA-256 as the adapter;
3. accepts the generated kit as `READY` in a fresh world with verified payload evidence;
4. rejects semantic tampering with `HOLD_HASH_MISMATCH`.

This does not claim compatibility with newer MorphTile commits, external dependency transport, visual correctness, or automatic canon.
