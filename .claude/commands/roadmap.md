---
description: Creates the project roadmap through a guided dialog with the user
---

You are executing the `/roadmap` step of the spec-driven-development workflow. The target of this step is the file `docs/roadmap.md`.

## Process

1. If `docs/roadmap.md` already exists, briefly summarize its current state and ask whether it should be revised or started over.
2. Ask the user for a free-text description of the project: what it is about, what problem it solves, who the users are, what the goal is.
3. First check the current repository for hints about the tech stack (e.g. package.json, requirements.txt, go.mod, pom.xml, existing code), and check the user's description for technical constraints:
   - Programming language
   - Framework
   - Target platform (web, CLI, mobile, backend service, ...)
   - Database / persistence
   - Deployment / runtime environment
4. For any of these that is not clearly recognizable from either the repo or the free text, ask specifically before continuing. Use the AskUserQuestion tool where possible with concrete, common options (e.g. common frameworks for the stated language) instead of open questions. Do not ask about things that are already clearly evident from the text or the repo.
5. Summarize the project description, tech stack, and rough milestones/phases into a roadmap. The individual epics themselves are NOT worked out here yet - that happens in `/brainstorming`.
6. Write the result in a structured way to `docs/roadmap.md`:
   - Vision / goal
   - Target audience
   - Tech stack (language, framework, database, platform, deployment)
   - Rough milestones/phases
   - Open questions / assumptions
7. Briefly confirm to the user what was saved, and point to the next step: `/brainstorming`.
