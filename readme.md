# readmeSync

A minimalist tool to synchronize your GitHub Profile README. Built with **Deno**
and **TypeScript**, it uses the **GitHub GraphQL API** for fast data fetching
and headless templating.

## Architecture

This project follows a **Headless Templating** approach:

1. **Source**: `README.template.md` (Markdown with placeholders).
2. **Logic**: Deno + TS scripts fetch data from GitHub GraphQL.
3. **Renderer**: Injects stats into placeholders like `{{languages}}` and
   `{{commit}}`.
4. **Deploy**: GitHub Actions automates the sync every 12 hours to your public
   profile repository.

## Tech Stack

- **Runtime**: [Deno](https://deno.com)
- **Language**: TypeScript
- **API**: GitHub GraphQL API v4
- **Automation**: GitHub Actions (Cron)
- **Formatting**: deno fmt

## Setup & Usage

1. Clone this repository.
2. Install dependencies:

   ```bash
   deno install
   ```

3. Initialize the environment file:

   ```bash
   cp .env.example .env
   ```

4. Set up your `GH_TOKEN` in the `.env` file (see the **Authentication** section
   below).
5. Run the generator:

   ```bash
   deno run -A scripts/index.ts <path-to-target-readme>
   ```

## Authentication

This project requires a GitHub Personal Access Token (PAT). You can use either:

- **Fine-grained PAT**: (Recommended) Requires `Contents (Read/Write)`,
  `Workflows (Read/Write)`, and `Profile (Read-only)` permissions.
- **Classic PAT**: (Easier for multiple organizations) Requires `repo`,
  `workflow`, and `read:user` scopes.

## Local Development

For local development, copy `.env.example` to `.env` and add your `GH_TOKEN`:

```bash
cp .env.example .env
# Edit .env and add your GH_TOKEN
```

## Production (GitHub Actions)

The CI workflow requires the following **repository secret**:

| Secret     | Description                                                                         |
| ---------- | ----------------------------------------------------------------------------------- |
| `GH_TOKEN` | GitHub PAT with `repo`, `workflow`, `read:user` scopes (or fine-grained equivalent) |

### Set GH_TOKEN via GitHub CLI (recommended, no token in history)

```bash
# Read token from stdin, never appear in shell history
gh secret set GH_TOKEN < /path/to/token.txt

# Or pipe directly, not recommended:
echo "ghp_xxxxxxxxxxxx" | gh secret set GH_TOKEN

# with explicit repo (useful in CI/script):
gh secret set GH_TOKEN --repo your-username/your-repo
```

### Via Web UI

1. Go to your repository → **Settings** → **Secrets and variables** →
   **Actions**
2. Click **New repository secret**
3. Name: `GH_TOKEN`, Value: your PAT

### First time using GitHub CLI?

See the
[GitHub CLI quickstart](https://docs.github.com/en/github-cli/github-cli/quickstart)
for installation and auth:

```bash
gh auth login
```

## Automation

Updates happen twice a day at **05:00 & 17:00 UTC**. Check
`.github/workflows/stats.yml` for the CI/CD pipeline details.

## CI Configuration (Repository Variables)

The workflow uses repository variables for configurable values. Set them in
**Settings → Variables** (not Secrets) of your repository:

### Via GitHub CLI

```bash
# Public profile repository (format: owner/repo)
gh variable set PUBLIC_PROFILE_REPO --body "your-username/your-profile-repo"

# Git author email for commits
gh variable set GIT_AUTHOR_EMAIL --body "your-email@example.com"

# Git author name for commits
gh variable set GIT_AUTHOR_NAME --body "Your Name"
```

### Via Web UI

1. Go to your repository → **Settings** → **Variables** (under "Secrets and
   variables")
2. Click **New repository variable**
3. Add each variable:
   - `PUBLIC_PROFILE_REPO`, `your-username/your-profile-repo`
   - `GIT_AUTHOR_EMAIL`, `your-email@example.com`
   - `GIT_AUTHOR_NAME`, `Your Name`

---

_Zero-bloat. Performance-first. Scalable._
