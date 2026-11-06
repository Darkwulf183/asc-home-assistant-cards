# ASC Solar Dashboard — implementiert und erweiterbar

Seit v0.2.0 ist `custom:asc-solar-dashboard-card` eine funktionsfähige experimentelle Karte und kein Platzhalter. Grundlage der Gestaltung: „Energiefluss-Dashboard mit PV und Akku.png“. Die kleine Karte folgt „Energieverteilung heute – Dashboard.png“.

## Implementiert

* Live-Flow: PV → DC-Bus → Inverter → Haus ↔ Netz, Batterie am DC-Bus.
* Richtungsabhängige Pfeile/Animationen anhand realer Sensoren.
* Energiezeiträume, Tages-Leistungsverlauf, ASC-Statusdaten.
* PV-Auslastung, geschätzter Batterie-Füllstand, AC-Eigenverbrauch.
* Eigene schmale Darstellung; fehlende Daten und Fehler sichtbar.

## Architektur

* `shared/helpers.js`: Einheiten, Live-Bilanz, Zeiträume.
* `shared/design.js`: Symbole, Farben, Ring-Layout und Darstellung gemeinsamer Werte.
* `shared/history.js`: historische Messpunkte und Kurven mit Lücken.
* `shared/dashboard-design.js`: große Flow-Kacheln, Diagramm, Messanzeigen und Statusfelder.
* `energy-flow-card-dc-bus.js`: HA-Lebenszyklus, Konfiguration, Energie-Statistiken und kompakte Karte.
* `asc-solar-dashboard-card.js`: erweitert die kleine Karte um History-Abfragen und das große Dashboard.

## Für weitere ASC-Versionen

Forecast-/Budget-/Strategie-Details, Jahreswerte und Diagnosebereiche anhand dann gültiger ASC-Entities ergänzen. Das vollständige Sensorinventar enthält data_key, state_key und Herkunft. Keine prognostizierten, gespeicherten oder phasenbezogenen Energien als Flusszähler verwenden.

Vor einer stabilen 1.0: Integrationstest mit der realen Anlage, Statusbezeichnungen/Einheiten prüfen, globalen HA-Energie-Datumswähler optional anbinden und bei Bedarf Entity-Registry-Erkennung für mehrere ASC-Instanzen ergänzen. Keine automatische Controller-Steuerung vorgesehen.
