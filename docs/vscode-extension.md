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
| CoreFix CLI and Docker | Follow [Installing the CoreFix CLI](/docs/install-cli). It also installs Docker if you do not have it. |
| A CoreFix account      | [Sign up](https://app.corefix.dev/signup) if you do not have one                                       |

> **Linux and macOS only.** On Windows, use WSL or a Remote-SSH window. Install the extension in that window, and install the CoreFix CLI and Docker on the remote machine, because that is where your code and the scan run.

## Install and sign in

**1. Check the CoreFix CLI.** After installing it, confirm it works:

```bash
corefix --version
```

**2. Install the extension.** In VS Code, open Extensions (`Ctrl+Shift+X`), search for **corefix**, and click **Install**. A CoreFix icon appears in the Activity Bar.

<!-- ![CoreFix extension in the VS Code Extensions view](https://your-host.example/images/corefix-extension.png) -->

![CoreFix extension in the VS Code Extensions view](/images/corefix-extension.png)

**3. Sign in.** Open the CoreFix view and choose one way:

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
Install it, run `corefix --version`, then click the retry icon.
:::

::: details Docker isn't installed or isn't running
Install or start Docker, then refresh.
:::

::: details The CoreFix image isn't available on this machine
Run `corefix update` in a terminal, then refresh.
:::

::: details Checking CoreFix status timed out
Click the refresh icon on the project card.
:::

::: details Browser sign-in isn't available
Use the API key option under the **Sign In** button.
:::

::: details Couldn't reach CoreFix
Check your internet connection and try again, or use an API key.
:::

::: details CoreFix returned an error (HTTP code)
Wait a moment and try again, or use an API key.
:::

::: details Could not start sign-in
Click **Sign In** again. If it keeps failing, use an API key.
:::

::: details Signed in, but the session couldn't be saved
Check that your home folder is writable (`~/.corefix`), then sign in again.
:::

::: details CoreFix couldn't verify your API key
Sign out, create a new key, and sign in again.
:::

::: details Your CoreFix session has expired
Click **Sign In**.
:::

::: details Sign-in timed out
Click **Sign In** again and finish the sign-in in your browser within 5 minutes.
:::

::: details CoreFix couldn't finish loading
Open the CoreFix output channel for the details, then reload the window.
:::

## Next step

[Scan your code and review fixes](/docs/vscode-extension-scanning)
