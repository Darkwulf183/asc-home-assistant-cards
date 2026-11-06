import {esc,read} from './helpers.js';
import {PALETTE,icon,flow,uniqueMarkers} from './design.js';
import {historyPath} from './history.js';
import {SOLAR_PHOTO} from './photo.js';
export const ASC_FIELDS={
 controller_state:'sensor.adaptive_solar_controller_controller_state',mode:'select.adaptive_solar_controller_control_mode',
 inverter_limit:'sensor.adaptive_solar_controller_effective_inverter_limit',forecast:'sensor.adaptive_solar_controller_corrected_pv_forecast_today_total',
 budget:'sensor.adaptive_solar_controller_battery_energy_budget',budget_state:'sensor.adaptive_solar_controller_battery_energy_budget_state',
 learning:'sensor.adaptive_solar_controller_prediction_maturity',planner_reason:'sensor.adaptive_solar_controller_energy_planner_reason',
 prediction_confidence:'sensor.adaptive_solar_controller_prediction_confidence'
};
export const DASHBOARD_CSS=`
 .solar .diagram svg.narrow-flow{display:none}
 .solar .diagram svg.wide-flow{display:block}
 .chart{width:100%;height:auto;display:block}
 .solar{background:radial-gradient(ellipse at 45% 0,#10253066,transparent 65%),#081219;padding:14px;border-radius:20px}.solar .head{padding:9px 10px 8px}.solar .head h2{font-size:27px}.solar .periods{padding-left:10px;padding-right:10px}.panel{background:linear-gradient(140deg,#10202a66,#09151d99);border:1px solid #233947;border-radius:15px;overflow:hidden}.theme-ha .panel{background:var(--surface)}.flow-panel{margin-bottom:12px;padding-bottom:8px}.tile{fill:url(#tile-fill);stroke:#395462;stroke-width:1.1}.tile-value{font-size:25px;font-weight:650;letter-spacing:-.5px}.tile-label{font-size:14px;font-weight:600}.tile-detail{font-size:12px;fill:var(--muted)!important}.tile-detail.left,.tile-value.left,.tile-label.left{text-anchor:start}.chart text{text-anchor:start;font-size:10px;fill:var(--muted)}.chart .gridline{stroke:#263947;stroke-width:1;fill:none}.chart path.series{stroke-width:2;fill:none;stroke-linejoin:round}.lower{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:12px}.panel h3{font-size:16px;font-weight:600;padding:17px 16px 12px;margin:0}.chart-wrap{padding:0 12px}.legend{display:flex;gap:12px;flex-wrap:wrap;padding:10px 17px 17px;font-size:11px;color:var(--muted)}.legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px}.data-list{margin:0;padding:0 12px 13px}.data-row{display:flex;align-items:center;gap:8px;justify-content:space-between;min-height:38px;padding:8px;border-radius:8px;font-size:11px}.data-row:nth-child(odd){background:#20334135}.data-row dt{color:var(--muted);flex:1}.data-row dd{margin:0;text-align:right;font-weight:550;overflow-wrap:anywhere;max-width:55%}.row-dot{width:5px;height:17px;border-radius:4px;background:var(--row-color,#71caff)}.gauges{display:grid;grid-template-columns:1fr 1fr 1fr 1.4fr;gap:12px;margin-top:12px}.gauge{width:100%;display:block}.gauge .gauge-number{font-size:21px;font-weight:650}.gauge .gauge-label{font-size:10px;fill:var(--muted)}.landscape{position:relative;min-height:200px;background:#112838}.landscape svg{width:100%;height:100%;display:block;position:absolute;inset:0}.landscape .caption{position:absolute;bottom:0;left:0;right:0;padding:45px 18px 17px;background:linear-gradient(transparent,#07131eee);font-size:15px;font-weight:550;line-height:1.4}.landscape small{font-size:10px;color:#b7d1dc;font-weight:400;display:block;margin-top:5px}.history-note{padding:0 16px 15px;color:var(--muted);font-size:11px}.solar .note{padding:12px 10px 2px}.flow-panel .diagram{padding:0 12px}.chart-empty{min-height:190px;display:grid;place-content:center;text-align:center;color:var(--muted);font-size:12px;padding:20px;line-height:1.6}
 @container(max-width:900px){.lower{grid-template-columns:1fr 1fr}.lower .history-panel{grid-column:1/-1}.gauges{grid-template-columns:1fr 1fr}.solar .head .badge{display:none}}
 .history-panel .chart{max-height:300px}.gauge{max-height:200px}
 @container(max-width:700px){.solar .diagram svg.wide-flow{display:none}.solar .diagram svg.narrow-flow{display:block;max-width:440px;margin:0 auto}}
 @container(max-width:480px){.solar{padding:8px}.lower{grid-template-columns:1fr}.gauges{grid-template-columns:1fr 1fr}.gauges h3{font-size:12px;padding:12px 10px}.landscape{min-height:155px}.landscape .caption{font-size:12px;padding:24px 10px 12px}.solar .head h2{font-size:22px}.solar .subtitle{font-size:10px}.data-row{font-size:12px}}
`;
export function dashboardFlow(m){
 const {live:l,energy:e,stored,capacity,soc,f,c,h}=m,animate=c.animate!==false;
 const tile=(type,x,y,w,height,title,value,details,key)=>`<g class="node" style="color:${PALETTE[type]}" data-key="${key}" tabindex="0" role="button" aria-label="${esc(title)} Details"><rect class="tile" x="${x}" y="${y}" width="${w}" height="${height}" rx="15"/>${icon(type,x+15,y+37,55)}<text class="tile-label left" x="${x+84}" y="${y+27}">${esc(title)}</text><text class="tile-value left" x="${x+84}" y="${y+59}">${esc(value)}</text>${details.map((s,i)=>`<text class="tile-detail left" x="${x+84}" y="${y+84+i*20}">${esc(s)}</text>`).join('')}</g>`;
 const limit=read(h,c.entities.inverter_limit,'power');
 return uniqueMarkers(`<svg class="wide-flow" viewBox="0 0 1100 412" role="group" aria-label="Live-Energiefluss mit Batterie am DC-Bus"><defs><linearGradient id="tile-fill" x2=".8" y2="1"><stop stop-color="#1b2c37"/><stop offset="1" stop-color="#0b171f"/></linearGradient></defs>
 ${flow('M246 102H347',PALETTE.pv,l.pv,false,animate)}${flow('M473 102H560',PALETTE.dc,l.inverter,false,animate)}${flow('M805 102H862',PALETTE.home,l.inverter,false,animate)}${flow('M410 134V208',l.battery<0?PALETTE.discharge:PALETTE.battery,l.battery,l.battery<0,animate)}${flow('M965 175V228',l.grid<0?PALETTE.export:PALETTE.home,l.grid,l.grid>=0,animate)}
 ${tile('pv',8,30,238,145,'PV / Solar',f(l.pv,'W'),['Energie: '+f(e.pv)],'pv_power')}
 <g style="color:#42b8ff" class="node" data-key="voltage" tabindex="0" role="button" aria-label="DC-Bus Details"><rect class="tile" x="347" y="69" width="126" height="65" rx="12" style="stroke:#42b8ff;stroke-width:2;filter:drop-shadow(0 0 7px #42b8ff44)"/><text class="tile-label" x="410" y="95">DC-Bus</text><text class="small" x="410" y="116">${esc(f(l.voltage,'V'))}</text></g>
 ${tile('inverter',560,30,245,145,'APsystems',f(l.inverter,'W'),['Limit: '+f(limit,'W'),'Energie: '+f(e.inverter)],'inverter_power')}
 ${tile('home',862,30,230,145,'Hausverbrauch',f(l.home,'W'),['Energie: '+f(e.home)],'home_power')}
 ${tile('battery',290,208,305,192,'Akku',f(l.battery===null?null:Math.abs(l.battery),'W'),[l.battery===null?'Livewert fehlt':l.battery>1?'Lädt gerade':l.battery< -1?'Entlädt gerade':'Ausgeglichen'],'stored_energy')}
 <rect x="374" y="307" width="147" height="8" rx="4" fill="#2b3c45"/>${soc===null?'':`<rect x="374" y="307" width="${147*Math.min(100,Math.max(0,soc))/100}" height="8" rx="4" fill="#56ed88"/>`}<text class="tiny" x="548" y="315">${esc(f(soc,'%'))}</text>
 <text class="tile-detail" x="443" y="340">${esc(f(stored)+' / '+f(capacity))}</text><text class="tile-detail" x="443" y="364">↓ ${esc(f(e.battery_charge))} geladen</text><text class="tile-detail" x="443" y="384">↑ ${esc(f(e.battery_discharge))} entnommen</text>
 ${tile('grid',862,228,230,158,'Netz',f(l.grid===null?null:Math.abs(l.grid),'W'),[l.grid===null?'Livewert fehlt':l.grid<0?'Einspeisung':'Netzbezug','↓ '+f(e.grid_import),'↑ '+f(e.grid_export)],'grid_power')}
 </svg>`,'d');
}
export function dataRows(rows){return `<dl class="data-list">${rows.map(([name,value,color])=>`<div class="data-row"><i class="row-dot" style="--row-color:${color||'#71caff'}"></i><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;}
export function gauge(title,value,main,sub,color){
 return `<section class="panel"><h3>${esc(title)}</h3><svg viewBox="0 0 220 151" class="gauge" role="img" aria-label="${esc(title+' '+main+' '+sub)}"><path d="M25 105 A85 85 0 0 1 195 105" fill="none" stroke="#243640" stroke-width="16"/>${Number.isFinite(value)?`<path d="M25 105 A85 85 0 0 1 195 105" fill="none" stroke="${color}" stroke-width="16" stroke-dasharray="${Math.max(0,Math.min(100,value))/100*Math.PI*85} ${Math.PI*85}"/>`:''}<text class="gauge-number" x="110" y="89">${esc(main)}</text><text class="gauge-label" x="110" y="113">${esc(sub)}</text><text class="gauge-label" x="110" y="136">${esc(Number.isFinite(value)?Math.round(value)+' %':'Keine Daten')}</text></svg></section>`;
}
// Decode the embedded photo once into a blob URL. Writing ~300 KB of base64 into innerHTML
// on every live update would re-parse and re-decode the image each time.
let photoUrl;
export function photoHref(){
 if(photoUrl)return photoUrl;
 try{const b64=SOLAR_PHOTO.slice(SOLAR_PHOTO.indexOf(',')+1),bin=atob(b64),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);photoUrl=URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));}catch(e){return SOLAR_PHOTO;}
 return photoUrl;
}
export function landscape(){return `<section class="panel landscape"><svg viewBox="0 0 360 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="${photoHref()}" width="360" height="230" preserveAspectRatio="xMidYMid slice"/></svg><div class="caption">Saubere Energie.<br>Dein System im Blick.<small>ASC · DC-gekoppeltes Solarsystem</small></div></section>`;}
export function chart(card,m){
 const series=card._history||[];
 if(!series.some(s=>s.points.some(p=>p.v!==null)))return `<div class="chart-empty">${card._historyLoading?'Leistungsverlauf wird geladen …':'Noch keine Verlaufsdaten verfügbar.'}<br>Aufgezeichnete Leistungssensoren erforderlich.</div>`;
 let min=0,max=100;for(const s of series)for(const p of s.points)if(Number.isFinite(p.v)){min=Math.min(min,p.v);max=Math.max(max,p.v);}max=Math.ceil(max/100)*100;min=Math.floor(min/100)*100;
 const start=card._historyStart,end=card._historyEnd;
 const ticks=[0,.25,.5,.75,1].map(t=>{const y=18+t*170;return `<path class="gridline" d="M42 ${y}H382"/><text x="0" y="${y+4}">${Math.round(max-t*(max-min))}</text>`;}).join('');
 const times=[0,.25,.5,.75,1].map(t=>`<text x="${42+t*340}" y="209" style="text-anchor:${t===1?'end':t===0?'start':'middle'}">${esc(new Date(start+t*(end-start)).toLocaleTimeString(m.h.locale?.language||'de',{hour:'2-digit',minute:'2-digit'}))}</text>`).join('');
 return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 390 220" role="img" aria-label="Leistungsverlauf heute in Watt">${ticks}${times}${series.map(s=>`<path class="series" stroke="${s.color}" d="${historyPath(s.points,start,end,42,18,340,170,min,max)}"/>`).join('')}</svg></div><div class="legend">${series.filter(s=>s.points.some(p=>p.v!==null)).map(s=>`<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
}
