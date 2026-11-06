import {EnergyFlowCardDCBus} from './energy-flow-card-dc-bus.js';
import {DESIGN_CSS,model,miniFlow} from './shared/design.js';
import {esc} from './shared/helpers.js';
export class EnergyFlowCardDCBusCompact extends EnergyFlowCardDCBus {
 static getStubConfig(){return {type:'custom:energy-flow-card-dc-bus-compact'};}
 getCardSize(){return 4;}
 getGridOptions(){return {columns:6,min_columns:4,rows:'auto'};}
 setConfig(config){if(!config||typeof config!=='object')throw Error('Konfiguration fehlt.');super.setConfig({...config,title:config.title||'Energieverteilung heute'});}
 render(){
  if(!this._config||!this._hass||this._deferRender())return;
  const m=model(this),c=m.c;
  this._apply(`<style>${DESIGN_CSS}
   ha-card.compact-card{border-radius:12px;box-shadow:var(--ha-card-box-shadow,none);min-height:350px}
   .compact-card .head{padding:18px 18px 4px}.compact-card .head h2{font-size:20px;letter-spacing:-.3px}
   .compact-card .mini-wrap{padding:0 10px}.compact-card .mini-wrap svg{display:block;width:100%;height:auto}
   .compact-card .note{display:none}.compact-card .footer{margin:0 18px;padding:13px 0;font-size:12px}
   .compact-card .footer span:last-child{font-size:20px}
   .compact-card .mini-main{font-size:11.5px;font-weight:650;letter-spacing:-.2px}
   .compact-card .mini-label{paint-order:stroke;stroke:var(--card-bg);stroke-width:5px;stroke-linejoin:round}
  </style><ha-card class="compact-card ${c.appearance==='ha'?'theme-ha':''}"><div class="head"><div><h2>${esc(c.title||'Energieverteilung heute')}</h2></div></div><div class="mini-wrap">${miniFlow(m)}</div>${this._error?`<div class="error" role="alert">${esc(this._error)}</div>`:''}<a class="footer" href="${esc(c.dashboard_path||'/energy')}"><span>Energie-Dashboard aufrufen</span><span aria-hidden="true">›</span></a></ha-card>`);
 }
}
