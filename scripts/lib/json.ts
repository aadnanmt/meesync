// scripts/lib/json.ts
// Build stats JSON object from GitHub user data
import type { GitHubUser } from '../types.ts'
import { parseCodebaseStats, parseLanguage, parseStreak } from './parser.ts'

export function buildStatsJson(user: GitHubUser) {
  const languageData = parseLanguage(user)
  const totalSize = languageData.reduce((acc, [, size]) => acc + size, 0)

  return {
    updatedAt: new Date().toISOString(),
    totalCommits:
      user.contributionsCollection.contributionCalendar.totalContributions,
    totalFollowers: user.followers.totalCount,
    streak: parseStreak(user),
    ...parseCodebaseStats(user),
    languages: languageData.map(([name, size]) => ({
      name,
      percentage: ((size / totalSize) * 100).toFixed(1),
    })),
  }
}
