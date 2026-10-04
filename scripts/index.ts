// scripts/index.ts
// Entry point: fetches GitHub stats, renders README + optional JSON output
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fetchData } from './lib/github.ts'
import { buildStatsJson } from './lib/json.ts'
import {
  buildReadme,
  formatCommits,
  formatLanguages,
  renderSection,
} from './lib/render.ts'
import { parseCodebaseStats, parseLanguage, parseStreak } from './lib/parser.ts'
import config from '../config.json' with { type: 'json' }

const { output } = config

async function main() {
  console.info('[▱_▱] Starting sync...')

  // 1. Fetch & Validate
  const data = await fetchData()
  if (!data?.viewer) throw new Error('GitHub API Error')
  const user = data.viewer

  // 2. Format & Assembly
  const languageData = parseLanguage(user)
  const codebaseMetrics = parseCodebaseStats(user)
  const mb = codebaseMetrics.totalDiskUsage / 1024
  const storageStr = mb > 1024
    ? `${(mb / 1024).toFixed(2)} GB`
    : `${mb.toFixed(2)} MB`

  const stats: string[] = []

  if (output.readmeSections.profile) {
    stats.push(
      renderSection(user.login, 'profile', [
        `FOLLOWERS: ${user.followers.totalCount}`,
        `STREAK: ${parseStreak(user)} days`,
      ]),
    )
  }

  if (output.readmeSections.codebase) {
    stats.push(
      renderSection(user.login, 'codebase', [
        `REPOS: ${codebaseMetrics.repoCount} (include private repo personal & org)`,
        `REPO SIZE: ${storageStr}`,
        `TOP LICENSE: ${codebaseMetrics.mainLicense}`,
      ]),
    )
  }

  if (output.readmeSections.languages) {
    stats.push(
      renderSection(user.login, 'languages', formatLanguages(languageData)),
    )
  }

  let commitSection = ''
  if (output.readmeSections.commit) {
    commitSection = renderSection(user.login, 'commit', [
      ...formatCommits(user),
      '',
      `Total: ${user.contributionsCollection.contributionCalendar.totalContributions.toLocaleString()} commits in last year`,
    ])
  }

  // 3. Output README
  const outputPath = process.argv[2] || path.join(process.cwd(), 'README.md')

  if (output.readme) {
    const template = readFileSync(
      path.join(process.cwd(), 'README.template.md'),
      'utf-8',
    )
    writeFileSync(
      outputPath,
      buildReadme(template, stats.join('\n\n'), commitSection),
    )
  }

  // 4. Output JSON (optional)
  const jsonPath = process.argv[3]
  if (jsonPath && output.stats) {
    writeFileSync(
      jsonPath,
      JSON.stringify(buildStatsJson(user), null, 2) + '\n',
    )
  }

  console.info('[▰_▰] System Synced')
  console.info('[▰_▰] Check your README.md and stats.json')
}

main().catch(console.error)
