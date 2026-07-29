# Spec-Driven Development Workflow

This project follows a fixed spec-driven-development workflow across four slash commands, executed in this order:

1. `/roadmap` - elaborates vision, target audience, and tech stack in a dialog -> `docs/roadmap.md`
2. `/brainstorming` - elaborates rough epics matching the roadmap plus optional further features -> `docs/epics.md`
3. `/spec <EpicName>` - clarifies implementation details for a single epic via multiple-choice follow-up questions (recommended option pre-selected) -> `docs/specs/<EpicName>.md`
4. `/dev <EpicName>` - implements the epic based on its specification

An epic is only specified (`/spec`) once it appears in `docs/epics.md`, and only implemented (`/dev`) once a specification exists under `docs/specs/`. An epic's status in `docs/epics.md` progresses through `planned -> specified -> in progress -> done`.

## Directory Structure

- `docs/roadmap.md` - project roadmap (vision, tech stack, milestones)
- `docs/epics.md` - list of all epics with status
- `docs/specs/<EpicName>.md` - detailed specification per epic
- `docs/change-log.md` - log of all code changes (see "Change Log" section)
- `.claude/commands/` - definition of the workflow commands (`roadmap`, `brainstorming`, `spec`, `dev`)

## Language

- Conversation with the user can happen in any language (e.g. German).
- All files - code, comments, documentation, commit messages - are always written in English, regardless of the conversation language.

## Coding Conventions

These rules apply to every implementation, regardless of the tech stack of the respective project (see `docs/roadmap.md`):

- Every function/method gets a doc comment in the format idiomatic to the language (e.g. JSDoc in JS/TS, docstrings in Python, doc comments in Rust/Go/Java). The comment text is always in English.
- No emojis/smileys - neither in code, comments, commit messages, nor console/UI output. If icons are needed (e.g. for buttons), download them from https://fonts.google.com/icons and place them under `assets/icons/`.
- Function length should not exceed 14 lines of code where possible; file length should not exceed 400 lines of code where possible. Exceptions are allowed when justified - but the guideline is the rule, not the exception.
- Variable names are always descriptive (e.g. `paramName`, `book`, `testName`), never single letters - exception: loop counters (`for (let i = 0; ...)`).
- Function and variable names are always in English and in camelCase.
- CSS/SCSS always uses the BEM naming scheme.
- Never just assume when there is no clearly correct solution for a functional or technical decision: ask via the AskUserQuestion tool, with one recommended option plus a short justification for why it is recommended.

## Change Log

Every code change is logged in `docs/change-log.md`: a running ID (`CHG-XXXX`), ISO timestamp, short description, affected files. Read the file before adding a new entry to determine the next free ID. This lets the user later refer to individual changes, e.g. "revert CHG-0012" or "adjust CHG-0012 again".

## Git Conventions

Commit messages are always written in English, regardless of the conversation language, and follow the convention at https://ec.europa.eu/component-library/v1.15.0/eu/docs/conventions/git/:

- Format: `<type>(<scope>): <subject>`, followed by a blank line, body, blank line, footer. The header is mandatory, `(<scope>)` is optional.
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- Subject in imperative present tense (`add`, not `added`/`adds`), no capitalized first letter, no period at the end.
- No line longer than 100 characters.
- Body (if present) also in imperative present tense; explains the motivation for the change in contrast to the previous behavior.
- Mark breaking changes in the footer with `BREAKING CHANGE:`.
- Revert commits start with `revert:` followed by the header of the reverted commit; body: `This reverts commit <hash>`.

## Command Conventions

- Ask follow-up questions for open points in `/spec` always via the AskUserQuestion tool: recommended option first and labeled "(Recommended)", 2-4 alternatives, free-form description always available via "Other".
- Actively ask about technical constraints (language, framework, database, platform) in `/roadmap` when they are not recognizable from the repo or the user's description - never guess.
- Keep epics in `/brainstorming` deliberately rough; implementation decisions belong in `/spec`, not in `/brainstorming`.
