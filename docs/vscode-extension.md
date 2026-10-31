---
hide_title: true
sidebar_label: VS Code Extension
---

# VS Code Extension Setup

Install the CoreFix extension for VS Code and sign in. To run scans, see [Scanning with the VS Code Extension](/docs/vscode-extension-scanning).

## Requirements

| You need               | Details                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| VS Code                | Version 1.85 or newer                                                                                  |
| Operating system       | Windows, macOS, or Linux                                                                               |
| CoreFix CLI            | Follow [Installing the CoreFix CLI](/docs/install-cli), or install it from the extension's setup card. |
| Docker                 | Docker Desktop on Windows and macOS, Docker on Linux. It must be running, not just installed.          |
| Git                    | [Download Git](https://git-scm.com/downloads) if you do not have it                                    |
| CoreFix scanner images | A one-time download of a few GB. The extension can start it for you (`corefix update`).                |
| A CoreFix account      | [Sign up](https://app.corefix.dev/signup) if you do not have one                                       |

> **Remote windows.** If you use WSL or a Remote-SSH window, install the extension in that window, and install the CoreFix CLI, Docker, and Git on the remote machine, because that is where your code and the scan run.

## Install and sign in

**1. Check the CoreFix CLI.** After installing it, confirm it works:

```bash
corefix --version
```

You can skip this step and let the extension do the setup for you (see step 3).

**2. Install the extension.** In VS Code, open Extensions (`Ctrl+Shift+X`), search for **corefix**, and click **Install**. A CoreFix icon appears in the Activity Bar.

<!-- ![CoreFix extension in the VS Code Extensions view](https://your-host.example/images/corefix-extension.png) -->

![CoreFix extension in the VS Code Extensions view](/images/corefix-extension.png)

**3. Finish the setup.** Open the CoreFix view. A setup card checks Docker, the CoreFix CLI, the scanner images, and Git, and shows what is missing:

- **CoreFix CLI.** Click **Install** to run the official installer in a terminal. On Windows it runs in PowerShell. On Linux and macOS it asks for your `sudo` password. The extension continues on its own once the CLI is installed.
- **Docker.** If it is missing, the card links to Docker Desktop (Windows and macOS). If it is installed but stopped, start it, then check again.
- **Scanner images.** Click **Download** to fetch them (a few GB, one time).
- **Git.** If it is missing, the card links to the Git download page.

**4. Sign in.** Choose one way:

- **Sign in with your browser.** Click **Sign In**, log in on the page that opens, then come back to VS Code. It continues on its own. If no page opened, click **Open in Browser**.
- **Use an API key.** Click **CoreFix Platform**, create a key ([how to create one](/docs/api_docs)), paste it into the field, and click **Continue**.

<video controls muted playsinline preload="metadata" width="100%" style="border-radius: 8px;">
  <source src="/videos/vscode-extension-login.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<!-- <video controls muted playsinline preload="metadata" width="100%" style="border-radius: 8px;">
  <source src="https://your-host.example/videos/vscode-extension-login.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video> -->

Your sign-in is kept on your computer, in a CoreFix session file in your home folder. The CoreFix CLI uses the same file, so signing in to one signs you in to the other.

## Sign out

Click **Sign Out** at the bottom of the Home panel, or run **CoreFix: Sign Out** from the Command Palette. If a scan is running, you are asked first, and signing out cancels it.

## Troubleshooting

::: details CoreFix CLI not found
Click **Install** on the setup card, or install it yourself and run `corefix --version`, then click the retry icon. If it is still not found on Windows, restart VS Code.
:::

::: details Docker isn't installed or isn't running
Install or start Docker (Docker Desktop on Windows and macOS), then refresh.
:::

::: details The CoreFix image isn't available on this machine
Click **Download** on the setup card, or run `corefix update` in a terminal, then refresh.
:::

::: details Couldn't reach CoreFix or sign-in failed
Check your internet connection and try again, or sign in with an API key.
:::

::: details Your CoreFix session has expired
Click **Sign In**.
:::

::: details CoreFix couldn't finish loading
Open the CoreFix output channel for the details, then reload the window.
:::

## Next step

[Scan your code and review fixes](/docs/vscode-extension-scanning)
