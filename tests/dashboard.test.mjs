import test from 'node:test';
import assert from 'node:assert/strict';
import {historyPoints,historyPath} from '../src/shared/history.js';
import {flow,model,compactFlow} from '../src/shared/design.js';
globalThis.HTMLElement=class {attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[],getElementById:()=>null};}};
const {ASCSolarDashboardCard}=await import('../src/asc-solar-dashboard-card.js');
test('history converts historical units, preserves unknown gaps and sign',()=>{
 const points=historyPoints([{state:'1',attributes:{unit_of_measurement:'kW'},last_changed:'2026-09-01T00:00:00Z'},{state:'unavailable',last_changed:'2026-09-01T00:05:00Z'},{state:'2',attributes:{unit_of_measurement:'W'},last_changed:'2026-09-01T00:10:00Z'}],'sensor.x',-1);
 assert.deepEqual(points.map(p=>p.v),[-1000,null,-2]);
 const d=historyPath(points,points[0].t,points[2].t,0,0,100,100,-1000,1000);assert.equal((d.match(/M/g)||[]).length,2);assert.ok(!d.includes(' L'));
});
test('unknown and zero live values do not animate; reverse flow uses reverse motion',()=>{
 assert.ok(!flow('M0 0H100','#ffffff',null).includes('animateMotion'));
 assert.ok(!flow('M0 0H100','#ffffff',0).includes('animateMotion'));
 assert.match(flow('M0 0H100','#ffffff',-10,true),/keyPoints="1;0"/);
 assert.ok(!flow('M0 0H100','#ffffff',10,false,false).includes('animateMotion'));
});
test('large card loads real history endpoint and does not fabricate status',async()=>{
 const card=new ASCSolarDashboardCard();card.setConfig({});let requested='';
 card._hass={states:{},callWS:async()=>({}),callApi:async(method,url)=>{requested=url;return [];}};
 await card.refresh();assert.match(requested,/^history\/period\//);assert.match(requested,/filter_entity_id=/);
 assert.match(card.shadowRoot.innerHTML,/ASC-Status unbekannt/);assert.match(card.shadowRoot.innerHTML,/Keine Daten/);assert.ok(!card.shadowRoot.innerHTML.includes('Alles in Ordnung'));
 assert.match(card.shadowRoot.innerHTML,/Aktueller Status/);assert.match(card.shadowRoot.innerHTML,/Batterie Füllstand/);
});
test('unknown battery sentinel does not become negative capacity or zero SOC',()=>{
 const card={_config:{entities:{stored_energy:'s',capacity:'c'},energy:{}},_hass:{states:{s:{state:'-1',attributes:{unit_of_measurement:'kWh'}},c:{state:'6.7',attributes:{unit_of_measurement:'kWh'}}}},_energy:{}};
 assert.equal(model(card).stored,null);assert.equal(model(card).soc,null);
 assert.ok(!compactFlow(model(card)).includes('NaN'));
});
test('config escapes UI title and rejects external dashboard navigation',()=>{
 const card=new ASCSolarDashboardCard();assert.throws(()=>card.setConfig({dashboard_path:'https://example.com'}));
 card.setConfig({title:'<img src=x onerror=alert(1)>'});card._hass={states:{}};card.render();
 assert.match(card.shadowRoot.innerHTML,/&lt;img/);assert.ok(!card.shadowRoot.innerHTML.includes('<img src=x'));
});
test('disconnected dashboard ignores pending history response',async()=>{
 const card=new ASCSolarDashboardCard();card.setConfig({});let resolve;
 card._hass={states:{},callApi:()=>new Promise(r=>resolve=r)};
 const p=card.refreshHistory();card.disconnectedCallback();resolve([[{entity_id:'sensor.solar_watt_aktuell',state:'900',attributes:{unit_of_measurement:'W'},last_changed:new Date().toISOString()}]]);await p;
 assert.deepEqual(card._history,[]);
});
