---
id: 003
title: "Fix Invalid next.config.js Options"
stage: "misc"
date_iso: "2026-01-23"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "huzaifa"
command: "fix next.config.js"
labels: ["configuration", "nextjs", "bug-fix"]
spec: null
ticket: null
adr: null
pr: null
files_yaml:
  - "/home/huzaifa/Hackathon/Todo-app/frontend/next.config.js"
tests_yaml: []
---

# Fix Invalid next.config.js Options

## User Intent
Fix the warning about invalid next.config.js options where 'appDir' was incorrectly placed under 'experimental'.

## Solution Applied
Removed the deprecated 'appDir' option from the experimental section of next.config.js. The appDir configuration is no longer valid in recent Next.js versions and was causing the warning.

## Changes Made
- Removed the experimental.appDir option from next.config.js
- Kept the reactStrictMode setting which is still valid
- Cleaned up the configuration to follow current Next.js standards

## Files Modified
- frontend/next.config.js: Removed invalid experimental.appDir option

## Verification
The configuration now passes Next.js validation without warnings while maintaining the desired behavior.

## PROMPT_TEXT
correct this and resolved in frontend ⚠ Invalid next.config.js options detected: ⚠ Unrecognized key(s) in object: 'appDir' at "experimental" ⚠ See more info here: https://nextjs.org/docs/messages/invalid-next-config

## RESPONSE_TEXT
Fixed the invalid next.config.js options by removing the deprecated 'appDir' option from the experimental section. The updated configuration now follows current Next.js standards and eliminates the warning while maintaining the reactStrictMode setting.