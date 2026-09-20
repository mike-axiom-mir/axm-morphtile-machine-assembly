# Interface target binding

MorphTile distinguishes a tile's local `id` from its canonical addressed path. Assembly preserves that distinction.

## Local identity

`request.intent.id` and any assembled `morphtile.tile-spec/v0.4` `id` remain one-segment local identities matching `[A-Za-z0-9_-]+`.

## Canonical target path

Interface `view.set` / `presentation.set` operations may target one or more path segments using the bounded MorphTile path grammar:

```text
[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*
```

A one-segment operation target continues to bind directly to the assembled local `id`.

A multi-segment operation target is accepted only when the Assembly request also supplies the exact same canonical path as `request.intent.tile_path`. The path's final segment must equal the assembled local `id`.

Assembly deliberately does **not** infer `mt_shell/mt_inner` merely from an assembled `id` of `mt_inner`. Different parent paths may legally contain the same local id, so leaf equality is not enough evidence of target identity.

## Result evidence

Successful and held results expose the resolved context as provisional `target_binding` metadata:

```json
{
  "id": "mt_inner",
  "path": "mt_shell/mt_inner"
}
```

`target_binding` is address/provenance context. It is intentionally outside Assembly's portable `closure_hash`, whose scope remains candidate + dependencies + world requirements. The same portable tile matter can therefore retain the same content identity while its source addressing context remains separately inspectable.

## Fail-closed cases

Assembly HOLDs instead of guessing when:

- a target path has leading/trailing `/`, empty segments, whitespace or traversal-like segments;
- a nested Interface target is supplied without `request.intent.tile_path`;
- the explicit Assembly path ends in a different local id;
- Interface operations in one bundle target different paths;
- the Interface target path differs from the explicitly bound Assembly path;
- a presentation anchor is not a valid bounded MorphTile tile path.

No path is normalized, shortened to its leaf, or rewritten to make composition pass.
