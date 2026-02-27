import fs from 'fs-extra'
import chalk from 'chalk'
import { RUN_LOG } from './runner.js'

function pad(str, width) {
  const s = String(str)
  return s + ' '.repeat(Math.max(0, width - s.length))
}

function truncate(str, max) {
  if (str.length <= max) return str
  return str.slice(0, max - 1) + '…'
}

export async function printReport() {
  const exists = await fs.pathExists(RUN_LOG)

  if (!exists) {
    console.log(chalk.yellow('No run log found. Have you run `sleep-and-ship run` yet?'))
    return
  }

  const data = await fs.readJson(RUN_LOG)
  const { ranAt, ran, completed, failed, results } = data

  const ranDate = new Date(ranAt).toLocaleString()
  const INNER_WIDTH = 42
  const BORDER = '─'.repeat(INNER_WIDTH)

  const line = (content = '') => {
    const padded = pad(content, INNER_WIDTH)
    console.log(`│ ${padded} │`)
  }

  console.log()
  console.log(chalk.cyan(`╭${BORDER}╮`))

  const title = 'SLEEP & SHIP — Morning Report'
  const titlePad = Math.floor((INNER_WIDTH - title.length - 2) / 2)
  console.log(
    chalk.cyan('│') +
      ' '.repeat(titlePad + 1) +
      chalk.bold.white(title) +
      ' '.repeat(INNER_WIDTH - titlePad - title.length - 1) +
      chalk.cyan('│')
  )

  console.log(chalk.cyan(`├${BORDER}┤`))
  line(`  Ran at:       ${ranDate}`)
  line(`  Tasks ran:    ${ran}`)
  line(`  Completed:    ${completed} ${chalk.green('✓')}`)
  line(`  Failed:       ${failed} ${failed > 0 ? chalk.red('✗') : ''}`)
  console.log(chalk.cyan(`├${BORDER}┤`))

  for (const r of results) {
    const icon = r.status === 'completed' ? chalk.green('✓') : chalk.red('✗')
    const label = truncate(r.task, INNER_WIDTH - 4)

    if (r.status === 'completed') {
      console.log(
        chalk.cyan('│') + '  ' + icon + ' ' + chalk.white(pad(label, INNER_WIDTH - 4)) + chalk.cyan('│')
      )
      const branchLabel = `    → ${r.branch}`
      console.log(
        chalk.cyan('│') + chalk.dim(pad(branchLabel, INNER_WIDTH + 2)) + chalk.cyan('│')
      )
    } else {
      console.log(
        chalk.cyan('│') + '  ' + icon + ' ' + chalk.dim(pad(label, INNER_WIDTH - 4)) + chalk.cyan('│')
      )
      const errStep = r.steps?.find((s) => !s.success)
      if (errStep) {
        const errLabel = `    → Error: ${truncate(errStep.output?.split('\n')[0] || 'Unknown', INNER_WIDTH - 14)}`
        console.log(
          chalk.cyan('│') + chalk.red(pad(errLabel, INNER_WIDTH + 2)) + chalk.cyan('│')
        )
      }
    }
  }

  if (results.length === 0) {
    line('  No tasks ran.')
  }

  console.log(chalk.cyan(`╰${BORDER}╯`))
  console.log()
}
