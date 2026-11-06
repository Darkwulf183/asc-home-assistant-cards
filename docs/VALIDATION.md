# Prüfbericht · v0.3.0

## Light-Karte (2026-11-06)

Browsertest bei 1920, 1100, 800 und 390 px mit Werten wie in der realen Anlage (PV 0 W, Akku entlädt 49 W, Inverter 36 W, Netzbezug 2.935 W): genau eine Flow-Ansicht, keine Zeitraum-Buttons, keine History-Abfrage, keine Fehler; Haus = Inverter + Netz.

# Prüfbericht · v0.2.1

## Browsertest v0.2.1 (2026-11-06)

Produktions-Bundle in Chrome (headless) mit simulierter HA-Schnittstelle getestet: `energy/get_prefs` (mit und ohne Energie-Konfiguration), `recorder/statistics_during_period`, History-REST-API, laufende Zustandsänderungen.

* Breiten 320–1220 px für alle drei Karten: genau eine Flow-Ansicht sichtbar, kleinste Schrift ≥ 9 px (Dashboard bei ca. 800 px), sonst ≥ 10 px, keine NaN/undefined, keine Konsolenfehler.
* Laden/Entladen, Bezug/Einspeisung, unavailable/unknown-Sensoren, Woche ab Montag, benutzerdefinierter Zeitraum (Ende inklusive), Fehleranzeige bei WS-Ausfall, `appearance: ha`, `animate: false`, ungültige Konfigurationen, Entity-Details per Klick, In-App-Navigation.
* 50 Updates fremder Entities: kein Neuaufbau; Datumsfeld behält Fokus und Wert.
* Mitgelieferte Demo-Seite in voller und Handybreite.

Weiterhin keine Abnahme in einer echten HA-Installation.

## Prüfstand v0.2.0

## Ausgeführt

* Beide vom Nutzer übergebenen Designbilder angesehen und die Karten entsprechend neu gestaltet.
* SVG-Designprüfungen aus denselben Renderfunktionen wie im HACS-Bundle erzeugt: kleine Karte, große Karte und schmale Flow-Ansicht. PNGs visuell geprüft; Abstände, Titel und Füllstandsbögen korrigiert.
* 14 automatisierte Tests bestanden: Einheiten/Nullwerte, Bilanz, ASC-Vorzeichen, Zeitraumgrenzen, Statistikfehler, veraltete Antworten, History-Umrechnung/Lücken, Flussrichtung, unbekannter Akku-Füllstand, Konfiguration, Disconnect-Verhalten und eigenständige Registrierung beider Karten im fertigen Bundle ohne Demo-Daten.
* Produktions-Bundle gebaut und JavaScript-Syntax geprüft.

## Grenzen

Keine Verbindung zur realen HA-Instanz oder HACS-Installation. Ein lokaler Browser-Dateiaufruf war zuvor durch Browser-Richtlinien blockiert. Daher **keine Browser- oder HA-Screenshot-Abnahme**: PNGs sind statische Designprüfungen aus dem Produktions-SVG mit gesonderter Panel-Anordnung, keine Browser-Screenshots. Die interaktive Demo enthält das echte Bundle zur Prüfung beim Nutzer.

Kalendertage verwenden die Browser-Zeitzone. Die kWh-Auswahl ist nicht an den globalen HA-Energie-Datumswähler gekoppelt. Große Verlaufskurven zeigen heute und nur konfigurierte aufgezeichnete Leistungssensoren. Inverter-/Netz-Energiezähler und PV-Nennleistung bleiben anlagenspezifisch einzutragen.

## Nach Installation

1. Reale Entity-IDs und Vorzeichen überprüfen.
2. Kleine Karte breit und in Handybreite ansehen; große Karte in eigener Panel-View öffnen.
3. Laden/Entladen und Bezug/Einspeisung mit den realen Messwerten vergleichen.
4. Energiezeiträume mit HA-Statistiken vergleichen; laufende Stunde kann verzögert sein.
5. Leistungsverlauf und Lücken bei unavailable-Sensoren kontrollieren.
6. Bei Updates die alte JS-Ressource aktualisieren, Browsercache erneuern und nicht mehrere Versionen parallel laden.

## Technische Referenzen

* [HACS Dashboard-Struktur](https://www.hacs.dev/docs/publish/plugin/)
* [HA Recorder frontend API](https://github.com/home-assistant/frontend/blob/dev/src/data/recorder.ts)
* [HA History REST API](https://developers.home-assistant.io/docs/api/rest/)
