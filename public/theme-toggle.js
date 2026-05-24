(function() {
  var theme = localStorage.getItem("pw_theme") || "dark";
  
  var light = {
    bg:"#FAFBFC", bg2:"#F1F4F8", card:"#FFFFFF",
    text:"#1E293B", text2:"#475569", text3:"#94A3B8", text4:"#CBD5E1",
    accent:"#0D9488", accent2:"#1E40AF",
    navy:"#0F2B4C", border:"#E2E8F0",
    headingColor:"#0F2B4C", linkColor:"#0D9488",
    cardBg:"#FFFFFF", cardBorder:"#E2E8F0",
    codeBg:"#F1F5F9", tableBg:"rgba(0,0,0,0.01)", tableHover:"rgba(0,0,0,0.02)",
    thBg:"rgba(0,0,0,0.03)", thColor:"#64748B",
    calloutGreen:"rgba(13,148,136,0.05)", calloutBlue:"rgba(30,64,175,0.05)",
    calloutAmber:"rgba(217,119,6,0.05)", calloutRed:"rgba(220,38,38,0.05)",
    verdictBg:"rgba(13,148,136,0.04)", verdictBorder:"rgba(13,148,136,0.15)",
    ctaBg:"rgba(13,148,136,0.04)", ctaBorder:"rgba(13,148,136,0.12)",
    highlight:"#0D9488", warn:"#D97706", red:"#DC2626",
    fast:"#059669", slow:"#DC2626", mid:"#D97706",
    shadow:"0 1px 3px rgba(0,0,0,0.04)",
  };
  
  function applyTheme(t) {
    var r = document.documentElement;
    r.setAttribute("data-theme", t);
    
    if (t === "light") {
      // Inject comprehensive light override stylesheet
      var id = "pw-light-css";
      var existing = document.getElementById(id);
      if (existing) existing.remove();
      
      var style = document.createElement("style");
      style.id = id;
      style.textContent = [
        "body { background:" + light.bg + " !important; color:" + light.text2 + " !important; }",
        "h1, h2 { color:" + light.navy + " !important; }",
        "h3 { color:" + light.accent2 + " !important; }",
        "h4 { color:" + light.accent + " !important; }",
        "p { color:" + light.text2 + " !important; }",
        "strong { color:" + light.text + " !important; }",
        "a { color:" + light.accent + " !important; }",
        "li { color:" + light.text2 + " !important; }",
        "table { border-color:" + light.border + " !important; }",
        "th { background:" + light.thBg + " !important; color:" + light.thColor + " !important; border-color:" + light.border + " !important; }",
        "td { color:" + light.text2 + " !important; border-color:" + light.border + " !important; }",
        "tr:hover td { background:" + light.tableHover + " !important; }",
        ".highlight, .g, .fast { color:" + light.fast + " !important; }",
        ".warn, .mid, .y { color:" + light.warn + " !important; }",
        ".red, .slow, .r { color:" + light.red + " !important; }",
        ".callout, .callout-green { background:" + light.calloutGreen + " !important; border-color:" + light.accent + " !important; }",
        ".callout-blue { background:" + light.calloutBlue + " !important; border-color:" + light.accent2 + " !important; }",
        ".callout-amber { background:" + light.calloutAmber + " !important; border-color:" + light.warn + " !important; }",
        ".callout-red { background:" + light.calloutRed + " !important; border-color:" + light.red + " !important; }",
        ".callout p, .callout strong { color:" + light.text2 + " !important; }",
        ".callout strong { color:" + light.text + " !important; }",
        ".verdict { background:" + light.verdictBg + " !important; border-color:" + light.accent + " !important; }",
        ".verdict strong { color:" + light.accent + " !important; }",
        ".verdict p { color:" + light.text2 + " !important; }",
        ".cta { background:" + light.ctaBg + " !important; border-color:" + light.ctaBorder + " !important; }",
        ".cta h3 { color:" + light.accent + " !important; }",
        ".cta p { color:" + light.text3 + " !important; }",
        ".cta a.btn { background:" + light.accent + " !important; color:#fff !important; }",
        ".toc { background:" + light.bg2 + " !important; border-color:" + light.border + " !important; }",
        ".toc a { color:" + light.text3 + " !important; }",
        ".toc a:hover { color:" + light.accent + " !important; }",
        ".stat-grid .stat-card, .stat-card { background:" + light.bg2 + " !important; border-color:" + light.border + " !important; }",
        ".stat-card .num { color:" + light.accent + " !important; }",
        ".stat-card .label { color:" + light.text3 + " !important; }",
        ".hero .badge, .series-tag, .pill { background:" + light.bg2 + " !important; border-color:" + light.border + " !important; color:" + light.accent + " !important; }",
        ".hero .sub, .meta, .byline, .updated { color:" + light.text3 + " !important; }",
        ".pullquote { color:" + light.text3 + " !important; }",
        ".spec-card { background:" + light.bg2 + " !important; border-color:" + light.border + " !important; }",
        ".spec-card h4 { color:" + light.accent2 + " !important; }",
        ".spec-card p { color:" + light.text2 + " !important; }",
        ".spec-card strong { color:" + light.text + " !important; }",
        ".math { background:" + light.bg2 + " !important; border-color:" + light.border + " !important; color:" + light.text2 + " !important; }",
        ".math .result { color:" + light.accent + " !important; }",
        ".honest { background:rgba(220,38,38,0.03) !important; border-color:rgba(220,38,38,0.12) !important; }",
        ".honest .tag { color:" + light.red + " !important; }",
        ".honest p { color:" + light.text2 + " !important; }",
        ".honest strong { color:" + light.red + " !important; }",
        ".timeline .tl-year { color:" + light.accent + " !important; }",
        ".timeline .tl-content strong { color:" + light.text + " !important; }",
        ".timeline .tl-content p { color:" + light.text3 + " !important; }",
        ".tl-item { border-color:" + light.border + " !important; }",
        ".tldr { background:" + light.calloutBlue + " !important; border-color:rgba(30,64,175,0.12) !important; }",
        ".tldr strong { color:" + light.accent2 + " !important; }",
        ".tldr p { color:" + light.text2 + " !important; }",
        ".related, .series { background:" + light.bg2 + " !important; border-color:" + light.border + " !important; }",
        ".related a, .series a { color:" + light.text3 + " !important; border-color:" + light.border + " !important; }",
        ".related a:hover, .series a:hover { color:" + light.accent + " !important; }",
        ".related a span { color:" + light.text4 + " !important; }",
        ".related-title, .series p { color:" + light.text3 + " !important; }",
        ".series-nav a { background:" + light.bg2 + " !important; border-color:" + light.border + " !important; color:" + light.text3 + " !important; }",
        ".series-nav a:hover { border-color:" + light.accent + " !important; color:" + light.accent + " !important; }",
        ".series-nav .label { color:" + light.text4 + " !important; }",
        ".compare-box.before { background:" + light.bg2 + " !important; border-color:" + light.border + " !important; }",
        ".compare-box.before .amount { color:" + light.text3 + " !important; }",
        ".compare-box.after { background:rgba(13,148,136,0.04) !important; border-color:rgba(13,148,136,0.15) !important; }",
        ".compare-box .label { color:" + light.text3 + " !important; }",
        ".compare-arrow { color:" + light.text4 + " !important; }",
        ".mc-bar { background:" + light.border + " !important; }",
        ".b, .g-card { background:" + light.bg2 + " !important; border-color:" + light.border + " !important; }",
        ".b .n { color:" + light.accent + " !important; }",
        ".b .l { color:" + light.text3 + " !important; }",
        "footer, footer * { color:" + light.text4 + " !important; }",
        "footer a { color:" + light.accent + " !important; opacity:0.6; }",
        // The toggle button itself
        "#pw-theme-toggle { background:" + light.card + " !important; border-color:" + light.border + " !important; box-shadow:" + light.shadow + " !important; }",
      ].join("\n");
      document.head.appendChild(style);
    } else {
      var existing = document.getElementById("pw-light-css");
      if (existing) existing.remove();
    }
  }
  
  applyTheme(theme);
  
  // Insert toggle button
  var btn = document.createElement("button");
  btn.id = "pw-theme-toggle";
  btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
  btn.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:9999;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,0.1);background:rgba(13,20,28,0.9);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:all 0.2s;backdrop-filter:blur(8px)";
  btn.onmouseenter = function() { btn.style.transform = "scale(1.1)"; };
  btn.onmouseleave = function() { btn.style.transform = "scale(1)"; };
  btn.onclick = function() {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("pw_theme", theme);
    applyTheme(theme);
    btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
  };
  document.body.appendChild(btn);
})();
