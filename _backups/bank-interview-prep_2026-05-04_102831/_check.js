const fs = require('fs');
const files = ['data.js','data-home.js','data-m1.js','data-m2.js','data-m3.js','data-m4.js','data-m5.js','data-m6.js','data-m7.js','data-m8.js','data-m9.js','data-m10.js','app.js'];
let allOk = true;
files.forEach(f => {
  try {
    new Function(fs.readFileSync(f, 'utf8'));
    console.log('OK  : ' + f);
  } catch(e) {
    console.log('ERR : ' + f + ' -- ' + e.message);
    allOk = false;
  }
});
if (allOk) console.log('\nAll files parse cleanly.');
