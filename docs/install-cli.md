---
hide_title: true
sidebar_label: Install the CLI
---

## Installing the CoreFix CLI

`corefix` is a single binary that runs the CoreFix code and web scanners for you. One command installs it, along with everything it needs to run.

---

## Install

```bash
curl -fsSL https://get.corefix.dev/corefix | sudo sh
```

The installer does three things:

1. **Installs the `corefix` binary** at `/usr/local/bin`, so it's on your `PATH` straight away.
2. **Installs Docker automatically** if it isn't already installed on the machine.
3. **Pre-pulls the scanner images** from Docker Hub — `corefixhq/cfix` and `corefixhq/cfix-web-chromium` (see [Scanner Images](#scanner-images)) — so your first scan doesn't wait on a pull. Set `COREFIX_SKIP_PULL=1` before installing to skip this and pull the images on first scan instead.

::: tip Docker is installed for you
You don't need Docker installed beforehand. If the installer doesn't find Docker on the machine, it installs Docker automatically as part of this same command — there's nothing extra to set up first.
:::

Verify the install:

```bash
corefix --version
```

---

## Scanner Images

`corefix` runs the scanners as Docker containers. The installer pulls both images for you, so your first scan starts right away.

| Image | Used by | What's inside |
|---|---|---|
| [`corefixhq/cfix`](https://hub.docker.com/r/corefixhq/cfix) | `corefix code` | The code scanners, plus the **OpenCode** coding agent that CodeFix uses to apply fixes |
| [`corefixhq/cfix-web-chromium`](https://hub.docker.com/r/corefixhq/cfix-web-chromium) | `corefix web` | The web scanners, plus **Chromium**, which the scanner uses for authenticated scans |


::: tip NOTE:
The OpenCode agent ships as part of the `cfix` code scanner image, and Chromium ships inside `cfix-web-chromium` as part of the web scanner — there is nothing extra to install for either.
:::



All CoreFix images are listed at [hub.docker.com/u/corefixhq](https://hub.docker.com/u/corefixhq).

### Update the images

By default, `corefix code` and `corefix web` check for a newer image before each scan and pull it automatically — you don't need to update manually.

To pull the latest scanner images ahead of time, run:

```bash
corefix update
```

---

## Next Step — Log In

Once installed, sign in with your browser:

```bash
corefix login
```

Or skip the login and export an API key. See [Creating an API Key](./api_docs):

```bash
export CFIX_API_KEY=<your-api-key>
```

Then run your first scan from the root of a repository:

```bash
corefix code
```

---

## Next Steps

- [CoreFix CLI — Overview](./docker-cli) — commands, flags and authentication
- [Code Scanner — Standalone Usage](./code-agent-usage) — scan code and fix findings with CodeFix
- [Web Scanner — Standalone Usage](./web-agent-usage) — scan a live web application
- [Code Scanning CI/CD Integration](./cicd-integration) — install and run `corefix` in your pipeline
