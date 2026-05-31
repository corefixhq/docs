---
hide_title: true
sidebar_label: Github
---

GitHub integration allows your product to connect with GitHub repositories to fetch metadata, create or manage issues, track pull requests, analyze commits, or integrate with CI/CD workflows. This integration is commonly used for code analysis, vulnerability tracking, automation, and collaboration features within your platform.

## Credentials Needed

To connect your product with GitHub, you need a GitHub Personal Access Token (PAT) or a GitHub App credential (for organizational integrations).

**For Personal Access Token (PAT):**

- GitHub Username (optional)
- Personal Access Token (PAT)

**For GitHub App (Organization Use):**

- App ID
- Client ID
- Client Secret
- Private Key (.pem)
- Installation ID

If you only need to read data or create issues/pull requests in a user's repository, the PAT method is sufficient and simpler.

## Permissions Needed / API Scopes

Depending on your integration use case, the following token scopes or app permissions are required:

| Functionality | Scope / Permission | Type |
|---------------|-------------------|------|
| Read repositories | repo | PAT / App |
| Create or manage issues | repo → includes issues | PAT / App |
| Manage pull requests | repo | PAT / App |
| Read organization info | read:org | PAT / App |
| Read workflow / actions data | workflow | Optional |
| Read user profile | read:user | Optional |

**Minimal Scopes for Issue/Pull Request Management:**
repo, read:org, read:user

## Creating Users / Access Tokens

**Step 1: Create a Personal Access Token (PAT)**

1. Go to GitHub → Settings → Developer settings → Personal Access Tokens → Tokens (classic)
2. Click Generate new token → Choose Fine-grained token (recommended) or Classic token
3. Select expiration (e.g., 90 days or 1 year)
4. Under Repository access, select:
   - All repositories (or specific ones if needed)
5. Under Repository permissions, enable:
   - Contents: Read-only (for reading repo data)
   - Issues: Read and write (for creating/updating issues)
   - Pull requests: Read and write (for managing pull requests)
6. Click Generate Token
7. Copy and securely store the token value — it will be visible only once.

**Step 2 (Optional): Create a GitHub App**

If your integration targets multiple users or organizations:

1. Go to GitHub → Settings → Developer Settings → GitHub Apps → New GitHub App
2. Fill details like App name, homepage URL, callback URL, etc.
3. Under Permissions, enable:
   - Repository permissions: Contents (read), Issues (read/write), Pull requests (read/write)
   - Organization permissions: Members (read)
4. Generate a Private Key (.pem)
5. Copy App ID, Client ID, and Client Secret
6. Install the app on your desired organization or user account and note the Installation ID

## Test Connectivity

You can test connectivity using curl or any REST API client:

```bash
# Replace <TOKEN> with your PAT
curl -H "Authorization: token <TOKEN>" https://api.github.com/user

# List repositories for the authenticated user
curl -H "Authorization: token <TOKEN>" https://api.github.com/user/repos

# Create an issue (example)
curl -X POST -H "Authorization: token <TOKEN>" \
     -d '{"title": "Test Issue", "body": "Created via integration"}' \
     https://api.github.com/repos/<USERNAME>/<REPO>/issues
```

If the responses are successful (HTTP 200/201), your credentials and permissions are valid.

## Save the Results in the Platform and Create Connection

In your platform's integration or connector setup, securely store:

- GITHUB_PAT (Personal Access Token)
- or APP_ID, CLIENT_ID, CLIENT_SECRET, PRIVATE_KEY, INSTALLATION_ID (if using GitHub App)

Validate the connection by fetching repositories or creating a sample issue.

Label this connector as GitHub Integration in your product.

## Best Practices

- Use fine-grained Personal Access Tokens or GitHub Apps instead of classic tokens for better security and control.
- Store tokens securely in your platform's encrypted vault or secret manager.
- Assign minimum required scopes — avoid full admin access unless necessary.
- Rotate tokens periodically, especially for long-lived integrations.
- Use OAuth flow or GitHub Apps if multiple users will authenticate through your product.
- If you only need public repository access, use public_repo scope instead of full repo.
- Monitor rate limits using the GitHub API (/rate_limit) to manage large-scale integrations efficiently.