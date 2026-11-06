import {EnergyFlowCardDCBus} from './energy-flow-card-dc-bus.js';
import {esc,read} from './shared/helpers.js';
import {DESIGN_CSS,PALETTE,model,controls,periodLabel,compactFlow} from './shared/design.js';
import {ASC_FIELDS,DASHBOARD_CSS,dashboardFlow,dataRows,gauge,landscape,chart} from './shared/dashboard-design.js';
import {historyPoints} from './shared/history.js';

export class ASCSolarDashboardCard extends EnergyFlowCardDCBus {
 static getStubConfig(){return {type:'custom:asc-solar-dashboard-card'};}
 setConfig(config){
  if(!config||typeof config!=='object')throw Error('Konfiguration fehlt.');
  if(config.pv_capacity_w!==undefined&&(!Number.isFinite(config.pv_capacity_w)||config.pv_capacity_w<=0))throw Error('pv_capacity_w muss positiv sein.');
  this._historySeq=(this._historySeq||0)+1;this._history=[];this._historyLast=0;
  super.setConfig({...config,entities:{...ASC_FIELDS,...config.entities}});
 }
 getCardSize(){return 15;}
 getGridOptions(){return {columns:'full',min_columns:12,rows:'auto'};}
 disconnectedCallback(){super.disconnectedCallback();this._historySeq=(this._historySeq||0)+1;this._historyLast=0;}
 async refresh(){await Promise.all([super.refresh(),this.refreshHistory()]);}
 async refreshHistory(){
  if(!this._hass||!this._config||Date.now()-(this._historyLast||0)<300000)return;
  const seq=this._historySeq=(this._historySeq||0)+1;this._historyLast=Date.now();this._historyLoading=true;this._historyError='';
  const now=new Date(),start=new Date(now);start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+1);
  const c=this._config,e=c.entities;
  const specs=[['pv_power','PV Leistung',PALETTE.pv],['inverter_power','Inverter Leistung',PALETTE.dc],['battery_power','Batterieleistung',PALETTE.battery],['grid_power','Netzleistung','#ff9768'],['home_power','Hausverbrauch','#acb9c6']].filter(([key])=>e[key]);
  try{
   if(!this._hass.callApi)throw Error('History-API nicht verfügbar');
   const ids=[...new Set(specs.map(([key])=>e[key]))];
   const result=await this._hass.callApi('GET','history/period/'+encodeURIComponent(start.toISOString())+'?filter_entity_id='+encodeURIComponent(ids.join(','))+'&end_time='+encodeURIComponent(now.toISOString()));
   if(seq!==this._historySeq)return;
   const byId=new Map((Array.isArray(result)?result:[]).filter(rows=>Array.isArray(rows)&&rows.length).map(rows=>[rows[0].entity_id,rows]));
   this._history=specs.map(([key,name,color])=>({name,color,points:historyPoints(byId.get(e[key]),e[key],key==='grid_power'&&c.grid_positive==='export'||key==='battery_power'&&c.battery_positive==='discharge'?-1:1)}));
   this._historyStart=+start;this._historyEnd=+end;
  }catch(error){if(seq!==this._historySeq)return;this._history=[];this._historyError='Verlauf nicht verfügbar: '+(error.message||'Verbindung prüfen');}
  this._historyLoading=false;this.render();
 }
 render(){
  if(!this._config||!this._hass||this._deferRender())return;
  const m=model(this),{c,h,f,live:l,energy:e,stored,capacity,soc}=m;
  const state=key=>{const s=h.states[c.entities[key]]?.state;return !s||['unknown','unavailable','none'].includes(s)?'—':s;};
  const rows=[['ASC Modus',state('mode')],['Controller',state('controller_state')],['Inverter-Limit',f(read(h,c.entities.inverter_limit,'power'),'W')],['Batteriespannung',f(l.voltage,'V')],['Batteriestrom',f(read(h,c.entities.battery_current,'current'),'A')],['Batterieleistung',f(l.battery,'W'),PALETTE.battery],['Prognose heute',f(read(h,c.entities.forecast,'energy'))],['Energiebudget',f(read(h,c.entities.budget,'energy'))],['Budget-Status',state('budget_state')],['Lernstatus',state('learning')]];
  const energyRows=[['PV Erzeugung',f(e.pv),PALETTE.pv],['Hausverbrauch',f(e.home),PALETTE.home],['Inverter Erzeugung',f(e.inverter),PALETTE.inverter],['In Akku geladen',f(e.battery_charge),PALETTE.battery],['Aus Akku entnommen',f(e.battery_discharge),PALETTE.discharge],['Netzeinspeisung',f(e.grid_export),PALETTE.export],['Netzbezug',f(e.grid_import),PALETTE.dc]];
  const utilization=Number.isFinite(l.pv)&&c.pv_capacity_w?l.pv/c.pv_capacity_w*100:null;
  // AC self-consumption is only meaningful with complete, consistent AC energy data.
  const self=Number.isFinite(e.inverter)&&e.inverter>0&&Number.isFinite(e.grid_export)&&e.grid_export>=0&&e.grid_export<=e.inverter?(e.inverter-e.grid_export)/e.inverter*100:null;
  this._apply(`<style>${DESIGN_CSS}${DASHBOARD_CSS}</style><ha-card class="solar ${c.appearance==='ha'?'theme-ha':''}"><section class="panel flow-panel"><div class="head"><div><div class="eyebrow">Adaptive Solar Controller</div><h2>${esc(c.title||'Energiefluss')}</h2><p class="subtitle">PV → DC-Bus → Inverter → Haus ↔ Netz · Akku am DC-Bus</p></div><span class="badge">${esc(state('controller_state')==='—'?'ASC-Status unbekannt':state('controller_state'))}</span></div>${controls(this)}<div class="diagram">${dashboardFlow(m)}${compactFlow(m,true)}</div></section>
  <div class="lower"><section class="panel history-panel"><h3>Leistungsverlauf heute</h3>${chart(this,m)}<div class="history-note">W · Heute, Browser-Zeitzone · Nur aufgezeichnete Sensoren${this._historyError?'<br>'+esc(this._historyError):''}</div></section><section class="panel"><h3>Energie ${periodLabel(this)}</h3>${dataRows(energyRows)}</section><section class="panel"><h3>Aktueller Status</h3>${dataRows(rows)}</section></div>
  <div class="gauges">${gauge('PV Auslastung',utilization,f(l.pv,'W'),c.pv_capacity_w?'von '+f(c.pv_capacity_w,'W'):'Nennleistung nicht konfiguriert',PALETTE.pv)}${gauge('Batterie Füllstand',soc,f(soc,'%'),f(stored)+' / '+f(capacity)+' · geschätzt',PALETTE.battery)}${gauge('Eigenverbrauch AC',self,f(self,'%'),periodLabel(this)+' · Inverter → Haus',PALETTE.dc)}${landscape()}</div>
  ${this._error?`<div class="error" role="alert">${esc(this._error)}</div>`:''}<div class="note">${this._loading?'Energiedaten werden geladen …':'Live-Werte aktuell · kWh '+periodLabel(this)+' · Statistikwerte zeitverzögert'} · — Keine Daten<br>Dashboard v0.3.0 · Experimentell, auf Basis ASC v0.4.3.1</div></ha-card>`);
 }
}
