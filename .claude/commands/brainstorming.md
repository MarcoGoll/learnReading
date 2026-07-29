---
description: Works out rough epics for the project through dialog
---

You are executing the `/brainstorming` step of the spec-driven-development workflow. The target is the file `docs/epics.md` with a list of rough epics.

## Prerequisite

Check whether `docs/roadmap.md` exists. If not, point out that `/roadmap` should reasonably run first, and ask whether to proceed without a roadmap anyway.

## Process

1. Read `docs/roadmap.md` (vision, tech stack, milestones) and derive possible core areas/epics from it.
2. Go through these roadmap-derived areas in dialog with the user and ask targeted questions to shape them into rough epics. An epic consists of: a short title and a 2-3 sentence description. No level of detail like in `/spec` - no implementation decisions, just "what is it about".
3. Once the roadmap-derived epics are clarified, actively ask whether the user wants to add further features/epics that do not directly follow from the roadmap.
4. Repeat step 3 until the user explicitly declines (e.g. "no", "that's enough", "no more").
5. Create/update `docs/epics.md` as a numbered list of all epics (Epic1, Epic2, ...) with title, short description, and status. New epics get the status `planned`.
6. Confirm the final list to the user and point to the next step: `/spec <EpicName>` for the respective epic.

Keep epics deliberately rough - details, variants, and technical decisions are only worked out in `/spec`.
