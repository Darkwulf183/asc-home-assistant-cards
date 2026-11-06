// Static SVG/PNG design proofs from the production SVG renderers.
// No browser execution; these are not screenshots of Home Assistant.
import {writeFileSync,mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {DESIGN_CSS,model,compactFlow} from '../src/shared/design.js';
import {DASHBOARD_CSS,dashboardFlow,chart,gauge,landscape} from '../src/shared/dashboard-design.js';
import {demoConfig,demoHass} from '../demo/data.js';
globalThis.HTMLElement=class {attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[],getElementById:()=>null};}};
const {ASCSolarDashboardCard}=await import('../src/asc-solar-dashboard-card.js');
const card=new ASCSolarDashboardCard();card.setConfig(demoConfig);card._hass=demoHass();await card.refresh();
const m=model(card),html=card.shadowRoot.innerHTML;
const dir=new URL('../preview/',import.meta.url);mkdirSync(dir,{recursive:true});
const css=(DESIGN_CSS+DASHBOARD_CSS).replace(/var\(--ink,#edf3f8\)/g,'#edf3f8').replace(/var\(--muted\)/g,'#a9b7c2')+`svg text{font-family:Arial,sans-serif;fill:#edf3f8} .narrow-flow{display:none}.label,.small,.tiny{fill:#a9b7c2}.wide-flow{display:block}.symbol{filter:none}.tile{fill:url(#tile-fill)}.gauge-number{font-size:21px;font-weight:650}.gauge-label{font-size:10px;fill:#a9b7c2}.chart text{font-size:10px;fill:#a9b7c2}.chart .gridline{stroke:#263947}.chart .series{fill:none;stroke-width:2}`;
const wrap=(w,h,content)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><style>${css}</style><rect x="1" y="1" width="${w-2}" height="${h-2}" rx="22" fill="#0d171e" stroke="#293b48"/>${content}</svg>`;
const svgOnly=s=>s.slice(s.indexOf('<svg'),s.lastIndexOf('</svg>')+6);
const place=(s,x,y,w,h)=>s.replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" style="width:${w}px;height:${h}px" `).replace(/<circle class="flow-dot"[\s\S]*?<\/circle>/g,'');
const text=(x,y,s,size=16,color='#edf3f8',weight=400)=>`<text x="${x}" y="${y}" style="text-anchor:start;font-size:${size}px;fill:${color};font-weight:${weight}">${s}</text>`;
const small=wrap(1200,760,text(32,61,'Energieverteilung heute',31,'#edf3f8',650)+text(32,91,'HEUTE  ·  WOCHE  ·  MONAT  ·  ZEITRAUM',11,'#68caff')+place(compactFlow(m),10,122,1180,587)+`<path d="M32 709H1168" stroke="#293b48"/>`+text(32,741,'Energie-Dashboard aufrufen  ›',16,'#52c8ff'));
const lists=[...html.matchAll(/<dl class="data-list">([\s\S]*?)<\/dl>/g)].map(match=>[...match[1].matchAll(/<dt>(.*?)<\/dt><dd>(.*?)<\/dd>/g)].map(x=>[x[1],x[2]]));
const panel=(x,y,w,h,title,content)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="#0c1922" stroke="#263b49"/>${text(x+17,y+28,title,16,'#edf3f8',600)}${content}`;
const rows=(items,x,y,w)=>items.map(([a,b],i)=>`<rect x="${x}" y="${y+i*29}" width="${w}" height="27" rx="5" fill="${i%2?'#0d1b25':'#142531'}"/>${text(x+9,y+18+i*29,a,11,'#a9b7c2')}<text x="${x+w-9}" y="${y+18+i*29}" style="text-anchor:end;font-size:12px">${b}</text>`).join('');
const chartSvg=svgOnly(chart(card,m));
const gaugeHtml=[...html.matchAll(/<svg viewBox="0 0 220 151"[\s\S]*?<\/svg>/g)].map(x=>x[0]);
let big=text(30,39,'ADAPTIVE SOLAR CONTROLLER',11,'#61c7ff')+text(30,78,'Energiefluss',32,'#edf3f8',650)+text(30,106,'PV → DC-Bus → Inverter → Haus ↔ Netz · Akku am DC-Bus',14,'#adc1cf')+place(dashboardFlow(m),10,129,1200,449);
big+=panel(16,590,470,340,'Leistungsverlauf heute',place(chartSvg,27,642,448,253)+text(36,951-52,'PV · Inverter · Batterie · Netz · Haus',11,'#9bafbe'));
big+=panel(498,590,334,340,'Energie heute',rows(lists[0],509,638,312));
big+=panel(844,590,360,340,'Aktueller Status',rows(lists[1],855,630,338));
for(let i=0;i<3;i++)big+=panel(16+i*267,946,255,216,['PV Auslastung','Batterie Füllstand','Eigenverbrauch AC'][i],place(gaugeHtml[i],28+i*267,989,231,158));
big+=panel(817,946,387,216,'',place(svgOnly(landscape()),818,947,385,214))+`<rect x="818" y="1074" width="385" height="87" fill="#07131e" opacity=".8"/>`+text(838,1108,'Saubere Energie.',21,'#edf3f8',600)+text(838,1135,'Dein System im Blick.',16,'#c2d8e5');
big+=text(20,1187,'Statische Designvorschau · synthetische Demodaten · v0.3.0',11,'#91a9b8');
const outputs={'small':small,'dashboard':wrap(1220,1204,big),'mobile-flow':wrap(400,650,place(compactFlow(m,true).replace('narrow-flow','wide-flow'),10,20,380,610))};
for(const [name,svg]of Object.entries(outputs))writeFileSync(new URL(name+'.svg',dir),svg);
if(process.argv[2]){const sharp=createRequire(import.meta.url)(process.argv[2]);for(const [name,svg]of Object.entries(outputs))await sharp(Buffer.from(svg)).png().toFile(new URL(name+'.png',dir).pathname.replace(/^\/([A-Za-z]:)/,'$1'));}
console.log('Static production-renderer previews created.');
