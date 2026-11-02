# FML-Quartett (öffentliches Repo) – App-Code

**Öffentlich!** Hier nur App-Code, Icons, Manifest. Niemals Modelldaten, Preise, Fotos oder Tokens ablegen.
Commits nur mit `langflo163@users.noreply.github.com`.

- Live: https://langflo163.github.io/FML-Quartett/ (GitHub Pages, main / root)
- Daten: privates Repo `langflo163/FML-Github` – Index `FML-Quartett/modelle.json` (Liste der RC-Ordner),
  pro Modell `RC-…/quartett.json`, Fotos als Dateien im selben Ordner (Feld `fotos` = Liste der Dateinamen, erstes = Kartenfoto; altes Feld `foto` wird weiter gelesen).
- Laden per GitHub-API (`contents`, Accept `application/vnd.github.raw+json`) mit Fine-grained-Token
  (nur FML-Github, Contents read-only), gespeichert in localStorage `fmlq.token`. Letzter Stand in `fmlq.cache`.
- `index.html` (kein Build) + `pdf.js` (PDF-Export, lädt erst bei Bedarf `lib/jspdf.umd.min.js` 2.5.1, `lib/qrcode.js` 1.4.4 und die TTF-Schriften aus `fonts/`), `sw.js` cacht nur die App-Hülle. Bei Änderungen an der Hülle `V` in `sw.js` hochzählen.
- Optik: flach, Rot/Weiß/Schwarz, keine Verläufe. Schriften Saira Condensed / IBM Plex Sans / IBM Plex Mono.
- Doku zu Datenformat und Pflege: `FML-Quartett/CLAUDE.md` im privaten Repo.

## Version

v1.4 (02.11.2026): PDF-Export pro Karte (A4, „PDF“ / „PDF mit Kosten“ im Datenblatt): Kopf, Foto, Technische Daten, Komponenten, weitere Fotos, Videos als QR-Codes. iPhone: Teilen-Menü; falls iOS das Teilen blockiert, Knopf „PDF teilen“.

v1.3 (02.11.2026): Video-Links (YouTube mit Vorschaubild, Instagram, TikTok, sonstige https-Links) im Datenblatt, Anzahl auf der Karte.

v1.2 (02.11.2026): Mehrere Fotos pro Modell – Galerie im Datenblatt zum Wischen, Vollbild per Tipp, Zähler auf der Karte.

v1.1 (29.10.2026): Preis-Hinweise (Richtwert usw.) nur bei „Kosten zeigen“; Preis ohne Wert = „—“.

v1.0 (29.10.2026): Karten, Datenblatt, Kosten auf Knopfdruck, Token-Einrichtung, Offline-Stand.
