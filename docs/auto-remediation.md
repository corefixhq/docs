
# CodeFix — Automated Remediation

CoreFix can patch the vulnerabilities it finds instead of just reporting them. `--patch` runs CodeFix against your findings and writes the fixes into your repository.

::: tip OpenCode Agent Included
CodeFix uses the **OpenCode** coding agent, which ships by default inside the CoreFix Docker image — there is nothing to install or configure. In the future, you will also be able to use your own Claude or Codex as the coding agent.
:::

## Patch options

| Flag | Description |
|---|---|
| `--patch` | Fix the previous pending scan, or scan and fix when no pending scan exists. Free plan: up to 5 patches at a time — see [Patch limits by plan](#patch-limits-by-plan) |
| `--rescan` | Scan the current checkout again; add `--patch` to also fix findings |
| `--pr` | Create a pull request after remediation |
| `--in-place` | Apply fixes directly in the current repository instead of an isolated worktree |

All four default to `false`. Here is what the common combinations do:

| Command | What it does |
|---|---|
| `corefix code` | Scans the current checkout. If a previous scan still has patches pending, it does **not** rescan — it shows the status of that scan instead (see [Scan snapshots and re-runs](#scan-snapshots-and-re-runs)) |
| `corefix code --patch` | Fixes the previous pending scan. If there is no pending scan, scans the current checkout and fixes it |
| `corefix code --rescan` | Scans the current checkout again — a security scan only, no fixes |
| `corefix code --rescan --patch` | Scans the current checkout again and fixes the findings |
| `corefix code --patch --pr` | Fixes the findings, then opens a pull request |
| `corefix code --patch --in-place` | Fixes the findings directly in your current repository instead of an isolated worktree |
| `corefix code status` | Prints the last known scan status (branch, commit and patch state) as JSON |

## How it works

1. Every scan takes a **snapshot** of the current branch and commit. Patches are always applied against that snapshot.
2. `--patch` fixes the previous pending scan. If there is no pending scan, it scans your checkout first and then fixes the findings — so a single command is always enough. Each patch is applied as a commit; how many are applied at a time depends on your [plan](#patch-limits-by-plan).
3. By default, fixes are applied in an **isolated worktree**, so your working directory and current branch are left untouched. Pass `--in-place` to apply the fixes directly in your current repository instead.
4. Optionally, `--pr` opens a pull request after remediation.

```bash
# Fix the previous pending scan (or scan and fix if none is pending)
corefix code --patch

# Scan the current checkout again and fix the findings
corefix code --rescan --patch

# Apply fixes and open a pull request automatically
corefix code --patch --pr --github-token ghp_xxxxxxxxxxxx

# Apply fixes directly in the current repository
corefix code --patch --in-place

# Check the last known scan / patch state
corefix code status
```

> `--pr` requires `--github-token` with write access to the repository, since it pushes the fix branch and opens a pull request. See [`--github-token`](#--github-token-optional) below.

## Patch limits by plan

How much `--patch` can fix in one go depends on your plan.

| Plan | Patches applied at a time | What gets fixed |
|---|---|---|
| **Free** | Up to **5** | Each patch is one commit, and each commit contains a file with all of its vulnerabilities fixed — so up to 5 files are fixed at a time |
| **Pro** | No limit | All issues in all files are fixed in one go |
| **Teams** | No limit | All issues in all files are fixed in one go |

::: warning Free plan
On the Free plan, `--patch` applies at most 5 patches (5 commits) at a time. If more than 5 files have vulnerabilities, the files beyond the limit are not fixed in that run. Upgrade to Pro or Teams to fix every issue across every file in a single run. See [Credit Components](./pricing-and-usage).
:::

## Scan snapshots and re-runs

When you scan, CoreFix takes a snapshot of the **current branch and commit**. If you run `corefix code` again while that scan still has patches pending, it **does not rescan** — it tells you a previous scan exists and how to apply its patches. The patches you are offered always belong to the **old snapshot**, never to code you have changed since.

If you switch branches, or commit new changes on the same branch, CoreFix detects that the checkout has diverged from the scan and tells you what changed. It then suggests `--rescan` to scan the current checkout instead.

**Same branch, same commit** — nothing has changed since the scan:

```
[!] Current checkout: main @ 9244570
[!] Previous scan:   main @ 9244570
[!] Previous scan exists; patch processing is not complete.
[!] Use --patch to apply fixes to the previous scan.
```

**Branch changed, commit unchanged:**

```
[!] Current checkout: bugfix/sql-injection @ 9244570
[!] Previous scan:   main @ 9244570
[!] Branch changed: main -> bugfix/sql-injection.
[!] Previous scan exists; patch processing is not complete.
[!] Use --patch to apply fixes to the previous scan.
[!] Use --rescan --patch to scan and fix the current checkout instead.
[!] Use --rescan only for a security scan.
```

**Branch and commit both changed:**

```
[!] Current checkout: bugfix/sql-injection @ aa5014f
[!] Previous scan:   main @ 9244570
[!] Branch changed: main -> bugfix/sql-injection.
[!] Commit changed: 9244570 -> aa5014f.
[!] Previous scan exists; patch processing is not complete.
[!] Use --patch to apply fixes to the previous scan.
[!] Use --rescan --patch to scan and fix the current checkout instead.
[!] Use --rescan only for a security scan.
```

**Same branch, new commit:**

```
[!] Current checkout: main @ 686cb1b
[!] Previous scan:   main @ 9244570
[!] Commit changed: 9244570 -> 686cb1b.
[!] Previous scan exists; patch processing is not complete.
[!] Use --patch to apply fixes to the previous scan.
[!] Use --rescan --patch to scan and fix the current checkout instead.
[!] Use --rescan only for a security scan.
```

In short:

- `--patch` → fix the **previous** scan's findings.
- `--rescan --patch` → scan the **current** checkout, then fix it.
- `--rescan` (on its own) → scan the current checkout only, with no fixes.

## Patch progress

CoreFix keeps track of patching per scan, so a patch run that is interrupted or only partly applied can be picked up again. Whenever a patch is in progress or partially applied, `corefix code` shows the progress: how many files are fixed, how many failed, and how many remain.

**Applying patches with `--patch`** — the fixes are applied in the previous scan's isolated worktree:

```
[!] Current checkout: demobranch @ 699f436a9c
[!] Previous scan:   demobranch @ 699f436a9c
[!] Applying fixes to the previous scan’s isolated worktree.
```

**Running `--patch` when patching is already in progress or partially applied** — the progress is shown first, then fixes continue to be applied:

```
[!] Current checkout: demobranch @ 699f436a9c
[!] Previous scan:   demobranch @ 699f436a9c
[+] Patch in progress: 2 fixed, 0 failed, 12 remaining of 14 files.
[!] Applying fixes to the previous scan’s isolated worktree.
```

**Running without `--patch` when patching is in progress** — nothing is applied; the progress is shown along with a reminder to use `--patch`:

```
[!] Current checkout: demobranch @ 699f436a9c
[!] Previous scan:   demobranch @ 699f436a9c
[+] Patch in progress: 2 fixed, 0 failed, 12 remaining of 14 files.
[!] Previous scan exists; patch processing is not complete.
[!] Use --patch to apply fixes to the previous scan.
```

The `Patch in progress` line reads `<n> fixed, <n> failed, <n> remaining of <total> files`. If your plan limits how many patches are applied at a time (see [Patch limits by plan](#patch-limits-by-plan)), run `--patch` again to apply fixes to the files that remain.
