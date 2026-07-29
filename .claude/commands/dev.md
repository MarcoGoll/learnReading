---
description: Implements an epic based on its specification
argument-hint: <EpicName>
---

Epic identifier: $1

You are executing the `/dev` step of the spec-driven-development workflow for the epic "$1".

## Prerequisites

1. Read `docs/specs/$1.md`. If the file does not exist, point out that `/spec $1` must be run first, and abort.
2. Also read `docs/roadmap.md` (tech stack, conventions) and `CLAUDE.md`, if present, for project-wide conventions.

## Process

1. Plan the implementation based on the specification: affected files, sensible order of steps, dependencies on already-implemented epics (status `done` in `docs/epics.md`).
2. Fully implement the specification - code, tests, and any migrations/configuration - based on the acceptance criteria set out in `docs/specs/$1.md`.
3. If the specification is unclear, contradictory, or incomplete at any point, ask specifically rather than guessing or making unspoken assumptions.
4. After implementation, check each acceptance criterion from the specification individually against the resulting code.
5. Update the status of epic "$1" in `docs/epics.md` to `done` - only if all acceptance criteria are met. Otherwise to `in progress` with a short note on what is missing.
6. Briefly summarize at the end what was implemented and what (if anything) is still open.
