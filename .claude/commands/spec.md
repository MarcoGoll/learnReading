---
description: Erarbeitet die detaillierte Spezifikation für ein Epic
argument-hint: <EpicName>
---

Epic-Identifier: $1

Du führst den `/spec`-Schritt des Spec-Driven-Development-Workflows für das Epic "$1" aus. Ziel ist die Datei `docs/specs/$1.md`.

## Voraussetzungen

1. Prüfe, ob `docs/epics.md` existiert und ein Epic "$1" enthält. Falls nicht, weise den Nutzer darauf hin und frage, ob das Epic trotzdem spontan definiert werden soll oder ob zuerst `/brainstorming` laufen soll.
2. Lies zur Orientierung `docs/roadmap.md` (Tech-Stack, Gesamtkontext) und `docs/epics.md` (Abgrenzung zu anderen Epics).

## Ablauf

1. Identifiziere die offenen Umsetzungsfragen für dieses Epic - je nach Art des Epics z. B. Datenmodell, Schnittstellen/API-Design, UI-Verhalten, Fehler-/Randfälle, Abhängigkeiten zu anderen Epics, nicht-funktionale Anforderungen, Akzeptanzkriterien.
2. Stelle jede dieser Entscheidungen als Multiple-Choice-Frage über das AskUserQuestion-Tool:
   - Die von dir empfohlene Variante steht immer an erster Stelle in der Optionsliste und ist im Label als "(Recommended)" gekennzeichnet.
   - Biete 2-4 sinnvolle, klar unterscheidbare Optionen an.
   - Der Nutzer kann die empfohlene Option einfach bestätigen, eine der Alternativen wählen, oder über die automatisch verfügbare "Other"-Option eine eigene Beschreibung angeben.
   - Begründe deine Empfehlung kurz in der Beschreibung der Option.
3. Arbeite so alle offenen Fragen ab, bis die Spezifikation vollständig genug ist, um direkt implementiert zu werden. Frage bei Bedarf auch mehrstufig nach (Rückfragen zu einer gegebenen Antwort), bevor du zur nächsten Entscheidung übergehst.
4. Schreibe das Ergebnis strukturiert nach `docs/specs/$1.md`:
   - Übersicht / Ziel des Epics
   - Getroffene Entscheidungen (jeweils mit kurzer Begründung)
   - Technische Details (Datenmodell, Schnittstellen, Ablauf)
   - Akzeptanzkriterien
   - Offene Risiken / Annahmen
5. Aktualisiere den Status des Epics "$1" in `docs/epics.md` auf `spezifiziert`.
6. Bestätige dem Nutzer den Abschluss und weise auf den nächsten Schritt hin: `/dev $1`.
