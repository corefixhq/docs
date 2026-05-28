# Projects

Projects are the core unit of organization in Corefix. Each project maps to a web application or a code repository and holds all scan results, settings, and access controls for that target.

---

## Table of Contents

- [Projects List](#projects-list)
- [Creating a Project](#creating-a-project)
  - [Web Application Project](#web-application-project)
  - [Code Repository Project](#code-repository-project)
  - [CI/CD Pipeline Project](#cicd-pipeline-project)
  - [GitHub App (Auto-connect)](#github-app-auto-connect)
- [Project Settings](#project-settings)
  - [Scan Schedule](#scan-schedule)
  - [Email Sharing](#email-sharing)
  - [Correlation](#correlation)
- [Regenerating the Report Password](#regenerating-the-report-password)
- [Deleting a Project](#deleting-a-project)
- [Plan Limits](#plan-limits)

---

## Projects List

The projects list (`GET /api/projects`) returns all projects belonging to your organization, sorted newest-first. You can filter by type and paginate through results.

### Query Parameters

| Parameter         | Type    | Default | Description                                              |
|-------------------|---------|---------|----------------------------------------------------------|
| `page`            | integer | `1`     | Page number (1-based)                                    |
| `limit`           | integer | `20`    | Results per page (max 100)                               |
| `type`            | string  | —       | Filter by project type: `web`, `code`, or `cicd`         |
| `organization_id` | string  | —       | Defaults to the organization from your auth token        |

### Columns Returned per Project

Each project entry in the list includes the following fields:

| Field           | Description                                                         |
|-----------------|---------------------------------------------------------------------|
| `project_id`    | Unique identifier for the project (e.g. `proj_abc123`)              |
| `repo`          | Project name — derived from the repo name or hostname               |
| `type`          | Project type: `web` or `code`                                       |
| `provider`      | Source provider: `github`, `gitlab`, `azure`, `bitbucket`, or `web` |
| `app_type`      | Web app subtype: `spa`, `html`, `legacy`, or `api` (web only)       |
| `remote_url`    | The URL or clone URL of the project                                 |
| `description`   | Optional description entered at creation                            |
| `scan_schedule` | Configured scan frequency (e.g. `daily`, `weekly`, `manual`)       |
| `scan_cron`     | Raw cron expression when schedule is `custom`                       |
| `scan_at`       | Time of day for scheduled scans (e.g. `09:00`)                      |
| `emailIds`      | List of email addresses with report access                          |
| `correlation`   | Linked code project for web-to-code correlation                     |
| `created_by`    | Email of the user who created the project                           |
| `created_on`    | ISO 8601 timestamp of project creation                              |
| `latest_build`  | Summary of the most recent scan build (see below)                   |

### Latest Build Summary

The `latest_build` object attached to each project includes:

| Field                    | Description                                          |
|--------------------------|------------------------------------------------------|
| `build_uuid`             | Unique build identifier                              |
| `branch`                 | Git branch the scan ran on                           |
| `status`                 | Build status (e.g. `completed`, `failed`, `running`) |
| `total_findings`         | Total number of security findings                    |
| `total_attack_chains`    | Number of attack chain sequences identified          |
| `severity_summary`       | Breakdown of findings by severity level              |
| `classification_summary` | Breakdown of findings by vulnerability class         |
| `compliance_frameworks`  | Compliance frameworks covered (e.g. OWASP, PCI-DSS) |
| `scanner_summary`        | Which scanners ran and their individual results      |
| `triggered_by`           | Who or what triggered the build                      |
| `created_on`             | When the build was created                           |

---

## Creating a Project

**Endpoint:** `POST /api/projects/create`  
**Auth:** Bearer JWT required

All project types share these common fields:

| Field             | Required | Description                                          |
|-------------------|----------|------------------------------------------------------|
| `provider`        | Yes      | One of: `github`, `gitlab`, `azure`, `bitbucket`, `web`, `cicd` |
| `url`             | Yes*     | Repository clone URL or web app URL                  |
| `description`     | No       | Human-readable description of the project            |
| `emailIds`        | No       | List of email addresses to share report access with  |
| `organization_id` | No       | Defaults to the organization from your auth token    |

> *Not required for CI/CD projects.

A `project_id`, a `report_password`, and a `project_url` are returned on successful creation. Store the password — it is only shown once and is required to view scan reports.

---

### Web Application Project

Use this when your target is a live web application accessed via URL.

**Set `provider` to `web`.**

| Field                      | Required | Description                                                        |
|----------------------------|----------|--------------------------------------------------------------------|
| `url`                      | Yes      | Full URL of the web application (e.g. `https://app.example.com`)  |
| `app_type`                 | No       | Application architecture: `spa`, `html`, `legacy`, or `api`       |
| `credentials.username`     | No       | Login username if the app requires authentication                  |
| `credentials.password`     | No       | Login password — stored encrypted                                  |
| `credentials.token`        | No       | Auth token alternative to password — stored encrypted              |
| `scan_schedule`            | No       | How often to scan automatically (see [Scan Schedule](#scan-schedule)) |
| `scan_at`                  | No       | Time of day for the scan (e.g. `09:00`)                            |
| `correlation`              | No       | Link to a code project for combined reporting                      |

**App Types**

| Value    | Use when...                                               |
|----------|-----------------------------------------------------------|
| `spa`    | The app is a Single Page Application (React, Vue, Angular, etc.) |
| `html`   | Traditional multi-page HTML site                         |
| `legacy` | Complex or legacy application with non-standard structure |
| `api`    | REST or GraphQL API endpoint                             |

The project name is automatically derived from the hostname and port of the URL (e.g. `app.example.com:443`).

---

### Code Repository Project

Use this to connect a Git repository for source-code security scanning.

**Set `provider` to one of: `github`, `gitlab`, `azure`, `bitbucket`.**

| Field           | Required | Description                                              |
|-----------------|----------|----------------------------------------------------------|
| `url`           | Yes      | Clone URL of the repository                              |
| `description`   | No       | Description of the project                               |
| `emailIds`      | No       | Emails to share report access with                       |
| `scan_schedule` | No       | Automated scan frequency                                 |
| `scan_at`       | No       | Time of day for the scan                                 |
| `correlation`   | No       | Link to another project for cross-project correlation    |

The project name is extracted automatically from the repository URL (the last path segment before `.git`).

---

### CI/CD Pipeline Project

Use this to integrate Corefix into an existing CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins, Azure DevOps, or a custom pipeline).

**Set `provider` to `cicd`.**

| Field               | Required | Description                                                    |
|---------------------|----------|----------------------------------------------------------------|
| `description`       | No       | Label for the generated API key (defaults to "Default CI/CD token") |

On success, the response includes a one-time `api_key`. Copy it immediately — it is not stored in plain text. Use this key in your pipeline to authenticate scan submissions.

---

### GitHub App (Auto-connect)

When the Corefix GitHub App is installed on a GitHub organization, all selected repositories are automatically connected as `code` projects. No manual creation is required.

- Each new repository gets its own `project_id` and report password.
- If a repository was previously connected and then reconnected (e.g. the app was reinstalled), its existing project record is updated rather than duplicated.
- A confirmation email is sent to the organization's primary email with the report URL and password for each newly created project.

To get the GitHub App installation URL: `GET /api/auth/github-app`

---

## Project Settings

**Endpoint:** `PATCH /api/projects/settings`  
**Auth:** Bearer JWT required

Update one or more settings for an existing project. Only the fields you include are changed.

| Field           | Type             | Description                                           |
|-----------------|------------------|-------------------------------------------------------|
| `project_id`    | string           | Required. The project to update                       |
| `scan_schedule` | string           | Scan frequency (see options below)                    |
| `scan_cron`     | string           | Cron expression — required when `scan_schedule` is `custom` |
| `scan_at`       | string           | Time of day for scheduled runs (e.g. `09:00`)         |
| `emailIds`      | array of strings | Full replacement list of report-access emails (max 20) |
| `correlation`   | object           | Link to a code project (see [Correlation](#correlation)) |

---

### Scan Schedule

Controls how often Corefix automatically runs a scan on the project.

| Value        | Description                                          |
|--------------|------------------------------------------------------|
| `manual`     | No automatic scans — run on demand only              |
| `hourly`     | Scan every hour                                      |
| `daily`      | Scan once per day                                    |
| `weekly`     | Scan once per week                                   |
| `biweekly`   | Scan every two weeks                                 |
| `monthly`    | Scan once per month                                  |
| `quarterly`  | Scan once every three months                         |
| `custom`     | Use a specific cron expression (requires `scan_cron`)|

**Custom cron example:** `"scan_schedule": "custom", "scan_cron": "0 9 * * 1"` — runs every Monday at 9:00 AM.

Use `scan_at` (e.g. `"09:00"`) alongside standard schedules to control the time of day a scan fires.

---

### Email Sharing

The `emailIds` field controls who receives report access for the project.

- Provide the **complete** desired list — this replaces the existing list entirely.
- Up to **20** email recipients are allowed.
- When new addresses are added, the report password is automatically rotated and a new password email is sent to all recipients.
- The organization's primary email is the `To:` recipient; newly added addresses are included as `Cc:`.

> **Note:** Rotating the password invalidates the old one immediately. Anyone using the old password will need the new one.

---

### Correlation

Correlation links a **web** project to a **code** project so that findings from both scans can be combined and cross-referenced in reports.

```json
{
  "correlation": {
    "code_project_id": "proj_abc123",
    "branch_pattern":  "main"
  }
}
```

| Field              | Description                                                   |
|--------------------|---------------------------------------------------------------|
| `code_project_id`  | The `project_id` of the code repository project to link       |
| `branch_pattern`   | Git branch to correlate against (e.g. `main`, `release/*`)    |

The linked code project must belong to the same organization. Set `correlation` to `null` to remove an existing link.

---

## Regenerating the Report Password

**Endpoint:** `POST /api/projects/regenerate-password`  
**Auth:** Bearer JWT required

| Field        | Required | Description             |
|--------------|----------|-------------------------|
| `project_id` | Yes      | The project to update   |

Generates a new report password and immediately invalidates the previous one. The response includes the new password and the project report URL. Share these with anyone who needs access.

```json
{
  "success": true,
  "project_id": "proj_abc123",
  "repo": "my-app",
  "project_url": "https://...",
  "password": "newGeneratedPassword"
}
```

> Use this whenever you suspect the report password has been compromised or after removing a team member from `emailIds`.

---

## Deleting a Project

**Endpoint:** `DELETE /api/projects`  
**Auth:** Bearer JWT required

| Field        | Required | Description                  |
|--------------|----------|------------------------------|
| `project_id` | Yes      | The project to delete        |

Deleting a project permanently removes:

- The project record
- All builds associated with the project
- All findings and raw findings
- All branch records

This action is **irreversible**. The response confirms what was deleted:

```json
{
  "success": true,
  "message": "Project 'my-app' and all related data deleted.",
  "deleted": {
    "project_id": "proj_abc123",
    "repo": "my-app",
    "type": "code"
  }
}
```

---

## Plan Limits

Each organization has limits on the number of projects that can be created, determined by its subscription plan.

| Project Type              | Default Limit | Upgrade       |
|---------------------------|---------------|---------------|
| Code / CI/CD repositories | 5             | Contact sales |
| Web applications          | 5             | Contact sales |

Attempting to create a project beyond the limit returns a `403` error with a message prompting you to upgrade your plan.
