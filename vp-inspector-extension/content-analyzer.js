'use strict';

// Runs persistently on the RE analyzer page.
// Listens for FILL_FORM messages from the background service worker
// and populates the form inputs when received.

console.log('[ANALYZER] content-analyzer.js injected and listening');

chrome.runtime.onMessage.addListener(function (msg) {
  console.log('[ANALYZER] message received:', msg.type);
  if (msg.type !== 'FILL_FORM' || !msg.payload) return;
  console.log('[ANALYZER] filling form with:', JSON.stringify(msg.payload));

  var payload = msg.payload;

  function fill(id, value) {
    if (value === undefined || value === null || value === '') return;
    var el = document.getElementById(id);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  fill('dealName',      payload.dealName);
  fill('purchasePrice', payload.purchasePrice);
  fill('arv',           payload.arv);
  fill('annualTaxes',   payload.annualTaxes);

  var parts = [
    payload.beds  ? payload.beds  + ' bed'  : null,
    payload.baths ? payload.baths + ' bath' : null,
    payload.sqft  ? payload.sqft  + ' sqft' : null,
  ].filter(Boolean).join(' | ');

  var banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#10b981;color:#fff;'
    + 'text-align:center;padding:10px 16px;font-weight:600;z-index:9999;'
    + 'font-size:14px;font-family:sans-serif;box-sizing:border-box';
  banner.textContent = 'Imported from Viewpoint.ca'
    + (parts ? ' - ' + parts : '')
    + ' - Fill in rent & expenses to complete your analysis';
  document.body.appendChild(banner);
  setTimeout(function () { banner.remove(); }, 7000);
});
