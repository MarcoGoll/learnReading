---
description: Implementiert ein Epic anhand seiner Spezifikation
argument-hint: <EpicName>
---

Epic-Identifier: $1

Du führst den `/dev`-Schritt des Spec-Driven-Development-Workflows für das Epic "$1" aus.

## Voraussetzungen

1. Lies `docs/specs/$1.md`. Existiert die Datei nicht, weise darauf hin, dass zuerst `/spec $1` ausgeführt werden muss, und brich ab.
2. Lies zusätzlich `docs/roadmap.md` (Tech-Stack, Konventionen) sowie `CLAUDE.md`, falls vorhanden, für projektweite Konventionen.

## Ablauf

1. Plane anhand der Spezifikation die Implementierung: betroffene Dateien, sinnvolle Reihenfolge der Schritte, Abhängigkeiten zu bereits implementierten Epics (Status `fertig` in `docs/epics.md`).
2. Setze die Spezifikation vollständig um - Code, Tests und ggf. Migrationen/Konfiguration - orientiert an den in `docs/specs/$1.md` festgelegten Akzeptanzkriterien.
3. Ist die Spezifikation an einer Stelle unklar, widersprüchlich oder unvollständig, frage gezielt nach, statt zu raten oder unausgesprochene Annahmen zu treffen.
4. Prüfe nach der Implementierung jedes Akzeptanzkriterium aus der Spezifikation einzeln gegen den entstandenen Code.
5. Aktualisiere den Status des Epics "$1" in `docs/epics.md` auf `fertig` - nur wenn alle Akzeptanzkriterien erfüllt sind. Andernfalls auf `in Arbeit` mit kurzer Notiz, was fehlt.
6. Fasse zum Abschluss kurz zusammen, was umgesetzt wurde und was (falls etwas) noch offen ist.
