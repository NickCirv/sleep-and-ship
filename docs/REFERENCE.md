# Command reference

Use `node bin/sas.js` from the pinned source checkout described in the [README](../README.md). The entries below describe the inspected implementation.

| Command or argument | Behavior |
| --- | --- |
| `add TASK [-r PATH]` | Append a task to the local queue; --repo PATH selects its repository instead of cwd. |
| `list` | List pending tasks. |
| `list --all` | Include completed and failed tasks. |
| `run` | Process queued tasks through Claude Code, run detected checks and attempt local Git commits. |
| `report` | Print the overnight execution report. |
| `install-cron` | Install the tool's scheduled cron invocation. |
| `Claude invocation` | Uses --dangerously-skip-permissions; review the README's execution and dirty-worktree limitations before run. |

For prerequisites, file writes, external services and known limitations, see [Behavior and limits](../README.md#behavior-and-limits).

Implementation: [src/queue.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/queue.js), [src/index.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/index.js), [src/runner.js](https://github.com/NickCirv/sleep-and-ship/blob/79bf0d4ab5ef572b283e6b82168b360729df2c98/src/runner.js); [review evidence](RESEARCH.md).
