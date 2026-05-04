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

  if (msg.type === 'GET_VP_NONCE') {
    // Inject a one-shot script into any open viewpoint.ca tab to read the nonce
    chrome.tabs.query({ url: 'https://www.viewpoint.ca/*' }, function (tabs) {
      if (!tabs || !tabs.length) { sendResponse({ nonce: null }); return; }
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        world: 'MAIN',
        func: function () {
          try {
            var nonces = window.vp && window.vp.api && window.vp.api.NONCES;
            if (nonces) return nonces['2'] || nonces['1'] || Object.values(nonces)[0];
          } catch (e) {}
          return null;
        },
      }, function (results) {
        var nonce = results && results[0] && results[0].result;
        sendResponse({ nonce: nonce || null });
      });
    });
    return true; // async
  }

  // Proxy a fetch through the viewpoint.ca tab. The injected code reads the
  // nonce from window.vp.api.NONCES itself so the popup never has to manage it.
  // msg.urlTemplate: URL with {{NONCE}} placeholder that the tab fills in.
  if (msg.type === 'VP_FETCH') {
    function doFetch(tabId) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        world: 'MAIN',
        func: function (urlTemplate) {
          // Read the freshest nonce from the page's own state
          var nonce = '';
          try {
            var nonces = window.vp && window.vp.api && window.vp.api.NONCES;
            if (nonces) nonce = nonces['2'] || nonces['1'] || Object.values(nonces)[0] || '';
          } catch (e) {}

          function doRequest(n) {
            var url = urlTemplate.replace('{{NONCE}}', encodeURIComponent(n));
            return fetch(url, { credentials: 'include' })
              .then(function (r) {
                return r.text().then(function (body) {
                  return { ok: r.ok, status: r.status, body: body };
                });
              })
              .catch(function (e) { return { error: String(e) }; });
          }

          // If nonce is empty, bootstrap it from user/get first
          if (!nonce) {
            return fetch('https://www.viewpoint.ca/api/v2/user/get?CLIENT_VER=23235', { credentials: 'include' })
              .then(function (r) { return r.json(); })
              .then(function (d) {
                nonce = (d && d.nonce) || '';
                return doRequest(nonce);
              })
              .catch(function () { return doRequest(''); });
          }
          return doRequest(nonce);
        },
        args: [msg.urlTemplate],
      }, function (results) {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }
        var result = results && results[0] && results[0].result;
        sendResponse(result || { error: 'No result from tab' });
      });
    }

    chrome.tabs.query({ url: 'https://www.viewpoint.ca/*' }, function (tabs) {
      if (tabs && tabs.length > 0) {
        doFetch(tabs[0].id);
      } else {
        // No VP tab open — create one in the background then fetch
        chrome.tabs.create({ url: 'https://www.viewpoint.ca/map', active: false }, function (tab) {
          var newTabId = tab.id;
          function onUpdated(updatedId, changeInfo) {
            if (updatedId !== newTabId || changeInfo.status !== 'complete') return;
            chrome.tabs.onUpdated.removeListener(onUpdated);
            setTimeout(function () { doFetch(newTabId); }, 800);
          }
          chrome.tabs.onUpdated.addListener(onUpdated);
        });
      }
    });
    return true; // async
  }

  if (msg.type === 'CLEAR_REQUESTS') {
    tabRequests[msg.tabId] = [];
    sendResponse({ ok: true });
    return false;
  }

  return false;
});

// Do NOT auto-clear requests on navigation — user clicks properties which
// triggers page loads and would wipe all captured data. User clears manually.
// Just cap the buffer so memory doesn't grow unboundedly.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status === 'loading') {
    // Keep last 100 requests across navigations so context isn't lost
    if (tabRequests[tabId] && tabRequests[tabId].length > 100) {
      tabRequests[tabId] = tabRequests[tabId].slice(-100);
    }
  }
});
