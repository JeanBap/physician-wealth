(function() {
  'use strict';
  if (localStorage.getItem('cookie-consent')) return;

  var style = document.createElement('style');
  style.textContent = [
    '.cc-banner{position:fixed;bottom:0;left:0;right:0;z-index:99999;',
    'background:#1a1a2e;color:#eaeaea;',
    'padding:16px 24px;display:flex;align-items:center;justify-content:space-between;',
    'flex-wrap:wrap;gap:12px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;',
    'box-shadow:0 -2px 10px rgba(0,0,0,0.3);animation:cc-slide-up .3s ease-out}',
    '.cc-banner a{color:#6ee7b7;text-decoration:underline}',
    '.cc-banner button{padding:8px 20px;border:none;border-radius:6px;cursor:pointer;',
    'font-size:14px;font-weight:500;transition:opacity .2s}',
    '.cc-banner button:hover{opacity:0.85}',
    '.cc-accept{background:#10b981;color:#fff}',
    '.cc-essential{background:transparent;color:#eaeaea;',
    'border:1px solid #4b5563 !important}',
    '.cc-buttons{display:flex;gap:8px;flex-shrink:0}',
    '@keyframes cc-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}',
    '@media(prefers-reduced-motion:reduce){.cc-banner{animation:none}}',
    '@media(max-width:600px){.cc-banner{flex-direction:column;text-align:center}',
    '.cc-buttons{width:100%;justify-content:center}}'
  ].join('');
  document.head.appendChild(style);

  var banner = document.createElement('div');
  banner.className = 'cc-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = [
    '<div class="cc-text">We use essential cookies for site functionality and optional analytics cookies to improve our service. ',
    '<a href="/cookie-policy.html">Cookie Policy</a></div>',
    '<div class="cc-buttons">',
    '<button class="cc-accept" onclick="window.__ccAccept(\'all\')">Accept All</button>',
    '<button class="cc-essential" onclick="window.__ccAccept(\'essential\')">Essential Only</button>',
    '</div>'
  ].join('');

  window.__ccAccept = function(choice) {
    localStorage.setItem('cookie-consent', choice);
    banner.remove();
    if (choice === 'all' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  };

  document.body.appendChild(banner);
})();
