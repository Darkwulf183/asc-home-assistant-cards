import {readFileSync,writeFileSync} from 'node:fs';
const data=readFileSync(new URL('../demo/data.js',import.meta.url),'utf8').replace(/^export /gm,'');
const setup=`
const cards=[document.querySelector('energy-flow-card-dc-bus'),document.querySelector('asc-solar-dashboard-light-card'),document.querySelector('asc-solar-dashboard-card')];
cards.forEach(card=>{card.setConfig(demoConfig);card.hass=demoHass();});
let discharge=false;
document.querySelector('#direction').onclick=()=>{discharge=!discharge;const states={...demoStates,'sensor.demo_battery_power':state(discharge?-310:310,'W'),'sensor.solar_complete_ampere':state(discharge?-12.5:12.5,'A'),'sensor.e320_power_in':state(discharge?-87:87,'W'),'sensor.demo_house_power':state(discharge?528:702,'W')};cards.forEach(card=>card.hass=demoHass(states));document.querySelector('#direction').textContent=discharge?'Laden & Netzbezug':'Entladen & Einspeisen';};
document.querySelector('#size').onclick=()=>{const phone=document.body.classList.toggle('phone');document.querySelector('#size').textContent=phone?'Volle Breite':'Handybreite';};
`;
writeFileSync(new URL('../demo/demo-bundle.js',import.meta.url),'(()=>{'+data+setup+'})();');
