// scripts/index.ts
import 'jsr:@std/dotenv@0.225/load'
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
import { GITHUB_QUERY } from './lib/query.ts'
import {
  output,
  parseCodebaseStats,
  parseLanguage,
  parseStreak,
} from './lib/parser.ts'

async function main() {
  console.info('[▱_▱] Starting sync...')

  // 1. Fetch & Validate
  const data = await fetchData(GITHUB_QUERY)
  if (!data?.viewer) throw new Error('GitHub API Error')
  const user = data.viewer

  // 2. Format & Assembly
  const languageData = parseLanguage(user)
  const totalSize = languageData.reduce((acc, [, size]) => acc + size, 0)

  const codebaseMetrics = parseCodebaseStats(user)
  const mb = codebaseMetrics.totalDiskUsage / 1024
  const storageStr = mb > 1024
    ? `${(mb / 1024).toFixed(2)} GB`
    : `${mb.toFixed(2)} MB`

  const sections: Record<string, string> = {}

  if (output.readmeSections.codebase) {
    sections.codebase = renderSection('codebase', [
      `REPOS: ${codebaseMetrics.repoCount} (include private repo personal & org)`,
      `VOLUME: ${storageStr}`,
      `LICENSE: ${codebaseMetrics.mainLicense}`,
    ])
  }

  if (output.readmeSections.languages) {
    sections.languages = renderSection('languages', formatLanguages(user))
  }

  if (output.readmeSections.profile) {
    sections.profile = renderSection('profile', [
      `FOLLOWERS: ${user.followers.totalCount}`,
      `STREAK: ${parseStreak(user)} days`,
    ])
  }

  if (output.readmeSections.commit) {
    sections.commit = renderSection('commit', [
      ...formatCommits(user),
      '',
      `Total: ${user.contributionsCollection.contributionCalendar.totalContributions.toLocaleString()} commits in last year`,
    ])
  }

  // 3. Output README
  if (output.readme) {
    const outputPath = process.argv[2] || path.join(process.cwd(), 'README.md')
    const template = readFileSync(
      path.join(process.cwd(), 'README.template.md'),
      'utf-8',
    )
    const statsContent = [
      sections.profile,
      sections.codebase,
      sections.languages,
    ]
      .filter(Boolean)
      .join('\n\n')
    writeFileSync(
      outputPath,
      buildReadme(template, statsContent, sections.commit || ''),
    )
  }

  // 4. Output JSON (optional)
  const jsonPath = process.argv[3]
  if (jsonPath && output.stats) {
    writeFileSync(jsonPath, JSON.stringify(buildStatsJson(user), null, 2))
  }

  console.info('[▰_▰] System Synced')
  console.info('[▰_▰] Check your README.md and stats.json')
}

main().catch(console.error)
