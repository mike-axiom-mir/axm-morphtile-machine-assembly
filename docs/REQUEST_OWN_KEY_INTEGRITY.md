# Assembly request own-key integrity

Status: candidate on PR #27; not merged and not CANON.

Baseline Assembly main: `92eaf40c2f458687a6a9ba6361cc0ec3ff540d0b`.

## Gap

Assembly's portable-data preflight already rejected Proxy/accessor/non-portable values and wrong semantic container shapes. However, the provisional v0.1 request grammar did not account for every caller-authored own key before later Assembly logic selected the fields it understood. An unknown enumerable top-level request field or unknown `request.intent` field could therefore survive portable cloning and then disappear semantically as if it had never been authored.

That is a source-integrity failure: authored presence must not silently become omission merely because this machine does not understand the field.

## Candidate rule

The request boundary now applies these deterministic rules after the existing Proxy gate and before authored data is interpreted:

- request must be an authored plain object;
- exact v0.1 root fields are `envelope_version`, `request_id`, `goal`, `intent`, `inputs`, `dependencies`, `world_requirements`, and `provenance`;
- when present and non-null, `request.intent` must be an authored plain map;
- exact v0.1 intent fields are `id`, `name`, and `tile_path`;
- unsupported own string fields HOLD with the exact authored path;
- symbol-keyed request/intent data HOLD rather than being dropped by portable transport;
- the existing Proxy rejection remains before own-key reflection;
- optional `intent: null` retains the existing omitted-intent meaning.

The repair does not infer future semantics, invent an extension mechanism, change candidate schemas, choose conflict winners, widen MorphTile vocabulary, or grant merge/CANON authority.

## Evidence

Regression-first head `d15a9e97e7ab59d4178871f06a4d4c8b9391fc9a` produced failing Actions run `35557446593`; setup/checkouts passed and `npm test` failed on the new own-key regressions before the repair.

Functional repair head `937b32697ab97a8be8b7fe28185db8bb92ace111` passed PR-triggered Actions run `35557488478`, including `npm test`.

Because this documentation commit moves the candidate head, exact final-head CI must pass before the PR is presented as technically green.

## Placement

Assembly Machine. MorphTile core already provides the universal tile/world/runtime substrate needed by Assembly; the defect is how this producer establishes its own request grammar and source-integrity boundary. No MorphTile-core candidate is justified.

## Reusable rule

**An exact machine request grammar must account for every caller-owned own key before selecting fields it understands. Unknown authored presence is not omission. Proxy rejection must stay before reflection, and unsupported future meaning must HOLD rather than be silently discarded.**

## Remaining HOLD

Independent Verification must replay the exact final PR #27 head before Creation Director integration. No self-merge is authorized from this specialist lane.
