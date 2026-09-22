# Source review — sleep-and-ship

## Revision and method

Inspected public commit: [`79bf0d4ab5ef572b283e6b82168b360729df2c98`](https://github.com/NickCirv/sleep-and-ship/commit/79bf0d4ab5ef572b283e6b82168b360729df2c98). Source tree: `2efb4d15d72bcf09183c299b3e0b315e80fe6fab`. Capture scope: all eligible text files; 10 of 10 eligible files.

This review read captured implementation and documentation. It did not install dependencies, execute project commands, call project APIs, check package publication or establish live CI status. Examples are source-derived, not captured execution transcripts.

## Claim ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| Queue storage | [src/queue.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/queue.js) | Verified in inspected source; execution unverified |
| Cron mutation and command routing | [src/index.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/index.js) | Verified in inspected source; execution unverified |
| Assistant invocation, branch handling, test fallback and commit behavior | [src/runner.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/runner.js) | Verified in inspected source; execution unverified |

## Findings and verification gaps

The runner invokes Claude with `--dangerously-skip-permissions` and inherits the environment. It mutates the supplied checkout, stages all changes and commits with `--no-verify`; there is no clean-worktree preflight or isolated worktree. No detected test suite is treated as success. Failures may leave edits behind, and successive tasks can build on the current task branch. The implementation does not deploy features or publish PRs. Restrict experiments to disposable, credential-free repositories until these execution gaps are addressed.

The captured smoke test only asks Node to syntax-check the entrypoint. It does not exercise behavior, integrations or failure paths. Neither that test nor installation was run in this review.

| Dimension | Result |
| --- | --- |
| Purpose and documented commands | Partially verified: static source inspection |
| Clean installation and examples | Unverified |
| Test suite and live CI | Unverified |
| Performance and security guarantees | Unverified |
| Publication | Local documentation only |

## Documentation inventory

- [README.md](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/README.md) — Rewritten; historic section anchors retained where practical.
- [LICENSE](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/LICENSE) — protected document preserved unchanged.

## Captured source inventory

- [LICENSE](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/LICENSE) — Git blob `481c289c06c96c07330f8c7dedd847c5c07ca384`.
- [README.md](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/README.md) — Git blob `a114990366b9c3c620c85458e425cdaeda473c93`.
- [package.json](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/package.json) — Git blob `89906c435179f061c9b58c848e767aef7ca6d6df`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/.github/workflows/ci.yml) — Git blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [bin/sas.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/bin/sas.js) — Git blob `73dc7bfbd293de1a27d6b7edae07dd23c6021fe4`.
- [src/index.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/index.js) — Git blob `b8f0d7a49b41a6d799bf57d08c9d3f1d4c3c058e`.
- [src/queue.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/queue.js) — Git blob `3142e93079e075668b7e60d758615a9a5fe10372`.
- [src/report.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/report.js) — Git blob `9d3ba6dad4b9c6ef078dd5d390344a25f1c4c206`.
- [src/runner.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/runner.js) — Git blob `91885aca2a76b41cc56d82ad3a1344228593e2fc`.
- [test/smoke.test.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/test/smoke.test.js) — Git blob `77132efde59038f1d23cc44d6c5bf4379b4dda7b`.

## Scope boundary

Capture excludes lockfiles, binary artwork, generated output, vendored dependencies and files above the acquisition size limit. The tree records their existence; no verification claim is made for omitted content. Protected documents and historical records are not replaced.

## Reference coverage

Added [command reference](REFERENCE.md) from the argument parser, command handlers and source-defined help at the pinned revision. README examples remain unexecuted.
