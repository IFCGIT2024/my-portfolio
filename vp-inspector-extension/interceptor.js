// Injected at document_start — intercepts ALL XHR and Fetch before the page's own code runs

(function () {
  'use strict';

  function send(data) {
    window.postMessage({ __vpInspector: true, data: data }, '*');
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '…[truncated]' : str;
  }

  // ── Intercept XHR ──────────────────────────────────────────────────────────
  const OrigXHR = window.XMLHttpRequest;
  function PatchedXHR() {
    const xhr = new OrigXHR();
    let method = '', url = '', reqBody = '';

    const origOpen = xhr.open.bind(xhr);
    xhr.open = function (m, u, ...rest) {
      method = m;
      url = u;
      return origOpen(m, u, ...rest);
    };

    const origSend = xhr.send.bind(xhr);
    xhr.send = function (body) {
      reqBody = body ? truncate(String(body), 500) : '';
      const t0 = Date.now();

      xhr.addEventListener('load', function () {
        let respText = '';
        let parsed = null;
        try { respText = truncate(xhr.responseText, 3000); } catch (e) {}
        try { parsed = JSON.parse(xhr.responseText); } catch (e) {}

        send({
          type: 'XHR',
          method,
          url,
          status: xhr.status,
          duration: Date.now() - t0,
          requestBody: reqBody,
          responseText: respText,
          responseParsed: parsed,
          timestamp: new Date().toISOString(),
        });
      });

      return origSend(body);
    };

    return xhr;
  }
  PatchedXHR.prototype = OrigXHR.prototype;
  window.XMLHttpRequest = PatchedXHR;

  // ── Intercept Fetch ────────────────────────────────────────────────────────
  const origFetch = window.fetch.bind(window);
  window.fetch = async function (input, init = {}) {
    const url   = typeof input === 'string' ? input : input?.url || String(input);
    const method = (init.method || 'GET').toUpperCase();
    const reqBody = init.body ? truncate(String(init.body), 500) : '';
    const t0 = Date.now();

    try {
      const response = await origFetch(input, init);
      const clone = response.clone();

      clone.text().then(text => {
        let parsed = null;
        try { parsed = JSON.parse(text); } catch (e) {}
        send({
          type: 'Fetch',
          method,
          url,
          status: response.status,
          duration: Date.now() - t0,
          requestBody: reqBody,
          responseText: truncate(text, 3000),
          responseParsed: parsed,
          timestamp: new Date().toISOString(),
        });
      }).catch(() => {});

      return response;
    } catch (err) {
      send({
        type: 'Fetch',
        method,
        url,
        status: 0,
        duration: Date.now() - t0,
        requestBody: reqBody,
        responseText: String(err),
        responseParsed: null,
        timestamp: new Date().toISOString(),
        error: true,
      });
      throw err;
    }
  };

  // ── Respond to vp api data requests from the content script ────────────────
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.__vpRequestApi !== true) return;
    window.postMessage({
      __vpApiResponse: true,
      nonces: window.vp && window.vp.api && window.vp.api.NONCES,
      ver:    window.vp && window.vp.api && window.vp.api.CLIENT_VER,
    }, '*');
  });
})();
