# MorphTile kit materialization candidate

Assembly preserves candidate + dependency + world-requirement closure and binds that creation-side closure with `closure_hash`.

`src/kit.js` can materialize a successful Assembly result into a real `morphtile-kit` **only when a caller supplies an explicit MorphTile runtime**.

The adapter has no static MorphTile dependency. It discovers the runtime's actual kit format/version through the public `exportKit` contract and uses the runtime's own `createTile`, `validateTile`, `hashOf` and `importKit` functions.

## Fail-closed rules

- Only an Assembly `CANDIDATE` may be materialized.
- The supplied runtime must expose the public tile/kit functions used by the adapter.
- Arbitrary Assembly `dependencies` are **not** representable in the current MorphTile kit contract, so any non-empty dependency closure returns `HOLD_KIT_DEPENDENCY_UNREPRESENTABLE` rather than silently dropping it.
- Declared world words/definitions are preserved in the kit.
- Assembly now detects direct and transitive MorphTile definition references before declaring its own candidate complete; runtime `needsOf` remains the authoritative materialization-time cross-check when available.
- The tile must pass the supplied runtime's `validateTile`.
- `kit.expect.sha256` is produced with the supplied runtime's own `hashOf({ tile, defs, words })` contract.
- A fresh-world `importKit` must return `READY`; partial/overwrite modes are never enabled automatically.

## Identity and provenance boundary

`closure_hash` and `morphtile-kit.expect.sha256` intentionally remain different receipts.

- `closure_hash` identifies the Assembly creation-side closure: candidate + dependencies + world requirements.
- `kit.expect.sha256` identifies the runtime-materialized portable payload: concrete tile + defs + words.
- `required_definitions` is derived from the content and is therefore an inspectable requirement index, not a third content identity.

The materialization result carries `source_closure_hash`, `source_provenance`, and `source_warnings` on both success and HOLD paths. These keep the creation history inspectable across format conversion without injecting Assembly-specific transport history into MorphTile's portable content hash.

Changing provenance or warnings alone must not change `kit.expect.sha256`. Changing tile/definition/word content must.

## Evidence target

CI currently pins the converged MorphTile v0.4 core:

`b6b086edb70fd4657495fcf01cb9fcdedceafdaf`

The integration suite proves that runtime:

1. validates the materialized tile;
2. computes the same kit SHA-256 as the adapter;
3. accepts the generated kit as `READY` in a fresh world with verified payload evidence;
4. rejects semantic tampering with `HOLD_HASH_MISMATCH`;
5. preserves Assembly source provenance/warnings as sidecars without changing portable kit identity;
6. carries an explicitly supplied Form definition through Assembly closure into verified kit import.

This does not claim compatibility beyond the exact pinned revisions, external dependency transport, visual correctness, automatic canon, or merge authority.
