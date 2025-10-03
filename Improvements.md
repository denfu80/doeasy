### Avatar & User

#### Probleme
- Wenn ein Nutzer alleine ist, kommt er nicht auf die Nutzerliste
-- evtl. offline Avatare anzeigen?
- Es gibt keine Möglichkeit alte Offline-Nutzer zu entfernen
- http://localhost:3000/list/real-trains-care/users/ geht ein Nutzer direkt auf die Nutzerseite und klickt zurück kommt er auf die vorherige Seite (nicht die Startseite)

##### Überdenken: Anzeige der Nutzer
Avatar-Anzeige (todo-app/guest-todo-app): 2 Minuten
- Nur kürzlich aktive User (letzte 2 Minuten)
- Für Live-Kollaboration relevant

Users-Page (/list/[id]/users): 24 Stunden
- Längere Historie (letzte 24 Stunden)
- Für User-Management gedacht


### UI/UX

- Auf kleinen Bildschirmen (Handy) verschieben sich Avatare, Pin und Link ungünstig
- Auf großen Bildschirmen (Desktop) ist viel leerer Platz

### Algmein

- Es gibt keine Möglichkeit auf die Startseite zu kommen (Logo als Link?)

### Todo Liste
- erledigt von steht da nicht sondern nur wer es erstellt hat
- item log

## Ideen

- Eigene Farbe ändern
- Thema ändern: z.b. mach.einfach -> schenk.einfach
- Hovereffekt auf Todos für mehr optionen (momentan nur löschen)
- Drag & Drop Sortierung der Todos
- Extended mode
- Das bin ich feature. Erlaube es einem nutzer sich selbst aus der liste existierender Nutzer auszuwählen
- Tipp: Änder deinen Namen
- Random tips
- Sticky Header: Add new Todo
