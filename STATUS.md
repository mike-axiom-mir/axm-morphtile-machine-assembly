# Status

- Foundation version: 0.5.1 candidate
- State: CANDIDATE — EXACT-HEAD CI REQUIRED
- Local/CI test command: `npm test`
- MorphTile runtime target: v0.4 at `a579182ae585e5722ac87dd0cc8209963b18d000`
- Envelope: provisional v0.1
- Visual proof: none

## Implemented on current main before this candidate

- Deterministic compatible tile/facet/capability union.
- Canonical object comparison so object key order does not create false conflicts.
- Dependency closure from the assembly request plus machine input packets.
- Same-identity dependency conflicts HOLD instead of selecting a winner, preserving both variants and sources.
- `world_requirements.words` and `world_requirements.definitions` are preserved as sidecars.
- Input machine/request/provenance metadata is preserved in `source_provenance`.
- Unsupported explicit candidate schemas HOLD instead of being silently discarded.
- Successful candidates carry canonical SHA-256 `closure_hash` over candidate + dependencies + world requirements.
- Stable Interface `view.set` and the exact current `view.set + presentation.set` operation bundle can be folded only onto an explicitly matching tile with caller-owned `ui_panel` eligibility.
- Successful closure-preserving candidates can be materialized through an explicitly supplied MorphTile runtime into a real `morphtile-kit`, with runtime validation, MorphTile-owned kit hashing, and fresh-world verified import.
- Arbitrary dependency records that MorphTile kits cannot represent still HOLD rather than being dropped.

## Added in this candidate

- Generic candidate conflicts now preserve the exact competing values and their input sources in `HOLD_ASSEMBLY_CONFLICT`, not only the conflicting path.
- Word and definition conflicts now preserve both meanings plus both source lanes, matching the already lossless dependency-conflict pattern.
- First-seen values remain deterministic in the held closure, but rejected alternatives remain inspectable; a HOLD never pretends one variant won.
- Added exact regressions for candidate, word, and definition conflict evidence.

## Placement decision

These rules belong in Assembly Machine, not MorphTile core. MorphTile owns representation/runtime contracts; Assembly owns combining machine outputs and must preserve enough evidence to explain why incompatible matter could not be combined.

## HELD / open

- No auto-resolution or priority policy for incompatible candidate, word, definition, or dependency variants.
- No arbitrary Interface operation composition beyond explicitly proven contracts.
- No invented `ui_panel` eligibility or target identity.
- No transport of arbitrary dependency records through the current MorphTile kit format.
- No compatibility claim beyond exact pinned sibling/core revisions exercised by CI.
- No visual-quality proof, automatic CANON, or merge authority.

Current sibling candidate lanes such as Form definition reuse, ordered Interface bodies, widened Capability wake vocabulary, and Surface repair remain external until integrated/re-proved; Assembly does not consume unmerged sibling work as if canonical.
