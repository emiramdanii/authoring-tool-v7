// ═══════════════════════════════════════════════════════════════
// LIVEVIEW-PAGES.JS — Page Rendering, Switching & Sync Logic v5.2
// Contains:
//   - AT_SPLITVIEW navigation methods (_navigateFrame, goPage,
//     navigateToPage) — added to existing AT_SPLITVIEW object
//   - Preview patch (AT_PREVIEW.buildStudentHTML override for fungsi)
//   - Accordion → Preview sync (map + patch)
//   - MutationObserver fallback for form changes
//   - UI helpers: undo buttons, modal close
//
// Requires: liveview-core.js (AT_SPLITVIEW must exist)
// ═══════════════════════════════════════════════════════════════

/* ────────────────────────────────────────────────────────────
   Extend AT_SPLITVIEW with page navigation methods
   ──────────────────────────────────────────────────────────── */

/* ── Navigate iframe to current page + restore doc tab ── */
window.AT_SPLITVIEW._navigateFrame = function() {
  const pageId = document.getElementById("splitPageSelect")?.value || "sc";
  this._sendToFrame({ goPage: pageId });

  // Restore doc tab if on document page and we have a saved tab
  if (pageId === 'scp' && this._savedPreviewState?.docTab) {
    this._sendToFrame({ switchDocTab: this._savedPreviewState.docTab });
  }
};

/* ── Navigate to a page by ID (simple) ── */
window.AT_SPLITVIEW.goPage = function(pageId) {
  const sel = document.getElementById("splitPageSelect");
  if (sel && pageId) sel.value = pageId;
  this._navigateFrame();
  this._sendToFrame({ goPage: pageId });
};

/* ── Navigate to specific page + optional sub-tab (queued) ── */
window.AT_SPLITVIEW.navigateToPage = function(pageId, options) {
  options = options || {};
  const sel = document.getElementById("splitPageSelect");
  if (sel && pageId) sel.value = pageId;

  // Save doc tab to persisted state so it survives iframe rebuilds
  if (options.tab) {
    this._savedPreviewState = this._savedPreviewState || {};
    this._savedPreviewState.docTab = options.tab;
  }

  // Force immediate rebuild even during typing (user explicitly navigated)
  this._forceNextRefresh = true;
  this._isTyping = false;
  clearTimeout(this._typingTimer);

  // Send goPage first
  this._queueMessage({ goPage: pageId });

  // Queue sub-tab switch
  if (options.tab) {
    this._queueMessage({ switchDocTab: options.tab });
  }
  if (options.scrollEnd) {
    this._queueMessage({ scrollToEnd: true });
  }
  if (options.scrollTop > 0) {
    this._queueMessage({ restoreState: { scrollTop: options.scrollTop } });
  }

  // If iframe is ready, also send immediately for faster response
  if (this._iframeReady) {
    this._sendToFrame({ goPage: pageId });
    if (options.tab) {
      this._sendToFrame({ switchDocTab: options.tab });
    }
  }

  // Schedule a refresh to rebuild if content changed
  this.scheduleRefresh();
};

/* ══════════════════════════════════════════════════════════════
   PREVIEW PATCH — pakai AT_STATE.fungsi jika ada override
   ══════════════════════════════════════════════════════════════ */
const _origBuild = AT_PREVIEW.buildStudentHTML.bind(AT_PREVIEW);
AT_PREVIEW.buildStudentHTML = function(S) {
  const patchedS = Object.assign({}, S);
  if (S.fungsi && S.fungsi.length) {
    const origFungsi = PRESETS.fungsi;
    PRESETS.fungsi = S.fungsi;
    const html = _origBuild(patchedS);
    PRESETS.fungsi = origFungsi;
    return html;
  }
  return _origBuild(patchedS);
};

/* ══════════════════════════════════════════════════════════════
   HELPER: Undo/Redo buttons di sidebar
   ══════════════════════════════════════════════════════════════ */
