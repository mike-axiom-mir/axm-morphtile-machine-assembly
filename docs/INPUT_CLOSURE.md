# Upstream input and closure boundary

Assembly receives outputs from independent machines. Those outputs are not trustworthy merely because they arrived in `inputs`.

## Envelope state

A machine envelope that declares `status` participates in assembly only when it is exactly `CANDIDATE` and carries an object `candidate`.

- upstream `HOLD`, `FAIL`, `BLOCKED`, or any other non-candidate status becomes `HOLD_INPUT_NOT_CANDIDATE`;
- the upstream HOLD details are preserved in the Assembly HOLD;
- a malformed `CANDIDATE` envelope without a candidate object becomes `HOLD_INPUT_CANDIDATE_MISSING`;
- bare legacy candidate fragments remain accepted for backward compatibility.

Assembly never upgrades an upstream HOLD into a successful candidate merely because other inputs were compatible.

## Source identity integrity

Source trace preservation and source-envelope identity validity are separate contracts.

For backward compatibility, a status-bearing input may omit `request_id`, `machine`, or both. Assembly does not fabricate the missing identity: absent source fields remain absent and are represented as `null` in `source_provenance`.

When a source identity field is authored on a status-bearing input, that field must satisfy its own semantic shape before Assembly treats it as machine-envelope identity:

- authored `request_id` must be a non-empty string, otherwise Assembly returns `HOLD_INPUT_REQUEST_ID_INVALID` at the exact source path;
- authored `machine` must be a plain map whose own `id` and `version` fields are non-empty strings, otherwise Assembly returns `HOLD_INPUT_MACHINE_INVALID` at the exact source path;
- Proxy/accessor and other non-portable authored values remain under the existing portability HOLD boundary rather than being executed or silently normalized.

Status-less legacy fragments keep their legacy candidate semantics. Portable metadata on those fragments may still be preserved in the source trace by authored presence, but preservation alone does not promote that metadata into validated machine-envelope authority.

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

**Assembly may combine only inputs that are explicitly eligible to become matter. It must carry unresolved upstream state and unsupported meaning forward as evidence, never reinterpret absence as success. Source-trace preservation does not grant source-envelope validity: absence may remain absence for compatibility, while authored identity must satisfy its own semantic contract before it is trusted as identity.**
