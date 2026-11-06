# Changelog

## 0.3.2 — 2026-11-06

* Light-Karte (Info-Screen): immer Queransicht mit Kacheln; die Hochkant-Ringansicht entfällt.

## 0.3.1 — 2026-11-06

* Lizenz auf GPL-3.0-or-later umgestellt (vorher MIT).
* Mitwirkende ergänzt (README, `CONTRIBUTORS.md`, `package.json`).
* Releases werden automatisch erstellt: `.github/workflows/release.yml` legt bei neuer Version in `package.json` Tag und GitHub-Release mit `dist/asc-home-assistant-cards.js` an, damit HACS Updates anzeigt.

## 0.3.0 — 2026-11-06

* Neue Karte `custom:asc-solar-dashboard-light-card` für Info-Screens: nur der Live-Energiefluss des Dashboards (Kacheln), immer heute, ohne Zeitraumwahl, Verlauf, Tabellen oder Rundanzeigen. Überschrift skaliert mit der Kartenbreite; `show_header: false` blendet sie aus; unter 701 px Ringansicht.
* Beispiel `examples/info-screen-light.yaml`; Demo zeigt die Light-Variante.
* HACS-Veröffentlichung vorbereitet: README mit HACS-Installation und Umstiegshinweis, `hacs.json` mit Mindestversion HA 2024.11 (Sections-Grid `columns: full`), GitHub-Workflow `.github/workflows/validate.yml` (HACS-Prüfung, Tests, dist aktuell).
* 1 neuer Test (insgesamt 22).

## 0.2.3 — 2026-11-06

* Live-Updates ändern die Karte jetzt direkt im bestehenden Aufbau (nur geänderte Zahlen, Linien und Attribute), statt sie bei jedem neuen Messwert komplett neu zu erzeugen. Behebt das Zurückspringen bei Änderungen z. B. des Netzbezugs: Flusspunkte laufen weiter statt neu zu starten (WebKit/iPhone), Fokus und Scrollposition bleiben unberührt.
* Neue Datei `src/shared/patch.js`.
* Browsertest: Nach 8 Wertwechseln (Bezug ↔ Einspeisung, Laden ↔ Entladen, unavailable) ist die aktualisierte Karte bei allen drei Karten zeichengleich mit einer frisch erzeugten; Grafiken bleiben erhalten, Animationszeit läuft durch.

## 0.2.2 — 2026-11-06

* Handy/Companion-App: Während ein Finger auf der Karte liegt (Wischen/Scrollen, Antippen), wird die Karte nicht mehr neu aufgebaut; Live-Werte werden nach dem Loslassen nachgezogen. Hintergrund: Mobile WebViews können eine Scrollgeste abbrechen, wenn das berührte Element währenddessen ersetzt wird. Im Browsertest mit Touch-Simulation: 0 Neuaufbauten während des Wischens, Scrollen und Antippen funktionieren.
* 1 neuer Regressionstest (insgesamt 21).

## 0.2.1 — 2026-11-06

Fehlerbehebungen nach Code-Prüfung und Browsertest mit simulierter HA-Umgebung:

* DC-Bus-Karte: Die breite Ansicht wurde nie angezeigt (immer schmale Ansicht, auf breiten Karten ca. 1800 px hoch). Jetzt breit ab 721 px, schmal darunter, immer genau eine Ansicht. Ursache der früheren „doppelten Darstellung“: `.diagram svg{display:block}` überschrieb die Umschaltregeln.
* Großes Dashboard: Die angekündigte mobile Ringansicht fehlte; auf Handybreite war der Flow mit ca. 4 px Schrift unlesbar. Jetzt Ringansicht bis 700 px.
* Ohne eingerichtetes HA-Energie-Dashboard (`energy/get_prefs` → „No prefs“) fielen alle kWh-Werte aus, auch die ASC-Batteriezähler. Jetzt entfällt nur die Automatik.
* `energy.<rolle>: null` schaltet die Automatik für Inverter/Netzbezug/Einspeisung jetzt wie dokumentiert ab.
* Karten wurden bei jeder Zustandsänderung irgendeiner HA-Entity komplett neu aufgebaut (inkl. ca. 300 KB Foto-Daten). Jetzt nur bei Änderung angezeigter Entities; Foto wird einmal dekodiert.
* Datumsfelder „Zeitraum“: Live-Updates schlossen den Datumswähler bzw. verwarfen Eingaben. Neuaufbau wird während der Eingabe zurückgestellt.
* „Energie-Dashboard aufrufen“ navigiert jetzt innerhalb von HA statt das Frontend neu zu laden.
* Kompaktkarte: Netz-Leitung endete ins Leere, Inverter→Haus versetzt, Netz-Knoten abgeschnitten. Layout korrigiert.
* Überlange Werte (z. B. „↓ 2,35 kWh“) ragten aus den Ringen; werden verkleinert.
* Sections-Grid: `columns: 36` ist ungültig (HA nutzt 12 Spalten) → `columns: 'full'`.
* Marker-IDs pro Grafik eindeutig; Pfeile bleiben auch sichtbar, wenn die andere Ansicht ausgeblendet ist.
* Demo: Mock beantwortete `energy/get_prefs` nicht, beide Demo-Karten zeigten „Energiedaten nicht verfügbar“.
* 6 neue Regressionstests (insgesamt 20).

## 0.2.0 — 2026-09-15

* Beide Karten nach den vom Nutzer bereitgestellten Designbildern gestaltet.
* Kleine Karte: dunkle Ringoptik, geschätzter Akku-Füllstandsring, farbige Pfeile und Live-Flusspunkte.
* Große Karte implementiert: Live-Kacheln, History-Leistungsverlauf, Energieübersicht, ASC-Status, PV-/Batterie-/Eigenverbrauchsanzeigen.
* Responsive schmale Ringansicht, reduzierte Bewegung und konfigurierbare dunkle bzw. HA-Oberfläche.
* Interaktive Demo für beide Karten, Beispiele für Panel-Ansicht und statische Designprüfungen.
* Große Karte bleibt bis zur Abnahme in einer realen HA-Installation experimentell.

## 0.1.0 — 2026-09-15

* Erste eigenständige Energy Flow Card DC Bus für die kompakte Home-Seite.
* Korrekte DC-Topologie, getrennte Batterie- und Netzenergierichtungen.
* Heute-/Wochen-/Monats-/Kalendertag-Auswahl über Recorder-Statistiken.
* ASC-v0.4.3.1-Vorgaben und vollständiges Sensorinventar aus der hochgeladenen ZIP.
* Eigenständiges HACS-Bundle, Beispiele, Tests und lokale Demo.
* Große ASC Solar Dashboard Card nur als ausdrücklich experimenteller Platzhalter.
