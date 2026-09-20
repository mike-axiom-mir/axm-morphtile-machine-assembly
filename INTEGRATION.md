# MorphTile integration

Current exact runtime target:

- repository: mike-axiom-mir/axm-morphtile
- commit: `ef2b3c6986aa1a333247feffc43a8443f17239d0`
- format: v0.4
- provisional envelope: v0.1

The adapter emits candidate data only. The receiving caller must validate it against the applicable MorphTile runtime, propose it through the project's normal clone/plan/commit path, inspect conflicts and HOLDs, commit only with applicable authority, preserve the receipt, and retain rollback.

Assembly preserves dependency closure, `world_requirements` words/definitions, source provenance and upstream warnings. Successful assembly content is bound by a creation-side `closure_hash` over candidate + dependencies + world requirements using sorted-key canonical JSON and SHA-256. That receipt is deliberately distinct from MorphTile's portable-kit `expect.sha256`, which is computed by MorphTile over the materialized tile + defs + words.

Assembly can materialize a successful closure-preserving candidate through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, validate the tile, compute MorphTile's own kit hash and require fresh-world `importKit` to return `READY`. Arbitrary dependency records remain a HOLD because the current portable kit contract has no representation for them; conversion never authorizes dropping closure.

## Interface transport compatibility

Merged Interface v0.4 remains pinned in CI at `260e45599c91cbcb0ec8a5a54153323e4e5d0c6a` and is exercised by the existing four-machine integration proof.

Assembly v0.6 additionally targets the exact reviewed Interface v0.5 candidate head `5dd11a33ed15a86f995fc47333c3822d94f5ec68`. Interface v0.5 changes creation-side nested relative layout but retains the same addressed MorphTile operation shapes:

- `morphtile.view-operation/v0.5` contains one `view.set`;
- `morphtile.interface-operations/v0.5` contains exactly one `view.set` plus one `presentation.set`.

Assembly treats the nested `row` / `group` tree as ordinary authored MorphTile `view` content. It does not flatten, reinterpret or take ownership of Interface layout semantics. The existing safety boundaries remain unchanged: explicit matching tile identity, caller-owned `ui_panel` eligibility, exact operation shape, presentation whitelist and conflict-safe merging. Unknown fields, extra operations and future schema versions HOLD.

The v0.5 integration proof uses the exact Interface candidate head rather than treating an open PR as merged CANON. Compatibility beyond the explicitly pinned versions is not inferred.
