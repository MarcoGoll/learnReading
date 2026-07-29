---
description: Works out the detailed specification for an epic
argument-hint: <EpicName>
---

Epic identifier: $1

You are executing the `/spec` step of the spec-driven-development workflow for the epic "$1". The target is the file `docs/specs/$1.md`.

## Prerequisites

1. Check whether `docs/epics.md` exists and contains an epic "$1". If not, point this out to the user and ask whether the epic should be defined spontaneously anyway, or whether `/brainstorming` should run first.
2. For orientation, read `docs/roadmap.md` (tech stack, overall context) and `docs/epics.md` (delineation from other epics).

## Process

1. Identify the open implementation questions for this epic - depending on the type of epic, e.g. data model, interface/API design, UI behavior, error/edge cases, dependencies on other epics, non-functional requirements, acceptance criteria.
2. Present each of these decisions as a multiple-choice question via the AskUserQuestion tool:
   - The option you recommend is always listed first and labeled "(Recommended)".
   - Offer 2-4 sensible, clearly distinguishable options.
   - The user can simply confirm the recommended option, choose one of the alternatives, or provide their own description via the automatically available "Other" option.
   - Briefly justify your recommendation in the option's description.
3. Work through all open questions this way until the specification is complete enough to be implemented directly. Ask multi-step follow-up questions where needed (clarifying a given answer) before moving to the next decision.
4. Write the result in a structured way to `docs/specs/$1.md`:
   - Overview / goal of the epic
   - Decisions made (each with a short justification)
   - Technical details (data model, interfaces, flow)
   - Acceptance criteria
   - Open risks / assumptions
5. Update the status of epic "$1" in `docs/epics.md` to `specified`.
6. Confirm completion to the user and point to the next step: `/dev $1`.
