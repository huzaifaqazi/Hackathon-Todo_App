---
id: 007
title: "Fix React-NextJS Dependency Conflict"
stage: "misc"
date_iso: "2026-01-23"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "fix-next-config-options"
user: "huzaifa"
command: "fix dependency conflict"
labels: ["dependencies", "react", "nextjs", "vercel", "bug-fix"]
spec: null
ticket: null
adr: null
pr: null
files_yaml:
  - "/home/huzaifa/Hackathon/Todo-app/frontend/package.json"
tests_yaml: []
---

# Fix React-NextJS Dependency Conflict

## User Intent
Fix Vercel deployment error due to peer dependency conflict between React 19 and Next.js 14.

## Solution Applied
Updated React and React-DOM versions from ^19.0.0 to ^18.3.1 to be compatible with Next.js 14, which doesn't support React 19 yet. Also updated the corresponding type definitions.

## Changes Made
- Changed React version from ^19.0.0 to ^18.3.1
- Changed React-DOM version from ^19.0.0 to ^18.3.1
- Updated @types/react from ^19.0.0 to ^18.3.5
- Updated @types/react-dom from ^19.0.0 to ^18.3.0

## Files Modified
- frontend/package.json: Updated React and related dependencies to be compatible with Next.js 14

## Verification
- React 18 is compatible with Next.js 14
- Peer dependency conflict should be resolved
- Vercel deployment should now succeed

## PROMPT_TEXT
ya deploy time error a rha ha npm error node_modules/react
npm error   react@"^19.0.0" from the root project
npm error
npm error Could not resolve dependency:
npm error peer react@"^18.2.0" from next@14.2.35
npm error node_modules/next
npm error   next@"^14.2.15" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry
npm error this command with --force or --legacy-peer-deps
npm error to accept an incorrect (and potentially broken) dependency resolution.

## RESPONSE_TEXT
Fixed the dependency conflict by updating React and React-DOM from version 19 to version 18 to be compatible with Next.js 14. Changed react and react-dom from ^19.0.0 to ^18.3.1, and updated the corresponding type definitions. This should resolve the Vercel deployment error.