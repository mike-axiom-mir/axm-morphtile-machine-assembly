# MorphTile integration

Runtime-tested contract target remains:

- repository: mike-axiom-mir/axm-morphtile
- commit: `13d83a2b2c0d12644442d3d9e45bcbe0af19876a`
- format: v0.4
- provisional envelope: v0.1

The adapter emits candidate data only. The receiving caller must validate it against the applicable MorphTile runtime, propose it through the project's normal clone/plan/commit path, inspect conflicts and HOLDs, commit only with applicable authority, preserve the receipt, and retain rollback.

Assembly v0.2 also preserves `world_requirements` sidecars for words and definitions. Current MorphTile main was source-inspected and already represents those as explicit world-level units (`word.define`, `def.put`) with independent diff/merge keys. This pass does **not** claim runtime proof for applying the new sidecars against current main.

The current Interface Machine candidate PR can emit `morphtile.interface-operations/v0.4`. That is an operation bundle, not tile matter. Assembly v0.2 HOLDS such explicit unsupported schemas instead of silently losing their operations. A future operation-kit assembly path requires its own grounded contract and tests.

No compatibility is claimed with MorphTile commits other than the pinned runtime-tested target until their conformance tests are run.
