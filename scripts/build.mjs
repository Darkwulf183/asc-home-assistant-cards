import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
const files=['shared/helpers.js','shared/patch.js','shared/photo.js','shared/design.js','shared/history.js','shared/dashboard-design.js','energy-flow-card-dc-bus.js','energy-flow-card-dc-bus-compact.js','asc-solar-dashboard-card.js','asc-solar-dashboard-light-card.js','index.js'];
const body=files.map(f=>readFileSync(new URL('../src/'+f,import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')).join('\n');
mkdirSync(new URL('../dist/',import.meta.url),{recursive:true});
writeFileSync(new URL('../dist/asc-home-assistant-cards.js',import.meta.url),'/* ASC Home Assistant Cards v0.3.0 | MIT */\n(()=>{\n'+body+'\n})();\n');
