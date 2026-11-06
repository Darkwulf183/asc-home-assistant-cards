import {EnergyFlowCardDCBus} from './energy-flow-card-dc-bus.js';
import {esc} from './shared/helpers.js';
import {DESIGN_CSS,model,compactFlow} from './shared/design.js';
import {ASC_FIELDS,DASHBOARD_CSS,dashboardFlow} from './shared/dashboard-design.js';

// Light variant of the ASC Solar Dashboard for info screens / wall displays:
// only the live energy-flow tiles, always "today", no period selection, no history,
// no tables or gauges. Reuses the dashboard tile renderer and measurement logic.
export class ASCSolarDashboardLightCard extends EnergyFlowCardDCBus {
 static getStubConfig(){return {type:'custom:asc-solar-dashboard-light-card'};}
 setConfig(config){
  if(!config||typeof config!=='object')throw Error('Konfiguration fehlt.');
  if(config.show_header!==undefined&&typeof config.show_header!=='boolean')throw Error('show_header muss true oder false sein.');
  super.setConfig({...config,entities:{...ASC_FIELDS,...config.entities}});
 }
 getCardSize(){return 8;}
 getGridOptions(){return {columns:'full',min_columns:12,rows:'auto'};}
 render(){
  if(!this._config||!this._hass||this._deferRender())return;
  this._period='today'; // fixed: an info screen always shows today
  const m=model(this),{c,h}=m;
  const s=h.states[c.entities.controller_state]?.state;
  const status=!s||['unknown','unavailable','none'].includes(s)?'ASC-Status unbekannt':s;
  const head=c.show_header===false?'':`<div class="head"><div><div class="eyebrow">Adaptive Solar Controller</div><h2>${esc(c.title||'Energiefluss')}</h2><p class="subtitle">PV → DC-Bus → Inverter → Haus ↔ Netz · Akku am DC-Bus</p></div><span class="badge">${esc(status)}</span></div>`;
  this._apply(`<style>${DESIGN_CSS}${DASHBOARD_CSS}
   .light .flow-panel{margin-bottom:0;padding-bottom:10px}.light .flow-panel.no-head{padding-top:12px}
   /* Header grows with the card so it stays in proportion on large info screens. */
   .light.solar .head h2{font-size:clamp(22px,2.5cqi,46px)}.light .eyebrow{font-size:clamp(10px,.85cqi,16px)}.light .subtitle{font-size:clamp(11px,1.05cqi,20px)}.light .badge{font-size:clamp(11px,1.05cqi,20px)}.light .badge:before{width:.55em;height:.55em}
  </style><ha-card class="solar light ${c.appearance==='ha'?'theme-ha':''}"><section class="panel flow-panel ${head?'':'no-head'}">${head}<div class="diagram">${dashboardFlow(m)}${compactFlow(m,true)}</div>${this._error?`<div class="error" role="alert">${esc(this._error)}</div>`:''}</section></ha-card>`);
 }
}
