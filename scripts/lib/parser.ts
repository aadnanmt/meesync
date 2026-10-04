import { ContributionWeek, GitHubUser, LangStat } from '../types.ts'
import config from '../../config.json' with { type: 'json' }

// Config for filtering repos and languages
const { allowedOwner, excludedLanguages, topLanguagesCount } = config

// Check if repo belong to allowed owners
function isOwnRepo(repo: { owner?: { login?: string } | null } | null) {
	return (
		!!repo?.owner?.login &&
		allowedOwner.includes(repo.owner.login.toLowerCase())
	)
}

// language bytes across owned repos, filter excluded, sort by size
export function parseLanguage(data: GitHubUser): LangStat[] {
	const langMap: Record<string, { size: number; color: string | null }> = {}

	data.repositories.nodes.filter(isOwnRepo).forEach((repo) => {
		repo.languages.edges.forEach((edge) => {
			const cur = langMap[edge.node.name] || { size: 0, color: null }
			cur.size += edge.size
			if (!cur.color) cur.color = edge.node.color
			langMap[edge.node.name] = cur
		})
	})

	return Object.entries(langMap)
		.filter(([name]) => !excludedLanguages.includes(name))
		.sort(([, a], [, b]) => b.size - a.size)
		.slice(0, topLanguagesCount)
		.map(([name, { size, color }]): LangStat => [name, size, color])
}

// Get last 7 days contribution data
export function parseCommit(data: GitHubUser) {
	const calendar = data.contributionsCollection.contributionCalendar
	return calendar.weeks
		.flatMap((w: ContributionWeek) => w.contributionDays)
		.slice(-7)
}

// Repo stats: count, total disk usage, most common license
export function parseCodebaseStats(data: GitHubUser) {
	let totalDiskUsage = 0
	let repoCount = 0
	const licenseMap: Record<string, number> = {}

	data.repositories.nodes.filter(isOwnRepo).forEach((repo) => {
		totalDiskUsage += repo.diskUsage
		repoCount++
		if (repo.licenseInfo?.spdxId) {
			licenseMap[repo.licenseInfo.spdxId] = (licenseMap[repo.licenseInfo.spdxId] || 0) + 1
		}
	})

	const mainLicense = Object.entries(licenseMap).sort(([, a], [, b]) => b - a)[0]?.[0] ||
		'No License'

	return { repoCount, totalDiskUsage, mainLicense }
}

// Calculate current contribution streak (consecutive day with commits)
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
