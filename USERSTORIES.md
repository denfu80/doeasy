# User Stories für mach.einfach

## 🎯 Core Features

### Liste erstellen und teilen
- **Als Nutzer** möchte ich auf der Homepage auf "MACHEN" klicken und sofort eine neue Todo-Liste erstellen, **damit** ich schnell loslegen kann ohne Registrierung
- **Als Nutzer** möchte ich den Link zu meiner Liste kopieren und teilen können, **damit** andere sofort mitmachen können
- **Als Nutzer** möchte ich über eine eindeutige URL zu einer bestehenden Liste gelangen, **damit** ich einfach beitreten kann

### Todo-Management
- **Als Nutzer** möchte ich neue Todos zur Liste hinzufügen, **damit** ich Aufgaben festhalten kann
- **Als Nutzer** möchte ich Todos als erledigt markieren/unmarkieren, **damit** ich den Fortschritt verfolgen kann
- **Als Nutzer** möchte ich Todos inline editieren können, **damit** ich Texte schnell anpassen kann
- **Als Nutzer** möchte ich Todos löschen können, **damit** ich irrelevante Einträge entfernen kann
- **Als Nutzer** möchte ich dass unvollständige Todos oben stehen, **damit** ich sofort sehe was zu tun ist

### Smart Delete & Mülleimer-System
- **Als Nutzer** möchte ich dass gelöschte Todos nicht sofort verschwinden, **damit** ich sie bei Bedarf wiederherstellen kann
- **Als Nutzer** möchte ich eine sofortige Undo-Option nach dem Löschen, **damit** ich versehentliche Löschungen rückgängig machen kann
- **Als Nutzer** möchte ich einen Mülleimer sehen der alle gelöschten Todos anzeigt, **damit** ich den Überblick behalte
- **Als Nutzer** möchte ich einzelne Todos aus dem Mülleimer wiederherstellen können, **damit** ich flexibel entscheiden kann
- **Als Nutzer** möchte ich einzelne Todos endgültig löschen können, **damit** ich irrelevante Einträge permanent entfernen kann
- **Als Nutzer** möchte ich alle Todos im Mülleimer auf einmal löschen können, **damit** ich schnell aufräumen kann
- **Als Nutzer** möchte ich eine Bestätigung vor dem endgültigen Löschen, **damit** ich keine wichtigen Todos verliere
- **Als Nutzer** möchte ich dass der Mülleimer nur die letzten gelöschten Todos speichert, **damit** er nicht überfüllt wird
- **Als Nutzer** möchte ich sehen wer ein Todo gelöscht hat, **damit** ich bei Fragen den richtigen Ansprechpartner habe

### Real-time Kollaboration
- **Als Nutzer** möchte ich sofort sehen wenn andere Nutzer Todos hinzufügen/ändern, **damit** wir synchron arbeiten können
- **Als Nutzer** möchte ich sehen wer gerade online ist, **damit** ich weiß mit wem ich zusammenarbeite
- **Als Nutzer** möchte ich dass Änderungen ohne Seitenladen erscheinen, **damit** die Zusammenarbeit flüssig ist

## 👤 User Identity & Avatar System

### Nutzer-Identität
- **Als Nutzer** möchte ich einen lustigen automatischen Namen bekommen wenn ich zum ersten Mal eine Liste erstelle, **damit** ich sofort erkennbar bin ohne manuell etwas eingeben zu müssen
- **Als Nutzer** möchte ich meinen Namen jederzeit einfach ändern können, **damit** ich mich personalisieren kann
- **Als Nutzer** möchte ich meinen Namen durch Klicken editieren können, **damit** es schnell und intuitiv ist

### Avatar-System
- **Als Nutzer** möchte ich meinen Avatar sowie die von anderen die online sind sehen, **damit** ich weiß wer in der Liste aktiv ist
- **Als Nutzer** möchte ich meinen eigenen Avatar von anderen einfach unterscheiden können, **damit** ich mich schnell orientiere
- **Als Nutzer** möchte ich eine farbige Avatar-Darstellung haben, **damit** Nutzer visuell unterscheidbar sind
- **Als Nutzer** möchte ich dass Avatare die Initialen der Namen zeigen, **damit** sie persönlicher wirken

