import {readFileSync,writeFileSync} from 'node:fs';
const data=readFileSync(new URL('../assets/solar-sunset.jpg',import.meta.url)).toString('base64');
writeFileSync(new URL('../src/shared/photo.js',import.meta.url),'// Generated from assets/solar-sunset.jpg. Run scripts/embed-photo.mjs after replacing the asset.\nexport const SOLAR_PHOTO = "data:image/jpeg;base64,'+data+'";\n');
