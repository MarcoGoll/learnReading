# Spec-Driven Development Workflow

Dieses Projekt folgt einem festen Spec-Driven-Development-Workflow über vier Slash-Commands, die in dieser Reihenfolge ausgeführt werden:

1. `/roadmap` - erarbeitet Vision, Zielgruppe und Tech-Stack im Dialog -> `docs/roadmap.md`
2. `/brainstorming` - erarbeitet grobe Epics passend zur Roadmap plus optionale weitere Funktionen -> `docs/epics.md`
3. `/spec <EpicName>` - klärt Umsetzungsdetails für ein einzelnes Epic per Multiple-Choice-Rückfragen (empfohlene Option vorausgewählt) -> `docs/specs/<EpicName>.md`
4. `/dev <EpicName>` - implementiert das Epic anhand seiner Spezifikation

Ein Epic wird erst spezifiziert (`/spec`), nachdem es in `docs/epics.md` auftaucht, und erst implementiert (`/dev`), nachdem eine Spezifikation unter `docs/specs/` existiert. Der Status eines Epics in `docs/epics.md` durchläuft `geplant -> spezifiziert -> in Arbeit -> fertig`.

## Verzeichnisstruktur

- `docs/roadmap.md` - Projekt-Roadmap (Vision, Tech-Stack, Meilensteine)
- `docs/epics.md` - Liste aller Epics mit Status
- `docs/specs/<EpicName>.md` - Detailspezifikation je Epic
- `docs/change-log.md` - Protokoll aller Code-Änderungen (siehe Abschnitt "Change-Log")
- `.claude/commands/` - Definition der Workflow-Commands (`roadmap`, `brainstorming`, `spec`, `dev`)

## Coding Conventions

Diese Vorgaben gelten für jede Implementierung, unabhängig vom Tech-Stack des jeweiligen Projekts (siehe `docs/roadmap.md`):

- Jede Funktion/Methode erhält einen Doc-Comment im für die Sprache idiomatischen Format (z. B. JSDoc in JS/TS, Docstrings in Python, Doc-Comments in Rust/Go/Java). Der Text des Kommentars ist auf Englisch, unabhängig von der Sprache der Konversation mit dem Nutzer.
- Keine Emojis/Smileys - weder in Code, Kommentaren, Commit-Messages noch in Konsolen-/UI-Ausgaben. Werden Icons benötigt (z. B. für Buttons), von https://fonts.google.com/icons herunterladen und unter `assets/icons/` ablegen.
- Funktionslänge nach Möglichkeit max. 14 Zeilen Code, Dateilänge nach Möglichkeit max. 400 Zeilen Code. Ausnahmen sind erlaubt, wenn sachlich begründet - aber die Richtwerte gelten als Regel, nicht als Ausnahme.
- Variablennamen sind immer sprechend (z. B. `paramName`, `book`, `testName`), keine einzelnen Buchstaben - Ausnahme: Schleifenzähler (`for (let i = 0; ...)`).
- Funktions- und Variablennamen immer auf Englisch und in camelCase.
- CSS/SCSS immer im BEM-Namensschema.
- Bei fachlichen oder technischen Entscheidungen ohne eindeutig richtige Lösung nie einfach annehmen: über das AskUserQuestion-Tool nachfragen, mit einer empfohlenen Option plus kurzer Begründung, warum sie empfohlen wird.

## Change-Log

Jede Code-Änderung wird in `docs/change-log.md` protokolliert: fortlaufende ID (`CHG-XXXX`), ISO-Zeitstempel, Kurzbeschreibung, betroffene Dateien. Vor einem neuen Eintrag die Datei lesen, um die nächste freie ID zu ermitteln. Darüber kann der Nutzer später auf einzelne Änderungen verweisen, z. B. "mach CHG-0012 rückgängig" oder "passe CHG-0012 nochmal an".

## Git-Konventionen

Commit-Messages werden immer auf Englisch verfasst, unabhängig von der Sprache der Konversation mit dem Nutzer, und folgen der Konvention von https://ec.europa.eu/component-library/v1.15.0/eu/docs/conventions/git/:

- Format: `<type>(<scope>): <subject>`, danach Leerzeile, Body, Leerzeile, Footer. Header ist verpflichtend, `(<scope>)` optional.
- Erlaubte Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- Subject im Imperativ Präsens (`add`, nicht `added`/`adds`), kein großgeschriebener erster Buchstabe, kein Punkt am Ende.
- Keine Zeile länger als 100 Zeichen.
- Body (falls vorhanden) ebenfalls im Imperativ Präsens; erklärt die Motivation der Änderung im Kontrast zum vorherigen Verhalten.
- Breaking Changes im Footer mit `BREAKING CHANGE:` kennzeichnen.
- Revert-Commits beginnen mit `revert:` gefolgt vom Header des rückgängig gemachten Commits; im Body: `This reverts commit <hash>`.

## Konventionen für die Commands

- Rückfragen zu offenen Punkten in `/spec` immer über das AskUserQuestion-Tool stellen: empfohlene Variante zuerst und als "(Recommended)" markiert, 2-4 Alternativen, freie Beschreibung bleibt über "Other" immer möglich.
- Technische Rahmenbedingungen (Sprache, Framework, Datenbank, Plattform) in `/roadmap` aktiv erfragen, wenn sie weder im Repo noch in der Nutzerbeschreibung erkennbar sind - nicht raten.
- Epics in `/brainstorming` bewusst grob halten; Implementierungsentscheidungen gehören in `/spec`, nicht in `/brainstorming`.
