import { program } from 'commander'
import chalk from 'chalk'
import { execFileSync } from 'child_process'
import { addTask, getTasks, QUEUE_DIR } from './queue.js'
import { runQueue } from './runner.js'
import { printReport } from './report.js'

const CRON_ENTRY = `0 2 * * * npx sleep-and-ship run >> ~/.sleep-and-ship/log.txt 2>&1`

function statusIcon(status) {
  switch (status) {
    case 'pending':
      return chalk.yellow('⏳')
    case 'completed':
      return chalk.green('✓')
    case 'failed':
      return chalk.red('✗')
    default:
      return chalk.dim('?')
  }
}

export function run() {
  program
    .name('sleep-and-ship')
    .description('Queue tasks at night. Wake up to deployed features.')
    .version('1.0.0')

  program
    .command('add <task>')
    .description('Add a task to the overnight queue')
    .option('-r, --repo <path>', 'Path to the git repo (defaults to cwd)')
    .action(async (task, opts) => {
      try {
        const added = await addTask(task, opts.repo || process.cwd())
        console.log(chalk.green('Task added:'), chalk.white(`#${added.id}`))
        console.log(chalk.dim('  Task:'), task)
        console.log(chalk.dim('  Repo:'), added.repo)
        console.log(chalk.dim('  Queue:'), QUEUE_DIR)
      } catch (err) {
        console.error(chalk.red('Failed to add task:'), err.message)
        process.exit(1)
      }
    })

  program
    .command('list')
    .description('Show all queued tasks with their status')
    .option('--all', 'Show all tasks including completed and failed')
    .action(async (opts) => {
      try {
        const tasks = await getTasks(opts.all ? null : undefined)
        const visible = opts.all ? tasks : tasks.filter((t) => t.status === 'pending')

        if (visible.length === 0) {
          console.log(chalk.dim('No tasks in queue. Add one with `sleep-and-ship add "<task>"`'))
          return
        }

        console.log()
        console.log(chalk.bold.white('  Sleep & Ship Queue'))
        console.log(chalk.dim('  ─────────────────────────────────────'))

        for (const t of visible) {
          const icon = statusIcon(t.status)
          const added = new Date(t.added).toLocaleDateString()
          console.log(`  ${icon}  ${chalk.white(t.task)}`)
          console.log(chalk.dim(`       Repo: ${t.repo}  |  Added: ${added}`))
          if (t.result) {
            console.log(chalk.dim(`       Result: ${t.result}`))
          }
          console.log()
        }

        const pending = tasks.filter((t) => t.status === 'pending').length
        console.log(chalk.dim(`  ${pending} task(s) pending for tonight's run.`))
        console.log()
      } catch (err) {
        console.error(chalk.red('Failed to list tasks:'), err.message)
        process.exit(1)
      }
    })

  program
    .command('run')
    .description('Run all pending tasks (called by cron at 2 AM)')
    .action(async () => {
      try {
        console.log(chalk.cyan('sleep-and-ship starting run at'), new Date().toISOString())

        const summary = await runQueue()

        if (summary.ran === 0) {
          console.log(chalk.dim('No pending tasks. Queue is empty.'))
          return
        }

        console.log()
        console.log(chalk.bold('Run complete:'))
        console.log(chalk.green(`  Completed: ${summary.completed}`))
        if (summary.failed > 0) {
          console.log(chalk.red(`  Failed:    ${summary.failed}`))
        }
        console.log()
      } catch (err) {
        console.error(chalk.red('Runner error:'), err.message)
        process.exit(1)
      }
    })

  program
    .command('report')
    .description("Show last night's results")
    .action(async () => {
      try {
        await printReport()
      } catch (err) {
        console.error(chalk.red('Failed to generate report:'), err.message)
        process.exit(1)
      }
    })

  program
    .command('install-cron')
    .description('Install the 2 AM cron job')
    .action(() => {
      try {
        let current = ''
        try {
          current = execFileSync('crontab', ['-l'], { encoding: 'utf8' })
        } catch {
          current = ''
        }

        if (current.includes('sleep-and-ship run')) {
          console.log(chalk.yellow('Cron job already installed.'))
          console.log(chalk.dim(`  ${CRON_ENTRY}`))
          return
        }

        const newCron = (current.trimEnd() + '\n' + CRON_ENTRY + '\n').trimStart()
        const { status } = { status: 0, ...execCrontabWrite(newCron) }

        if (status === 0) {
          console.log(chalk.green('Cron installed.'))
          console.log(chalk.dim(`  ${CRON_ENTRY}`))
          console.log()
          console.log(chalk.dim('Tasks will run at 2 AM every night.'))
          console.log(chalk.dim('Logs: ~/.sleep-and-ship/log.txt'))
        }
      } catch (err) {
        console.error(chalk.red('Failed to install cron:'), err.message)
        process.exit(1)
      }
    })

  program.parse()
}

function execCrontabWrite(content) {
  try {
    execFileSync('crontab', ['-'], {
      input: content,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return { status: 0 }
  } catch (err) {
    throw new Error(`crontab write failed: ${err.message}`)
  }
}