### Presence Tracking
- **Als Nutzer** möchte ich sehen wer gerade online ist, **damit** ich weiß wer aktiv mitarbeitet
- **Als Nutzer** möchte ich dass offline Nutzer nach einiger Zeit ausgeblendet werden, **damit** die Anzeige übersichtlich bleibt
- **Als Nutzer** möchte ich dass mein Avatar andere Nutzer nicht überlappt, **damit** alle gut sichtbar sind

## 💾 Offline & Persistence

### Offline-Unterstützung
- **Als Nutzer** möchte ich auch ohne Internet-Verbindung Todos erstellen können, **damit** ich immer arbeiten kann
- **Als Nutzer** möchte ich dass meine Offline-Änderungen synchronisiert werden wenn ich wieder online bin, **damit** nichts verloren geht
- **Als Nutzer** möchte ich eine Demo-Modus haben wenn Firebase nicht konfiguriert ist, **damit** ich die App trotzdem testen kann

### Data Persistence
- **Als Nutzer** möchte ich dass meine Todos auch nach Browser-Neustart verfügbar sind, **damit** meine Arbeit gespeichert bleibt
- **Als Nutzer** möchte ich dass mein gewählter Name gespeichert wird, **damit** ich ihn nicht jedes Mal neu eingeben muss

## 🎨 Design & UX

### Playful Design
- **Als Nutzer** möchte ich eine moderne, bunte und spielerische Oberfläche, **damit** die Nutzung Spaß macht
- **Als Nutzer** möchte ich hover-Effekte und Animationen, **damit** die App lebendig wirkt
- **Als Nutzer** möchte ich dass wichtige Aktionen visuell hervorgehoben sind, **damit** ich mich schnell orientiere

### Responsive Design
- **Als Nutzer** möchte ich die App auf dem Handy genauso gut nutzen können wie am Desktop, **damit** ich überall arbeiten kann
- **Als Nutzer** möchte ich dass Buttons und Eingabefelder touch-freundlich sind, **damit** mobile Nutzung angenehm ist

### German Interface
- **Als Nutzer** möchte ich eine deutsche Benutzeroberfläche, **damit** ich alles intuitiv verstehe
- **Als Nutzer** möchte ich lustige deutsche Namen-Kombinationen, **damit** es persönlicher und unterhaltsamer wird

## 🔧 Technical Features

### Performance
- **Als Nutzer** möchte ich dass die App schnell lädt, **damit** ich sofort produktiv sein kann
- **Als Nutzer** möchte ich dass Real-time Updates ohne Verzögerung ankommen, **damit** Kollaboration flüssig ist

### Security
- **Als Nutzer** möchte ich dass meine Daten sicher sind, **damit** ich der App vertrauen kann
- **Als Nutzer** möchte ich dass nur Nutzer mit dem Link Zugriff haben, **damit** private Listen privat bleiben

### Error Handling
- **Als Nutzer** möchte ich verständliche Fehlermeldungen, **damit** ich weiß was zu tun ist
- **Als Nutzer** möchte ich dass die App auch bei Fehlern weiter funktioniert, **damit** meine Arbeit nicht unterbrochen wird

## 🚀 Future Features

### Erweiterte Features (Later)
- **Als Nutzer** möchte ich Listen archivieren können, **damit** ich alte Projekte aufbewahren kann
- **Als Nutzer** möchte ich Todos mit Deadlines versehen können, **damit** ich Prioritäten setzen kann
- **Als Nutzer** möchte ich Listen kategorisieren können, **damit** ich bessere Übersicht habe
- **Als Nutzer** möchte ich eine Typing-Indicator sehen, **damit** ich weiß wann andere gerade schreiben
- **Als Nutzer** möchte ich Todos anderen Nutzern zuweisen können, **damit** Verantwortlichkeiten klar sind

### Integration Features (Later)
- **Als Nutzer** möchte ich Listen exportieren können, **damit** ich sie anderweitig nutzen kann
- **Als Nutzer** möchte ich Listen per E-Mail teilen können, **damit** nicht-technikaffine Nutzer einfach beitreten können
- **Als Nutzer** möchte ich Listen mit Kalender-Apps verbinden können, **damit** Todos automatisch zu Terminen werden

## 📊 Metrics & Analytics (Future)
- **Als Product Owner** möchte ich wissen wie viele Listen erstellt werden, **damit** ich den Erfolg messen kann
- **Als Product Owner** möchte ich wissen wie oft Listen geteilt werden, **damit** ich die Viralität verstehe
- **Als Product Owner** möchte ich wissen wie lange Nutzer in Listen aktiv sind, **damit** ich Engagement messen kann