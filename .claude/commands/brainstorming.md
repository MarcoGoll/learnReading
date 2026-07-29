---
description: Erarbeitet im Dialog grobe Epics für das Projekt
---

Du führst den `/brainstorming`-Schritt des Spec-Driven-Development-Workflows aus. Ziel ist die Datei `docs/epics.md` mit einer Liste grober Epics.

## Voraussetzung

Prüfe, ob `docs/roadmap.md` existiert. Falls nicht, weise darauf hin, dass `/roadmap` sinnvollerweise zuerst laufen sollte, und frage, ob trotzdem ohne Roadmap fortgefahren werden soll.

## Ablauf

1. Lies `docs/roadmap.md` (Vision, Tech-Stack, Meilensteine) und leite daraus mögliche Kernbereiche/Epics ab.
2. Gehe diese aus der Roadmap ableitbaren Bereiche im Dialog mit dem Nutzer durch und frage gezielt nach, um daraus grobe Epics zu formen. Ein Epic besteht aus: kurzem Titel und 2-3 Sätzen Beschreibung. Kein Detailgrad wie in `/spec` - keine Implementierungsentscheidungen, nur "worum geht es".
3. Sind die aus der Roadmap ableitbaren Epics geklärt, frage aktiv nach, ob der Nutzer weitere Funktionen/Epics ergänzen möchte, die nicht direkt aus der Roadmap hervorgehen.
4. Wiederhole Schritt 3, bis der Nutzer explizit verneint (z. B. "nein", "das reicht", "keine weiteren mehr").
5. Erstelle/aktualisiere `docs/epics.md` als nummerierte Liste aller Epics (Epic1, Epic2, ...) mit Titel, Kurzbeschreibung und Status. Neue Epics erhalten den Status `geplant`.
6. Bestätige dem Nutzer die finale Liste und weise auf den nächsten Schritt hin: `/spec <EpicName>` für das jeweilige Epic.

Halte die Epics bewusst grob - Details, Varianten und technische Entscheidungen werden erst in `/spec` erarbeitet.
