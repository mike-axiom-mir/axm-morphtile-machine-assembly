# Architecture

`src/index.js` reads explicit packets, clones accepted data, and never imports or writes sibling repositories.

Assembly v0.2 separates two responsibilities:

1. **candidate folding** — combine compatible tile/facet/capability matter into one `morphtile.tile-spec/v0.4` candidate;
2. **closure preservation** — carry dependencies, world word/definition requirements, and source provenance alongside the candidate without applying them automatically.

Conflicts are deterministic HOLDs. Candidate equality uses canonical structural comparison rather than object insertion order. Dependencies are deduplicated only when they have the same identity and the same complete content; same identity with different content HOLDS. World words and definitions use the same no-overwrite rule by name/id.

`world_requirements` is sidecar data, not world mutation. Assembly does not issue `word.define`, `def.put`, or any canonical MorphTile change. A receiving project must explicitly validate and apply those operations through its normal authority path.

Explicit candidate schemas outside the current tile-folding set HOLD. This prevents operation-oriented outputs such as Interface Machine bundles from disappearing inside a superficially successful tile assembly.

Dependency direction is one-way: this machine may consume MorphTile's public contract; MorphTile core must never import this machine. Candidate output is data, not canon. There is no shared protocol package in this pass: the local envelope copy may only be extracted after multiple real machines prove a stable common contract.

Repository isolation rules: no sibling imports, no sibling writes, no shared mutable state, no assumed installed machines, and no cloud dependency for the tested path.
