// Run with a local extracted ASC directory; never redistributes ASC source.
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.argv[2];if(!root)throw Error('Pass the extracted adaptive_solar_controller directory');
const sensor=readFileSync(join(root,'sensor.py'),'utf8');
const yaml=readFileSync(join(root,'dashboard/Solar_ASC_v0.4.3.yaml'),'utf8');
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
let group='';const sensors=[];
for(const [index,line] of sensor.split('\n').entries()){
 if(line.trim().startsWith('#'))group=line.trim().slice(1).trim();
 if(!line.includes('ASCSensorDescription(key='))continue;
 const get=k=>line.match(new RegExp(k+'="([^"]+)"'))?.[1]||null;
 const name=get('name');const entity='sensor.adaptive_solar_controller_'+slug(name);
 sensors.push({key:get('key'),name,data_key:get('data_key'),state_key:get('state_key'),group,expected_entity_id:entity,entity_id_evidence:yaml.includes(entity)?'dashboard YAML':'derived from device/name; verify in HA',unit:line.match(/native_unit_of_measurement=([^,]+)/)?.[1]||null,state_class:line.match(/state_class=([^,]+)/)?.[1]||null,source_line:index+1});
}
const entities=[...new Set(yaml.match(/\b(?:sensor|binary_sensor|number|input_number|input_boolean|input_datetime|select|switch|sun)\.[a-z0-9_]+/g))].sort();
const inventory={version:'0.4.3.1',sensor_py_sha256:createHash('sha256').update(sensor).digest('hex'),sensors,dashboard_entities:entities};
writeFileSync(new URL('../docs/asc-sensor-inventory.json',import.meta.url),JSON.stringify(inventory,null,2)+'\n');
let md='# ASC v0.4.3.1 — Sensorzuordnung\n\nAus der hochgeladenen ZIP extrahiert. Keine ASC-Quelldateien werden weiterverteilt. IDs aus Sensor-Namen sind erwartete HA-IDs, keine Garantie nach Umbenennung. Vollständige Daten inklusive data_key/state_key im JSON-Inventar.\n\n## Live- und Anlagenmessung\n\n| Rolle | Entity | Beleg / Einschränkung |\n|---|---|---|\n| PV-Leistung | sensor.solar_watt_aktuell | const.py; Definition des externen Sensors fehlt |\n| DC-Spannung | sensor.solar_average_voltage | const.py und Dashboard |\n| Batterie-Strom | sensor.solar_complete_ampere | const.py und Dashboard; positiv Laden |\n| Batterie-Leistung | V × A | ASC-Vorgabe battery_power_sensor leer; optional separater Sensor |\n| Inverter AC | sensor.apsystems_output_average | const.py Inverter-Istwert |\n| Alternative AC-Anzeige | sensor.input_solar_power | Dashboard; nicht gleichzeitig addieren |\n| Netzleistung | sensor.e320_power_in | const.py und Dashboard |\n| PV heute | sensor.solar_tageserzeugung | const.py; externe Definition nicht mitgeliefert |\n| solar_tagesverbrauch | sensor.solar_tagesverbrauch | Messgrenze nicht definiert; nicht automatisch zugeordnet |\n| Inverter/Netz-Energie | nicht eindeutig vorhanden | eigene Zähler konfigurieren |\n\nDie fünf EPEVER-PV-Array-Sensoren sind Eingangsmessungen vor möglichen MPPT-Verlusten. Keine DC-Bus-Leistungsbilanz aus ungleichen Messgrenzen bilden. solar_akku_entladeleistung ist eine einseitige Entladeanzeige und kein vorzeichenbehafteter Batteriesensor. solar_entladephase_kwh ist ein Phasenwert, kein fortlaufender Energieflusszähler. ASC actual_pv_today und Prognosen haben keinen Summen-state_class.\n\n## Sämtliche ASC-Sensoren\n\n| Schlüssel | Name / erwartete Entity-ID | Einheit | Statistikklasse | YAML belegt |\n|---|---|---|---|---|\n';
for(const s of sensors)md+=`| ${s.key} | ${s.name}<br>\`${s.expected_entity_id}\` | ${s.unit||'—'} | ${s.state_class||'keine'} | ${s.entity_id_evidence==='dashboard YAML'?'ja':'abgeleitet'} |\n`;
md+='\n## Alle Dashboard-Entities (einschließlich Steuerungen / externe Sensoren)\n\nDiese Liste dokumentiert die Referenz, sie aktiviert keine Steuerungen. Schalter, Nummern und Auswahllisten werden von der kleinen Karte nicht bedient.\n\n'+entities.map(e=>'- `'+e+'`').join('\n')+'\n';
writeFileSync(new URL('../docs/ASC-SENSOR-MAPPING.md',import.meta.url),md);
console.log(`${sensors.length} ASC sensors; ${entities.length} dashboard entities`);
