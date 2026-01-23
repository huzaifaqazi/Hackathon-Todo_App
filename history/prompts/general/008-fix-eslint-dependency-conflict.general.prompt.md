---
id: 008
title: "Fix ESLint Dependency Conflict"
stage: "misc"
date_iso: "2026-01-23"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "fix-next-config-options"
user: "huzaifa"
command: "fix eslint dependency conflict"
labels: ["dependencies", "eslint", "vercel", "bug-fix"]
spec: null
ticket: null
adr: null
pr: null
files_yaml:
  - "/home/huzaifa/Hackathon/Todo-app/frontend/package.json"
tests_yaml: []
---

# Fix ESLint Dependency Conflict

## User Intent
Fix Vercel deployment error due to peer dependency conflict between ESLint 9 and eslint-config-next 14.2.15.

## Solution Applied
Downgraded ESLint from version 9 to version 8 to be compatible with eslint-config-next 14.2.15, which only supports ESLint 7 or 8.

## Changes Made
- Changed ESLint version from ^9.9.0 to ^8.57.0 in devDependencies

## Files Modified
- frontend/package.json: Updated ESLint to be compatible with eslint-config-next

## Verification
- ESLint 8 is compatible with eslint-config-next 14.2.15
- Peer dependency conflict should be resolved
- Vercel deployment should now succeed

## PROMPT_TEXT
solve this issue ya error a ha bar bar error q a rhe han  16:03:42.199 Running build in Washington, D.C., USA (East) – iad1
16:03:42.200 Build machine configuration: 2 cores, 8 GB
16:03:42.327 Cloning github.com/huzaifaqazi/Hackathon-Todo_App (Branch: main, Commit: af21464)
16:03:42.328 Previous build caches not available.
16:03:42.584 Cloning completed: 257.000ms
16:03:43.768 Running "vercel build"
16:03:44.648 Vercel CLI 50.4.10
16:03:44.924 Installing dependencies...
16:03:47.525 npm error code ERESOLVE
16:03:47.526 npm error ERESOLVE unable to resolve dependency tree
16:03:47.527 npm error
16:03:47.527 npm error While resolving: todo-frontend@0.1.0
16:03:47.528 npm error Found: eslint@9.39.2
16:03:47.528 npm error node_modules/eslint
16:03:47.528 npm error   dev eslint@"^9.9.0" from the root project
16:03:47.529 npm error
16:03:47.529 npm error Could not resolve dependency:
16:03:47.530 npm error peer eslint@"^7.23.0 || ^8.0.0" from eslint-config-next@14.2.35
16:03:47.530 npm error node_modules/eslint-config-next
16:03:47.531 npm error   dev eslint-config-next@"^14.2.15" from the root project
16:03:47.531 npm error
16:03:47.531 npm error Fix the upstream dependency conflict, or retry
16:03:47.532 npm error this command with --force or --legacy-peer-deps
16:03:47.532 npm error to accept an incorrect (and potentially broken) dependency resolution.

## RESPONSE_TEXT
Fixed the dependency conflict by downgrading ESLint from version 9 to version 8. Changed eslint from ^9.9.0 to ^8.57.0 in the devDependencies to be compatible with eslint-config-next 14.2.15, which only supports ESLint 7 or 8.