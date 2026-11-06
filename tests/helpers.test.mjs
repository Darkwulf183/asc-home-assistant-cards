import test from 'node:test';
import assert from 'node:assert/strict';
import {read,sumChanges,houseBalance,liveValues,dateRange} from '../src/shared/helpers.js';
test('units, real zero, invalid and unavailable',()=>{
 const h={states:{p:{state:'1.2',attributes:{unit_of_measurement:'kW'}},z:{state:'0',attributes:{unit_of_measurement:'W'}},bad:{state:'unavailable'},empty:{state:''}}};
 assert.equal(read(h,'p','power'),1200);assert.equal(read(h,'z','power'),0);assert.equal(read(h,'bad','power'),null);assert.equal(read(h,'empty','power'),null);assert.equal(read(h,'p','energy'),null);
});
test('statistics changes handle resets without subtracting raw counter states',()=>{
 assert.equal(sumChanges([{change:2},{change:null},{change:3,state:0}]),5);assert.equal(sumChanges([]),null);assert.equal(sumChanges([{change:0}]),0);
});
test('house balance needs all inputs and preserves inconsistent negative result',()=>{
 assert.equal(houseBalance(4,6,1),9);assert.equal(houseBalance(4,null,1),null);assert.equal(houseBalance(4,6,undefined),null);assert.equal(houseBalance(1,0,2),-1);
});
test('ASC charging and export signs; missing battery measurement',()=>{
 const state=(state,unit)=>({state:String(state),attributes:{unit_of_measurement:unit}});
 const h={states:{v:state(25,'V'),i:state(-4,'A'),g:state(-50,'W'),inv:state(200,'W')}};
 const c={entities:{voltage:'v',battery_current:'i',grid_power:'g',inverter_power:'inv'}};
 assert.equal(liveValues(h,c).battery,-100);assert.equal(liveValues(h,c).home,150);
 assert.equal(liveValues(h,{...c,grid_positive:'export'}).grid,50);
 delete h.states.i;assert.equal(liveValues(h,c).battery,null);
});
test('calendar range and inclusive end, Monday week',()=>{
 const now=new Date(2026,8,15,12);assert.equal(dateRange('week',now).start.getDate(),14);assert.equal(dateRange('month',now).start.getDate(),1);
 const r=dateRange('custom',now,'2026-09-01','2026-09-02');assert.equal(r.end.getDate(),3);
 assert.throws(()=>dateRange('custom',now,'2026-09-03','2026-09-01'));
});
