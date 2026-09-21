# MorphTile kit materialization candidate

Assembly preserves candidate + dependency + world-requirement closure and binds that creation-side closure with `closure_hash`.

`src/kit.js` can materialize a successful Assembly result into a real `morphtile-kit` **only when a caller supplies an explicit MorphTile runtime**.

The adapter has no static MorphTile dependency. It discovers the runtime's actual kit format/version through the public `exportKit` contract and uses the runtime's own `createTile`, `validateTile`, `createWorld`, `exportKit`, `importKit`, `applyStructOp`, `hashOf` and `resolveTile` functions, plus `needsOf`/`grantsOf` when available for bounded closure proof.

## Fail-closed rules

- Only an Assembly `CANDIDATE` may be materialized.
- The supplied runtime must expose the public tile/kit functions used by the adapter.
- Arbitrary Assembly `dependencies` are **not** representable in the current MorphTile kit contract, so unresolved arbitrary dependency closure returns `HOLD_KIT_DEPENDENCY_UNREPRESENTABLE` rather than silently dropping it. Known local Interface proof dependencies may be discharged only when isolated staged MorphTile matter proves them exactly.
- Declared world words/definitions are preserved in the kit.
- Assembly detects direct and transitive MorphTile definition references before declaring its own candidate complete; runtime `needsOf` remains the authoritative materialization-time cross-check when available.
- The tile must pass the supplied runtime's `validateTile`.
- `kit.expect.sha256` is produced with the supplied runtime's own `hashOf({ tile, defs, words })` contract.
- A fresh-world `importKit` must return `READY`; partial/overwrite modes are never enabled automatically.
- `READY` is treated as an import plan, not receiver completion. The returned ordered import operations must be inspectable and every operation must execute successfully through `applyStructOp` against the isolated fresh receiver. Missing operation evidence returns `HOLD_KIT_RUNTIME_IMPORT_OPS_INVALID`; an operation rejection returns `HOLD_KIT_RUNTIME_APPLY_FAILED` with the exact operation index, operation and runtime error preserved.
- Returning successfully from every operation is still not enough. Assembly verifies the exact public postcondition of every supported READY import operation (`word.define`, `def.put`, root `tile.add`) against the isolated receiver. Missing, changed or unsupported postconditions return `HOLD_KIT_RUNTIME_RECEIVER_INCOMPLETE` with a deterministic receiver-closure receipt.

## Identity and provenance boundary

`closure_hash` and `morphtile-kit.expect.sha256` intentionally remain different receipts.

- `closure_hash` identifies the Assembly creation-side closure: candidate + dependencies + world requirements.
- `kit.expect.sha256` identifies the runtime-materialized portable payload: concrete tile + defs + words **before receiver import normalization**.
- the receiver-closure receipt identifies the exact READY operation plan and whether every operation's public postcondition is present after application.
- `required_definitions` is derived from the content and is therefore an inspectable requirement index, not another content identity.

The materialization result carries `source_closure_hash`, `source_provenance`, and `source_warnings` on both success and HOLD paths. These keep the creation history inspectable across format conversion without injecting Assembly-specific transport history into MorphTile's portable content hash.

Changing provenance or warnings alone must not change `kit.expect.sha256`. Changing tile/definition/word content must.

Assembly deliberately verifies receiver closure against the READY plan rather than comparing the post-import world byte-for-byte with the pre-import kit. MorphTile's public import operations may normalize portable matter while installing it. Transport identity and installed receiver identity therefore remain separate evidence layers rather than being silently conflated.

## Evidence target

CI currently pins MorphTile core:

`2bdf8eade1376055473b9cc1b11734b72a5566e5`

The integration suite proves that runtime:

1. validates the materialized tile;
2. computes the same kit SHA-256 as the adapter;
3. can plan the generated kit as `READY` in a fresh world with verified payload evidence;
4. executes every planned import operation against that isolated receiver before Assembly returns a materialization `CANDIDATE`;
5. fails closed with exact operation evidence when a `READY` plan contains matter the receiver rejects during application;
6. fails closed when operations return successfully but install none or only part of the READY plan;
7. proves the installed word/definition/tile postconditions against the receiver-normalized READY plan before emitting `KIT_RECEIVER_CLOSURE` PASS evidence;
8. rejects semantic tampering with `HOLD_HASH_MISMATCH`;
9. preserves Assembly source provenance/warnings as sidecars without changing portable kit identity;
10. carries explicitly supplied Form definitions and portable words through Assembly closure into receiver application.

This does not claim compatibility beyond the exact pinned revisions, external dependency transport, visual correctness, automatic canon, or merge authority.
