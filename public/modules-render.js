/* ══════════════════════════════════════════════════════════════
   modules-render.js — Aggregator for module HTML renderers
   Loads dispatcher only; actual renderers are in:
     render-basic.js       — Materi, Video, Infografis, Flashcard, Hero, Kutipan, Embed
     render-interactive.js — Skenario, Matching, Accordion, Polling, Tab-Icons
     render-data.js        — Studi-Kasus, Debat, Timeline, Langkah, Statistik
     render-advanced.js    — Icon-Explore, Comparison, Card-Showcase, Hotspot-Image
   Dipakai oleh importer.js (buildHtml) & preview.js.
   ══════════════════════════════════════════════════════════════ */

(function() {
  const M = window.AT_MODULES;

  M.renderModuleHtml = function(m) {
    // If this module is actually a game, delegate to AT_GAMES
    if (m._isGame && window.AT_GAMES) {
      return AT_GAMES.renderGameHtml(m);
    }
    switch(m.type) {
      case "skenario":    return this._htmlSkenario(m);
      case "video":       return this._htmlVideo(m);
      case "infografis":  return this._htmlInfografis(m);
      case "flashcard":   return this._htmlFlashcard(m);
      case "studi-kasus": return this._htmlStudiKasus(m);
      case "debat":       return this._htmlDebat(m);
      case "timeline":    return this._htmlTimeline(m);
      case "matching":    return this._htmlMatching(m);
      case "materi":      return this._htmlMateri(m);
      case "hero":        return this._htmlHero(m);
      case "kutipan":     return this._htmlKutipan(m);
      case "langkah":     return this._htmlLangkah(m);
      case "accordion":   return this._htmlAccordion(m);
      case "statistik":   return this._htmlStatistik(m);
      case "polling":     return this._htmlPolling(m);
      case "embed":       return this._htmlEmbed(m);
      case "tab-icons":   return this._htmlTabIcons(m);
      case "icon-explore":return this._htmlIconExplore(m);
      case "comparison":  return this._htmlComparison(m);
      case "card-showcase":return this._htmlCardShowcase(m);
      case "hotspot-image":return this._htmlHotspotImage(m);
      default: return `<div class="card mt14"><p style="color:var(--muted)">Modul tipe ${m.type} belum ada renderer.</p></div>`;
    }
  };

})();

console.log("✅ modules-render.js loaded");
