#!/usr/bin/env node
// Called from .github/workflows/release.yml after `changeset tag` runs. Bundles every
// package bumped in this merge into a single dated GitHub release instead of one
// release per package tag.
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function findWorkspaceDirs() {
  const dirs = []
  for (const root of ['apps', 'packages']) {
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (entry.isDirectory()) dirs.push(join(root, entry.name))
    }
  }
  return dirs
}

function buildNameToDirMap() {
  const map = new Map()
  for (const dir of findWorkspaceDirs()) {
    const pkgPath = join(dir, 'package.json')
    if (!existsSync(pkgPath)) continue
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    map.set(pkg.name, dir)
  }
  return map
}

function extractChangelogSection(changelogPath, version) {
  if (!existsSync(changelogPath)) return null
  const lines = readFileSync(changelogPath, 'utf8').split('\n')
  const startIndex = lines.findIndex((line) => line.trim() === `## ${version}`)
  if (startIndex === -1) return null
  const rest = lines.slice(startIndex + 1)
  const endIndex = rest.findIndex((line) => line.startsWith('## '))
  const section = endIndex === -1 ? rest : rest.slice(0, endIndex)
  return section.join('\n').trim()
}

function nextTagName() {
  const today = new Date().toISOString().slice(0, 10).replaceAll('-', '.')
  const existingTags = execSync('git tag -l', { encoding: 'utf8' })
    .split('\n')
    .filter((tag) => tag.startsWith(`${today}.`))
  const maxN = existingTags.reduce((max, tag) => {
    const n = Number(tag.slice(today.length + 1))
    return Number.isInteger(n) && n > max ? n : max
  }, 0)
  return `${today}.${maxN + 1}`
}

function main() {
  const publishedPackagesJson = process.env.PUBLISHED_PACKAGES
  const published = publishedPackagesJson ? JSON.parse(publishedPackagesJson) : []
  if (published.length === 0) {
    console.log('No packages were tagged; skipping release.')
    return
  }

  const nameToDir = buildNameToDirMap()
  const sections = []
  for (const { name, version } of published) {
    const dir = nameToDir.get(name)
    if (!dir) continue
    const section = extractChangelogSection(join(dir, 'CHANGELOG.md'), version)
    if (!section) continue
    sections.push(`## ${name}@${version}\n\n${section}`)
  }

  if (sections.length === 0) {
    console.log('No changelog content found for published packages; skipping release.')
    return
  }

  const tag = nextTagName()
  const notesPath = 'release-notes.md'
  writeFileSync(notesPath, sections.join('\n\n'))

  execSync(
    `gh release create "${tag}" --title "${tag}" --notes-file "${notesPath}" --target "${process.env.GITHUB_SHA}"`,
    { stdio: 'inherit' }
  )
  console.log(`Created release ${tag}`)
}

main()
