// Update a shadow root in place instead of replacing it with innerHTML.
// Live values change every few seconds; replacing the DOM each time restarts the SVG
// flow animations (WebKit/iOS), drops focus and can disturb scrolling on mobile.
// Only changed text and attributes are written; nodes are replaced only when the
// structure itself differs (e.g. a flow becomes active and gains its moving dot).
function syncAttributes(from,to){
 for(const a of [...from.attributes])if(!to.hasAttributeNS(a.namespaceURI,a.localName))from.removeAttributeNS(a.namespaceURI,a.localName);
 for(const a of [...to.attributes])if(from.getAttributeNS(a.namespaceURI,a.localName)!==a.value)from.setAttributeNS(a.namespaceURI,a.name,a.value);
}
function morphChildren(from,to){
 const a=[...from.childNodes],b=[...to.childNodes];
 for(let i=0;i<b.length;i++){
  const old=a[i],next=b[i];
  if(!old){from.appendChild(next);continue;}
  if(old.nodeType!==next.nodeType||old.nodeName!==next.nodeName){from.replaceChild(next,old);continue;}
  if(old.nodeType===3||old.nodeType===8){if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;continue;}
  if(old.nodeType!==1)continue;
  // A changed SMIL animation is replaced so the browser picks up the new path/direction.
  if(old.localName==='animateMotion'&&old.outerHTML!==next.outerHTML){from.replaceChild(next,old);continue;}
  syncAttributes(old,next);
  if(old.localName==='input')continue; // never overwrite what the user is typing
  morphChildren(old,next);
 }
 for(let i=b.length;i<a.length;i++)a[i].remove();
}
// Returns the SVG elements that were newly created by this update.
export function patchShadow(root,html){
 if(typeof document==='undefined'||!root.firstChild||!document.createElement){root.innerHTML=html;return null;}
 const t=document.createElement('template');t.innerHTML=html;
 const before=new Set(root.querySelectorAll('svg'));
 morphChildren(root,t.content);
 return [...root.querySelectorAll('svg')].filter(s=>!before.has(s));
}
