# Spec: Deployment (Epic21)

## Overview / Goal

Publish the game on Vercel so it can be opened via a link on laptop and tablet. Every push to `master` runs the unit tests and only deploys if they pass.

## Decisions

| Topic | Decision | Justification |
|-------|----------|---------------|
| Hosting | Vercel (free Hobby plan), connected to the GitHub repository | Chosen by the user; free, preview links per branch |
| Trigger | Push to `master` -> production deployment; other branches -> preview deployments | Automatic, no manual steps |
| Quality gate | The Vercel build runs the unit tests first; failing tests fail the build, so nothing is deployed | Broken states never reach the child |
| Visibility | Public repository and public site without personal data | Progress is only stored in the browser; personal photos are not committed |

## Technical Details

### Files

- `package.json` (no dependencies), only scripts:
  ```json
  {
    "name": "learn-reading",
    "private": true,
    "type": "module",
    "scripts": {
      "test": "node --test tests/",
      "build": "npm test && node scripts/buildDist.js"
    }
  }
  ```
- `scripts/buildDist.js` copies only the files needed at runtime (`index.html`, `css/`, `js/`, `assets/`) into `dist/`, so `docs/`, `tests/`, and `.claude/` are not published.
- `vercel.json`:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": null,
    "headers": [
      { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=604800" }] }
    ]
  }
  ```
- `dist/` is listed in `.gitignore`.

### Setup steps (one-time, done by the user with guidance)

1. Push the repository to GitHub (public).
2. In Vercel: "Add New Project" -> import the GitHub repository -> settings are taken from `vercel.json`.
3. Production branch: `master`.
4. Open the production URL on the tablet and add it to the home screen as a bookmark.

### Local development

- `python3 -m http.server` (or any static server) in the project root for development.
- `npm run build` locally to check the production build; `npx serve dist` is optional.

### Notes

- Hash routing (GameFoundation) means no rewrite rules are needed.
- localStorage is bound to the domain: progress made on a preview URL is separate from production; the child should always use the production URL.

## Acceptance Criteria

- `npm test` runs all unit tests without installing dependencies.
- `npm run build` fails when a test fails and otherwise produces `dist/` containing only runtime files.
- A push to `master` creates a production deployment on Vercel; a failing test prevents it.
- The production URL opens the game on laptop and tablet; reloading any route works.
- No files from `docs/`, `tests/`, or `.claude/` are reachable on the deployed site.

## Open Risks / Assumptions

- Requires a Vercel account linked to GitHub; the connection is made by the user.
- If the domain changes (e.g. new Vercel project), the child's progress on the old domain is not transferred.
