import { ContributionWeek, GitHubUser } from '../types.ts'
import config from '../../config.json' with { type: 'json' }

const { allowedOwner, excludedLanguages, topLanguagesCount, output } = config

export { output }

function isOwnRepo(repo: { owner?: { login?: string } | null } | null) {
  return (
    !!repo?.owner?.login &&
    allowedOwner.includes(repo.owner.login.toLowerCase())
  )
}

export function parseLanguage(data: GitHubUser) {
  const langMap: Record<string, number> = {}

  data.repositories.nodes.filter(isOwnRepo).forEach((repo) => {
    repo.languages.edges.forEach((edge) => {
      langMap[edge.node.name] = (langMap[edge.node.name] || 0) + edge.size
    })
  })

  return Object.entries(langMap)
    .filter(([name]) => !excludedLanguages.includes(name))
    .sort(([, a], [, b]) => b - a)
    .slice(0, topLanguagesCount)
}

export function parseCommit(data: GitHubUser) {
  const calendar = data.contributionsCollection.contributionCalendar
  return calendar.weeks
    .flatMap((w: ContributionWeek) => w.contributionDays)
    .slice(-7)
}

export function parseCodebaseStats(data: GitHubUser) {
  let totalDiskUsage = 0
  let repoCount = 0
  const licenseMap: Record<string, number> = {}

  data.repositories.nodes.filter(isOwnRepo).forEach((repo) => {
    totalDiskUsage += repo.diskUsage
    repoCount++
    if (repo.licenseInfo?.spdxId) {
      licenseMap[repo.licenseInfo.spdxId] =
        (licenseMap[repo.licenseInfo.spdxId] || 0) + 1
    }
  })

  const mainLicense =
    Object.entries(licenseMap).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    'No License'

  return { repoCount, totalDiskUsage, mainLicense }
}

export function parseStreak(data: GitHubUser) {
  const days = data.contributionsCollection.contributionCalendar.weeks.flatMap(
    (w: ContributionWeek) => w.contributionDays,
  )
  let i = days.length - 1
  if (days[i]?.contributionCount === 0) i--
  let streak = 0
  for (; i >= 0; i--) {
    if (days[i].contributionCount > 0) streak++
    else break
  }
  return streak
}
