import fs from 'fs-extra'
import path from 'path'
import os from 'os'

const QUEUE_DIR = path.join(os.homedir(), '.sleep-and-ship')
const QUEUE_FILE = path.join(QUEUE_DIR, 'queue.json')

async function ensureQueue() {
  await fs.ensureDir(QUEUE_DIR)
  const exists = await fs.pathExists(QUEUE_FILE)
  if (!exists) {
    await fs.writeJson(QUEUE_FILE, { tasks: [] }, { spaces: 2 })
  }
}

async function readQueue() {
  await ensureQueue()
  return fs.readJson(QUEUE_FILE)
}

async function writeQueue(data) {
  await fs.writeJson(QUEUE_FILE, data, { spaces: 2 })
}

export async function addTask(task, repo) {
  const data = await readQueue()
  const repoPath = repo ? path.resolve(repo) : process.cwd()

  const newTask = {
    id: Date.now(),
    task,
    repo: repoPath,
    status: 'pending',
    added: new Date().toISOString(),
    result: null,
    completedAt: null,
  }

  data.tasks.push(newTask)
  await writeQueue(data)
  return newTask
}

export async function getTasks(statusFilter = null) {
  const data = await readQueue()
  if (!statusFilter) return data.tasks
  return data.tasks.filter((t) => t.status === statusFilter)
}

export async function updateTask(id, status, result = null) {
  const data = await readQueue()
  const idx = data.tasks.findIndex((t) => t.id === id)

  if (idx === -1) {
    throw new Error(`Task ${id} not found`)
  }

  data.tasks[idx] = {
    ...data.tasks[idx],
    status,
    result,
    completedAt: new Date().toISOString(),
  }

  await writeQueue(data)
  return data.tasks[idx]
}

export async function clearCompleted() {
  const data = await readQueue()
  data.tasks = data.tasks.filter((t) => t.status === 'pending')
  await writeQueue(data)
}

export { QUEUE_DIR }
