# Refactoring Plan: Presence Utils einbauen

## Ziel
Duplizierte Presence-Logik durch zentrale `presence-utils.ts` ersetzen.

---

## Schritt 1: `user-avatars.tsx` ⬜

**Schwierigkeit:** EINFACH
**Status:** Nicht gestartet

### Was zu ersetzen:
- [ ] Zeilen 83-95: `isOnline()` → `isRecentlyActive()`
- [ ] Zeilen 97-115: `getOfflineTime()` → `getOfflineTimeString()`
- [ ] Zeilen 67-72: Sortier-Logik in `sortedUsers` → `sortUsersByActivity()`

### Test VOR Refactoring:
- [x] Öffne eine Todo-Liste mit mehreren Usern
- [x] Grüner Punkt bei Online-Usern sichtbar
- [x] Offline-Zeit korrekt angezeigt
- [x] Hover über Avatare: Tooltip zeigt richtigen Status
- [X] Sortierung: Aktueller User zuerst, dann Online-User

**Notizen vor Refactoring:**
```
Verhalten dokumentiert:
-
```

### Test NACH Refactoring:
- [x] Gleiche Tests wie oben durchführen
- [x] Verhalten identisch?

**Notizen nach Refactoring:**
```
Ergebnis:
-
```

---

## Schritt 2: `todo-app.tsx` ⬜

**Schwierigkeit:** MITTEL
**Status:** Nicht gestartet

### Was zu ersetzen:
- [ ] Zeilen 333-350: Filter + Sort kombiniert
  - Filter: `.filter(user => ...)` → `filterRecentlyActiveUsers(users, 2)`
  - Sort: `.sort((a, b) => ...)` → Bereits in Filter integriert, dann `sortUsersByActivity()`

### Test VOR Refactoring:
- [ ] Öffne eine Liste mit mehreren Usern
- [ ] Schließe Tab, warte 1 Minute, öffne wieder
- [ ] Avatar noch sichtbar (< 2min)
- [ ] Warte weitere 2 Minuten
- [ ] Avatar verschwunden (> 2min)
- [ ] Sortierung: Online-User vor Offline-Usern

**Notizen vor Refactoring:**
```
Verhalten dokumentiert:
-
```

### Test NACH Refactoring:
- [ ] Gleiche Tests wie oben
- [ ] Verhalten identisch?

**Notizen nach Refactoring:**
```
Ergebnis:
-
```

---

## Schritt 3: `guest-todo-app.tsx` ⬜

**Schwierigkeit:** MITTEL
**Status:** Nicht gestartet

### Was zu ersetzen:
- [ ] Zeilen 313-327: Filter + Sort (identisch zu todo-app.tsx)
  - Filter: `.filter(user => ...)` → `filterRecentlyActiveUsers(users, 2)`
  - Sort: `.sort((a, b) => ...)` → `sortUsersByActivity()`

### Test VOR Refactoring:
- [ ] Öffne Guest-Link einer Liste (`/list/[id]/guest/[guestId]`)
- [ ] Gleiche Tests wie Schritt 2

**Notizen vor Refactoring:**
```
Verhalten dokumentiert:
-
```

### Test NACH Refactoring:
- [ ] Gleiche Tests wie oben
- [ ] Verhalten identisch?

**Notizen nach Refactoring:**
```
Ergebnis:
-
```

---

## Schritt 4: `users-page.tsx` ⬜

**Schwierigkeit:** KOMPLEX
**Status:** Nicht gestartet

### Was zu ersetzen:
- [ ] Zeilen 105-124: Filter + Sort mit **24h Schwellwert**
  - Filter: `.filter(user => ...)` → `filterRecentlyActiveUsers(users, 24 * 60)` ⚠️ WICHTIG: 24h!
  - Sort: `.sort((a, b) => ...)` → `sortUsersByActivity(users, user.uid)` ⚠️ currentUserId!

### Test VOR Refactoring:
- [ ] Öffne `/list/[id]/users` Seite
- [ ] User von letzten 24h sind sichtbar
- [ ] Aktueller User steht ganz oben
- [ ] Sortierung: Aktuell > Online > Offline (nach lastSeen)

**Notizen vor Refactoring:**
```
Verhalten dokumentiert:
-
```

### Test NACH Refactoring:
- [ ] Gleiche Tests wie oben
- [ ] Verhalten identisch?

**Notizen nach Refactoring:**
```
Ergebnis:
-
```

---

## Wichtige Unterschiede zwischen Komponenten

| Komponente | Schwellwert | currentUserId? | Besonderheiten |
|------------|-------------|----------------|----------------|
| user-avatars | 2 min | Ja (in sort) | Deutsche Texte, Tooltip |
| todo-app | 2 min | Nein | Standard Filter+Sort |
| guest-todo-app | 2 min | Nein | Identisch zu todo-app |
| users-page | **24h** | **Ja** | Längere Anzeige, User-Management |

---

## Checkliste Final

- [ ] Alle 4 Komponenten refactored
- [ ] Alle Tests bestanden
- [ ] Keine Verhaltensänderungen
- [ ] Code-Duplikation eliminiert
- [ ] Commit erstellen

---

## Notizen

```
Datum: 2025-10-02
Begonnen:
Abgeschlossen:

Probleme:
-

Learnings:
-
```
