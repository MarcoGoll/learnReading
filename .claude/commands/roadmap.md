---
description: Erstellt die Projekt-Roadmap durch einen geführten Dialog mit dem Nutzer
---

Du führst den `/roadmap`-Schritt des Spec-Driven-Development-Workflows aus. Ziel dieses Schritts ist die Datei `docs/roadmap.md`.

## Ablauf

1. Falls `docs/roadmap.md` bereits existiert, zeige den aktuellen Stand kurz zusammengefasst und frage, ob überarbeitet oder neu begonnen werden soll.
2. Bitte den Nutzer um eine freie Beschreibung des Projekts als Fließtext: worum es geht, welches Problem gelöst wird, wer die Nutzer sind, was das Ziel ist.
3. Prüfe zuerst das aktuelle Repository auf Hinweise zum Tech-Stack (z. B. package.json, requirements.txt, go.mod, pom.xml, vorhandener Code) und die vom Nutzer gelieferte Beschreibung auf technische Rahmenbedingungen:
   - Programmiersprache
   - Framework
   - Zielplattform (Web, CLI, Mobile, Backend-Service, ...)
   - Datenbank / Persistenz
   - Deployment-/Laufzeitumgebung
4. Für jede Angabe, die weder im Repo noch im Fließtext eindeutig erkennbar ist, frage gezielt nach, bevor du fortfährst. Nutze dafür wenn möglich das AskUserQuestion-Tool mit konkreten, gängigen Optionen (z. B. übliche Frameworks für die genannte Sprache) statt offener Fragen. Frage nicht nach Dingen, die bereits eindeutig aus Text oder Repo hervorgehen.
5. Fasse Projektbeschreibung, Tech-Stack und grobe Meilensteine/Phasen zu einer Roadmap zusammen. Die einzelnen Epics selbst werden hier noch NICHT erarbeitet - das passiert erst in `/brainstorming`.
6. Schreibe das Ergebnis strukturiert nach `docs/roadmap.md`:
   - Vision / Zielsetzung
   - Zielgruppe
   - Tech-Stack (Sprache, Framework, Datenbank, Plattform, Deployment)
   - Grobe Meilensteine/Phasen
   - Offene Fragen / Annahmen
7. Bestätige dem Nutzer kurz, was gespeichert wurde, und weise auf den nächsten Schritt hin: `/brainstorming`.
