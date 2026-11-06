import {esc,read,houseBalance,liveValues} from './helpers.js';

export const PALETTE={pv:'#ffc21b',dc:'#42b8ff',battery:'#56ed88',discharge:'#ffb632',inverter:'#b883ff',home:'#42c8ea',grid:'#42dbac',export:'#b883ff'};
export const ICONS={
 pv:'<circle cx="24" cy="20" r="8" fill="currentColor" stroke="none"/><path d="M24 3v5m0 24v5M7 20H2m39 0h5M12 8l4 4m16 16 4 4M12 32l4-4M32 12l4-4"/>',
 dc:'<path d="M10 17h28M10 29h28" stroke-width="5"/>',
 inverter:'<rect x="12" y="4" width="24" height="34" rx="4"/><path d="M18 16c5-12 7 12 12 0M18 28c5-12 7 12 12 0M24 38v7"/>',
 battery:'<rect x="12" y="6" width="24" height="36" rx="3"/><path d="M20 6V2h8v4"/><path d="M17 32h14M17 24h14M17 16h14" stroke-width="5"/>',
 home:'<path d="M3 23 24 4l21 19M9 19v24h11V29h9v14h10V19"/>',
 grid:'<path d="M19 3h10l7 42M19 3l-7 42M14 15h20L7 23h34L15 15m-3 18h24L16 23m16 0L12 33l24 12m0-12L12 45M24 3v8"/>',
 leaf:'<path d="M39 6C11 5 4 20 14 32c11 9 26-2 25-26ZM8 42l23-26"/>',
 status:'<circle cx="24" cy="24" r="15"/><path d="m16 24 6 6 11-13"/>'
};
export function icon(type,x,y,size=42){return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 48 48" class="symbol" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[type]||ICONS.status}</g></svg>`;}
export function formatValue(value,unit='kWh',language='de'){
 if(!Number.isFinite(value))return '—';
 return new Intl.NumberFormat(language,{maximumFractionDigits:unit==='W'||unit==='%'?0:unit==='V'||unit==='A'?1:2}).format(value)+(unit?' '+unit:'');
}
export function model(card){
 const c=card._config,h=card._hass,energy={};
 for(const [k,e]of Object.entries(c.energy))energy[k]=!e?null:e.source==='today'?(card._period==='today'?read(h,e.entity,'energy'):null):card._energy[k]??null;
 // HA Energy auto-mapping supplies AC inverter/grid roles even when no YAML energy role exists.
 // An explicit YAML role (also null = disabled) wins; otherwise use the auto-mapped value.
 for(const k of ['inverter','grid_import','grid_export'])if(!Object.prototype.hasOwnProperty.call(c.energy,k))energy[k]=card._energy[k]??null;
 if(!c.energy.home)energy.home=houseBalance(energy.inverter,energy.grid_import,energy.grid_export);
 let stored=read(h,c.entities.stored_energy,'energy'),capacity=read(h,c.entities.capacity,'energy');
 if(stored!==null&&stored<0)stored=null;if(capacity!==null&&capacity<=0)capacity=null;
 const soc=stored!==null&&capacity!==null?stored/capacity*100:null;
 const live=liveValues(h,c),f=(n,u)=>formatValue(n,u,h.locale?.language||'de');
 return {c,h,energy,stored,capacity,soc,live,f};
}
export function flow(d,color,power,reverse=false,animated=true){
 const active=Number.isFinite(power)&&Math.abs(power)>1;
 // Static lines show topology. Moving dots exclusively represent current measurements.
 const marker='arrow-'+color.slice(1);
 return `<g style="color:${color}"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L8 5L1 9" fill="none" stroke="${color}" stroke-width="2"/></marker></defs><path class="wire ${active?'active':''}" d="${d}" ${active?`marker-${reverse?'start':'end'}="url(#${marker})"`:''}/>${active&&animated?`<circle class="flow-dot" r="3.2" fill="currentColor"><animateMotion dur="2.8s" repeatCount="indefinite" path="${d}" ${reverse?'keyPoints="1;0" keyTimes="0;1" calcMode="linear"':''}/></circle>`:''}</g>`;
}
export const DESIGN_CSS=`
 :host{display:block;container-type:inline-size;font-family:var(--paper-font-body1_-_font-family,Inter,Roboto,Arial,sans-serif)}
 *{box-sizing:border-box}ha-card{display:block;--card-bg:#10181e;color:#edf3f8;background:radial-gradient(ellipse at 50% 0,#172128 0,transparent 65%),#10181e;border:1px solid #28343c;border-radius:22px;overflow:hidden;box-shadow:0 14px 45px #0003;--muted:#a9b7c2;--surface:#14212a;--border:#293e4d;--ink:#edf3f8}
 ha-card.theme-ha{--card-bg:var(--ha-card-background,var(--card-background-color,#10181e));color:var(--primary-text-color,#edf3f8);background:var(--ha-card-background,var(--card-background-color,#10181e));--muted:var(--secondary-text-color,#a9b7c2);--surface:var(--secondary-background-color,#14212a);--border:var(--divider-color,#293e4d);--ink:var(--primary-text-color,#edf3f8)}
 .head{padding:24px 28px 8px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.head h2{font-size:clamp(19px,3.5cqi,28px);letter-spacing:-.6px;margin:0;font-weight:650}.eyebrow{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#69caff;margin-bottom:7px}.subtitle{color:var(--muted);font-size:12px;margin:7px 0 0}.periods{display:flex;gap:4px;flex-wrap:wrap;align-items:center;padding:10px 28px 0}
 button,input{font:inherit}button{cursor:pointer}.periods button{padding:6px 10px;background:transparent;color:var(--muted);border:1px solid transparent;border-radius:7px;font-size:12px}.periods button[aria-pressed=true]{background:#38b8ff17;color:#65c9ff;border-color:#38b8ff35}.periods button:hover{background:#38b8ff25}button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #65c9ff;outline-offset:3px}.dates{display:flex;gap:10px;flex-wrap:wrap;padding:12px 28px;font-size:12px;color:var(--muted)}input{color:inherit;background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:5px;max-width:160px;color-scheme:dark}.diagram{padding:8px 18px 0}.diagram svg{display:block;width:100%;height:auto;overflow:visible}svg text{fill:var(--ink,#edf3f8);font-family:inherit;text-anchor:middle}.label{font-size:15px;fill:var(--muted)!important}.big{font-size:22px;font-weight:650;letter-spacing:-.4px}.small{font-size:12px;fill:var(--muted)!important}.tiny{font-size:10px;fill:var(--muted)!important}.ring{fill:#0b131a55;stroke:currentColor;stroke-width:2.5}.ring-halo{fill:none;stroke:currentColor;stroke-width:10;opacity:.055}.wire{fill:none;stroke:currentColor;stroke-width:2;opacity:.38;stroke-linecap:round}.wire.active{opacity:.9}.flow-dot{filter:drop-shadow(0 0 5px currentColor)}.symbol{color:inherit;filter:drop-shadow(0 0 7px currentColor)}.node{cursor:pointer}.node:focus{outline:none}.node:focus .ring,.node:hover .ring{stroke-width:4}.node:focus .tile,.node:hover .tile{stroke:currentColor;stroke-width:2}.note{font-size:11px;color:var(--muted);padding:8px 28px 17px;line-height:1.5}.error{color:#ff9e91;padding:8px 28px;font-size:12px}.footer{display:flex;align-items:center;justify-content:space-between;margin:0 28px;padding:17px 0;border-top:1px solid var(--border);color:#50c6ff;font-size:13px;text-decoration:none}.footer span:last-child{font-size:24px}.badge{font-size:11px;white-space:nowrap;color:var(--muted);padding-top:7px}.badge:before{content:'';display:inline-block;width:6px;height:6px;margin-right:7px;background:#68b8ed;border-radius:50%}
 @media(prefers-reduced-motion:reduce){.flow-dot{display:none}.symbol{filter:none}}
 .diagram svg.wide-flow{display:block}.diagram svg.narrow-flow{display:none}
 @container(max-width:480px){.head{padding:18px 18px 5px}.periods{padding-left:18px;padding-right:18px}.diagram{padding:0 5px}.head .badge{display:none}.note{padding-left:18px;padding-right:18px}.footer{margin:0 18px}}
 @container(max-width:720px){.diagram svg.wide-flow{display:none}.diagram svg.narrow-flow{display:block;max-width:440px;margin:0 auto}}
`;
export function controls(card){return `<div class="periods" aria-label="Energiezeitraum">${[['today','Heute'],['week','Woche'],['month','Monat'],['custom','Zeitraum']].map(([p,t])=>`<button data-period="${p}" aria-pressed="${p===card._period}">${t}</button>`).join('')}</div>${card._period==='custom'?`<div class="dates"><label>Von <input aria-label="Von" type="date" id="start" value="${esc(card._start||'')}"></label><label>Bis <input aria-label="Bis einschließlich" type="date" id="end" value="${esc(card._end||'')}"></label></div>`:''}`;}
export function periodLabel(card){return card._period==='today'?'heute':card._period==='week'?'diese Woche':card._period==='month'?'diesen Monat':'im Zeitraum';}
export function ringNode(type,x,y,r,title,main,sub,key,extra='',below=false){
 return `<g class="node" style="color:${PALETTE[type]}" data-key="${key}" tabindex="0" role="button" aria-label="${esc(title)} Details"><text class="label" x="${x}" y="${below?y+r+22:y-r-13}">${esc(title)}</text><circle class="ring-halo" cx="${x}" cy="${y}" r="${r}"/><circle class="ring" cx="${x}" cy="${y}" r="${r}"/>${icon(type,x-19,y-43,38)}<text class="big" x="${x}" y="${y+15}"${String(main).length>8?' style="font-size:19px"':''}>${esc(main)}</text><text class="small" x="${x}" y="${y+36}">${esc(sub)}</text>${extra}</g>`;
}
export function compactFlow(m,narrow=false){
 const {f,energy:e,live:l,c,stored,soc}=m,animated=c.animate!==false;
 const width=narrow?380:900,height=narrow?650:460;
 const pos=narrow?{pv:[78,100],dc:[275,100],inverter:[275,304],home:[275,510],battery:[78,304],grid:[78,510]}:{pv:[90,111],dc:[340,111],inverter:[580,111],home:[810,111],battery:[340,303],grid:[810,315]};
 const r=narrow?62:64;
 const wire=narrow?[
 flow('M140 100H213',PALETTE.pv,l.pv,false,animated),flow('M275 162V242',PALETTE.inverter,l.inverter,false,animated),flow('M275 366V371M275 399V448',PALETTE.home,l.inverter,false,animated),
 flow('M255 159V196Q255 206 245 206H97Q78 206 78 226V242',l.battery<0?PALETTE.discharge:PALETTE.battery,l.battery,l.battery<0,animated),flow('M213 510H140',l.grid<0?PALETTE.export:PALETTE.home,l.grid,l.grid>=0,animated)
 ]:[flow('M154 111H276',PALETTE.pv,l.pv,false,animated),flow('M404 111H516',PALETTE.inverter,l.inverter,false,animated),flow('M644 111H746',PALETTE.home,l.inverter,false,animated),flow('M328 174V238',PALETTE.battery,l.battery>0?l.battery:0,false,animated),flow('M352 238V174',PALETTE.discharge,l.battery<0?l.battery:0,false,animated),flow('M810 180V245',l.grid<0?PALETTE.export:PALETTE.home,l.grid,l.grid>=0,animated)];
 const n=(k,title,main,sub,key,extra='')=>ringNode(k,...pos[k],r,title,main,sub,key,extra,['battery','grid'].includes(k)||(narrow&&['inverter','home'].includes(k)));
 const watts=v=>c.show_live===false?'':f(v,'W')+' live';
 return uniqueMarkers(`<svg class="${narrow?'narrow-flow':'wide-flow'}" viewBox="0 0 ${width} ${height}" role="group" aria-label="PV zum DC-Bus, Akku am DC-Bus, Inverter zum Haus, Haus und Netz">${wire.join('')}
 ${n('pv','PV',f(e.pv),watts(l.pv),'pv_power')}
 ${n('dc','DC-Bus',f(l.voltage,'V'),'DC-Spannung','voltage')}
 ${n('inverter','Inverter',f(e.inverter),watts(l.inverter),'inverter_power')}
 ${n('home','Haus',f(e.home),watts(l.home),'home_power')}
 ${n('battery','Akku',f(stored),soc===null?'Füllstand unbekannt':f(soc,'%')+' · geschätzt','stored_energy',soc===null?'':`<circle cx="${pos.battery[0]}" cy="${pos.battery[1]}" r="${r+5}" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="${Math.max(0,Math.min(100,soc))/100*2*Math.PI*(r+5)} ${2*Math.PI*(r+5)}" transform="rotate(-90 ${pos.battery[0]} ${pos.battery[1]})"/>`)}
 ${n('grid','Netz','↓ '+f(e.grid_import),'↑ '+f(e.grid_export),'grid_power')}
 <text class="small" x="${pos.battery[0]}" y="${pos.battery[1]+r+44}">↓ ${esc(f(e.battery_charge))} geladen</text><text class="small" x="${pos.battery[0]}" y="${pos.battery[1]+r+63}">↑ ${esc(f(e.battery_discharge))} entnommen</text>
 ${c.show_live===false?'':`<text class="tiny" x="${pos.grid[0]}" y="${pos.grid[1]+r+44}">${l.grid===null?'Livewert fehlt':esc(f(Math.abs(l.grid),'W')+(l.grid<0?' Einspeisung':' Bezug'))}</text>`}
 </svg>`,narrow?'n':'w');
}
// Prefix marker ids per SVG (a marker inside a hidden SVG does not render in a visible one)
// and drop repeated identical marker definitions within the same SVG.
export const uniqueMarkers=(svg,prefix)=>{const seen=new Set();return svg.replace(/arrow-([0-9a-f]{6})/g,'arrow-'+prefix+'-$1').replace(/<defs><marker id="([^"]+)"[\s\S]*?<\/marker><\/defs>/g,(all,id)=>seen.has(id)?'':(seen.add(id),all));};

export function miniFlow(m){
 const {f,energy:e,live:l,c,stored,soc}=m,animated=c.animate!==false;
 const W=330,H=316;
 // Columns: PV | DC-Bus | Inverter. DC-Bus feeds Akku below; Inverter feeds Haus; Netz below Haus.
 const P={pv:[52,56,29],dc:[165,56,29],inverter:[278,56,29],battery:[165,166,31],home:[278,166,31],grid:[278,264,30]};
 const node=(type,title,main,sub,key,subBelow=false)=>{const [x,y,r]=P[type];return `<g class="node" style="color:${PALETTE[type]}" data-key="${key}" tabindex="0" role="button" aria-label="${esc(title)} Details"><text class="tiny mini-label" x="${x}" y="${y-r-7}">${esc(title)}</text><circle class="ring" cx="${x}" cy="${y}" r="${r}"/>${icon(type,x-10,y-r+5,20)}<text x="${x}" y="${y+(sub&&!subBelow?6:10)}" class="mini-main"${String(main).length>8?' style="font-size:10.5px"':''}>${esc(main)}</text>${sub?`<text class="tiny" x="${x}" y="${subBelow?y+r+13:y+19}">${esc(sub)}</text>`:''}</g>`;};
 const w=(d,color,power,reverse=false)=>flow(d,color,power,reverse,animated);
 const bp=l.battery,gp=l.grid;
 const live=v=>c.show_live===false?'':f(v,'W');
 return uniqueMarkers(`<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Kompakte DC-Energieverteilung">
 ${w('M81 56H136',PALETTE.pv,l.pv)}${w('M194 56H249',PALETTE.inverter,l.inverter)}${w('M278 85V135',PALETTE.home,l.inverter)}
 ${w('M165 85V135',bp<0?PALETTE.discharge:PALETTE.battery,bp,bp<0)}${w('M278 197V234',gp<0?PALETTE.export:PALETTE.home,gp,gp>=0)}
 ${node('pv','PV',f(e.pv),live(l.pv),'pv_power')}
 ${node('dc','DC-Bus',f(l.voltage,'V'),'','voltage')}
 ${node('inverter','Inverter',f(e.inverter),live(l.inverter),'inverter_power')}
 ${node('battery','Akku',f(stored),soc===null?'—':f(soc,'%'),'stored_energy')}
 ${node('home','Haus',f(e.home),live(l.home),'home_power')}
 ${node('grid','Netz','↓ '+f(e.grid_import),'↑ '+f(e.grid_export),'grid_power',true)}
 <text class="tiny" x="165" y="219">↓ ${esc(f(e.battery_charge))} geladen</text><text class="tiny" x="165" y="234">↑ ${esc(f(e.battery_discharge))} entnommen</text>
 </svg>`,'m');
}
