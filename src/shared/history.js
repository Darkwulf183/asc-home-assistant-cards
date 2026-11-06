import {read} from './helpers.js';
// Keep unavailable samples as explicit breaks. Never replace them with zeros.
export function historyPoints(rows,id,sign=1){
 return (rows||[]).map(s=>({t:Date.parse(s.last_updated||s.last_changed),v:read({states:{[id]:s}},id,'power')}))
 .filter(p=>Number.isFinite(p.t)).map(p=>({...p,v:p.v===null?null:p.v*sign})).sort((a,b)=>a.t-b.t);
}
export function historyPath(points,start,end,x,y,w,h,min,max){
 let d='',pen=false;
 for(const p of points){if(p.v===null){pen=false;continue;}if(p.t<start||p.t>end)continue;
 const px=x+(p.t-start)/(end-start)*w,py=y+h-(p.v-min)/(max-min)*h;
 d+=(pen?' L':'M')+px.toFixed(2)+' '+py.toFixed(2);pen=true;
 }return d;
}
