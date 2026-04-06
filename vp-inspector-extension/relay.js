// Step 1: inject interceptor.js as a real <script> tag into the page (MAIN world)
(function () {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('interceptor.js');
  s.onload = () => s.remove();
  (document.head || document.documentElement).appendChild(s);
})();

// Step 2: relay postMessage events from the page to the background
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data?.__vpInspector) return;
  try {
    chrome.runtime.sendMessage({ type: 'REQUEST_CAPTURED', data: event.data.data });
  } catch (e) {
    // Extension was reloaded — context invalidated, ignore silently
  }
});
