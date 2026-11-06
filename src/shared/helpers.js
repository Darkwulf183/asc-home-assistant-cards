export const DEFAULTS = {
 pv_power:'sensor.solar_watt_aktuell', voltage:'sensor.solar_average_voltage', battery_current:'sensor.solar_complete_ampere',
 inverter_power:'sensor.apsystems_output_average', grid_power:'sensor.e320_power_in',
 stored_energy:'sensor.adaptive_solar_controller_estimated_stored_battery_energy',
 capacity:'sensor.adaptive_solar_controller_learned_usable_battery_capacity'
};
export const ENERGY_DEFAULTS={
 pv:{entity:'sensor.solar_tageserzeugung',source:'today'},
 battery_charge:{entity:'sensor.adaptive_solar_controller_battery_energy_charged_total',source:'statistics'},
 battery_discharge:{entity:'sensor.adaptive_solar_controller_battery_energy_discharged_total',source:'statistics'}
};
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function read(hass,id,kind) {
 const s=hass?.states?.[id]; if(!s||s.state==null||String(s.state).trim()==='')return null;
 const n=Number(s.state); if(!Number.isFinite(n))return null;
 const units={power:{W:1,kW:1000},energy:{Wh:.001,kWh:1,MWh:1000},voltage:{V:1},current:{A:1,mA:.001}};
 const factor=units[kind]?.[s.attributes?.unit_of_measurement]; return factor===undefined?null:n*factor;
}
export function sumChanges(rows) {
 const valid=(rows||[]).map(r=>r.change).filter(n=>typeof n==='number'&&Number.isFinite(n));
 return valid.length?valid.reduce((a,b)=>a+b,0):null;
}
export function houseBalance(inverter,imp,exp){return [inverter,imp,exp].every(Number.isFinite)?inverter+imp-exp:null;}
export function liveValues(hass,c){
 const e=c.entities; const p=k=>read(hass,e[k],'power');
 const v=read(hass,e.voltage,'voltage'),i=read(hass,e.battery_current,'current');
 let b=e.battery_power?p('battery_power'):(v===null||i===null?null:v*i);
 if(b!==null&&c.battery_positive==='discharge')b=-b;
 let g=p('grid_power');if(g!==null&&c.grid_positive==='export')g=-g;
 const inv=p('inverter_power');
 return {pv:p('pv_power'),battery:b,voltage:v,inverter:inv,grid:g,home:e.home_power?p('home_power'):houseBalance(inv,g,0)};
}
export function dateRange(period,now=new Date(),startDate,endDate){
 const start=new Date(now);start.setHours(0,0,0,0);let end=new Date(now);
 if(period==='week')start.setDate(start.getDate()-(start.getDay()+6)%7);
 if(period==='month')start.setDate(1);
 if(period==='custom'){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate||'')||!/^\d{4}-\d{2}-\d{2}$/.test(endDate||''))throw Error('Bitte beide Datumsfelder ausfüllen.');
  start.setTime(new Date(startDate+'T00:00:00').getTime());end=new Date(endDate+'T00:00:00');end.setDate(end.getDate()+1);
 }
 if(!Number.isFinite(+start)||!Number.isFinite(+end)||start>=end)throw Error('Ungültiger Zeitraum.');
 return {start,end};
}
