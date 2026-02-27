import { execFileSync, spawnSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { getTasks, updateTask } from './queue.js'

const LOG_DIR = path.join(os.homedir(), '.sleep-and-ship')
const RUN_LOG = path.join(LOG_DIR, 'last-run.json')

function safeExec(file, args, cwd, timeout = 300_000) {
  try {
    const output = execFileSync(file, args, {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout,
    })
    return { success: true, output }
  } catch (err) {
    return {
      success: false,
      output: err.message,
      stderr: typeof err.stderr === 'string' ? err.stderr : '',
    }
  }
}

function branchName(id) {
  return `sleep-and-ship/task-${id}`
}

function runClaude(task, repoPath) {
  const prompt = [
    `You are an expert software engineer working in the repository at: ${repoPath}`,
    ``,
    `Your task:`,
    `${task}`,
    ``,
    `Instructions:`,
    `- Make the minimal correct change to complete the task`,
    `- Follow the existing code style and conventions`,
    `- Do not add console.log statements`,
    `- Do not modify unrelated files`,
    `- Do not create documentation unless specifically asked`,
  ].join('\n')

  const result = spawnSync(
    'claude',
    ['--dangerously-skip-permissions', '-p', prompt],
    {
      cwd: repoPath,
      encoding: 'utf8',
      timeout: 300_000,
      env: { ...process.env },
    }
  )

  if (result.status !== 0) {
    return {
      success: false,
      output: result.stderr || result.stdout || 'Claude exited with non-zero status',
    }
  }

  return { success: true, output: result.stdout }
}

function detectTestRunner(repoPath) {
  const hasPkg = fs.pathExistsSync(path.join(repoPath, 'package.json'))
  if (hasPkg) {
    const pkg = fs.readJsonSync(path.join(repoPath, 'package.json'), { throws: false })
    if (pkg?.scripts?.test && !pkg.scripts.test.includes('no test specified')) {
      return { file: 'npm', args: ['test'] }
    }
  }

  const hasPytest =
    fs.pathExistsSync(path.join(repoPath, 'pytest.ini')) ||
    fs.pathExistsSync(path.join(repoPath, 'pyproject.toml')) ||
    fs.pathExistsSync(path.join(repoPath, 'setup.py'))

  if (hasPytest) {
    return { file: 'pytest', args: ['--tb=short', '-q'] }
  }

  return null
}

function runTests(repoPath) {
  const runner = detectTestRunner(repoPath)
  if (!runner) {
    return { success: true, output: 'No test suite detected — skipping' }
  }
  return safeExec(runner.file, runner.args, repoPath)
}

export async function runQueue() {
  const pending = await getTasks('pending')
  const results = []

  if (pending.length === 0) {
    return { ran: 0, completed: 0, failed: 0, results }
  }

  for (const task of pending) {
    const { id, task: description, repo } = task
    const branch = branchName(id)
    const taskResult = { id, task: description, repo, branch, steps: [] }

    const repoExists = await fs.pathExists(repo)
    if (!repoExists) {
      const errMsg = `Repo path not found: ${repo}`
      taskResult.steps.push({ step: 'repo-check', success: false, output: errMsg })
      await updateTask(id, 'failed', errMsg)
      results.push({ ...taskResult, status: 'failed' })
      continue
    }

    const branchResult = safeExec('git', ['checkout', '-b', branch], repo)
    taskResult.steps.push({ step: 'create-branch', ...branchResult })

    if (!branchResult.success) {
      await updateTask(id, 'failed', branchResult.output)
      results.push({ ...taskResult, status: 'failed' })
      safeExec('git', ['checkout', '-'], repo)
      continue
    }

    const claudeResult = runClaude(description, repo)
    taskResult.steps.push({ step: 'claude', ...claudeResult })

    if (!claudeResult.success) {
      await updateTask(id, 'failed', claudeResult.output)
      results.push({ ...taskResult, status: 'failed' })
      safeExec('git', ['checkout', '-'], repo)
      safeExec('git', ['branch', '-D', branch], repo)
      continue
    }

    const testResult = runTests(repo)
    taskResult.steps.push({ step: 'tests', ...testResult })

    if (!testResult.success) {
      const errMsg = `Tests failed: ${testResult.output}`
      await updateTask(id, 'failed', errMsg)
      results.push({ ...taskResult, status: 'failed' })
      safeExec('git', ['checkout', '-'], repo)
      safeExec('git', ['branch', '-D', branch], repo)
      continue
    }

    const summary = description.slice(0, 72)
    safeExec('git', ['add', '-A'], repo)
    const commitResult = safeExec(
      'git',
      ['commit', '-m', `feat: ${summary}`, '--no-verify'],
      repo
    )
    taskResult.steps.push({ step: 'commit', ...commitResult })

    if (!commitResult.success) {
      const errMsg = `Commit failed: ${commitResult.output}`
      await updateTask(id, 'failed', errMsg)
      results.push({ ...taskResult, status: 'failed' })
      continue
    }

    await updateTask(id, 'completed', `Branch: ${branch}`)
    results.push({ ...taskResult, status: 'completed' })
  }

  const runSummary = {
    ranAt: new Date().toISOString(),
    ran: results.length,
    completed: results.filter((r) => r.status === 'completed').length,
    failed: results.filter((r) => r.status === 'failed').length,
    results,
  }

  await fs.ensureDir(LOG_DIR)
  await fs.writeJson(RUN_LOG, runSummary, { spaces: 2 })

  return runSummary
}

export { RUN_LOG }
