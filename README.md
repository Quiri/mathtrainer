# Mathe Trainer

Ein browserbasieter Mathe-Trainer für vier wichtige Schulthemen. Alle Aufgaben werden **zufällig generiert** – kein Anmelden, kein Backend, einfach öffnen und üben.

## Themen

| Thema | Inhalt |
|---|---|
| **Bruchrechnen** | Addition, Subtraktion, Multiplikation und Division von Brüchen |
| **Negative Zahlen** | Rechnen mit negativen Zahlen (alle vier Grundrechenarten) |
| **Ausklammern** | Faktorisieren von Ausdrücken (ggT ausklammern, x ausklammern) |
| **Gleichungen (x)** | Lineare Gleichungen lösen (ax+b=c, zwei Seiten, Division) |

## Schwierigkeitsstufen

- 🟢 **Leicht** – kleine Zahlen, nur Addition/Subtraktion
- 🟡 **Mittel** – größere Zahlen, alle Operatoren
- 🔴 **Schwer** – große Zahlen, komplexere Aufgabentypen

## Verwendung

Kein Build-Schritt notwendig. Einfach `index.html` im Browser öffnen:

```bash
# Option 1: direkt öffnen
start index.html

# Option 2: lokaler Dev-Server (z. B. mit VS Code Live Server oder Python)
python -m http.server 8080
# → http://localhost:8080
```

## Dateistruktur

```
mathtrainer/
├── index.html   ← HTML-Struktur
├── style.css    ← Alle Stile (Dark Mode, responsive)
├── main.js      ← Aufgaben-Generatoren, Spiellogik
└── README.md
```

## Mitmachen / Beitragen

1. Fork erstellen
2. Feature-Branch anlegen: `git checkout -b feature/neues-thema`
3. Änderungen committen: `git commit -m "Neues Thema: Prozentrechnung"`
4. Pull Request öffnen

Neue Themen können einfach als weitere Methoden im `generators`-Objekt in `main.js` hinzugefügt werden.

---

© 2026 Mathe Trainer
