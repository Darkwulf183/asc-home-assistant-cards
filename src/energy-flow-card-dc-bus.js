import {DEFAULTS,ENERGY_DEFAULTS,esc,sumChanges,dateRange} from './shared/helpers.js';
import {DESIGN_CSS,model,controls,periodLabel,compactFlow} from './shared/design.js';
import {patchShadow} from './shared/patch.js';
const AUTO_ROLES=['inverter','grid_import','grid_export'];
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
export class EnergyFlowCardDCBus extends HTMLElement {
 constructor(){super();this.attachShadow({mode:'open'});this._seq=0;this._energy={};this._haEnergyMap={};this._animationStart=Date.now();
  // Do not replace the element under the user's finger while they scroll or tap: mobile
  // WebViews (HA Companion app) can cancel the touch gesture when its target leaves the DOM.
  const down=()=>{this._touching=true;clearTimeout(this._touchTimer);this._touchTimer=setTimeout(up,4000);};
  const up=()=>{if(!this._touching)return;this._touching=false;clearTimeout(this._touchTimer);if(this._renderPending)setTimeout(()=>this.render(),0);};
  this._touchUp=up;
  this.shadowRoot.addEventListener?.('touchstart',down,{passive:true});
 }
 static getStubConfig(){return {type:'custom:energy-flow-card-dc-bus'};}
 setConfig(config){
  if(!config||typeof config!=='object')throw Error('Konfiguration fehlt.');
  for(const [key,value] of Object.entries(config.energy||{}))if(value!==null&&(typeof value!=='object'||!value.entity||!['today','statistics'].includes(value.source)))throw Error('energy.'+key+': entity und source (today/statistics) erforderlich.');
  for(const [key,values] of Object.entries({battery_positive:['charge','discharge'],grid_positive:['import','export'],appearance:['dark','ha']}))if(config[key]&&!values.includes(config[key]))throw Error(key+' ist ungültig.');
  if(config.dashboard_path&&!/^\/(?!\/)[a-zA-Z0-9_/?=&.%#-]*$/.test(config.dashboard_path))throw Error('dashboard_path muss ein lokaler HA-Pfad sein.');
  this._config={auto_ha_energy:true,...config,entities:{...DEFAULTS,...config.entities},energy:{...ENERGY_DEFAULTS,...config.energy}};
  this._period='today';this._energy={};this._seq++;this._last=0;this._watchKey=null;this.render();this.refresh();
 }
 set hass(hass){
  const old=this._hass;this._hass=hass;
  // HA sets hass on every state change in the whole installation. Only re-render when
  // a state object this card displays was replaced (HA replaces objects on change).
  const key=this._stateKey(hass);
  if(!old||key===null||key!==this._watchKey||old.locale?.language!==hass?.locale?.language){this._watchKey=key;this.render();}
  if(Date.now()-(this._last||0)>300000)this.refresh();
 }
 get hass(){return this._hass;}
 _stateKey(hass){
  if(!this._config||!hass?.states)return null;
  if(!this._stateIds)this._stateIds=new WeakMap();
  const ids=[...new Set([...Object.values(this._config.entities||{}),...Object.values(this._config.energy||{}).filter(e=>e?.source==='today').map(e=>e.entity)].filter(Boolean))];
  const tag=s=>{if(!s)return 0;let id=this._stateIds.get(s);if(!id){this._stateCounter=(this._stateCounter||0)+1;id=this._stateCounter;this._stateIds.set(s,id);}return id;};
  return ids.join(',')+'#'+ids.map(id=>tag(hass.states[id])).join(',');
 }
 getCardSize(){return 7;}
 getGridOptions(){return {columns:12,min_columns:6,rows:'auto'};}
 connectedCallback(){if(!this._touchBound){this._touchBound=true;for(const t of ['touchend','touchcancel'])window.addEventListener(t,()=>this._touchUp?.(),{passive:true,capture:true});}clearInterval(this._timer);this._timer=setInterval(()=>this.refresh(),300000);this.refresh();}
 disconnectedCallback(){clearInterval(this._timer);this._seq++;this._last=0;}
 async _energyPrefs(){
  // energy/get_prefs answers "not_found" when the HA Energy dashboard was never set up.
  // That must not hide the ASC battery statistics, so failures here only disable auto-mapping.
  try{return await this._hass.callWS({type:'energy/get_prefs'});}catch(e){return null;}
 }
 async refresh(){
  if(!this._hass||!this._config)return;
  const seq=++this._seq;this._last=Date.now();this._error='';
  let range;try{range=dateRange(this._period,new Date(),this._start,this._end);}catch(e){this._error=e.message;this._loading=false;this.render();return;}
  try{
   // In this installation the HA Energy "solar" source is the APsystems AC output,
   // so it maps to the inverter node, while DC-PV continues to come from ASC.
   let auto={};
   if(this._config.auto_ha_energy!==false){
    const prefs=await this._energyPrefs();
    if(seq!==this._seq)return;
    const sources=Array.isArray(prefs?.energy_sources)?prefs.energy_sources:[];
    auto={
     inverter:sources.filter(x=>x?.type==='solar'&&x.stat_energy_from).map(x=>x.stat_energy_from),
     grid_import:sources.filter(x=>x?.type==='grid'&&x.stat_energy_from).map(x=>x.stat_energy_from),
     grid_export:sources.filter(x=>x?.type==='grid'&&x.stat_energy_to).map(x=>x.stat_energy_to)
    };
    // Any explicit YAML entry for a role (including null = disabled) wins over auto-mapping.
    for(const role of AUTO_ROLES)if(has(this._config.energy,role))delete auto[role];
   }
   this._haEnergyMap=auto;
   const explicit=Object.fromEntries(Object.entries(this._config.energy).filter(([,e])=>e?.source==='statistics'));
   const ids=[...new Set([...Object.values(explicit).map(e=>e.entity),...Object.values(auto).flat()])];
   this._loading=ids.length>0;this.render();
   const data=ids.length?await this._hass.callWS({type:'recorder/statistics_during_period',start_time:range.start.toISOString(),end_time:range.end.toISOString(),statistic_ids:ids,period:'hour',types:['change'],units:{energy:'kWh'}}):{};
   if(seq!==this._seq)return;
   const out=Object.fromEntries(Object.entries(explicit).map(([k,e])=>[k,sumChanges(data?.[e.entity])]));
   // Sum all configured HA Energy sources of a role, like the Energy dashboard does.
   for(const role of Object.keys(auto)){
    const vals=auto[role].map(id=>sumChanges(data?.[id])).filter(Number.isFinite);
    out[role]=vals.length?vals.reduce((a,b)=>a+b,0):null;
   }
   this._energy=out;
  }catch(e){if(seq!==this._seq)return;this._energy={};this._error='Energiedaten nicht verfügbar: '+(e?.message||e?.code||'Verbindung prüfen');}
  this._loading=false;this.render();
 }
 _deferRender(){
  // Never rebuild the DOM while a date field is being edited: it would close the picker.
  const a=this.shadowRoot.activeElement;
  if(this._touching||(a&&a.tagName==='INPUT')){this._renderPending=true;return true;}
  this._renderPending=false;return false;
 }
 render(){
  if(!this._config||!this._hass||this._deferRender())return;
  const m=model(this),c=m.c;
  this._apply(`<style>${DESIGN_CSS}</style><ha-card class="${c.appearance==='ha'?'theme-ha':''}"><div class="head"><div><h2>${esc(c.title||'Energieverteilung '+periodLabel(this))}</h2></div><span class="badge">DC-gekoppeltes System</span></div>${controls(this)}<div class="diagram">${compactFlow(m,false)}${compactFlow(m,true)}</div>${this._error?`<div class="error" role="alert">${esc(this._error)}</div>`:''}<div class="note">${this._loading?'Energiedaten werden geladen …':'kWh '+periodLabel(this)+' · Live-Flüsse aktuell · Speicherstand geschätzt'}<br>— Keine Daten · Statistiken zeitverzögert · Browser-Zeitzone</div><a class="footer" href="${esc(c.dashboard_path||'/energy')}"><span>Energie-Dashboard aufrufen</span><span aria-hidden="true">›</span></a></ha-card>`);
 }
 _apply(html){this.bindControls(patchShadow(this.shadowRoot,html));}
 bindControls(fresh=null){
  // SVGs survive live updates (patched in place), so their animations keep running.
  // Only a newly created flow SVG is moved to the shared animation phase.
  (fresh??[...this.shadowRoot.querySelectorAll('.diagram > svg')]).filter(svg=>svg.parentElement?.classList?.contains('diagram')).forEach(svg=>svg.setCurrentTime?.((Date.now()-this._animationStart)/1000));
  this.shadowRoot.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>{this._period=b.dataset.period;this._energy={};this.render();this.refresh();});
  for(const id of ['start','end']){const input=this.shadowRoot.getElementById(id);if(input){input.onchange=()=>{this['_'+id]=input.value;this._energy={};this.refresh();};input.onblur=()=>{if(this._renderPending)setTimeout(()=>this.render(),0);};}}
  this.shadowRoot.querySelectorAll('[data-key]').forEach(n=>{const open=()=>{const id=this._config.entities[n.dataset.key];if(id)this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:id},bubbles:true,composed:true}));};n.onclick=open;n.onkeydown=ev=>{if(['Enter',' '].includes(ev.key)){ev.preventDefault();open();}};});
  // In-app navigation like HA's own cards; a plain link would reload the whole frontend.
  this.shadowRoot.querySelectorAll('a.footer').forEach(a=>a.onclick=ev=>{
   if(ev.defaultPrevented||ev.button!==0||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey)return;
   ev.preventDefault();history.pushState(null,'',a.getAttribute('href'));
   window.dispatchEvent(new CustomEvent('location-changed',{detail:{replace:false}}));
  });
 }
}
