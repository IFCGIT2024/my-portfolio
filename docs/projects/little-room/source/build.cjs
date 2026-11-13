// Build the portfolio's single-file app from the editable source files.
const fs = require('node:fs');
const path = require('node:path');
const dir = __dirname;
const read = name => fs.readFileSync(path.join(dir, name), 'utf8');
const canvas = read('canvas.js').replace('export const CATALOG', 'const CATALOG').replace('export function getDefaultState', 'function getDefaultState').replace('export class RoomCanvas', 'class RoomCanvas');
const feng = read('feng.js').replace('export function inspectRoom', 'function inspectRoom').replace('export function arrangeRoom', 'function arrangeRoom');
const script = [read('furniture.js'), `(function(){\n${canvas}\nwindow.RoomModule={CATALOG,getDefaultState,RoomCanvas};\n})();`, `(function(){\n${feng}\nwindow.FengModule={inspectRoom,arrangeRoom};\n})();`, read('sharing.js'), read('radial.js'), read('custom-studio.js'), read('generator.js'), read('ui.js')].join('\n');
const names = ['style.css', 'mobile.css', 'radial.css', 'custom-studio.css'];
const links = names.map(name => `<link rel="stylesheet" href="${name}">`).join('\n');
const styles = names.map(read).join('\n');
const html = read('index.html');
const bundleTag = '<script src="app.bundle.js"></script>';
if (!html.includes(links) || !html.includes(bundleTag) || /<\/script/i.test(script) || /<\/style/i.test(styles)) throw new Error('Unexpected source markup; refusing to produce an incomplete build.');
const output = html.replace(links, `<style>\n${styles}\n</style>`).replace(bundleTag, `<script>\n${script}\n</script>`);
const outputArg = process.argv.indexOf('--out');
const outputPath = outputArg >= 0 && process.argv[outputArg + 1] ? path.resolve(process.cwd(), process.argv[outputArg + 1]) : path.resolve(dir, '..', 'index.html');
fs.writeFileSync(outputPath, output);
console.log(`Built ${outputPath}`);
