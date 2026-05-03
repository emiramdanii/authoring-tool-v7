// ═══════════════════════════════════════════════════════════════
// LIVEVIEW.JS — Split-View Live Preview Aggregator v5.2
// This file loads AFTER liveview-core.js and liveview-pages.js.
// It contains only the DOMContentLoaded initialization:
//   - markDirty hook (with typing-optimized undo)
//   - Typing detection (keydown capture + input fallback)
//   - Undo button hover effects
//   - Keyboard shortcuts (Ctrl+Shift+L, Ctrl+Shift+R)
//   - Iframe message listener (preview state, retry, scroll)
//
// Sub-modules:
//   liveview-core.js  — AT_SPLITVIEW object, toggle, refresh, messaging
//   liveview-pages.js — Navigation, preview patch, accordion sync, helpers
// ═══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  _injectUndoButtons();
  _initModalClose();
  _patchAccordionToggle();
  AT_UNDO.init();
  _initMutationObserver();

  // Add fungsi to AT_STATE if missing
  if (!AT_STATE.fungsi) AT_STATE.fungsi = null;

  // ── UNIFIED markDirty hook (with typing-optimized undo) ──────
  const _baseMarkDirty = AT_EDITOR.markDirty.bind(AT_EDITOR);
  let _undoBatchTimer = null;
  AT_EDITOR.markDirty = function() {
    _baseMarkDirty();
    // v5.1: Detect typing HERE — before scheduleRefresh!
    // This fixes the race condition where inline oninput fires before
    // the #content input listener (event bubbling order).
    AT_SPLITVIEW._startTyping();
    // Batch undo pushes during typing to avoid expensive deep clone per keystroke
    if (AT_SPLITVIEW._isTyping) {
      clearTimeout(_undoBatchTimer);
      _undoBatchTimer = setTimeout(() => AT_UNDO.push(), 1500);
    } else {
      AT_UNDO.push();
    }
    AT_SPLITVIEW.scheduleRefresh();
    _recalcAfterRender();
  };

  // ── Typing Detection: keydown CAPTURE phase (before ALL other handlers) ──
  // Using capture phase ensures _isTyping=true BEFORE any form handler runs.
  // This catches ALL keyboard input, including inputs not inside #content.
  document.addEventListener("keydown", (e) => {
    // Only for actual text input keys (not Ctrl, Alt, Shift, arrows, etc.)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      AT_SPLITVIEW._startTyping();
    }
  }, { capture: true, passive: true });

  // Fallback: input event on #content for paste/drag-drop/IME
  document.getElementById("content")?.addEventListener("input", () => {
    AT_SPLITVIEW._startTyping();
  }, { passive: true });

  // Undo buttons hover effect
  document.querySelectorAll("#undoBtn,#redoBtn").forEach(b => {
    b.addEventListener("mouseenter", () => b.style.opacity = b.disabled ? ".5" : "1");
    b.addEventListener("mouseleave", () => b.style.opacity = b.disabled ? ".5" : "1");
  });

  // ── Keyboard Shortcuts ──
  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      AT_SPLITVIEW.toggle();
    }
    if (mod && e.shiftKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      if (AT_SPLITVIEW.active) {
        AT_SPLITVIEW.forceRefresh();
        AT_UTIL.toast("Preview di-refresh", "ok");
      }
    }
  });

  // ── Listen for messages from iframe ──
  window.addEventListener("message", (e) => {
    if (e.data && e.data.action === "retry") {
      AT_SPLITVIEW.forceRefresh();
    }
    // v5.0: MERGE preview state instead of OVERWRITE
    // Fixes CP/TP/ATP race condition where iframe sends state without docTab
    // during goPage, overwriting the docTab saved by navigateToPage()
    if (e.data && e.data.previewState) {
      const incoming = e.data.previewState;
      const existing = AT_SPLITVIEW._savedPreviewState || {};
      // Merge: incoming takes priority, but preserve docTab if iframe didn't report it
      if (incoming.docTab === undefined && existing.docTab) {
        incoming.docTab = existing.docTab;
      }
      // Preserve scrollTop if incoming doesn't have it
      if (incoming.scrollTop === undefined && existing.scrollTop) {
        incoming.scrollTop = existing.scrollTop;
      }
      AT_SPLITVIEW._savedPreviewState = incoming;
    }
    if (e.data && e.data.previewScroll) {
      AT_SPLITVIEW._savedPreviewState = AT_SPLITVIEW._savedPreviewState || {};
      AT_SPLITVIEW._savedPreviewState.scrollTop = e.data.previewScroll;
    }
    if (e.data && e.data.docTabSwitched) {
      // Doc tab changed in iframe — update saved state
      AT_SPLITVIEW._savedPreviewState = AT_SPLITVIEW._savedPreviewState || {};
      AT_SPLITVIEW._savedPreviewState.docTab = e.data.docTabSwitched;
    }
  });

  console.log("liveview.js v5.1 — hard block typing (refresh() unreachable during typing), keydown capture phase, state merge for CP/TP/ATP");
});

console.log("✅ liveview.js loaded");
