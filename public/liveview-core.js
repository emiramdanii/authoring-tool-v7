// ═══════════════════════════════════════════════════════════════
// LIVEVIEW-CORE.JS — Core Split View Controller v5.2
// Contains:
//   AT_SPLITVIEW — main split-view object with all state properties,
//   message queue system, typing detection, scheduling, refresh engine,
//   sync pulse, resizing, and UI helpers (dropdown, char count).
//
// Navigation methods (_navigateFrame, goPage, navigateToPage) are
// added by liveview-pages.js after this file loads.
//
// Initialization logic lives in liveview.js (aggregator).
// ═══════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════════
   AT_SPLITVIEW — Live preview di sebelah editor  v4.6
   Single entry point: scheduleRefresh() → debounced refresh()
   ══════════════════════════════════════════════════════════════ */
window.AT_SPLITVIEW = {
  active: false,
  _device: "mobile",
  _debounceTimer: null,
  _lastHTML: "",
  _hasContent: false,
  _splitWidth: 440,
  _minWidth: 280,
  _maxWidth: 800,
  _isResizing: false,
  _resizeStartX: 0,
  _resizeStartWidth: 0,
  _refreshCount: 0,
  _autoOpened: false,
  _syncTimer: null,
  _buildCount: 0,
  _errorRetries: 0,
  _savedPreviewState: null,
  _rafPending: false,         // requestAnimationFrame gating flag
  _prePatchState: null,       // state snapshot before typing started
  _lastPatchedHTML: '',       // last known HTML (to detect structure changes)

  // ── Typing Detection ──
  _isTyping: false,
  _typingTimer: null,
  _hasPendingRefresh: false,   // true when typing generated dirty state
  _forceNextRefresh: false,   // true when navigation action needs immediate rebuild

  // ── Message Queue: prevents race condition with iframe rebuild ──
  _pendingMessages: [],
  _iframeReady: false,

  /* ── Queue a message to iframe (safe even during rebuild) ── */
  _queueMessage(msg) {
    if (this._iframeReady) {
      this._sendToFrame(msg);
    } else {
      this._pendingMessages.push(msg);
    }
  },

  /* ── Send message directly to iframe ── */
  _sendToFrame(msg) {
    const frame = document.getElementById("split-frame");
    try {
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage(msg, "*");
      }
    } catch(e) {}
  },

  /* ── Flush all queued messages after iframe loads ── */
  _flushPendingMessages() {
    this._iframeReady = true;
    const msgs = this._pendingMessages.splice(0);
    msgs.forEach(msg => {
      setTimeout(() => this._sendToFrame(msg), 50);
    });
  },

  /* ── Reset queue when iframe starts rebuilding ── */
  _resetIframeState() {
    this._iframeReady = false;
  },

  /* ── Send targeted DOM patches instead of full rebuild during typing ── */
  _sendPatch() {
    if (!this._iframeReady) return;
    try {
      const html = AT_PREVIEW.buildStudentHTML(AT_STATE);
      if (!this._lastPatchedHTML || html.length < 100) {
        this._lastPatchedHTML = html;
        return;
      }
      if (html === this._lastPatchedHTML) return;

      const patches = {};

      // CP fields
      const oldCp = this._prePatchState?.cp || {};
      const newCp = AT_STATE.cp || {};
      if (oldCp.capaianFase !== newCp.capaianFase) patches['cp-f'] = newCp.capaianFase || '';
      if (oldCp.elemen !== newCp.elemen) patches['cp-e'] = newCp.elemen || '-';
      if (oldCp.subElemen !== newCp.subElemen) patches['cp-s'] = newCp.subElemen || '-';

      // Meta fields
      const oldM = this._prePatchState?.meta || {};
      const newM = AT_STATE.meta || {};
      if (oldM.judulPertemuan !== newM.judulPertemuan) patches['cover-title'] = newM.judulPertemuan || 'Media Pembelajaran';
      if (oldM.subjudul !== newM.subjudul) patches['cover-sub'] = newM.subjudul || '';

      // TP fields (only patch if array length unchanged)
      const oldTp = this._prePatchState?.tp || [];
      const newTp = AT_STATE.tp || [];
      if (oldTp.length === newTp.length) {
        newTp.forEach((t,i) => {
          const ot = oldTp[i] || {};
          if (ot.verb !== t.verb) patches['tp-v-'+i] = t.verb || '';
          if (ot.desc !== t.desc) patches['tp-d-'+i] = t.desc || '';
        });
      }

      // ATP fields
      const oldAtp = this._prePatchState?.atp?.pertemuan || [];
      const newAtp = AT_STATE.atp?.pertemuan || [];
      if (oldAtp.length === newAtp.length) {
        newAtp.forEach((p,i) => {
          const op = oldAtp[i] || {};
          if (op.judul !== p.judul) patches['atp-j-'+i] = p.judul || '';
          if (op.tp !== p.tp) patches['atp-t-'+i] = p.tp || '';
          if (op.kegiatan !== p.kegiatan) patches['atp-k-'+i] = p.kegiatan || '';
        });
      }

      // Alur fields
      const oldAlur = this._prePatchState?.alur || [];
      const newAlur = AT_STATE.alur || [];
      if (oldAlur.length === newAlur.length) {
        newAlur.forEach((s,i) => {
          const os = oldAlur[i] || {};
          if (os.durasi !== s.durasi) patches['alur-d-'+i] = s.durasi || '';
          if (os.judul !== s.judul) patches['alur-j-'+i] = s.judul || '';
        });
      }

      if (Object.keys(patches).length > 0) {
        this._sendToFrame({ patchContent: patches });
      }
      this._lastPatchedHTML = html;
    } catch(e) {}
  },

  /* ── Toggle split view ─────────────────────────────────── */
  toggle() {
    this.active = !this.active;
    const app  = document.getElementById("app");
    const btn  = document.getElementById("btnSplitToggle");
    const pane = document.getElementById("split-pane");
    if (!app) return;

    if (this.active) {
      app.classList.add("split-active");
      app.style.setProperty('--split-width', this._splitWidth + 'px');
      if (pane) pane.style.display = "flex";
      if (btn)  btn.classList.add("active");
      this._initResizeHandle();
      this.refresh();
    } else {
      app.classList.remove("split-active", "resizing");
      if (pane) pane.style.display = "none";
      if (btn)  btn.classList.remove("active");
      const loading = document.getElementById("splitLoading");
      if (loading) loading.style.display = "none";
      this._autoOpened = false;
      this._pendingMessages = [];
      this._iframeReady = false;
    }
  },

  setDevice(d) {
    this._device = d;
    document.querySelectorAll(".split-device-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.device === d);
    });
    this.refresh();
  },

  /* ── Detect active typing — defer ALL rebuilds until typing stops ── */
  _startTyping() {
    if (!this._isTyping) {
      // Save state snapshot for diffing (shallow clone is enough)
      this._prePatchState = JSON.parse(JSON.stringify(AT_STATE));
    }
    this._isTyping = true;
    this._forceNextRefresh = false;
    clearTimeout(this._typingTimer);
    this._typingTimer = setTimeout(() => {
      this._isTyping = false;
      // Typing ended — one full rebuild for consistency, then patch from here
      if (this._hasPendingRefresh && this.active) {
        this._hasPendingRefresh = false;
        this._prePatchState = null;
        this._lastPatchedHTML = '';
        this.scheduleRefresh();
      }
    }, 400);
  },

  /* ── Show typing indicator in sync area ── */
  _showTypingIndicator() {
    const dot = document.getElementById("syncDot");
    const label = document.getElementById("syncLabel");
    if (!dot) return;
    dot.style.background = 'var(--muted)';
    dot.style.transform = 'scale(0.8)';
    dot.style.opacity = '0.5';
    if (label) { label.textContent = 'Mengetik...'; label.style.color = 'var(--muted)'; }
  },

  /* ── Single entry point: dipanggil dari unified markDirty ── */
  scheduleRefresh() {
    if (!this.active) {
      if (!this._autoOpened && this._hasEnoughContent() && window.innerWidth > 900) {
        this._autoOpened = true;
        this.toggle();
      }
      return;
    }

    // During active typing, DON'T schedule rebuild — just flag pending
    if (this._isTyping && !this._forceNextRefresh) {
      // PATCH MODE: send targeted DOM updates instead of rebuilding
      this._sendPatch();
      this._hasPendingRefresh = true;
      this._showTypingIndicator();
      return;
    }

    clearTimeout(this._debounceTimer);
    this._hasPendingRefresh = false;
    const delay = this._buildCount < 2 ? 50 : 150;  // 150ms — fast response
    // Use requestAnimationFrame to avoid mid-frame rendering
    this._debounceTimer = setTimeout(() => {
      if (this._rafPending) return;
      this._rafPending = true;
      requestAnimationFrame(() => {
        this._rafPending = false;
        this.refresh();
      });
    }, delay);
  },

  /* ── Force refresh — always rebuild ── */
  forceRefresh() {
    this._forceNextRefresh = true;
    this._isTyping = false;
    this._hasPendingRefresh = false;
    this._lastHTML = "";
    this.refresh();
  },

  _hasEnoughContent() {
    const S = AT_STATE;
    return !!(S.meta.judulPertemuan || S.cp.capaianFase || S.tp.length || S.kuis.length || (S.modules||[]).length || (S.skenario||[]).length);
  },

  /* ── Build & render preview ke iframe ───────────────────── */
  refresh() {
    if (!this.active) return;

    // ╔══════════════════════════════════════════════════════════╗
    // ║  HARD BLOCK: Tidak ada rebuild saat sedang mengetik!    ║
    // ║  Ini check TERAKHIR — tidak ada code path yang bisa      ║
    // ║  melewati ini selain forceNextRefresh=true.               ║
    // ╚══════════════════════════════════════════════════════════╝
    if (this._isTyping && !this._forceNextRefresh) {
      this._hasPendingRefresh = true;
      this._showTypingIndicator();
      return;  // ← REBUILD DIBATALKAN
    }

    // Clear flags
    this._debounceTimer = null;
    this._forceNextRefresh = false;
    this._hasPendingRefresh = false;

    const frame = document.getElementById("split-frame");
    const loading = document.getElementById("splitLoading");
    const emptyState = document.getElementById("splitEmptyState");
    if (!frame) return;

    try {
      if (!window.AT_PREVIEW || !window.AT_PREVIEW.buildStudentHTML) {
        console.warn("AT_PREVIEW not ready, retrying in 500ms...");
        setTimeout(() => this.refresh(), 500);
        return;
      }

      const html = AT_PREVIEW.buildStudentHTML(AT_STATE);
      this._buildCount++;
      this._hasContent = true;
      this._errorRetries = 0;
      this._updateCharCount(html);
      this._updateDropdown();

      // ── ANTI-FLICKER: skip refresh if HTML hasn't changed ──
      if (html === this._lastHTML) {
        if (this._pendingMessages.length > 0) {
          this._flushPendingMessages();
        } else {
          this._navigateFrame();
        }
        return;
      }

      // HTML changed — show sync pulse
      this._showSyncPulse();

      this._lastHTML = html;
      this._lastPatchedHTML = html;
      this._prePatchState = null;
      // ╔═══════════════════════════════════════════════════════╗
      // ║  ANTI-FLICKER v5.2: TIDAK ADA loading overlay,      ║
      // ║  TIDAK ADA opacity fade, TIDAK ADA visibility toggle ║
      // ║                                                     ║
      // ║  Kenapa ini bekerja tanpa flicker?                  ║
      // ║  1. iframe background sudah #0e1c2f (sama konten)   ║
      // ║  2. antiFlicker CSS membuat semua opacity:1 langsung  ║
      // ║  3. Tidak ada transisi visual — langsung ganti       ║
      // ║  4. srcdoc update sangat cepat (<16ms)               ║
      // ║  5. Browser compositor menangani swap tanpa jank    ║
      // ╚═════════════════════════════════════════════════════╝
      this._resetIframeState();

      // ── Aggressive anti-flicker: kill ALL animations + transitions ──
      const antiFlicker = `<style>
*{animation:none!important;transition:none!important;}
.screen,.mat-page,.kp,.card,.btn-y,.h2{opacity:1!important;}
@keyframes fi{from{opacity:1;transform:none}to{opacity:1;transform:none}}
</style>`;

      // ── Navigation script injected into student HTML ──
      // Handles: goPage, restoreState, switchDocTab, scrollToEnd, scroll tracking
      // v4.6: patches kT() to track doc tab, includes docTab in state
      const navScript = `<script>(function(){
  var _curDocTab=null;
  window.addEventListener('message',function(e){
    if(e.data&&e.data.goPage){var fn=window.go;if(fn)fn(e.data.goPage);}
    if(e.data&&e.data.goModP!==undefined){var fn=window.goModP;if(fn)fn(e.data.goModP);}
    if(e.data&&e.data.goMatP!==undefined){var fn=window.goMatP;if(fn)fn(e.data.goMatP);}
    if(e.data&&e.data.restoreState){
      var rs=e.data.restoreState;
      setTimeout(function(){
        if(rs.matPage!=null&&typeof window.goMatP==='function')goMatP(rs.matPage);
        if(rs.modPage!=null&&typeof window.goModP==='function')goModP(rs.modPage);
        if(rs.ftTab!=null&&typeof window.swFt==='function')swFt(rs.ftTab);
        if(rs.docTab&&typeof kT==='function'){
          var tabEl=null;
          document.querySelectorAll('.ktab').forEach(function(t){
            var oc=t.getAttribute('onclick')||'';
            if(oc.indexOf('"'+rs.docTab+'"')>=0||oc.indexOf("'"+rs.docTab+"'")>=0){tabEl=t;}
          });
          if(tabEl){kT(rs.docTab,tabEl);_curDocTab=rs.docTab;}
        }
        if(rs.scrollTop>0)window.scrollTo(0,rs.scrollTop);
      },150);
    }
    if(e.data&&e.data.switchDocTab){
      var tabId=e.data.switchDocTab;
      setTimeout(function(){
        var tabEl=null;
        document.querySelectorAll('.ktab').forEach(function(t){
          var oc=t.getAttribute('onclick')||'';
          if(oc.indexOf('"'+tabId+'"')>=0||oc.indexOf("'"+tabId+"'")>=0){tabEl=t;}
        });
        if(tabEl&&typeof kT==='function'){kT(tabId,tabEl);_curDocTab=tabId;}
        else if(typeof kT==='function'){
          var fakeEl={classList:{add:function(){},remove:function(){}}};
          try{kT(tabId,fakeEl);_curDocTab=tabId;}catch(ex){}
        }
        try{window.parent.postMessage({docTabSwitched:tabId},'*');}catch(ex){}
      },80);
    }
    if(e.data&&e.data.scrollToEnd){
      setTimeout(function(){window.scrollTo(0,document.body.scrollHeight);},100);
    }
    if(e.data&&e.data.patchContent){
      var pc=e.data.patchContent;
      for(var f in pc){
        var el=document.getElementById('pf-'+f);
        if(el)el.textContent=pc[f];
      }
    }
  });
  var _rsTimer=null;
  function _rsDebounced(){
    clearTimeout(_rsTimer);
    // v5.0: Debounce state reports to prevent race condition
    // When multiple messages arrive quickly (goPage + switchDocTab),
    // only report state after the last one settles (250ms)
    _rsTimer=setTimeout(_rs,250);
  }
  var _og=window.go;
  window.go=function(id){if(_og)_og(id);_rsDebounced();};
  var _gm=window.goMatP;if(_gm){window.goMatP=function(i){_gm(i);_rsDebounced();};}
  var _mn=window.matNav;if(_mn){window.matNav=function(d){_mn(d);_rsDebounced();};}
  var _gmp=window.goModP;if(_gmp){window.goModP=function(i){_gmp(i);_rsDebounced();};}
  var _mdn=window.modNav;if(_mdn){window.modNav=function(d){_mdn(d);_rsDebounced();};}
  var _sf=window.swFt;if(_sf){window.swFt=function(i){_sf(i);_rsDebounced();};}
  var _okT=window.kT;
  if(_okT){window.kT=function(id,el){_okT(id,el);_curDocTab=id;_rsDebounced();};}
  function _rs(){
    var s={};
    var as=document.querySelector('.screen.active');
    if(as)s.page=as.id;
    if(typeof _matP!=='undefined')s.matPage=_matP;
    if(typeof _modP!=='undefined')s.modPage=_modP;
    if(typeof curFt!=='undefined')s.ftTab=curFt;
    if(_curDocTab)s.docTab=_curDocTab;
    s.scrollTop=window.scrollY||document.documentElement.scrollTop;
    try{window.parent.postMessage({previewState:s},'*');}catch(e){}
  }
  window.addEventListener('scroll',function(){
    try{var st=window.scrollY||document.documentElement.scrollTop;
    if(st>5)window.parent.postMessage({previewScroll:st},'*');
    }catch(e){}
  });
  setTimeout(_rs,400);
})();<\/script>`;
      frame.srcdoc = html.replace("</body>", antiFlicker + navScript + "</body>");
      frame.style.display = "block";
      if (emptyState) emptyState.style.display = "none";

      // Remove old listeners to prevent stacking
      frame.onload = null;
      frame.addEventListener("load", () => {
        // NO opacity fade — directly navigate (anti-flicker)
        setTimeout(() => {
          // 1. Navigate to correct page + restore doc tab
          this._navigateFrame();
          // 2. Restore full saved state (matPage, modPage, ftTab, scroll, docTab)
          if (this._savedPreviewState) {
            try {
              frame.contentWindow.postMessage({ restoreState: this._savedPreviewState }, "*");
            } catch(e) {}
          }
          // 3. Flush queued messages (switchDocTab, scrollToEnd, etc.)
          this._flushPendingMessages();
          this._hideSyncPulse();
          if (loading) loading.style.display = "none";
        }, 80);
      }, { once: true });

      // Safety timeout
      setTimeout(() => {
        if (loading) loading.style.display = "none";
        if (!this._iframeReady) this._flushPendingMessages();
      }, 4000);

    } catch(e) {
      this._errorRetries++;
      this._hideSyncPulse();
      console.error("Live preview error:", e);

      frame.srcdoc = `<body style="padding:24px;color:#f87171;font-family:'Plus Jakarta Sans',sans-serif;background:#0e1c2f;margin:0"><div style="max-width:300px"><div style="font-size:1.4rem;margin-bottom:8px">&#9888;&#65039;</div><div style="font-size:.85rem;font-weight:700;margin-bottom:6px">Preview Error</div><pre style="font-size:.72rem;white-space:pre-wrap;color:rgba(248,113,113,.7);line-height:1.5;margin:0">${e.message}</pre><button onclick="window.parent.postMessage({action:'retry'},'*')" style="margin-top:12px;padding:6px 14px;border-radius:6px;border:1px solid rgba(248,113,113,.3);background:rgba(248,113,113,.1);color:#f87171;font-size:.72rem;font-weight:700;cursor:pointer">Coba Lagi</button></div></body>`;
      if (loading) loading.style.display = "none";
      frame.style.display = "block";
      if (emptyState) emptyState.style.display = "none";
      this._iframeReady = false;
    }
  },

  /* ── Update page dropdown dynamically ───────────────────── */
  _updateDropdown() {
    const sel = document.getElementById('splitPageSelect');
    if (!sel) return;
    const curVal = sel.value;
    const gameCount = (AT_STATE.games || []).length;

    const pages = [
      { id: 'sc',   label: '🏠 Cover' },
      { id: 'scp',  label: '📋 Dokumen' },
      { id: 'ssk',  label: '🎭 Skenario' },
      { id: 'smat', label: '📝 Materi' },
      { id: 'smods',label: '🧩 Modul' },
    ];
    for (let g = 0; g < gameCount; g++) {
      const gTitle = AT_STATE.games[g]?.title || '';
      pages.push({ id: 'sgame_' + g, label: '🎮 ' + (gTitle ? gTitle : 'Game ' + (g+1)) });
    }
    pages.push(
      { id: 'skuis', label: '❓ Kuis' },
      { id: 'shas',  label: '📊 Hasil' }
    );

    sel.innerHTML = pages.map(p =>
      `<option value="${p.id}">${p.label}</option>`
    ).join('');

    const validIds = pages.map(p => p.id);
    if (validIds.includes(curVal)) {
      sel.value = curVal;
    }
  },

  /* ── Character count display ─────────────────────────────── */
  _updateCharCount(html) {
    const el = document.getElementById("splitCharCount");
    if (el) {
      const chars = html.length;
      el.textContent = chars > 1000 ? (chars / 1000).toFixed(1) + 'k' : chars;
    }
  },

  /* ── Sync pulse indicator ─────────────────────────────── */
  _showSyncPulse() {
    const dot = document.getElementById("syncDot");
    const label = document.getElementById("syncLabel");
    if (!dot) return;
    clearTimeout(this._syncTimer);
    // Reset any typing indicator styles
    dot.style.opacity = '1';
    dot.style.background = 'var(--y)';
    dot.style.transform = 'scale(1.3)';
    if (label) { label.textContent = 'Sinkron...'; label.style.color = 'var(--y)'; }
    this._syncTimer = setTimeout(() => this._hideSyncPulse(), 1500);
  },

  _hideSyncPulse() {
    const dot = document.getElementById("syncDot");
    const label = document.getElementById("syncLabel");
    if (!dot) return;
    dot.style.background = 'var(--g)';
    dot.style.transform = 'scale(1)';
    dot.style.opacity = '1';
    if (label) { label.textContent = 'Tersinkron'; label.style.color = 'var(--muted)'; }
  },

  /* ── Resizable Split Pane ─────────────────────────────────── */
  _initResizeHandle() {
    const handle = document.getElementById("split-resize-handle");
    if (!handle || handle._bound) return;
    handle._bound = true;
    handle.addEventListener("mousedown", (e) => this._startResize(e));
    handle.addEventListener("touchstart", (e) => this._startResize(e), { passive: false });
  },

  _startResize(e) {
    e.preventDefault();
    this._isResizing = true;
    this._resizeStartX = e.touches ? e.touches[0].clientX : e.clientX;
    this._resizeStartWidth = this._splitWidth;
    const app = document.getElementById("app");
    const handle = document.getElementById("split-resize-handle");
    if (app) app.classList.add("resizing");
    if (handle) handle.classList.add("active");
    document.addEventListener("mousemove", this._onResizeMove);
    document.addEventListener("touchmove", this._onResizeMove, { passive: false });
    document.addEventListener("mouseup", this._onResizeEnd);
    document.addEventListener("touchend", this._onResizeEnd);
  },

  _onResizeMove: (e) => {
    const sv = window.AT_SPLITVIEW;
    if (!sv._isResizing) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = sv._resizeStartX - clientX;
    const newWidth = Math.min(sv._maxWidth, Math.max(sv._minWidth, sv._resizeStartWidth + diff));
    sv._splitWidth = Math.round(newWidth);
    const app = document.getElementById("app");
    if (app) app.style.setProperty('--split-width', sv._splitWidth + 'px');
  },

  _onResizeEnd: () => {
    const sv = window.AT_SPLITVIEW;
    if (!sv._isResizing) return;
    sv._isResizing = false;
    const app = document.getElementById("app");
    const handle = document.getElementById("split-resize-handle");
    if (app) app.classList.remove("resizing");
    if (handle) handle.classList.remove("active");
    document.removeEventListener("mousemove", sv._onResizeMove);
    document.removeEventListener("touchmove", sv._onResizeMove);
    document.removeEventListener("mouseup", sv._onResizeEnd);
    document.removeEventListener("touchend", sv._onResizeEnd);
  }
};

console.log("✅ liveview-core.js loaded");
