/* SAP TLP v2 — comportamento compartilhado */
(function () {
  'use strict';
  var body = document.body;
  var ROOT = body.getAttribute('data-root') || '';
  var PAGE = body.getAttribute('data-page') || '';
  var MOD = body.getAttribute('data-mod') || '';

  /* ---------- storage seguro ---------- */
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  window.SAP = { load: load, save: save };

  /* ---------- progresso ---------- */
  var PKEY = 'sap2-progress';
  function getProg() { return load(PKEY, {}); }
  function setProg(id, patch) {
    var p = getProg(); p[id] = Object.assign({}, p[id] || {}, patch); save(PKEY, p); paintSignals();
  }
  function level(id) {
    var m = getProg()[id]; if (!m) return 0;
    if (m.done) return 4;
    var s = m.seen || 0;
    return s >= .66 ? 3 : s >= .33 ? 2 : s > 0 ? 1 : 0;
  }
  function paintSignals() {
    document.querySelectorAll('[data-signal]').forEach(function (el) {
      var lv = level(el.getAttribute('data-signal'));
      el.setAttribute('data-level', lv);
      el.setAttribute('aria-label', ['Não iniciado', 'Iniciado', 'Em andamento', 'Quase lá', 'Concluído'][lv]);
      var st = el.closest('[data-station]'); if (st) st.setAttribute('data-done', lv === 4);
    });
    document.querySelectorAll('[data-signal-text]').forEach(function (el) {
      var lv = level(el.getAttribute('data-signal-text'));
      el.textContent = ['Não iniciado', 'Iniciado', 'Em andamento', 'Quase lá', 'Concluído'][lv];
    });
  }
  window.SAP.signal = function () { return '<span class="signal" role="img"><i></i><i></i><i></i><i></i></span>'; };

  /* ---------- ícones ---------- */
  var I = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  /* ---------- tema ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var b = document.getElementById('themeBtn');
    if (b) { b.innerHTML = t === 'dark' ? I.sun : I.moon; b.setAttribute('aria-label', t === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'); }
    save('sap2-theme', t);
  }

  /* ---------- topo e rodapé ---------- */
  var nav = [
    ['inicio', 'index.html', 'Início'],
    ['cci', 'index.html#cci', 'CCI'],
    ['campo', 'index.html#campo', 'Campo'],
    ['calc', 'consulta/calculadora-sla.html', 'Calculadora SLA'],
    ['glossario', 'consulta/glossario.html', 'Glossário'],
    ['ferramentas', 'consulta/ferramentas.html', 'Ferramentas']
  ];
  var top = document.createElement('header');
  top.className = 'topbar';
  top.innerHTML =
    '<a class="skip" href="#conteudo">Pular para o conteúdo</a>' +
    '<div class="wrap">' +
    '<a class="brand" href="' + ROOT + 'index.html"><img src="' + ROOT + 'img/logotlp.jpg" alt="TLP"><span>Portal SAP<small>Sistema de Apoio Profissional</small></span></a>' +
    '<nav class="nav" id="mainNav" aria-label="Principal">' +
    nav.map(function (n) { return '<a href="' + ROOT + n[1] + '"' + (PAGE === n[0] ? ' aria-current="page"' : '') + '>' + n[2] + '</a>'; }).join('') +
    '</nav>' +
    '<div class="top-actions">' +
    '<button class="search-btn" id="searchBtn" type="button" aria-label="Buscar no portal">' + I.search + '<span class="lbl">Buscar procedimento…</span><kbd>Ctrl K</kbd></button>' +
    '<button class="icon-btn" id="themeBtn" type="button"></button>' +
    '<button class="icon-btn menu-btn" id="menuBtn" type="button" aria-label="Abrir menu" aria-expanded="false">' + I.menu + '</button>' +
    '</div></div>';
  body.insertBefore(top, body.firstChild);

  var foot = document.createElement('footer');
  foot.className = 'footer';
  foot.innerHTML = '<div class="wrap"><div>© 2026 TLP — Conectados com o Futuro.<br>Portal SAP · Sistema de Apoio Profissional</div>' +
    '<div>Desenvolvimento: Lucas Infante<br>Conteúdo para uso interno dos colaboradores TLP.</div></div>';
  body.appendChild(foot);

  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
  document.getElementById('themeBtn').addEventListener('click', function () {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  document.getElementById('menuBtn').addEventListener('click', function () {
    var n = document.getElementById('mainNav'); var o = n.classList.toggle('open');
    this.setAttribute('aria-expanded', o);
  });

  /* ---------- busca ---------- */
  var dlg = document.createElement('div');
  dlg.className = 'sdlg'; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', 'Buscar no portal');
  dlg.innerHTML = '<div class="sbox"><input id="sInput" type="search" placeholder="Ex.: P2, suspensão, carimbo, dBm, concentrador…" autocomplete="off" aria-label="Termo de busca">' +
    '<ul class="sres" id="sRes" role="listbox"></ul><div class="shint">↑ ↓ para navegar · Enter para abrir · Esc para fechar</div></div>';
  body.appendChild(dlg);
  var sIn = dlg.querySelector('#sInput'), sRes = dlg.querySelector('#sRes'), sSel = 0, lastFocus;
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hl(text, q) {
    if (!q) return esc(text);
    var n = norm(text), i = n.indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function runSearch() {
    var q = norm(sIn.value.trim());
    var idx = window.SAP_INDEX || [];
    var res;
    if (!q) res = idx.filter(function (r) { return r.top; }).slice(0, 8);
    else {
      var words = q.split(/\s+/);
      res = idx.map(function (r) {
        var t = norm(r.t), x = norm(r.x || ''), p = norm(r.p);
        var score = 0;
        for (var i = 0; i < words.length; i++) {
          var w = words[i];
          if (t.indexOf(w) >= 0) score += t.indexOf(w) === 0 ? 6 : 4;
          else if (x.indexOf(w) >= 0) score += 2;
          else if (p.indexOf(w) >= 0) score += 1;
          else return null;
        }
        return { r: r, s: score };
      }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 12).map(function (o) { return o.r; });
    }
    sSel = 0;
    sRes.innerHTML = res.length ? res.map(function (r, i) {
      return '<li><a role="option" href="' + ROOT + r.u + '" aria-selected="' + (i === 0) + '">' + hl(r.t, q.split(/\s+/)[0]) + '<small>' + esc(r.p) + '</small></a></li>';
    }).join('') : '<li class="empty">Nada encontrado para “' + esc(sIn.value) + '”. Tente outro termo, como “SLA” ou “GMG”.</li>';
  }
  function openSearch() { lastFocus = document.activeElement; dlg.classList.add('open'); sIn.value = ''; runSearch(); setTimeout(function () { sIn.focus(); }, 20); }
  function closeSearch() { dlg.classList.remove('open'); if (lastFocus) lastFocus.focus(); }
  document.getElementById('searchBtn').addEventListener('click', openSearch);
  sIn.addEventListener('input', runSearch);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeSearch(); });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.classList.contains('open') ? closeSearch() : openSearch(); return; }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName) && !dlg.classList.contains('open')) { e.preventDefault(); openSearch(); return; }
    if (!dlg.classList.contains('open')) return;
    var links = sRes.querySelectorAll('a');
    if (e.key === 'Escape') closeSearch();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!links.length) return;
      sSel = (sSel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach(function (a, i) { a.setAttribute('aria-selected', i === sSel); });
      links[sSel].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && links[sSel]) { e.preventDefault(); location.href = links[sSel].href; closeSearch(); }
  });
  sRes.addEventListener('click', function () { setTimeout(closeSearch, 0); });

  /* ---------- índice lateral + progresso de leitura ---------- */
  var chapters = Array.prototype.slice.call(document.querySelectorAll('.chapter[id]'));
  var toc = document.getElementById('toc');
  if (toc && chapters.length) {
    toc.innerHTML = '<div class="toc-head"><span>Neste módulo</span>' + (MOD ? '<span class="signal" data-signal="' + MOD + '" role="img"><i></i><i></i><i></i><i></i></span>' : '') + '</div><ol>' +
      chapters.map(function (c) { return '<li><a href="#' + c.id + '">' + (c.getAttribute('data-title') || c.querySelector('h2').textContent) + '</a></li>'; }).join('') +
      '</ol><div class="toc-progress"><span id="readTxt">0% lido</span><div class="bar"><span id="readBar"></span></div></div>';
    var links = toc.querySelectorAll('a');
    var seenMax = MOD ? ((getProg()[MOD] || {}).seen || 0) : 0;
    var onScroll = function () {
      var y = window.innerHeight * .35, active = 0;
      chapters.forEach(function (c, i) { if (c.getBoundingClientRect().top < y) active = i; });
      links.forEach(function (a, i) { a.classList.toggle('active', i === active); a.classList.toggle('seen', i < active); });
      var doc = document.documentElement, max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, window.scrollY / max) : 1;
      document.getElementById('readBar').style.width = (pct * 100) + '%';
      document.getElementById('readTxt').textContent = Math.round(pct * 100) + '% lido';
      if (MOD && pct > seenMax + .05) { seenMax = pct; setProg(MOD, { seen: Math.round(pct * 100) / 100 }); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- quiz ---------- */
  document.querySelectorAll('script.quiz-data').forEach(function (s) {
    var data; try { data = JSON.parse(s.textContent); } catch (e) { return; }
    var host = document.createElement('div'); host.className = 'quiz';
    var letters = 'ABCDE', answered = 0, right = 0;
    host.innerHTML = data.map(function (q, qi) {
      return '<div class="q" data-q="' + qi + '"><div class="q-text">' + (qi + 1) + '. ' + q.q + '</div><div class="q-opts">' +
        q.o.map(function (o, oi) { return '<button type="button" class="q-opt" data-o="' + oi + '"><span class="k">' + letters[oi] + '</span><span>' + o + '</span></button>'; }).join('') +
        '</div><div class="q-exp" aria-live="polite"></div></div>';
    }).join('') + '<div class="quiz-score" aria-live="polite"><div><span id="scoreLbl">Responda às ' + data.length + ' perguntas</span><br><b><span class="sc">0</span> / ' + data.length + '</b></div><button type="button" class="reset">Refazer o quiz</button></div>';
    s.parentNode.insertBefore(host, s.nextSibling);
    var scEl = host.querySelector('.sc'), lbl = host.querySelector('#scoreLbl');
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.q-opt');
      if (b) {
        var qd = b.closest('.q'), qi = +qd.getAttribute('data-q'), oi = +b.getAttribute('data-o'), q = data[qi];
        if (qd.classList.contains('answered')) return;
        qd.classList.add('answered'); answered++;
        var ok = oi === q.a; if (ok) right++;
        qd.querySelectorAll('.q-opt').forEach(function (x, i) { x.disabled = true; if (i === q.a) x.classList.add('correct'); });
        if (!ok) b.classList.add('wrong');
        qd.querySelector('.q-exp').innerHTML = '<b class="' + (ok ? 'okc' : 'bad') + '">' + (ok ? 'Certo.' : 'Não é essa.') + '</b> ' + q.e;
        scEl.textContent = right;
        if (answered === data.length) {
          var pct = right / data.length;
          lbl.textContent = pct >= .7 ? 'Módulo concluído. Bom trabalho.' : 'Revise os tópicos marcados e tente de novo.';
          if (MOD) setProg(MOD, { score: right, total: data.length, done: pct >= .7 || ((getProg()[MOD] || {}).done || false) });
        } else lbl.textContent = (data.length - answered) + ' pergunta(s) restante(s)';
      }
      if (e.target.closest('.reset')) {
        answered = 0; right = 0; scEl.textContent = 0; lbl.textContent = 'Responda às ' + data.length + ' perguntas';
        host.querySelectorAll('.q').forEach(function (qd) {
          qd.classList.remove('answered'); qd.querySelector('.q-exp').innerHTML = '';
          qd.querySelectorAll('.q-opt').forEach(function (x) { x.disabled = false; x.classList.remove('correct', 'wrong'); });
        });
        host.querySelector('.q').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* ---------- checklists persistentes ---------- */
  document.querySelectorAll('[data-checklist]').forEach(function (list) {
    var key = 'sap2-check-' + list.getAttribute('data-checklist');
    var st = load(key, {});
    list.querySelectorAll('input[type=checkbox]').forEach(function (cb, i) {
      cb.checked = !!st[i];
      cb.addEventListener('change', function () { st[i] = cb.checked; save(key, st); });
    });
    var rb = list.parentNode.querySelector('[data-clear="' + list.getAttribute('data-checklist') + '"]');
    if (rb) rb.addEventListener('click', function () { st = {}; save(key, st); list.querySelectorAll('input').forEach(function (c) { c.checked = false; }); });
  });

  /* ---------- lightbox ---------- */
  var zoomables = document.querySelectorAll('img[data-zoom]');
  if (zoomables.length) {
    var lb = document.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Imagem ampliada');
    lb.innerHTML = '<img alt=""><button class="icon-btn" type="button" aria-label="Fechar imagem">✕</button>';
    body.appendChild(lb);
    var close = function () { lb.classList.remove('open'); };
    zoomables.forEach(function (im) {
      im.tabIndex = 0;
      var open = function () { lb.querySelector('img').src = im.src; lb.querySelector('img').alt = im.alt; lb.classList.add('open'); lb.querySelector('button').focus(); };
      im.addEventListener('click', open);
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(); });
    });
    lb.addEventListener('click', function (e) { if (e.target !== lb.querySelector('img')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  paintSignals();
})();
