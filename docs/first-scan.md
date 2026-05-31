---
hide_title: true
sidebar_label: Quick Start
---

## Overview

This quick start guide walks you through running your **first web application vulnerability scan in CoreFix**.

The example uses an **unauthenticated scan**, which is the fastest way to evaluate the platform because it does not require authentication scripts or credential configuration.

By the end of this guide, you will:

* Create a new web application scan
* Launch the vulnerability scan
* Monitor scan progress
* Review detected vulnerabilities

This example uses a public demo application for testing.

Example target used in this guide:

```
http://demo.testfire.net/
```

You may also use:

```
http://zero.webappsecurity.com/
http://testasp.vulnweb.com
http://testaspnet.vulnweb.com/
http://google-gruyere.appspot.com/
https://demo.owasp-juice.shop/#/
```


#### Prerequisites

Before starting this quick start tutorial, ensure the following:

* Active **CoreFix user account**
* Permission to create and run scans
* Internet access to the demo target website

---

### Step 1 — Navigate to Web Application Security

1. Log in to the **CoreFix dashboard**
2. Expand vulnerability management and navigate to **Web Application Security**
3. Click **Start New Scan**

This opens the scan configuration wizard.

---

### Step 2 — Enter Scan Details

Provide the basic information required to identify the scan.

#### Required Fields

| Field       | Description                     | Example                        |
| ----------- | ------------------------------- | ------------------------------ |
| Scan Name   | Name used to identify the scan  | Demo Web Scan                  |
| Description | Optional details about the scan | Quick start vulnerability scan |

---

### Step 3 — Configure Scan Environment

1. Select the appropriate **environment**
2. Confirm the target application URL (http://demo.testfire.net/)

For demo purposes, select a **non-production environment**.

---

### Step 4 — Add Tags (Optional)

You may add tags to organize your scans.

Example:

`quickstart`

This step is optional.

---


### Step 5 — Configure Scanner Settings
For this quick start:

* Choose **Unauthenticated Scan** from Scanner options
* No authentication setup is required
This will initiate an unauthenticated web vulnerability scan against the target application

---


### Step 6 — Scan Options

* Enable the option to save vulnerabilities, including informational and log-level findings  
* Enable **Save all scan artifacts** for future reference and analysis  

This ensures complete visibility into scan results and preserves all data for later review.

---

### Step 7 — Configure Scheduling (Optional)

Choose when the scan should run.

For this guide, select **Run Immediately**.

This step is optional.

---
### Step 8 — Link to Repository (Optional)

> This step is optional and currently in beta.

---

### Step 9 — Launch the Scan

1. Click **Launch Scan**

CoreFix will begin analyzing the web application for vulnerabilities.

---

### Step 10 — Monitor Scan Progress

1. Navigate to **Web Application Security**
2. Locate your scan
3. Monitor the scan status and progress bar

You can expand the scan to view individual jobs and execution details.

---

### Step 11 — Review Vulnerability Findings

After the scan completes:

1. Open the scan
2. Navigate to **Results**
3. Review detected vulnerabilities

Each finding includes:

* Severity
* Affected URL
* Description
* Remediation guidance


