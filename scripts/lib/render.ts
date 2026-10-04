// scripts/lib/render.ts
import { parseCommit } from './parser.ts'
import type { ContributionDay, GitHubUser, LangStat } from '../types.ts'

// Create ASCII bar visualization for a value relative to max
function makeBar(count: number, max: number, width: number): string {
  const filledLength = Math.round((count / max) * width)
  const filled = '█'.repeat(Math.max(0, filledLength))
  const empty = '░'.repeat(Math.max(0, width - filledLength))
  return `[${filled}${empty}]`
}

// Wrap lines in a section header/footer with ASCII border
export function renderSection(
  login: string,
  title: string,
  lines: string[],
): string {
  return [
    `$ ${login}-stats --${title}`,
    '----------------------------------',
    ...lines,
    '----------------------------------',
  ].join('\n')
}

// Format language bars with percentage (accepts precompute language data)
export function formatLanguages(languageData: LangStat[]): string[] {
  const totalSize = languageData.reduce((acc, [, size]) => acc + size, 0)

  return languageData.map(([name, size]) => {
    const bar = makeBar(size, totalSize, 20)
    const percentage = ((size / totalSize) * 100).toFixed(1)
    return `${name.padEnd(10)} ${bar} ${percentage}%`
  })
}

// Format last 7 days commit activity as ASCII bars
export function formatCommits(user: GitHubUser): string[] {
  const commitData = parseCommit(user)
  const maxCommits = Math.max(
    ...commitData.map((d: ContributionDay) => d.contributionCount),
    1,
  )

  return commitData.map((day: ContributionDay) => {
    const dayName = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
    }).format(new Date(day.date))
    const bar = makeBar(day.contributionCount, maxCommits, 15)
    return `${dayName.padEnd(5)} ${bar} ${day.contributionCount} commits`
  })
}

// Fill template placeholders with render section
export function buildReadme(
  template: string,
  statsOutput: string,
  commitOutput: string,
): string {
  return template
    .replace('{{languages}}', statsOutput)
    .replace('{{commit}}', commitOutput)
}
