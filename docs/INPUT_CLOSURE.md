# Upstream input and closure boundary

Assembly receives outputs from independent machines. Those outputs are not trustworthy merely because they arrived in `inputs`.

## Envelope state

A machine envelope that declares `status` participates in assembly only when it is exactly `CANDIDATE` and carries an object `candidate`.

- upstream `HOLD`, `FAIL`, `BLOCKED`, or any other non-candidate status becomes `HOLD_INPUT_NOT_CANDIDATE`;
- the upstream HOLD details are preserved in the Assembly HOLD;
- a malformed `CANDIDATE` envelope without a candidate object becomes `HOLD_INPUT_CANDIDATE_MISSING`;
- bare legacy candidate fragments remain accepted for backward compatibility.

Assembly never upgrades an upstream HOLD into a successful candidate merely because other inputs were compatible.

## Unsupported candidate schemas

A syntactically present candidate with an unsupported schema is not discarded. Assembly:

1. returns `HOLD_UNASSEMBLABLE_CANDIDATE_SCHEMA` with the exact input index and schema;
2. preserves the candidate body in `held_candidates`;
3. does not fold the unsupported candidate into the tile spec.

This is particularly important for Interface Machine operation candidates. Operations and tile matter have different semantics and must not be flattened together until a proven assembly contract exists.

## Closure sources

Dependency closure already includes request-level and input-level dependencies.

World requirements now follow the same rule: words and definitions declared at either the Assembly request level or any input level participate in conflict detection and in the deterministic closure hash.

If the same named word/definition has different meaning across sources, Assembly returns an explicit HOLD rather than selecting one.

## Reusable rule

**Assembly may combine only inputs that are explicitly eligible to become matter. It must carry unresolved upstream state and unsupported meaning forward as evidence, never reinterpret absence as success.**
