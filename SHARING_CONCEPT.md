# Sharing & Guest Konzept (Vereinfacht)

## Philosophie

**"mach.einfach"** - Einfachheit steht im Vordergrund.
Keine unnötigen Barrieren, keine Anmeldung, keine komplexen Rechte-Systeme.

## Übersicht

Das Sharing-System basiert auf 2 Zugangsebenen - simpel und klar:

```
┌─────────────────────────────────────────────────┐
│  NORMAL (Vollzugang: Lesen, Schreiben, Löschen) │
│  ↓                                               │
│  GUEST  (Nur Lesen + Abhaken)                   │
└─────────────────────────────────────────────────┘
```

**Kein Admin-System. Kein Passwort-Schutz.**

---

## 2 Zugangsebenen

### 1. Normal (Standard-Zugang)
**URL:** `/list/[listId]`

**Berechtigungen:**
- ✅ Todos lesen
- ✅ Todos erstellen
- ✅ Todos bearbeiten
- ✅ Todos löschen (soft-delete)
- ✅ Todos wiederherstellen
- ✅ Namen ändern
- ✅ Präsenz sichtbar
- ✅ **Guest-Links erstellen/widerrufen** (jeder kann Gäste einladen)

**Verwendung:**
- Standard für alle Collaborators
- Beispiel: Team-Mitglieder an Projekt-Todo-Liste
- Beispiel: WG-Mitglieder an Putzplan
- Beispiel: Freunde an Party-Planung

**Technische Umsetzung:**
- Standard-Route: `/list/[id]/page.tsx`
- Component: `todo-app.tsx`
- Keine Berechtigung nötig
- Jeder mit dem Link kann voll mitwirken

---

### 2. Guest (Gast-Zugang)
**URL:** `/list/[listId]/guest/[guestId]`

**Berechtigungen:**
- ✅ Todos lesen
- ✅ Todos abhaken (toggle `completed` flag)
- ❌ Todos erstellen
- ❌ Todos bearbeiten
- ❌ Todos löschen
- ❌ Guest-Links erstellen/widerrufen

**Verwendung:**
- Für externe Personen, die nur Fortschritt sehen sollen
- Beispiel: Auftraggeber sieht Projektfortschritt
- Beispiel: Putzkraft sieht WG-Putzplan
- Beispiel: Gäste sehen Party-Checkliste

**Technische Umsetzung:**
- Guest-Route: `/list/[id]/guest/[guestId]/page.tsx`
- Component: `guest-todo-app.tsx`
- Jeder User kann Guest-Links erstellen
- Guest-Links können widerrufen werden (soft-delete via `revoked` flag)

---

## Guest-Links System

### Guest-Link Lifecycle

#### 1. Erstellen (jeder Normal-User kann das)
```typescript
const handleCreateGuestLink = async () => {
  const guestLinksRef = ref(db, `lists/${listId}/guestLinks`)
  const newLinkRef = push(guestLinksRef)

  await set(newLinkRef, {
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    revoked: false
  })
}
```

**Resultat:**
- Neuer Guest-Link mit eindeutiger ID
- URL: `https://app.com/list/{listId}/guest/{guestLinkId}`

#### 2. Nutzen
1. Empfänger öffnet Guest-Link
2. App validiert:
   - Existiert Guest-Link? (`guestLinks/{guestId}`)
   - Ist Link aktiv? (`revoked === false`)
3. Wenn gültig: Lade Todos im readonly Mode
4. Wenn ungültig: Zeige Fehler "Link ungültig oder widerrufen"

#### 3. Widerrufen (jeder Normal-User kann das)
```typescript
const handleRevokeGuestLink = async (linkId: string) => {
  const linkRef = ref(db, `lists/${listId}/guestLinks/${linkId}`)
  await update(linkRef, {
    revoked: true,
    revokedAt: serverTimestamp(),
    revokedBy: user.uid
  })
}
```

**Resultat:**
- Link bleibt in Firebase (Audit Trail)
- Flag `revoked: true` verhindert Zugriff
- Wer & wann widerrufen wird gespeichert

### Guest-Link Verwaltung

**UI in Sharing Modal (für alle Normal-User):**
```
┌─────────────────────────────────────────┐
│ Gast-Links                    [2 aktiv] │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Einkaufsliste (readonly)            │ │
│ │ Erstellt: 04.01.2025                │ │
│ │                        [📋] [QR] [×]│ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Einkaufsliste (readonly)            │ │
│ │ Erstellt: 03.01.2025                │ │
│ │                        [📋] [QR] [×]│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Neuen Gast-Link erstellen]          │
└─────────────────────────────────────────┘
```

**Aktionen:**
- 📋 Link kopieren
- QR QR-Code anzeigen (TODO: Implementation)
- × Link widerrufen

---

## Firebase Struktur

```
lists/
  {listId}/
    name: "Einkaufsliste"

    todos/
      {todoId}/
        text: "Milch kaufen"
        completed: false
        createdBy: "user123"
        createdAt: 1704384000

    presence/
      {userId}/
        name: "Max"
        color: "#ff6b9d"
        lastSeen: 1704384000
        isTyping: false

    guestLinks/
      {guestLinkId}/
        createdBy: "user123"
        createdAt: 1704384000
        revoked: false
        revokedAt: null
        revokedBy: null
```

