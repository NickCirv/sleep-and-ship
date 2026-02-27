![Banner](banner.svg)

# sleep-and-ship

> Queue tasks at night. Wake up to deployed features.

[![npm version](https://img.shields.io/npm/v/sleep-and-ship?color=%23818CF8&label=npm)](https://www.npmjs.com/package/sleep-and-ship)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/NickCirv/sleep-and-ship?style=flat)](https://github.com/NickCirv/sleep-and-ship/stargazers)

## The Problem

You have 10 tasks to build but only 8 hours of sleep to waste. You sit down at midnight to bang out "just one more feature" and wake up face-down on your keyboard with a half-finished PR and a cold coffee. What if Claude could work the night shift? Queue your tasks, go to bed, wake up to branches with working code.

## Quick Start

```bash
export ANTHROPIC_API_KEY=sk-ant-...

# Queue tasks before bed
npx sleep-and-ship add "Add dark mode to the dashboard" --repo ./my-project
npx sleep-and-ship add "Fix the pagination bug on /users" --repo ./my-project
npx sleep-and-ship add "Add CSV export to the reports page" --repo ./my-project

# Install the overnight cron (runs at 2 AM automatically)
npx sleep-and-ship install-cron

# Check the queue before you sleep
npx sleep-and-ship list

# Wake up and read the report
npx sleep-and-ship report
```

## Example Output

```
╭──────────────────────────────────────────────╮
│         SLEEP & SHIP — Morning Report        │
├──────────────────────────────────────────────┤
│  Ran at:       2/27/2026, 2:01:03 AM         │
│  Tasks ran:    5                             │
│  Completed:    4 ✓                           │
│  Failed:       1 ✗                           │
├──────────────────────────────────────────────┤
│  ✓ Add dark mode to the dashboard            │
│    → sleep-and-ship/task-1740614400000       │
│  ✓ Fix the pagination bug on /users          │
│    → sleep-and-ship/task-1740614401000       │
│  ✓ Add CSV export to the reports page        │
│    → sleep-and-ship/task-1740614402000       │
│  ✓ Update API docs                           │
│    → sleep-and-ship/task-1740614403000       │
│  ✗ Implement WebSocket notifications         │
│    → Error: Missing ws dependency            │
╰──────────────────────────────────────────────╯
```

## Features

- **Natural language task queuing** — describe what you want in plain English
- **Isolated branches** — every task runs on its own branch, `main` is never touched
- **Test-gated commits** — tasks only commit if `npm test` or `pytest` passes
- **2 AM cron** — installs a crontab entry, runs while you sleep
- **Morning report** — clean summary of what shipped and what failed
- **Safe by default** — you still review and merge, nothing auto-deploys

## How It Works

1. Queue tasks with natural language descriptions before bed
2. At 2 AM, Claude Code processes each task on a separate git branch
3. Tests run automatically — passing tasks get committed, failing ones are logged
4. Wake up to a morning report of what shipped overnight

## Requirements

- Node.js 18+
- Claude Code CLI installed: `npm install -g @anthropic-ai/claude-code`
- `ANTHROPIC_API_KEY` environment variable set
- Git initialized in target repos

**Commands**

| Command | Description |
|---|---|
| `add <task> --repo <path>` | Queue a task for tonight |
| `list` | Show pending tasks |
| `list --all` | Show all tasks including completed |
| `run` | Execute the queue manually |
| `report` | Show last night's results |
| `install-cron` | Add the 2 AM crontab entry |

Tasks stored at `~/.sleep-and-ship/queue.json`. Logs at `~/.sleep-and-ship/log.txt`.

## See Also

- [one-prompt-saas](https://github.com/NickCirv/one-prompt-saas) — Full SaaS app from a single prompt
- [zero-to-prod](https://github.com/NickCirv/zero-to-prod) — Go from idea to deployed in minutes
- [fix-it-felix](https://github.com/NickCirv/fix-it-felix) — Self-healing CI that auto-fixes failed builds
- [100x-dev](https://github.com/NickCirv/100x-dev) — AI-powered developer productivity toolkit

## License

MIT — [NickCirv](https://github.com/NickCirv)
