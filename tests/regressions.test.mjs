import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.HTMLElement=class {attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[],getElementById:()=>null,activeElement:null};}};
const {EnergyFlowCardDCBus}=await import('../src/energy-flow-card-dc-bus.js');
const {ASCSolarDashboardCard}=await import('../src/asc-solar-dashboard-card.js');
const {DESIGN_CSS,uniqueMarkers}=await import('../src/shared/design.js');
const {DASHBOARD_CSS}=await import('../src/shared/dashboard-design.js');
const CHARGED='sensor.adaptive_solar_controller_battery_energy_charged_total';

test('missing HA Energy configuration (not_found) keeps ASC battery statistics',async()=>{
 const card=new EnergyFlowCardDCBus();card.setConfig({});
 card._hass={states:{},callWS:async m=>{if(m.type==='energy/get_prefs')throw {code:'not_found',message:'No prefs'};return {[CHARGED]:[{change:4.2}]};}};
 await card.refresh();
 assert.equal(card._energy.battery_charge,4.2);assert.equal(card._error,'');
});

test('energy role set to null disables HA Energy auto-mapping for that role',async()=>{
 const card=new EnergyFlowCardDCBus();card.setConfig({energy:{grid_export:null}});let ids=[];
 card._hass={states:{},callWS:async m=>{if(m.type==='energy/get_prefs')return {energy_sources:[{type:'grid',stat_energy_from:'sensor.imp',stat_energy_to:'sensor.exp'}]};ids=m.statistic_ids;return {'sensor.imp':[{change:2}]};}};
 await card.refresh();
 assert.ok(ids.includes('sensor.imp'));assert.ok(!ids.includes('sensor.exp'));
 assert.equal(card._energy.grid_import,2);assert.equal(card._energy.grid_export,undefined);
});

test('unrelated entity updates do not rebuild the card DOM',()=>{
 const card=new EnergyFlowCardDCBus();card.setConfig({auto_ha_energy:false});let renders=0;const orig=card.render.bind(card);card.render=()=>{renders++;orig();};
 const pv={state:'100',attributes:{unit_of_measurement:'W'}};
 card._last=Date.now();card.hass={states:{'sensor.solar_watt_aktuell':pv},callWS:async()=>({})};const base=renders;
 card.hass={states:{'sensor.solar_watt_aktuell':pv,'sensor.other':{state:'1'}},callWS:async()=>({})};
 assert.equal(renders,base);
 card.hass={states:{'sensor.solar_watt_aktuell':{...pv,state:'200'}},callWS:async()=>({})};
 assert.equal(renders,base+1);
});

test('DC-Bus card renders wide and narrow layout; CSS shows exactly one',()=>{
 const card=new EnergyFlowCardDCBus();card.setConfig({auto_ha_energy:false});card._hass={states:{}};card.render();
 assert.match(card.shadowRoot.innerHTML,/class="wide-flow"/);assert.match(card.shadowRoot.innerHTML,/class="narrow-flow"/);
 // Selectors must outrank ".diagram svg{display:block}" or both layouts appear at once.
 assert.match(DESIGN_CSS,/\.diagram svg\.narrow-flow\{display:none\}/);
 assert.match(DESIGN_CSS,/@container\(max-width:720px\)\{\.diagram svg\.wide-flow\{display:none\}/);
 assert.ok(!/\.wide-flow\{display:block!important\}/.test(DESIGN_CSS+DASHBOARD_CSS));
});

test('dashboard has a mobile flow and uses a valid sections grid width',()=>{
 const card=new ASCSolarDashboardCard();assert.throws(()=>card.setConfig(null));card.setConfig({});card._hass={states:{}};card.render();
 assert.match(card.shadowRoot.innerHTML,/class="narrow-flow"/);assert.equal(card.getGridOptions().columns,'full');
});

test('marker ids are prefixed per SVG and not duplicated inside one SVG',()=>{
 const d='<defs><marker id="arrow-ffffff"><path/></marker></defs>';
 const out=uniqueMarkers('<svg>'+d+'<path marker-end="url(#arrow-ffffff)"/>'+d+'</svg>','n');
 assert.equal((out.match(/<marker /g)||[]).length,1);assert.match(out,/url\(#arrow-n-ffffff\)/);
});

test('no DOM rebuild while a finger is on the card; render follows on release',()=>{
 const card=new EnergyFlowCardDCBus();card.setConfig({auto_ha_energy:false});card._hass={states:{}};card.render();
 card._touching=true;const before=card.shadowRoot.innerHTML;card.shadowRoot.innerHTML='MARK';card.render();
 assert.equal(card.shadowRoot.innerHTML,'MARK');assert.equal(card._renderPending,true);
 card._touching=false;card.render();assert.notEqual(card.shadowRoot.innerHTML,'MARK');assert.equal(card.shadowRoot.innerHTML,before);
});

test('light card: flow only, always today, no period buttons, history or tables',async()=>{
 const {ASCSolarDashboardLightCard}=await import('../src/asc-solar-dashboard-light-card.js');
 const card=new ASCSolarDashboardLightCard();assert.throws(()=>card.setConfig(null));assert.throws(()=>card.setConfig({show_header:'nein'}));
 let api=0;card.setConfig({auto_ha_energy:false});card._period='week';
 card._hass={states:{'sensor.adaptive_solar_controller_controller_state':{state:'ok',attributes:{}}},callWS:async()=>({}),callApi:async()=>{api++;return [];}};
 await card.refresh();card.render();const html=card.shadowRoot.innerHTML.replace(/<style>[\s\S]*?<\/style>/,'');
 assert.equal(card._period,'today');assert.ok(!/data-period=/.test(html));assert.ok(!/Leistungsverlauf|Aktueller Status|class="gauge/.test(html));
 assert.match(html,/class="wide-flow"/);assert.ok(!/class="narrow-flow"/.test(html));assert.match(html,/>ok</);assert.equal(api,0);
 card.setConfig({show_header:false,auto_ha_energy:false});card.render();assert.ok(!/<h2>/.test(card.shadowRoot.innerHTML));
 assert.equal(card.getGridOptions().columns,'full');
});
