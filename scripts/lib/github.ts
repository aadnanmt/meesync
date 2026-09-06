import { GitHubGqlResponse } from '../types.ts'

const GITHUB_QUERY = `
  query {
    viewer {
      login
      followers {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: [OWNER, ORGANIZATION_MEMBER], isFork: false) {
        nodes {
          diskUsage
          licenseInfo {
            spdxId
          }
          owner {
            login
          }
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                color
                name
              }
            }
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`

export async function fetchData(): Promise<GitHubGqlResponse> {
  const token = process.env.GH_TOKEN
  if (!token) {
    throw new Error(
      '[ ✖_✖ ] Damn, GH_TOKEN is missing. Check again your value GH_TOKEN on your .env',
    )
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: GITHUB_QUERY }),
  })

  const result = await response.json()
  if (result.errors) {
    console.error(result.errors)
    throw new Error('[ ✖_✖ ] Graphql error!')
  }
  return result.data
}