function _injectUndoButtons() {
  const sb = document.querySelector(".sidebar-bottom");
  if (!sb || document.getElementById("undoBtn")) return;
  const row = document.createElement("div");
  row.style.cssText = "display:flex;gap:6px;margin-bottom:6px";
  row.innerHTML = [
    `<button id="undoBtn" class="sidebar-bottom-btn" style="flex:1;opacity:.5" disabled onclick="AT_UNDO.undo()" title="Ctrl+Z">Undo</button>`,
    `<button id="redoBtn" class="sidebar-bottom-btn" style="flex:1;opacity:.5" disabled onclick="AT_UNDO.redo()" title="Ctrl+Y">Redo</button>`
  ].join("");
  sb.insertBefore(row, sb.firstChild);
}

/* ══════════════════════════════════════════════════════════════
   HELPER: Close modals on overlay click
   ══════════════════════════════════════════════════════════════ */
function _initModalClose() {
  ["skDetailModal","fungsiModal"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", e => {
      if (e.target === el) {
        el.classList.remove("show");
        if (id === "skDetailModal") AT_SK_EDITOR.close();
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   HELPER: MutationObserver fallback for form changes
   v5.0: Now uses scheduleRefresh() to RESPECT typing skip!
   Previously called refresh() directly — this was the ROOT CAUSE
   of typing flicker even when _isTyping was true.
   ══════════════════════════════════════════════════════════════ */
let _mutationObserver = null;
function _initMutationObserver() {
  if (_mutationObserver) return;

  const contentEl = document.getElementById("content");
  if (!contentEl) return;

  let _lastMutCheck = 0;
  _mutationObserver = new MutationObserver((mutations) => {
    if (!AT_SPLITVIEW.active) return;
    // Respect typing state — don't trigger rebuild during typing
    if (AT_SPLITVIEW._isTyping) {
      AT_SPLITVIEW._hasPendingRefresh = true;
      AT_SPLITVIEW._showTypingIndicator();
      return;
    }
    const now = Date.now();
    if (now - _lastMutCheck < 800) return;
    _lastMutCheck = now;
    if (!AT_STATE.dirty) return;
    // Use scheduleRefresh instead of direct refresh() — respects all guards
    AT_SPLITVIEW.scheduleRefresh();
  });

  _mutationObserver.observe(contentEl, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['value', 'checked', 'selected']
  });
}

/* ══════════════════════════════════════════════════════════════
   ACCORDION → PREVIEW SYNC (with message queue)
   Maps accordion titles to preview pages and sub-tabs.
   Uses navigateToPage() which saves doc tab + force refresh.
   ══════════════════════════════════════════════════════════════ */

const _ACCORDION_PREVIEW_MAP = {
  'Identitas Media':           { page: 'sc',   tab: null },
  'Capaian Pembelajaran':      { page: 'scp',  tab: 'kcp'  },
  'Tujuan Pembelajaran':       { page: 'scp',  tab: 'ktp'  },
  'Alur Tujuan Pembelajaran':  { page: 'scp',  tab: 'katp' },
  'Alur Kegiatan':             { page: 'scp',  tab: null,  scrollEnd: true },
};

function _patchAccordionToggle() {
  const origToggle = window.toggleAccordion;
  if (!origToggle) return;
  window.toggleAccordion = function(headerEl) {
    const wasOpen = headerEl.closest('.acc-section')?.classList.contains('open');
    origToggle(headerEl);
    _recalcAfterRender();

    // Auto-sync preview when accordion OPENS (not when closing)
    if (!wasOpen && AT_SPLITVIEW?.active) {
      const title = headerEl.querySelector('.acc-title')?.textContent?.trim();
      const mapping = title ? _ACCORDION_PREVIEW_MAP[title] : null;
      if (mapping) {
        // navigateToPage saves doc tab + forces refresh (bypasses typing skip)
        AT_SPLITVIEW.navigateToPage(mapping.page, {
          tab: mapping.tab || null,
          scrollEnd: mapping.scrollEnd || false
        });
      }
    }
  };
}

/* ── Expose helpers on window for aggregator access ── */
window._injectUndoButtons = _injectUndoButtons;
window._initModalClose = _initModalClose;
window._initMutationObserver = _initMutationObserver;
window._patchAccordionToggle = _patchAccordionToggle;

console.log("✅ liveview-pages.js loaded");
