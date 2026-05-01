# Insighta CLI

Command-line interface for Insighta Labs+.

## Installation
```bash
npm install -g .
```

## Configuration
Create `~/.insighta/.env`:
```env
GITHUB_CLIENT_ID=your_cli_github_client_id
API_URL=https://web-production-5347.up.railway.app
```

## Commands

### Auth
```bash
insighta login       # Login with GitHub
insighta logout      # Logout
insighta whoami      # Show current user
```

### Profiles
```bash
insighta profiles list
insighta profiles list --gender male
insighta profiles list --country NG --age-group adult
insighta profiles list --min-age 25 --max-age 40
insighta profiles list --sort-by age --order desc
insighta profiles list --page 2 --limit 20

insighta profiles get <id>

insighta profiles search "young males from nigeria"

insighta profiles create --name "Harriet Tubman"

insighta profiles export --format csv
insighta profiles export --format csv --gender male
```

## Token Handling
- Tokens stored at `~/.insighta/credentials.json`
- Auto-refreshes access token when expired
- Prompts re-login if refresh token is also expired

## Natural Language Parsing
The search command parses queries like:
- "young males from nigeria" → gender=male, country=NG, age≤30
- "adult females" → gender=female, age_group=adult
- "senior males" → gender=male, age_group=senior
