import { cp, rm, mkdir, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const website = resolve(root, '..', 'Website')
const target = resolve(root, 'public', 'vendor')

const trees = ['Content', 'Scripts/Others']

const exists = async (p) => {
  try { await stat(p); return true } catch { return false }
}

if (!await exists(website)) {
  console.error(`Website not found at ${website}`)
  process.exit(1)
}

await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })

for (const tree of trees) {
  const from = resolve(website, tree)
  if (!await exists(from)) {
    console.error(`missing: ${tree}`)
    process.exit(1)
  }
  await cp(from, resolve(target, tree), { recursive: true })
  console.log(`copied ${tree}`)
}

console.log(`vendor assets synced to ${target}`)
