# FML-Quartett (öffentliches Repo) – App-Code

**Öffentlich!** Hier nur App-Code, Icons, Manifest. Niemals Modelldaten, Preise, Fotos oder Tokens ablegen.
Commits nur mit `langflo163@users.noreply.github.com`.

- Live: https://langflo163.github.io/FML-Quartett/ (GitHub Pages, main / root)
- Daten: privates Repo `langflo163/FML-Github` – Index `FML-Quartett/modelle.json` (Liste der RC-Ordner),
  pro Modell `RC-…/quartett.json`, Foto als Datei im selben Ordner (Feld `foto` = Dateiname).
- Laden per GitHub-API (`contents`, Accept `application/vnd.github.raw+json`) mit Fine-grained-Token
  (nur FML-Github, Contents read-only), gespeichert in localStorage `fmlq.token`. Letzter Stand in `fmlq.cache`.
- Eine Datei `index.html` (kein Build), `sw.js` cacht nur die App-Hülle. Bei Änderungen an der Hülle `V` in `sw.js` hochzählen.
- Optik: flach, Rot/Weiß/Schwarz, keine Verläufe. Schriften Saira Condensed / IBM Plex Sans / IBM Plex Mono.
- Doku zu Datenformat und Pflege: `FML-Quartett/CLAUDE.md` im privaten Repo.

## Version

v1.0 (29.10.2026): Karten, Datenblatt, Kosten auf Knopfdruck, Token-Einrichtung, Offline-Stand.
