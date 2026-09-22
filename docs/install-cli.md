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
3. **Pulls the scanner images** from Docker Hub — `corefixhq/cfix` and `corefixhq/cfix-web-chromium` (see [Scanner Images](#scanner-images)).

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

The OpenCode agent ships as part of the `cfix` code scanner image, and Chromium ships inside `cfix-web-chromium` as part of the web scanner — there is nothing extra to install for either.

All CoreFix images are listed at [hub.docker.com/u/corefixhq](https://hub.docker.com/u/corefixhq).

### Update the images

To pull the latest scanner images, run:

```bash
corefix update
```

### Skip pulling images

To skip pulling images when running code and web scans, set `COREFIX_SKIP_PULL=1`:

```bash
# For a single run
COREFIX_SKIP_PULL=1 corefix code
COREFIX_SKIP_PULL=1 corefix web --target https://your-app.com

# Or for every run in the current shell
export COREFIX_SKIP_PULL=1
```

---

## Next Step — Log In

Once installed, sign in with your browser:

```bash
corefix login
```

Or skip the login and export an API key from [Account & API Keys](https://app.corefix.dev/settings/api-keys):

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
