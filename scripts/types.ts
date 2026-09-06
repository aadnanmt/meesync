// scripts/types.ts

// Repository node with disk usage, license, owner, and languages
export interface RepositoryNode {
  diskUsage: number
  licenseInfo: {
    spdxId: string
  } | null
  owner: {
    login: string
  }
  languages: {
    edges: {
      size: number
      node: {
        name: string
      }
    }[]
  }
}

// Single contribution day
export interface ContributionDay {
  contributionCount: number
  date: string // ISO 8601 date string
}

// Week contribution days
export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

// Contribution calendar with total and weekly
export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

// Authenticated user / viewer with repos and contributions
export interface GitHubUser {
  followers: {
    totalCount: number
  }
  repositories: {
    nodes: RepositoryNode[]
  }
  contributionsCollection: {
    contributionCalendar: ContributionCalendar
  }
}

// GraphQL response wrapper (viewer or specific user)
export interface GitHubGqlResponse {
  // the authenticated user (used with the 'viewer' query)
  viewer?: GitHubUser

  // a specific user (used with the 'user(login: "...")' query)
  user?: GitHubUser
}