**Hinweis:** Keine `admins/` oder `passwords/` Nodes mehr!

---

## Komponenten-Übersicht

### 1. `sharing-modal.tsx`
**Zweck:** Zentrale Sharing-Verwaltung

**Features:**
- Normal-Link kopieren/QR
- Guest-Links anzeigen/erstellen/widerrufen

**Props:**
```typescript
{
  listId: string
  listName: string
  guestLinks: GuestLink[]
  onCreateGuestLink: () => void
  onRevokeGuestLink: (id: string) => void
}
```

### 2. `guest-todo-app.tsx`
**Zweck:** Guest-Ansicht mit eingeschränkten Rechten

**Features:**
- Todos anzeigen
- Todos abhaken (toggle completed)
- Keine Edit/Delete/Create Funktionen
- Readonly Badge sichtbar

**Unterschiede zu `todo-app.tsx`:**
```typescript
// Kein TodoInput
// Kein Delete Button
// Kein Edit Mode
// Nur Checkbox für toggle
```

### 3. `todo-app.tsx`
**Zweck:** Normale Ansicht (Vollzugang)

**Features:**
- Sharing Modal mit Guest-Link Management
- **Jeder User kann Guest-Links erstellen**

---

## Use Cases & Szenarien

### Szenario 1: Projektteam
**Setup:**
- Alle Team-Mitglieder: Normal
- Stakeholder/Kunden: Guest

**Flow:**
1. Developer A erstellt Liste, teilt Normal-Link im Team-Chat
2. Jeder im Team kann Todos erstellen/bearbeiten
3. Developer B erstellt Guest-Link für Kunden
4. Kunde sieht readonly Fortschritt

### Szenario 2: WG Putzplan
**Setup:**
- Alle Mitbewohner: Normal
- Putzkraft: Guest

**Flow:**
1. Mitbewohner erstellt Liste, teilt Normal-Link in WG-Gruppe
2. Alle können Putz-Aufgaben hinzufügen/abhaken
3. Irgendjemand erstellt Guest-Link für Putzkraft
4. Putzkraft sieht nur was zu tun ist (readonly)

### Szenario 3: Party-Planung
**Setup:**
- Organisatoren: Normal
- Gäste: Guest (optional)

**Flow:**
1. Organisator A erstellt Liste, teilt mit Freunden
2. Alle Organisatoren können Aufgaben hinzufügen
3. Optional: Guest-Link für Gäste, die sehen wollen was noch fehlt
4. Gäste können nichts ändern, nur schauen

---

## Security Considerations

### Firebase Rules (Empfohlen)

```json
{
  "rules": {
    "lists": {
      "$listId": {
        "todos": {
          // Jeder authentifizierte User hat Vollzugriff
          ".read": "auth != null",
          ".write": "auth != null"
        },

        "guestLinks": {
          // Jeder kann Guest-Links lesen und erstellen
          ".read": "auth != null",
          ".write": "auth != null"
        },

        "presence": {
          // Presence für alle sichtbar
          ".read": "auth != null",
          "$userId": {
            // Jeder kann nur seine eigene Presence schreiben
            ".write": "auth != null && auth.uid === $userId"
          }
        }
      }
    }
  }
}
```

**Hinweis:** Sehr offene Rules, da das System auf Vertrauen basiert.

### Sicherheitsmodell

**Grundprinzip:** "Wer den Link hat, darf was damit machen"

- **Normal-Link:** Vollzugriff für jeden
- **Guest-Link:** Readonly für jeden
- **Kein Passwort-Schutz:** Bewusste Design-Entscheidung
- **Kein Admin-System:** Demokratisch - jeder ist gleichberechtigt

**Wenn Schutz gewünscht:**
- Links nicht öffentlich teilen
- Guest-Links nach Gebrauch widerrufen
- Neue Liste erstellen statt alte zu "sichern"

---

## Offene TODOs

### Features
- [ ] QR-Code Generator implementieren
- [ ] Guest-Link Ablaufdatum (optional)
- [ ] Guest-Link Zugriffszähler (Analytics)
- [ ] Email-Einladungen für Gäste

### UX
- [ ] Onboarding für neue User (erste Liste)
- [ ] "Guest erstellen" Tooltip (erklärt readonly)
- [ ] Sharing-Tipps ("Link nur mit Vertrauenspersonen teilen")

---

## Zusammenfassung

**Vereinfachtes Sharing-System:**
1. **2 Rollen** (Normal, Guest)
2. **Kein Passwort-Schutz**
3. **Kein Admin-System**
4. **Jeder kann Gäste einladen**
5. **Link = Berechtigung**

**Stärken:**
- Maximal einfach ("mach.einfach")
- Keine Barrieren (keine Anmeldung, keine Passwörter)
- Schnelles Teilen (Link kopieren, fertig)
- Demokratisch (alle gleichberechtigt)

**Schwächen:**
- Kein Zugriffsschutz
- Wer den Link hat, kann alles (Normal) oder lesen (Guest)
- Keine Rechte-Verwaltung

**Fazit:** Perfekt für informelle, vertrauensbasierte Zusammenarbeit.
Nicht geeignet für sensible Daten oder formelle Organisationen.
