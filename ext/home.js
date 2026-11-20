/* added by the GPFIS build: a small button back to Story Street */
(function () { if (window.top !== window.self) return;
  const b = document.createElement('a'); b.href = (document.currentScript.dataset.home || '../demo/street.html'); b.title = 'Story Street'; b.textContent = '🏠';
  b.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:99999;width:46px;height:46px;border-radius:50%;background:#fff;box-shadow:0 4px 0 rgba(0,0,0,.18),0 6px 14px rgba(0,0,0,.2);display:grid;place-items:center;font-size:24px;text-decoration:none;opacity:.92';
  addEventListener('DOMContentLoaded', () => document.body.appendChild(b)); if (document.body) document.body.appendChild(b); })();