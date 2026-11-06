// Synthetic demonstration data only. Not imported by the production bundle.
export const state=(n,u)=>({state:String(n),attributes:{unit_of_measurement:u}});
export const demoStates={
 'sensor.solar_watt_aktuell':state(1420,'W'), 'sensor.solar_average_voltage':state(24.8,'V'),
 'sensor.solar_complete_ampere':state(12.5,'A'), 'sensor.demo_battery_power':state(310,'W'),
 'sensor.apsystems_output_average':state(615,'W'), 'sensor.e320_power_in':state(87,'W'),
 'sensor.demo_house_power':state(702,'W'), 'sensor.solar_tageserzeugung':state(12.4,'kWh'),
 'sensor.adaptive_solar_controller_estimated_stored_battery_energy':state(4.8,'kWh'),
 'sensor.adaptive_solar_controller_learned_usable_battery_capacity':state(6.7,'kWh'),
 'sensor.adaptive_solar_controller_controller_state':state('running'),
 'select.adaptive_solar_controller_control_mode':state('adaptive'),
 'sensor.adaptive_solar_controller_effective_inverter_limit':state(800,'W'),
 'sensor.adaptive_solar_controller_corrected_pv_forecast_today_total':state(18.6,'kWh'),
 'sensor.adaptive_solar_controller_battery_energy_budget':state(3.2,'kWh'),
 'sensor.adaptive_solar_controller_battery_energy_budget_state':state('available'),
 'sensor.adaptive_solar_controller_prediction_maturity':state('learning')
};
export const demoConfig={pv_capacity_w:2000,entities:{battery_power:'sensor.demo_battery_power',home_power:'sensor.demo_house_power'},energy:{inverter:{entity:'demo.inverter',source:'statistics'},grid_import:{entity:'demo.import',source:'statistics'},grid_export:{entity:'demo.export',source:'statistics'}}};
export function demoHass(states=demoStates){return {states,locale:{language:'de'},
 callWS:async m=>m.type==='energy/get_prefs'?{energy_sources:[]}:Object.fromEntries(m.statistic_ids.map(id=>[id,[{change:id.includes('discharged')?1.1:id.includes('charged')?4.2:id==='demo.inverter'?5.8:id==='demo.import'?2.35:.05}]])),
 callApi:async(method,url)=>{
  const start=new Date();start.setHours(0,0,0,0);
  const ids=new URL('http://demo.invalid/'+url).searchParams.get('filter_entity_id').split(',');
  return ids.map(id=>Array.from({length:97},(_,i)=>{const hour=i/4,t=new Date(+start+i*900000);const solar=Math.max(0,Math.sin((hour-6)/12*Math.PI))*1420;
   const value=id.includes('solar_watt')?solar:id.includes('apsystems')?Math.min(615,solar*.5+120):id.includes('battery')?solar*.28-120:id.includes('house')?200+solar*.36:80+Math.sin(hour)*22;
   return {entity_id:id,...state(value,'W'),last_changed:t.toISOString(),last_updated:t.toISOString()};}));
 }
};}
