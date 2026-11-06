import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.HTMLElement=class {attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[],getElementById:()=>null};}};
const {EnergyFlowCardDCBus}=await import('../src/energy-flow-card-dc-bus.js');
test('card requests change statistics in kWh and rejects stale response',async()=>{
 const card=new EnergyFlowCardDCBus();card.setConfig({auto_ha_energy:false});let pending=[];
 card.hass={states:{},callWS:msg=>new Promise(resolve=>pending.push({msg,resolve}))};
 assert.equal(pending[0].msg.units.energy,'kWh');assert.deepEqual(pending[0].msg.types,['change']);
 const latest=card.refresh();pending[1].resolve({sensor:[]});await latest;
 pending[0].resolve({'sensor.adaptive_solar_controller_battery_energy_charged_total':[{change:999}]});
 await new Promise(r=>setImmediate(r));assert.notEqual(card._energy.battery_charge,999);
 assert.match(card.shadowRoot.innerHTML,/Inverter/);
});
test('API failures visible and no fabricated zero; config validation',async()=>{
 const card=new EnergyFlowCardDCBus();assert.throws(()=>card.setConfig({energy:{pv:{entity:'x'}}}));
 card.setConfig({});card._hass={states:{},callWS:async()=>{throw Error('Offline');}};await card.refresh();
 assert.match(card.shadowRoot.innerHTML,/Offline/);assert.equal(card._energy.battery_charge,undefined);
 assert.match(card.shadowRoot.innerHTML,/—/);
});
