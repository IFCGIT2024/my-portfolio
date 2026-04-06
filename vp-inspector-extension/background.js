'use strict';

// Injected directly into the analyzer tab to fill the form.
// ASCII-only strings required — no emoji or special chars.
function fillAnalyzerForm(payload) {
  function fill(id, value) {
    if (value === undefined || value === null || value === '') return;
    var el = document.getElementById(id);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function apply() {
    fill('dealName',      payload.dealName);
    fill('purchasePrice', payload.purchasePrice);
    fill('arv',           payload.arv);
    fill('annualTaxes',   payload.annualTaxes);

    // Auto-save to deal history so it appears in Saved Deals + Compare tabs
    setTimeout(function () {
      if (typeof getInputs === 'function' && typeof saveDeal === 'function') {
        var inputs = getInputs();
        saveDeal(inputs.dealName || payload.dealName || 'Viewpoint Import', inputs);
        if (typeof renderSavedDeals === 'function') renderSavedDeals();
      }
    }, 800);

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
  }

  setTimeout(apply, 600);
}

// ── Per-tab request store ────────────────────────────────────────────────────
var tabRequests = {};

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  var tabId = sender.tab ? sender.tab.id : undefined;

  if (msg.type === 'REQUEST_CAPTURED') {
    if (!tabId) return false;
    if (!tabRequests[tabId]) tabRequests[tabId] = [];
    tabRequests[tabId].push(msg.data);
    if (tabRequests[tabId].length > 200) tabRequests[tabId].shift();
    return false;
  }

  if (msg.type === 'OPEN_ANALYZER') {
    var payload = msg.payload;
    var analyzerUrl = 'https://ifcgit2024.github.io/my-portfolio/real-estate-analyzer/index.html';

    function injectIntoTab(targetTabId) {
      console.log('[BG] executeScript into tab', targetTabId);
      chrome.scripting.executeScript({
        target: { tabId: targetTabId },
        func: fillAnalyzerForm,
        args: [payload],
      }, function () {
        if (chrome.runtime.lastError) {
          console.log('[BG] executeScript error:', chrome.runtime.lastError.message);
        } else {
          console.log('[BG] executeScript OK');
        }
      });
    }

    chrome.tabs.query(
      { url: 'https://ifcgit2024.github.io/my-portfolio/real-estate-analyzer/*' },
      function (tabs) {
        console.log('[BG] tabs found:', tabs ? tabs.length : 0);
        if (tabs && tabs.length > 0) {
          var existingId = tabs[0].id;
          chrome.tabs.update(existingId, { active: true });
          chrome.windows.update(tabs[0].windowId, { focused: true });
          injectIntoTab(existingId);
        } else {
          chrome.tabs.create({ url: analyzerUrl }, function (tab) {
            var newTabId = tab.id;
            function onUpdated(updatedId, changeInfo) {
              if (updatedId !== newTabId || changeInfo.status !== 'complete') return;
              chrome.tabs.onUpdated.removeListener(onUpdated);
              setTimeout(function () { injectIntoTab(newTabId); }, 700);
            }
            chrome.tabs.onUpdated.addListener(onUpdated);
          });
        }
      }
    );
    return false;
  }

  if (msg.type === 'GET_REQUESTS') {
    sendResponse({ requests: tabRequests[msg.tabId] || [] });
    return false;
  }

  if (msg.type === 'CLEAR_REQUESTS') {
    tabRequests[msg.tabId] = [];
    sendResponse({ ok: true });
    return false;
  }

  return false;
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status === 'loading') {
    tabRequests[tabId] = [];
  }
});
