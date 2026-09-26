---
hide_title: true
sidebar_label: API Keys
---

## Creating an API Key

An API key lets the CoreFix CLI and the CoreFix VS Code extension push scan results to the [app.corefix.dev](https://app.corefix.dev) platform.

---

## Create a Key

1. Go to [app.corefix.dev/api-keys](https://app.corefix.dev/api-keys).
2. Click the **+** (plus) icon at the top corner of the table to add an API key.
3. Select the **workspace** the key will be bound to.
4. Set an **expiry** for the key.

::: tip What is a workspace?
A workspace is a collection of repositories, along with the collaborators you've invited to it.
:::

---

## Things to Know

### A key is bound to one workspace

Each API key is bound to exactly one workspace. Results pushed with the key go to that workspace. To push results to a different workspace, create a separate key for it.

### A key can only push results

The API key is for pushing results only. It cannot be used to view or read data, or to delete data.

### Keys expire

You set an expiry date when you create the key. Once a key expires, it stops working and you'll need to create a new one.

### There is no regenerate option

You can't regenerate a key. Regenerating would be the same as deleting the key and creating a new one, so do exactly that: delete the old key, then create a new one.

---

## Use the Key

The CLI and the VS Code extension use the key to push results. For the CLI, export it as `CFIX_API_KEY`:

```bash
export CFIX_API_KEY=<your-api-key>
corefix code
```

Or run `corefix login` to sign in with your browser instead. See [CoreFix CLI — Overview](./docker-cli#authentication) for how the CLI finds your credentials.

---

## Related

- [CoreFix CLI — Overview](./docker-cli)
- [Installing the CoreFix CLI](./install-cli)
- [Code Scanning CI/CD Integration](./cicd-integration) — use an API key in your pipeline
