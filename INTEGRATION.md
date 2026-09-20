# MorphTile integration

Runtime-tested contract target remains:

- repository: mike-axiom-mir/axm-morphtile
- commit: `13d83a2b2c0d12644442d3d9e45bcbe0af19876a`
- format: v0.4
- provisional envelope: v0.1

The adapter emits candidate data only. The receiving caller must validate it against the applicable MorphTile runtime, propose it through the project's normal clone/plan/commit path, inspect conflicts and HOLDs, commit only with applicable authority, preserve the receipt, and retain rollback.

Assembly v0.2 preserves `world_requirements` sidecars for words and definitions. Current MorphTile main was source-inspected and already represents those as explicit world-level units (`word.define`, `def.put`) with independent diff/merge keys. This pass does **not** claim runtime proof for applying the sidecars against current main.

Assembly v0.2.1 adds a machine-side `closure_hash` over the candidate + dependencies + world requirements using sorted-key canonical JSON and SHA-256. This is a tamper/drift receipt for the creation-side closure only. It is deliberately not labeled or shaped as MorphTile's `morphtile-kit.expect.sha256`, because a tile spec is not yet the canonical tile object produced/imported by MorphTile.

The current Interface Machine candidate PR can emit `morphtile.interface-operations/v0.4`. That is an operation bundle, not tile matter. Assembly HOLDS such explicit unsupported schemas instead of silently losing their operations. A future operation-aware assembly path requires its own grounded contract and tests.

No compatibility is claimed with MorphTile commits other than the pinned runtime-tested target until their conformance tests are run.
