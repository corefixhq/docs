---
title: "Account & Usage"
description: "How to manage your CoreFix account profile, view usage details, and track build and project consumption"
---

# Account & Usage

## Overview

The **Account & Usage** section lets you manage your personal profile, monitor token and API consumption, review monthly billing activity, and drill into per-build and per-project usage. All of these views are accessible from the **Account** menu in the top-right corner of the portal.

---

## Updating Your Profile

### Accessing Profile Settings

1. Click your avatar or email address in the top-right corner of the portal.
2. Select **Profile Settings** from the dropdown.

### What You Can Update

| Field                        | Notes                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Display name**             | Shown in build cards ("triggered by") and email notifications                                        |
| **Email address**            | Must be verified — a confirmation link is sent to the new address before the change takes effect     |
| **Password**                 | Minimum 12 characters. Changing your password invalidates all active sessions.                       |
| **Notification preferences** | Choose which scan events send you an email (e.g. scan complete, new Critical finding, build failure) |
| **Theme preference**         | Light or dark — synced across devices, overrides the per-browser toggle in the report viewer         |
| **Timezone**                 | Used for displaying timestamps in usage charts and monthly summaries                                 |

### Saving Changes

Click **Save changes** at the bottom of the form. Changes to display name and notification preferences take effect immediately. Email and password changes require confirmation.

> Organization administrators can lock certain fields (e.g. email address) for members managed through SSO. If a field is grayed out, contact your administrator.

---

## Usage Details

The **Usage** page gives a real-time snapshot of your consumption across all dimensions — tokens, API calls, builds, and cost — for any time window you choose.

### Selecting a Time Range

Use the date-range picker at the top of the page:

- **Last 7 days** (default)
- **Last 30 days**
- **Last 90 days**
- **Custom range** — pick any start and end date

All charts and tables on the page update instantly when you change the range.

### Summary Cards

Four cards at the top of the page give instant totals for the selected period:

| Card                | What it shows                                                         |
| ------------------- | --------------------------------------------------------------------- |
| **Total Builds**    | Number of scan runs completed                                         |
| **Total Tokens**    | Combined input + output tokens consumed by the AI enrichment pipeline |
| **Total API Calls** | Number of LLM calls made across all builds                            |
| **Total LLM Cost**  | Actual cost of AI enrichment (USD)                                    |

Clicking any card scrolls to the corresponding detailed section below.

### Token Breakdown Chart

A stacked area chart shows daily **input tokens** vs **output tokens** over the selected range. Hover a date to see the exact split.

### Cost Trend Chart

A line chart showing daily LLM cost. Spikes typically correspond to large builds (many findings, complex codebases, or enrichment retries).

---

## Monthly Usage

The **Monthly Usage** view shows a month-by-month summary, useful for budgeting and billing reconciliation.

### Accessing Monthly Usage

From the **Usage** page, click the **Monthly** tab, or navigate to **Account → Monthly Usage**.

### Monthly Summary Table

Each row represents one calendar month:

| Column                    | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| **Month**                 | Calendar month (e.g. May 2026)                               |
| **Builds**                | Total scan runs completed that month                         |
| **Input Tokens**          | Prompt tokens sent to the AI model                           |
| **Output Tokens**         | Completion tokens returned by the AI model                   |
| **Total Tokens**          | Combined input + output                                      |
| **API Calls**             | Total LLM API calls                                          |
| **LLM Cost (USD)**        | Actual cost of LLM usage                                     |
| **Forecasted Cost (USD)** | LLM cost + estimated infrastructure time (hover for formula) |

Click any row to expand a day-by-day breakdown for that month.

### Exporting Monthly Data

Click **Export CSV** (top-right of the table) to download the displayed range as a CSV file. The export respects any active filters (project, scanner, date range).

> Monthly usage data is finalized at 00:00 UTC on the first day of the following month. Usage shown for the current month is a running total and may update as builds complete.

---

## Build Usage

Build usage shows the cost and token consumption broken down **per individual scan run**, making it easy to identify expensive builds and optimize your pipeline.

### Accessing Build Usage

Navigate to **Account → Usage → Build Usage** or click the **Builds** tab on the Usage page.

### Build Usage Table

| Column           | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| **Build UUID**   | Unique identifier for the scan run — click to open the report |
| **Project**      | The repository name                                           |
| **Branch**       | Git branch that was scanned                                   |
| **Commit SHA**   | Short SHA of the scanned commit                               |
| **Triggered By** | Who or what initiated the scan                                |
| **Findings**     | Total AI-enriched findings produced                           |
| **Tokens**       | Combined input + output tokens for this build                 |
| **API Calls**    | LLM calls made during enrichment                              |
| **LLM Cost**     | Cost of AI enrichment for this build                          |
| **Duration**     | Time from scan start to enrichment completion                 |
| **Scanned On**   | Timestamp (displayed in your configured timezone)             |

### Filtering and Searching

- **Search** by commit SHA, branch name, or triggered-by value
- **Filter by project** using the project dropdown
- **Filter by date range** using the date picker
- **Sort** any column by clicking its header (default: newest first)

### Build Detail

Clicking a **Build UUID** opens the full security report for that build. The build's usage stats (tokens, cost, duration) are also visible in the **Summary tab → AI Pipeline Stats** strip inside the report.

### Identifying Expensive Builds

Sort by **LLM Cost** descending to find the costliest builds. Common causes:

| Cause                    | What to look for                                 |
| ------------------------ | ------------------------------------------------ |
| Large number of findings | High finding count + high token count            |
| Complex codebases        | Long pipeline duration                           |
| Enrichment retries       | API call count disproportionate to finding count |
| Many scanners enabled    | Scanner breakdown showing 5+ scanners            |

---

## Project Usage

Project usage aggregates consumption **per repository**, letting you see which projects drive the most scan activity and cost.

### Accessing Project Usage

Navigate to **Account → Usage → Project Usage** or click the **Projects** tab on the Usage page.

### Project Usage Table

| Column               | Description                                             |
| -------------------- | ------------------------------------------------------- |
| **Project**          | Repository name and `project_id`                        |
| **Builds**           | Total scan runs for this project in the selected period |
| **Branches Scanned** | Number of distinct Git branches scanned                 |
| **Total Findings**   | Cumulative AI-enriched findings across all builds       |
| **Tokens**           | Combined tokens consumed by this project                |
| **LLM Cost**         | Total AI cost attributed to this project                |
| **Last Scanned**     | Timestamp of the most recent build                      |

Click a project row to drill into that project's individual builds (equivalent to the **Build Usage** table filtered to that project).

### Project Usage Chart

A horizontal bar chart ranks projects by **LLM Cost** (or toggle to **Tokens** or **Builds**) for the selected time range. The longest bar is the highest-consuming project.

### Per-Project Breakdown by Scanner

Click **View scanners** on any project row to see how tokens and cost are distributed across the scanners enabled for that project.

| Scanner    | Findings | Tokens  | Cost  |
| ---------- | -------- | ------- | ----- |
| semgrep    | 42       | 128,400 | $0.31 |
| trivy      | 18       | 64,200  | $0.15 |
| trufflehog | 5        | 22,100  | $0.05 |
