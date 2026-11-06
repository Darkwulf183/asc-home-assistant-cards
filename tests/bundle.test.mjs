import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('distributable registers all four cards with no external imports or demo data',()=>{
 const code=readFileSync(new URL('../dist/asc-home-assistant-cards.js',import.meta.url),'utf8');
 const registry=new Map(),context={window:{},HTMLElement:class {},customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)}};
 vm.runInNewContext(code,context);vm.runInNewContext(code,context);
 assert.equal(registry.size,4);assert.equal(context.window.customCards.length,4);
 assert.ok(!code.includes('demo.inverter'));assert.ok(code.includes('data:image/jpeg;base64,'));
 assert.ok(!/^import /m.test(code));
 const hacs=JSON.parse(readFileSync(new URL('../hacs.json',import.meta.url),'utf8'));assert.equal(hacs.filename,'asc-home-assistant-cards.js');
});
