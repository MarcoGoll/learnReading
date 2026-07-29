# Spec-Driven Development Template (Claude Code)

Vorlage für neue Projekte, die mit Claude Code nach einem festen Spec-Driven-Development-Workflow entwickelt werden sollen. Details zum Workflow und den Konventionen stehen in [`CLAUDE.md`](./CLAUDE.md).

## Workflow

1. **`/roadmap`** - Claude fragt nach einer Fließtext-Beschreibung des Projekts und klärt fehlende technische Rahmenbedingungen (Sprache, Framework, Datenbank, Plattform). Ergebnis: `docs/roadmap.md`.
2. **`/brainstorming`** - Claude erarbeitet passend zur Roadmap grobe Epics und fragt danach aktiv nach weiteren Funktionen, bis nichts mehr ergänzt wird. Ergebnis: `docs/epics.md`.
3. **`/spec <EpicName>`** - Claude klärt die Umsetzung eines Epics per Multiple-Choice-Rückfragen (empfohlene Option immer vorausgewählt, Alternativen wählbar, eigene Beschreibung jederzeit möglich). Ergebnis: `docs/specs/<EpicName>.md`.
4. **`/dev <EpicName>`** - Claude implementiert das Epic anhand der zugehörigen Spezifikation.

Ein Epic durchläuft dabei die Stationen `geplant -> spezifiziert -> in Arbeit -> fertig` (Status wird in `docs/epics.md` gepflegt).

## Neues Projekt aus diesem Template starten

1. Repo als neues Projekt kopieren (z. B. `git clone <dieses-repo> mein-projekt && cd mein-projekt && rm -rf .git && git init`).
2. In Claude Code öffnen und `/roadmap` ausführen.
3. Danach der Reihe nach `/brainstorming`, dann pro Epic `/spec <EpicName>` gefolgt von `/dev <EpicName>`.

## Struktur

```
.claude/commands/     Workflow-Commands (roadmap, brainstorming, spec, dev)
CLAUDE.md              Workflow-, Coding- und Verzeichniskonventionen für Claude Code
docs/change-log.md     Protokoll aller Code-Änderungen (CHG-IDs), Teil des Templates
docs/roadmap.md        Wird von /roadmap erzeugt
docs/epics.md          Wird von /brainstorming erzeugt
docs/specs/            Wird von /spec pro Epic erzeugt
```

`docs/roadmap.md`, `docs/epics.md` und `docs/specs/` entstehen erst beim ersten Durchlauf der jeweiligen Commands. `docs/change-log.md` ist bereits Teil des Templates, da jede Code-Änderung protokolliert wird - unabhängig davon, welcher Workflow-Schritt gerade läuft.
