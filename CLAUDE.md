# FML-Quartett (öffentliches Repo) – App-Code

**Öffentlich!** Hier nur App-Code, Icons, Manifest. Niemals Modelldaten, Preise, Fotos oder Tokens ablegen.
Commits nur mit `langflo163@users.noreply.github.com`.

- Live: https://langflo163.github.io/FML-Quartett/ (GitHub Pages, main / root)
- Daten: privates Repo `langflo163/FML-Github` – Index `FML-Quartett/modelle.json` (Liste der RC-Ordner),
  pro Modell `RC-…/quartett.json`, Fotos als Dateien im selben Ordner (Feld `fotos` = Liste der Dateinamen, erstes = Kartenfoto; altes Feld `foto` wird weiter gelesen).
- Laden per GitHub-API (`contents`, Accept `application/vnd.github.raw+json`) mit Fine-grained-Token
  (nur FML-Github, Contents read-only; für Bearbeiten in der App „Read and write“). Speichern: GET mit sha → Änderung auf den
  neuesten Stand anwenden → PUT (bei 409 einmal neu versuchen), gespeichert in localStorage `fmlq.token`. Letzter Stand in `fmlq.cache`.
- App-Version: `APPV` in `index.html` (wird in der Statuszeile angezeigt) – bei jeder Änderung hochzählen, dazu `V` in `sw.js`.
- `index.html` (kein Build) + `pdf.js` (PDF-Export, lädt erst bei Bedarf `lib/jspdf.umd.min.js` 2.5.1, `lib/qrcode.js` 1.4.4 und die TTF-Schriften aus `fonts/`), `sw.js` cacht nur die App-Hülle. Bei Änderungen an der Hülle `V` in `sw.js` hochzählen.
- Optik: flach, Rot/Weiß/Schwarz, keine Verläufe. Schriften Saira Condensed / IBM Plex Sans / IBM Plex Mono.
- Doku zu Datenformat und Pflege: `FML-Quartett/CLAUDE.md` im privaten Repo.

## Version

v1.9 (03.11.2026): Offline – alle Daten, Fotos, Sender-Profile/-Bilder landen im Cache `fmlq-data` (Cache Storage); bei Internet werden fehlende
Dateien vorgeladen, PDF-Teile (pdf.js, lib, fonts) über den Service Worker. Offline geht alles außer Bearbeiten.

v1.8.1 (03.11.2026): Geber-Typ `schalter3` (oben/mitte/unten, mit Startstellung).

v1.8 (03.11.2026): Geber-Schilder zeigen die Original-Bezeichnung (`kurz` im Sender-Profil, z. B. Sa, SF, trim 3-4) statt der Nummer – im Bild, in der Liste, im Editor und im PDF.

v1.7 (03.11.2026): Geber-Typen knueppel (oben/unten/links/rechts), drehknopf (links/rechts), schieber (oben/unten) für die Jeti DC-16.

v1.6 (03.11.2026): Jeder Geber hat frei benennbare Stellungen mit Beschreibung (Vorgaben je Typ: Rad links/rechts, Hebel ziehen/drücken,
Taster gedrückt, Schalter oben/unten, Wippe Stellung 1/2), „+ Stellung“; Startstellung bei Schaltern. Versionsnummer in der Statuszeile.
Service Worker lädt mit `cache: no-cache` (GitHub Pages cacht sonst bis 10 min).

v1.5.1 (03.11.2026): Unter dem Sender-Bild nur belegte Geber; unbelegte nur als grauer Punkt im Bild (antippen zum Belegen).

v1.5 (03.11.2026): Fernsteuerung pro Modell – Sender-Bild mit nummerierten Gebern (rote Linie, grau = unbelegt), Geber antippen →
Funktion, Stellungen oben/unten, Startstellung, Notiz eintragen und direkt ins Repo speichern; Modellspeicher + Hinweise;
Kasten „Vor dem Einschalten“ im Datenblatt; alles auch im PDF.

v1.4 (02.11.2026): PDF-Export pro Karte (A4, „PDF“ / „PDF mit Kosten“ im Datenblatt): Kopf, Foto, Technische Daten, Komponenten, weitere Fotos, Videos als QR-Codes. iPhone: Teilen-Menü; falls iOS das Teilen blockiert, Knopf „PDF teilen“.

v1.3 (02.11.2026): Video-Links (YouTube mit Vorschaubild, Instagram, TikTok, sonstige https-Links) im Datenblatt, Anzahl auf der Karte.

v1.2 (02.11.2026): Mehrere Fotos pro Modell – Galerie im Datenblatt zum Wischen, Vollbild per Tipp, Zähler auf der Karte.

v1.1 (29.10.2026): Preis-Hinweise (Richtwert usw.) nur bei „Kosten zeigen“; Preis ohne Wert = „—“.

v1.0 (29.10.2026): Karten, Datenblatt, Kosten auf Knopfdruck, Token-Einrichtung, Offline-Stand.
