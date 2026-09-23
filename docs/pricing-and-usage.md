---
title: "Billing Components"
description: "What factors into Runtime and AI Credit calculation — LLM, runtime, storage, browser, AWS, and Vercel sandbox components"
---

# Billing Components

This document explains how the cost of a build is calculated, component by component. For your own numbers — tokens, cost, and credits per build — see the Usage dashboard; every build shows its full pricing breakdown there.

---

## Cost Components

Every build accumulates costs across up to seven distinct categories. The **total cost** for a build is the sum of whichever apply:

```
Total Cost = LLM Cost + Cloudflare Workers Cost + R2 Storage Cost + Browser Cost + AWS Sandbox Cost + Local Agent Duration + Vercel Sandbox Cost
```

AWS Sandbox Cost and Local Agent Duration are mutually exclusive — exactly one of the two applies to a given build, never both, based on where it ran: AWS Sandbox Cost for builds CoreFix ran in its own SaaS-hosted sandbox, Local Agent Duration for builds run locally via the `corefix` CLI. See [5. AWS Sandbox Cost](#5-aws-sandbox-cost) and [6. Local Agent Duration](#6-local-agent-duration) below. Vercel Sandbox Cost only applies to lab environment runs — see [7. Vercel Sandbox Cost](#7-vercel-sandbox-cost) below.

---

### 1. LLM Cost

The LLM cost covers AI inference — the tokens consumed when the scanner sends prompts to and receives responses from the chosen language model.

LLM cost is broken into up to four sub-components:

| Sub-component        | Formula                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| **Input cost**       | `(prompt_tokens / 1,000,000) × input_rate`                                   |
| **Output cost**      | `(completion_tokens / 1,000,000) × output_rate`                              |
| **Cache write cost** | `(cache_write_tokens / 1,000,000) × cache_write_rate` _(Claude models only)_ |
| **Cache read cost**  | `(cache_read_tokens / 1,000,000) × cache_read_rate` _(Claude models only)_   |

```
LLM Cost = Input Cost + Output Cost + Cache Write Cost + Cache Read Cost
```

All rates are **per 1 million tokens** and vary by model — see [Model Pricing](./models-pricing) for the current per-model rates.

> **Prompt caching** (cache write / cache read) is only available on Anthropic Claude models. For all other models, cache costs are $0.

#### Orchestration Fee

The LLM Cost above is the raw **provider cost** — what the tokens cost at standard rates. On top of it, CoreFix charges an **orchestration fee** for running AI enrichment or AI autofix generation:

- **BYOK** (`--openai-api-key`) — LLM Cost is $0 to CoreFix; you pay only the orchestration fee. Your provider bills you directly for the tokens.
- **No BYOK** — you pay both the orchestration fee and the LLM Cost.

The exact multipliers (enrichment vs. autofix, BYOK vs. not) are on [Model Pricing](./models-pricing#ai-usage--billing).

---

### 2. Cloudflare Workers Cost — Runtime

The Cloudflare Workers cost is the **runtime cost** of a build — it's billed on how long the scan actually runs, in metered minutes, not on where it ran. The same metering applies whether the scan was run locally via the `corefix` CLI or in a CoreFix cloud sandbox.

What's metered: the CPU wall-clock time the scanner worker was active during the build (`cf_workers_duration_ms`) — this is what feeds into the runtime credit rate shown on [Credit Metering](./account-usage#usage--credit-rates).

---

### 3. R2 Storage Cost

The R2 cost covers object storage operations and storage space for scan artifacts (raw findings, reports, etc.).

What's metered:

- **Write operations** — roughly two per API call, plus three fixed operations per build for ingestion, normalization write, and report generation.
- **Storage volume** — the size of the artifacts written for the build.

---

### 4. Browser Cost

Browser cost applies **only** when Cloudflare Browser Rendering is used (e.g., for DAST / web scanning). It has two parts:

#### Browser Runtime

What's metered: browser session duration, plus a per-day amortized share of keeping a concurrent browser available.

#### Browser LLM

The same LLM Cost components as [1. LLM Cost](#1-llm-cost) above apply to tokens consumed during browser-assisted AI analysis.

```
Total Browser Cost = Browser Runtime Cost + Browser LLM Cost
```

If the browser was not used in a build, all browser costs are $0.

---

### 5. AWS Sandbox Cost

When a build doesn't run locally via the `corefix` CLI, CoreFix runs it in a SaaS-hosted sandbox — a fully managed AWS container job. This means zero infrastructure setup and no configuration on your side; everything runs on CoreFix's platform. Builds that run this way pick up additional AWS costs, on top of the Cloudflare Workers runtime cost above:

- **Container compute** — the cost of running the container job itself.
- **Network egress** — the container image pull and result egress, capped per build. Data transferred *in* is always free; this only applies when a NAT gateway and private subnet are used for the container job.
- **Ephemeral disk** — storage attached to the container job, prorated to how long the build ran.

```
AWS Cost = Container Compute Cost + Network Cost + Ephemeral Disk Cost
```

::: tip Local Scans
This cost is $0 for builds run locally with the `corefix` CLI — see [6. Local Agent Duration](#6-local-agent-duration) for what's tracked instead.
:::

---

### 6. Local Agent Duration

::: warning
When a build runs locally via the `corefix` CLI, there's no AWS sandbox for CoreFix to bill — [5. AWS Sandbox Cost](#5-aws-sandbox-cost) is $0. The scan still runs for some duration, though, so CoreFix tracks that as **Local Agent Duration** instead.
:::

Local Agent Duration is measured almost the same way as AWS Sandbox duration — it's the same kind of "how long did the agent run" figure — except it excludes the AWS container's boot time, since a local run has no AWS container to start up.

This duration carries no AWS cost, since it never touched CoreFix's AWS infrastructure. It's what feeds the runtime credit rate for locally run builds on [Credit Metering](./account-usage#usage--credit-rates) — the same way AWS Sandbox duration feeds it for cloud-run builds.

---

### 7. Vercel Sandbox Cost

Lab environment runtime — the Vercel-hosted practice labs (DVWA, Juice Shop, etc.) you can scan against — is billed using Vercel's own sandbox pricing components:

- **CPU** — compute time used by the sandbox. CoreFix provisions each lab sandbox with 4 cores.
- **Memory** — memory allocated to the sandbox for the session. CoreFix provisions each lab sandbox with 8 GB of RAM.
- **Disk** — the default disk allocation Vercel provisions for a sandbox; CoreFix doesn't configure or request more.
- **Network** — usage stays within Vercel's default included limits for a sandbox.

Every lab sandbox is provisioned at a fixed 4 core / 8 GB RAM size. Disk and network aren't configured beyond that — CoreFix uses Vercel's defaults for both, so pricing for those two follows Vercel's own rates.

---

## Monthly Aggregation

Per organization, the following fields are aggregated in the `usage_monthly` collection (reset each calendar month):

| Field                 | What it accumulates                          |
| --------------------- | --------------------------------------------- |
| `total_tokens`        | All prompt + completion tokens across builds  |
| `total_llm_cost`      | LLM cost (main + browser LLM)                 |
| `total_cf_cost`       | CF Workers + R2 + CF Browser runtime          |
| `total_aws_cost`      | AWS Sandbox cost, for builds run in a sandbox |
| `local_agent_duration_ms` | Total local agent duration, for builds run via the `corefix` CLI |
| `total_vercel_cost`   | Vercel Sandbox cost, for lab environment runs |
| `total_cost`          | Grand total across all cost components        |
| `total_credits`       | Credit ledger — LLM cost × the applicable orchestration multiplier, see [Orchestration Fee](#orchestration-fee) |
| `runtime_duration_ms` | Total scan runtime, local or cloud sandbox    |
| `total_builds`        | Number of completed builds                    |

> These are the fields the `total_credits` figure is built from — for the rates themselves, see [Credit Metering](./account-usage).


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
