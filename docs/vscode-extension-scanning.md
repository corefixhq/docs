---
hide_title: true
sidebar_label: VS Code — Scan & Fix
---

# Scanning with the VS Code Extension

Scan your code, review AI-generated fixes, and merge the ones you trust, all inside VS Code. Not set up yet? See [VS Code Extension Setup](/docs/vscode-extension).

> **Nothing changes in your files until you merge.** Fixes are prepared on a separate fix branch. Your own files and your current branch stay as they are until you click **Raise Merge Request** and confirm.

## How it works

1. **Scan.** CoreFix scans your repository.
2. **Review.** For each proposed fix, you choose **Accept** or **Reject**.
3. **Merge.** The accepted fixes are merged into the branch you are on.

Open a git repository with **File → Open Folder**. The Home panel shows your repository, branch and commit at the top, and the scan buttons below.

## Run a scan

The Home panel shows only the buttons that make sense right now.

| Button | What it does |
| --- | --- |
| **Scan Now** | Finds issues. No fixes are generated. |
| **Scan & Fix** | Finds issues and proposes a fix for each one. |
| **Apply Fixes** | Generates fixes for a scan you already have, without scanning again. |
| **Rescan** and **Rescan & Fix** | Scan the current commit again. |
| **View Findings** | Opens the results of the last scan. |

**Choose a scan profile** from the dropdown above the buttons:

| Profile | Scanners it runs |
| --- | --- |
| **Fast Scan** (recommended) | Secrets, SAST, Kubernetes, IaC, OSV |
| **Deep Scan** (slower) | All scanners |
| **AI/LLM Security** | AI/LLM |
| **Kubernetes** | Kubernetes |
| **Supply Chain** | OSV, Malware |
| **Custom** | The scanners you tick |

> **Which findings get an automatic fix?** Secrets, SAST, Kubernetes and Sonar. IaC, OSV, Malware and AI/LLM only report issues. **Scan & Fix** needs at least one scanner from the first group, otherwise the button is disabled and a hint tells you why.

After a scan, a **Runs** line above **Apply Fixes** lists the scanners that were used. Click **+** to change them. Choosing different scanners runs a new scan.

While a scan runs, a banner shows the current stage and the findings so far. Use **Cancel scan** to stop (finished fixes are kept) or **Show log** for the full output. Only one scan can run at a time.

When it finishes, **Scan & Fix** and **Apply Fixes** open the review screen, and **Scan Now** opens the findings screen.

## Review findings

The findings screen is read-only. Open it any time with **View Findings**, or with the warning icon in the title bar of the CoreFix view.

- **Click a finding** to see the problem, how to fix it, and where it is. Click a location to open that file at that line.
- **Click a file** to jump to its flagged line.
- Use **Search** to filter the list.

Findings are also marked in the editor: the **Problems** panel lists each open finding, flagged lines are highlighted, and the **Explorer** shows **⚠** on files and folders with open findings and **✓** where everything is resolved. A finding is resolved only when its fix is accepted.

## Review fixes

After **Scan & Fix**, the review screen lists each file CoreFix wants to change. The fixes are on the fix branch only.

| Status | What it means |
| --- | --- |
| **Not reviewed** | You have not decided on this file yet |
| **In review 1/3** | You decided on some changes, not all |
| **Accepted** | You accepted every change |
| **Rejected** | You rejected every change |
| **Partial** | You decided on every change, accepting some and rejecting others |

**To review a file:**

1. Click the file to open it. It shows its changes one by one.
2. For each change, click **View Diff** to see it in VS Code's diff editor, then click **Accept** or **Reject**.
3. Change your mind any time before you merge by clicking the other button.

**Shortcuts:** **Accept All** and **Reject All** (the two icons at the top right) apply to every file. **Accept the rest** accepts the remaining changes of one file. You find it under the **Raise Merge Request** button, next to each file that is part-way through review.

**Good to know**
- If you reject a change but accept a later one that touches the same lines, CoreFix explains the problem and changes nothing. Accept the first, or reject the second.
- If a file in the fix branch was edited by something other than CoreFix, a dialog lets you choose **Show changes** or **Overwrite my edits**. CoreFix never overwrites it silently.

## Merge the fixes

Click **Raise Merge Request** at the bottom of the review screen. CoreFix merges the fix branch into the branch you are on with a normal local `git merge`. **Nothing is pushed.**

| Your situation | What happens |
| --- | --- |
| You reviewed nothing | You are asked to confirm. **All fixes are merged as accepted.** |
| You reviewed some files | You are asked to confirm. The files you did not review are merged as accepted, and your choices on the others are kept. |
| You reviewed everything | It merges straight away. |
| You rejected everything | There is nothing to merge. You can discard the fix branch. |

**When the merge is blocked,** the button is disabled or a message explains why:

| Reason | What to do |
| --- | --- |
| A file is part-way through review | Click **Review next ›**, or **Accept the rest** on that file. The small arrow next to it lists every such file. |
| You have uncommitted changes in a file the merge also changes | Commit or stash that file, then merge again. Changes in other files do not matter. |
| You are on a different branch than the one that was scanned | Switch back to that branch. |

**If git reports conflicts,** CoreFix lists the files. Resolve them in the editor and commit, as you normally would. The fix branch is kept.

**After a clean merge,** CoreFix deletes the fix branch and its working copy. To share the result, push your branch and open a pull request the way you usually do.

Scan results belong to the commit that was scanned. If you commit afterwards, the old results disappear from the Home panel and the editor, so run a new scan. The scan you just merged is the one exception: its badges stay until your next commit.

## Troubleshooting

::: details A scan is already running
Wait for it to finish, or click **Cancel scan**.
:::

::: details The Home panel shows an old status
Click the refresh icon on the project card.
:::

::: details Your findings disappeared
You committed since the scan. Run a new scan.
:::

::: details The fixes belong to another branch
Click the link in the message to switch to that branch.
:::

For setup and sign-in problems, see [VS Code Extension Setup](/docs/vscode-extension#troubleshooting).

## FAQ

**Does it push my code or open a pull request?** No. The merge is local. Push your branch yourself when you are ready.

## Help and logs

Open **View → Output** and pick a channel from the dropdown:

- **CoreFix Scan** shows the output of the latest scan. **Show log** on the progress banner opens it too.
- **CoreFix** shows sign-in, review and merge steps.

Your API key is never written to these logs. Before you share a log, remove any line that mentions `token`.

For help, ask in the [CoreFix discussions](https://github.com/orgs/corefixhq/discussions/categories/q-a) or write to [help@corefix.dev](mailto:help@corefix.dev).
