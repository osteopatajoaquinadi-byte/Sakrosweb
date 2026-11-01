/* Sakros Go · motor del maniquí 3D (ejercicios sin video).
   Maniqui.mount(contenedor, id) → { destroy }. Los ejercicios se registran en window.MQ_EJ (maniqui.js).
   - Piernas y brazos con cinemática inversa: pies y manos quedan exactos en el piso, el cajón o la barra.
   - Interpolación cúbica monótona entre poses: el movimiento fluye sin frenadas y las pausas quedan quietas.
   Requiere three.js r128 (window.THREE). */
(function () {
  var D = Math.PI / 180, FOOT = 0.08, L1 = 0.45, L2 = 0.44, UA = 0.29, FA = 0.27, HO = 0.045;
  var ROJO = 0xc9402a;
  var BASE = { pel: [0, 0.97, 0], pr: [0, 0, 0], sp: [0, 0, 0], ch: [0, 0, 0], hd: [0, 0, 0],
    la: [0, 0, 6], ra: [0, 0, -6], le: -8, re: -8, lf: [0.12, FOOT, 0.02], rf: [-0.12, FOOT, 0.02],
    lfy: 8, rfy: -8, lfp: 0, rfp: 0, lfr: 0, rfr: 0, pup: 0, lsc: [0, 0], rsc: [0, 0], rs: 0, ab: 0, pf: 0, cue: '' };

  // ---------- línea de tiempo: [duración, pose parcial] → canales numéricos con interpolación cúbica monótona ----------
  function prepara(K) {
    var t = 0, T = [], P = [];
    K.forEach(function (k, i) { t += i ? k[0] : 0; T.push(t); });
    var keys = {}; for (var b in BASE) keys[b] = 1; K.forEach(function (k) { for (var j in k[1]) keys[j] = 1; });
    var prev = {}; for (var c in BASE) prev[c] = BASE[c];
    // la primera pose define los valores por defecto de los campos opcionales que aparecen después
    K.forEach(function (k) { for (var j in k[1]) if (prev[j] === undefined) prev[j] = k[1][j]; });
    K.forEach(function (k) { var p = {}; for (var j in keys) p[j] = k[1][j] !== undefined ? k[1][j] : prev[j]; if (k[1].cue === undefined) p.cue = ''; p.vivo = !!k[1].vivo; prev = p; P.push(p); });
    // si una mano pasa de estar fija en el mundo (lh) a seguir al tórax (lhc), se mezcla suave entre ambas referencias
    ['l', 'r'].forEach(function (sd) {
      var hayW = K.some(function (k) { return k[1][sd + 'h']; }), hayC = K.some(function (k) { return k[1][sd + 'hc']; });
      if (!hayW || !hayC) return;
      var m = K[0][1][sd + 'hc'] && !K[0][1][sd + 'h'] ? 1 : 0;
      for (var i0 = 0; i0 < K.length; i0++) { if (K[i0][1][sd + 'hc'] && !K[i0][1][sd + 'h']) { m = 1; break; } if (K[i0][1][sd + 'h']) { m = 0; break; } }
      K.forEach(function (k, i) { var q = k[1]; if (q[sd + 'hc'] && !q[sd + 'h']) m = 1; else if (q[sd + 'h'] && !q[sd + 'hc']) m = 0; P[i][sd + 'mc'] = m; });
      keys[sd + 'mc'] = 1;
    });
    var num = [], paso = [];
    for (var n in keys) { var v = P[0][n]; if (typeof v === 'number' || (Array.isArray(v) && typeof v[0] === 'number')) num.push(n); else paso.push(n); }
    var ch = num.map(function (n) {
      var arr = Array.isArray(P[0][n]), L = arr ? P[0][n].length : 1, cs = [];
      for (var d = 0; d < L; d++) {
        var y = P.map(function (p) { return arr ? p[n][d] : p[n]; }), m = [];
        var mR = [];
        for (var i = 0; i < y.length; i++) {
          if (i === 0 || i === y.length - 1) { m.push(0); mR.push(0); continue; }
          var d0 = (y[i] - y[i - 1]) / Math.max(1e-6, T[i] - T[i - 1]), d1 = (y[i + 1] - y[i]) / Math.max(1e-6, T[i + 1] - T[i]);
          var h0 = Math.max(1e-6, T[i] - T[i - 1]), h1 = Math.max(1e-6, T[i + 1] - T[i]);
          if (P[i].vivo) { m.push(d0); mR.push(d1); continue; }
          var mm = d0 * d1 <= 0 ? 0 : 3 * (h0 + h1) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1); m.push(mm); mR.push(mm);
        }
        cs.push({ y: y, m: m, mR: mR });
      }
      return { n: n, arr: arr, cs: cs };
    });
    return { T: T, P: P, ch: ch, paso: paso, dur: T[T.length - 1] };
  }
  function muestra(L, tt) {
    var T = L.T, tm = L.dur > 0 ? tt % L.dur : 0, i = 0;
    while (i < T.length - 2 && tm > T[i + 1]) i++;
    var h = Math.max(1e-6, T[i + 1] - T[i]), u = Math.min(1, Math.max(0, (tm - T[i]) / h));
    var u2 = u * u, u3 = u2 * u, h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    var p = {};
    L.ch.forEach(function (c) {
      var v = c.cs.map(function (s) { return h00 * s.y[i] + h10 * h * s.mR[i] + h01 * s.y[i + 1] + h11 * h * s.m[i + 1]; });
      p[c.n] = c.arr ? v : v[0];
    });
    var a = L.P[i], b = L.P[i + 1];
    L.paso.forEach(function (n) { p[n] = u < 1 ? a[n] : b[n]; });
    p.cue = b.cue || a.cue;
    return p;
  }

  function mount(el, id, opts) {
    var T = window.THREE, EJ = window.MQ_EJ || {}, ej = EJ[id] || EJ[String(id).split('@')[0]];
    if (!T || !ej) return null;
    if (typeof ej === 'function') ej = ej();
    // un ejercicio puede tener varias partes (circuitos): cada una con su línea de tiempo, cámara e implementos
    var partes = (ej.partes || [ej]).map(function (e) { e = typeof e === 'string' ? EJ[e] : e; if (!e._L) e._L = prepara(e.k); return e; });
    var t0 = [], dur = 0; partes.forEach(function (e) { t0.push(dur); dur += e._L.dur; });
    var dyn = {}; partes.forEach(function (e) { var d0 = e.dyn || {}; for (var d in d0) if (!dyn[d]) dyn[d] = d0[d]; });
    var L = { dur: dur, T: t0.concat([dur]) }, actual = partes[0];
    var cv = null, R = null;
    var marca = document.createElement('span'); marca.className = 'mq-marca'; marca.innerHTML = 'SAKROS <b>Go</b>'; el.appendChild(marca);
    var cueEl = document.createElement('span'); cueEl.className = 'mq-cue'; el.appendChild(cueEl);
    // El visor 3D solo existe mientras se ve: los celulares permiten pocos contextos WebGL a la vez.
    var yo = { libera: function () { if (!R) return; R.dispose(); R.forceContextLoss(); if (cv && cv.parentNode) cv.parentNode.removeChild(cv); R = null; cv = null; } };
    function creaR() {
      if (R) return;
      var vivos = Maniqui._vivos; vivos.push(yo);
      while (vivos.length > 8) vivos.shift().libera();
      cv = document.createElement('canvas'); cv.className = 'mq-cv'; el.insertBefore(cv, el.firstChild);
      R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, preserveDrawingBuffer: !!(opts && opts.captura) });
      R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.outputEncoding = T.sRGBEncoding;
      tam();
    }
    function sale() { var i = Maniqui._vivos.indexOf(yo); if (i >= 0) Maniqui._vivos.splice(i, 1); yo.libera(); }
    var scene = new T.Scene(), bg = 0xe3e8ed; scene.background = new T.Color(bg); scene.fog = new T.Fog(bg, 7, 15);
    var cam = new T.PerspectiveCamera(32, 4 / 5, 0.1, 50);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a96a3, 0.75));
    var key = new T.DirectionalLight(0xffffff, 0.95); key.position.set(2.5, 4.5, 3); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    var sc = key.shadow.camera; sc.left = -3; sc.right = 3; sc.top = 3; sc.bottom = -3; sc.near = 1; sc.far = 12; scene.add(key);
    var rim = new T.DirectionalLight(0xdfe8ff, 0.35); rim.position.set(-3, 2.5, -3); scene.add(rim);
    var floor = new T.Mesh(new T.CircleGeometry(4.5, 64), new T.MeshStandardMaterial({ color: 0xcdd4db, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    var grid = new T.GridHelper(4.5, 18, 0x9aa6b2, 0xb3bcc5); grid.material.opacity = 0.35; grid.material.transparent = true; grid.position.y = 0.001; scene.add(grid);
    var mat = new T.MeshStandardMaterial({ color: 0xe6e9ec, roughness: 0.45, metalness: 0.04 });
    var jmat = new T.MeshStandardMaterial({ color: ROJO, roughness: 0.5, metalness: 0.08 });
    var dmat = new T.MeshStandardMaterial({ color: 0x2c3540, roughness: 0.6 });
    var fmat = new T.MeshStandardMaterial({ color: 0x2c3540, roughness: 0.45, metalness: 0.35 });
    var steel = new T.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.3, metalness: 0.8 });
    var wood = new T.MeshStandardMaterial({ color: 0xb98a5a, roughness: 0.8 });
    var pad = new T.MeshStandardMaterial({ color: 0x3a4652, roughness: 0.7 });
    var bandM = new T.MeshStandardMaterial({ color: 0x2f9e8f, roughness: 0.6 });
    var ballM = new T.MeshStandardMaterial({ color: 0x7a3b2e, roughness: 0.7 });
    var wallM = new T.MeshStandardMaterial({ color: 0xd5dbe1, roughness: 0.95 });
    function M(g, m) { var o = new T.Mesh(g, m || mat); o.castShadow = true; o.receiveShadow = true; return o; }
    function elip(r, sx, sy, sz, m) { var o = M(new T.SphereGeometry(r, 24, 16), m); o.scale.set(sx, sy, sz); return o; }
    function seg(len, r0, r1) { var g = new T.Group(), c = M(new T.CylinderGeometry(r1, r0, len, 22)); c.position.y = -len / 2; g.add(c); return g; }
    function joint(r) { return M(new T.SphereGeometry(r, 18, 12), jmat); }
    function caja(w, h, d, m) { return M(new T.BoxGeometry(w, h, d), m); }
    // ---------- cuerpo ----------
    var root = new T.Group(); scene.add(root);
    root.add(elip(0.15, 1.18, 0.72, 0.85));
    var gl = elip(0.085, 1, 1, 0.9); gl.position.set(0.07, -0.04, -0.07); root.add(gl);
    var gr = elip(0.085, 1, 1, 0.9); gr.position.set(-0.07, -0.04, -0.07); root.add(gr);
    var spine = new T.Group(); spine.position.y = 0.06; root.add(spine);
    var abd = elip(0.12, 1.05, 1.1, 0.78); abd.position.y = 0.12; spine.add(abd);
    var chestG = new T.Group(); chestG.position.y = 0.23; spine.add(chestG);
    var rib = elip(0.165, 1.12, 1.05, 0.72); rib.position.y = 0.11; chestG.add(rib);
    var escM = new T.MeshStandardMaterial({ color: 0xd9a08f, roughness: 0.5 });
    var esc = { l: elip(0.055, 0.9, 1.25, 0.3, escM), r: elip(0.055, 0.9, 1.25, 0.3, escM) };
    esc.l.rotation.z = -0.25; esc.r.rotation.z = 0.25; chestG.add(esc.l); chestG.add(esc.r);
    var pisoM = new T.MeshBasicMaterial({ color: ROJO, transparent: true, opacity: 0.9, depthTest: false }); var piso = elip(0.06, 1.2, 0.35, 1, pisoM); piso.renderOrder = 10; piso.castShadow = false; piso.position.y = -0.1; piso.visible = !!dyn.suelo; root.add(piso);
    // logo SAKROS Go en la polera
    (function () {
      var c = document.createElement('canvas'); c.width = 256; c.height = 80; var x = c.getContext('2d');
      x.font = '700 50px "Barlow Condensed", "Arial Narrow", Arial, sans-serif'; x.textBaseline = 'middle';
      var w1 = x.measureText('SAKROS ').width, w2 = x.measureText('Go').width, x0 = (256 - w1 - w2) / 2;
      x.fillStyle = '#16202a'; x.fillText('SAKROS ', x0, 42); x.fillStyle = '#c9402a'; x.fillText('Go', x0 + w1, 42);
      var tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4;
      var logo = new T.Mesh(new T.PlaneGeometry(0.2, 0.0625), new T.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false }));
      logo.position.set(0, 0.15, 0.121); logo.rotation.x = -0.12; chestG.add(logo);
    })();
    var neckG = new T.Group(); neckG.position.y = 0.28; chestG.add(neckG);
    var neck = M(new T.CylinderGeometry(0.045, 0.055, 0.09, 14)); neck.position.y = 0.03; neckG.add(neck);
    var head = elip(0.1, 0.9, 1.12, 1.02); head.position.set(0, 0.15, 0.01); neckG.add(head);
    var jaw = elip(0.07, 1, 0.7, 1); jaw.position.set(0, 0.09, 0.04); neckG.add(jaw);
    var visor = elip(0.03, 2.1, 0.55, 0.6, dmat); visor.position.set(0, 0.17, 0.085); neckG.add(visor);
    function brazo(s) {
      var sh = new T.Group(); sh.position.set(0.2 * s, 0.22, 0); chestG.add(sh);
      sh.add(elip(0.06, 1, 1.05, 1)); sh.add(seg(UA, 0.05, 0.04));
      var el2 = new T.Group(); el2.position.y = -UA; sh.add(el2); el2.add(joint(0.04));
      el2.add(seg(FA, 0.04, 0.03));
      var hand = new T.Group(); hand.position.y = -FA; el2.add(hand);
      var hm = elip(0.045, 0.75, 1.25, 0.5); hm.position.y = -HO; hand.add(hm);
      return { sh: sh, el: el2, hand: hand };
    }
    function pierna(s) {
      var hip = new T.Group(); hip.position.set(0.1 * s, -0.03, 0); root.add(hip); hip.add(joint(0.06));
      hip.add(seg(L1, 0.085, 0.055));
      var quad = elip(0.07, 1, 1.9, 1); quad.position.set(0, -0.17, 0.015); hip.add(quad);
      var kn = new T.Group(); kn.position.y = -L1; hip.add(kn); kn.add(joint(0.052));
      kn.add(seg(L2, 0.055, 0.037));
      var calf = elip(0.05, 1, 2, 1); calf.position.set(0, -0.13, -0.02); kn.add(calf);
      var an = new T.Group(); an.position.y = -L2; kn.add(an);
      var heel = M(new T.BoxGeometry(0.085, 0.06, 0.1)); heel.position.set(0, -0.04, -0.01); an.add(heel);
      var toe = M(new T.BoxGeometry(0.09, 0.045, 0.15)); toe.position.set(0, -0.047, 0.11); an.add(toe);
      var tip = M(new T.BoxGeometry(0.092, 0.03, 0.03), jmat); tip.position.set(0, -0.055, 0.19); an.add(tip);
      return { hip: hip, kn: kn, an: an };
    }
    var A = { l: brazo(1), r: brazo(-1) }, P = { l: pierna(1), r: pierna(-1) };

    // ---------- implementos fijos ----------
    var propsG = [];
    partes.forEach(function (pe) { (pe.props || []).forEach(function (q) {
      var g = new T.Group(), p = q.p || [0, 0], s = q.s || [0.5, 0.4, 0.4];
      if (q.t === 'caja') { var c = caja(s[0], s[1], s[2], q.m === 'pad' ? pad : wood); c.position.y = s[1] / 2; g.add(c); }
      else if (q.t === 'banco') { var tp = caja(s[0], 0.07, s[2], pad); tp.position.y = s[1] - 0.035; g.add(tp);
        [-1, 1].forEach(function (k) { var l = caja(0.06, s[1] - 0.07, s[2] * 0.7, fmat); l.position.set(k * (s[0] / 2 - 0.08), (s[1] - 0.07) / 2, 0); g.add(l); }); }
      else if (q.t === 'mesa') { var tt = caja(s[0], 0.04, s[2], wood); tt.position.y = s[1] - 0.02; g.add(tt);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (k) { var l = caja(0.04, s[1] - 0.04, 0.04, fmat); l.position.set(k[0] * (s[0] / 2 - 0.04), (s[1] - 0.04) / 2, k[1] * (s[2] / 2 - 0.04)); g.add(l); }); }
      else if (q.t === 'pared') { var w = M(new T.PlaneGeometry(4.5, 3), wallM); w.castShadow = false; w.position.y = 1.5; if (q.x !== undefined) { w.rotation.y = q.x > 0 ? -Math.PI / 2 : Math.PI / 2; g.position.x = q.x; } else { if (q.z < 0) w.rotation.y = 0; else w.rotation.y = Math.PI; g.position.z = q.z; } g.add(w); p = null; }
      else if (q.t === 'barra') { var br = M(new T.CylinderGeometry(0.016, 0.016, 1.4, 12), steel); br.rotation.z = Math.PI / 2; br.position.y = q.y; g.add(br);
        [-0.7, 0.7].forEach(function (x) { var po = caja(0.06, q.y + 0.05, 0.06, fmat); po.position.set(x, (q.y + 0.05) / 2, 0); g.add(po); }); }
      else if (q.t === 'ancla') { var po2 = caja(0.08, q.y + 0.1, 0.08, fmat); po2.position.y = (q.y + 0.1) / 2; g.add(po2); }
      else if (q.t === 'cono') { var co = M(new T.ConeGeometry(0.07, 0.2, 16), jmat); co.position.y = 0.1; g.add(co); }
      else if (q.t === 'colch') { var mt = M(new T.BoxGeometry(s[0], 0.012, s[1]), pad); mt.position.y = 0.006; g.add(mt); }
      else if (q.t === 'lm') { var bs = M(new T.CylinderGeometry(0.06, 0.08, 0.06, 16), fmat); bs.position.y = 0.03; g.add(bs); }
      if (p) g.position.set(p[0], q.y || 0, p[1]);
      if (q.ry) g.rotation.y = q.ry * D; if (q.rx) g.rotation.x = q.rx * D;
      g.userData.parte = pe; propsG.push(g); scene.add(g);
    }); });
    // ---------- implementos que se mueven ----------
    function barbell(len, r, plates) {
      var g = new T.Group(), b = M(new T.CylinderGeometry(r, r, len, 12), steel); b.rotation.z = Math.PI / 2; g.add(b);
      if (plates) [-1, 1].forEach(function (k) { var pl = M(new T.CylinderGeometry(plates, plates, 0.05, 28), fmat); pl.rotation.z = Math.PI / 2; pl.position.x = k * 0.72; g.add(pl); });
      return g;
    }
    var bar = null; if (dyn.barra) { bar = barbell(2.0, 0.014, 0.225); scene.add(bar); }
    var palo = null; if (dyn.palo) { palo = M(new T.CylinderGeometry(0.013, 0.013, dyn.palo === 'esp' ? 1.25 : 1.4, 10), wood); if (dyn.palo === 'esp') { palo.position.set(0, 0.42, -0.19); palo.rotation.x = -5 * D; root.add(palo); } else if (dyn.palo === 'hom') { palo.rotation.z = Math.PI / 2; palo.position.set(0, 0.26, -0.08); chestG.add(palo); } else { palo.rotation.z = Math.PI / 2; scene.add(palo); } }
    function mancuerna(o) { var g = new T.Group(), hnd = M(new T.CylinderGeometry(0.016, 0.016, 0.14, 10), steel); hnd.rotation.z = Math.PI / 2; g.add(hnd);
      [-1, 1].forEach(function (k) { var w = M(new T.CylinderGeometry(0.045, 0.045, 0.06, 6), fmat); w.rotation.z = Math.PI / 2; w.position.x = k * 0.1; g.add(w); });
      if (o === 'z') g.rotation.y = Math.PI / 2; g.position.y = -HO; return g; }
    function pesa(m) { var g = new T.Group(), b = M(new T.SphereGeometry(m ? 0.085 : 0.075, 20, 14), fmat); b.position.y = -0.13; g.add(b); var hh = M(new T.TorusGeometry(0.05, 0.012, 8, 20), fmat); hh.position.y = -0.05; g.add(hh); g.position.y = -HO; return g; }
    var dbL = null; if (dyn.db) { (dyn.db === 'r' ? ['r'] : dyn.db === 'l' ? ['l'] : ['l', 'r']).forEach(function (k) { var c = dyn.carga === 'kb' ? pesa(true) : mancuerna(dyn.dbo || 'z'); if (k === 'l') dbL = c; A[k].hand.add(c); }); }
    var kb = null; if (dyn.kb === 'g') { kb = new T.Group(); kb.add(M(new T.SphereGeometry(0.085, 20, 14), fmat)); var kh = M(new T.TorusGeometry(0.055, 0.014, 10, 24), fmat); kh.position.y = 0.09; kb.add(kh); scene.add(kb); }
    var dbg = null; if (dyn.dbg) { dbg = new T.Group(); var hd2 = M(new T.CylinderGeometry(0.016, 0.016, 0.16, 10), steel); dbg.add(hd2); [-1, 1].forEach(function (k) { var w = M(new T.CylinderGeometry(0.06, 0.06, 0.06, 8), fmat); w.position.y = k * 0.11; dbg.add(w); }); scene.add(dbg); }
    var bola = null; if (dyn.balon) { bola = M(new T.SphereGeometry(dyn.balon === 'chico' ? 0.11 : 0.13, 22, 16), ballM); scene.add(bola); }
    var cajaM = null; if (dyn.caja) { cajaM = caja(0.36, 0.24, 0.28, wood); scene.add(cajaM); }
    var rueda = null; if (dyn.rueda) { rueda = new T.Group(); var rr = M(new T.CylinderGeometry(0.1, 0.1, 0.06, 28), fmat); rr.rotation.z = Math.PI / 2; rueda.add(rr);
      var ej2 = M(new T.CylinderGeometry(0.012, 0.012, 0.42, 10), steel); ej2.rotation.z = Math.PI / 2; rueda.add(ej2); [-1, 1].forEach(function (k) { var mg = M(new T.CylinderGeometry(0.018, 0.018, 0.1, 10), pad); mg.rotation.z = Math.PI / 2; mg.position.x = k * 0.15; rueda.add(mg); }); scene.add(rueda); }
    var kbw = null; if (dyn.kbw) { kbw = new T.Group(); var kb1 = M(new T.SphereGeometry(0.085, 20, 14), fmat); kb1.position.y = 0.16; kbw.add(kb1); var kb2 = M(new T.TorusGeometry(0.05, 0.013, 8, 20), fmat); kb2.position.y = 0.05; kbw.add(kb2); kbw.position.set(dyn.kbw[0], dyn.kbw[1], dyn.kbw[2]); kbw.rotation.z = Math.PI; kbw.position.y += 0.25; scene.add(kbw); }
    var rodillo = null; if (dyn.rodillo) { rodillo = M(new T.CylinderGeometry(0.075, 0.075, 0.45, 20), bandM); rodillo.rotation.z = Math.PI / 2; scene.add(rodillo); }
    var cojin = null; if (dyn.cojin) { cojin = elip(0.07, 1.1, 0.8, 1, ballM); scene.add(cojin); }
    var lmBar = null; if (dyn.lm) { lmBar = new T.Group(); var lb = M(new T.CylinderGeometry(0.016, 0.016, 1, 10), steel); lb.position.y = 0.5; lmBar.add(lb); var lp = M(new T.CylinderGeometry(0.17, 0.17, 0.05, 24), fmat); lp.position.y = 0.8; lmBar.add(lp); scene.add(lmBar); }
    var bandas = []; partes.forEach(function (pe) { ((pe.dyn || {}).banda || []).forEach(function (b) { var m = M(new T.CylinderGeometry(0.011, 0.011, 1, 8), bandM); scene.add(m); bandas.push({ a: b[0], b: b[1], m: m, parte: pe }); }); });
    var dbs = []; if (dyn.db) { A.l.hand.children.concat(A.r.hand.children).forEach(function (c) { if (c.type === 'Group') dbs.push(c); }); }
    function visibles(pe) {
      var d = pe.dyn || {};
      propsG.forEach(function (g) { g.visible = g.userData.parte === pe; });
      [[bar, 'barra'], [palo, 'palo'], [kb, 'kb'], [dbg, 'dbg'], [bola, 'balon'], [cajaM, 'caja'], [rodillo, 'rodillo'], [rueda, 'rueda'], [kbw, 'kbw'], [cojin, 'cojin'], [lmBar, 'lm'], [piso, 'suelo']].forEach(function (x) { if (x[0]) x[0].visible = !!d[x[1]]; });
      dbs.forEach(function (c) { c.visible = !!d.db; });
    }

    // ---------- cinemática inversa ----------
    var q1 = new T.Quaternion(), m4 = new T.Matrix4(), v1 = new T.Vector3(), v2 = new T.Vector3(), UP = new T.Vector3(0, 1, 0);
    function base(yv, zh) { var y = yv.clone().normalize(), z = zh.clone().sub(y.clone().multiplyScalar(zh.dot(y))).normalize(), x = new T.Vector3().crossVectors(y, z).normalize();
      return new T.Quaternion().setFromRotationMatrix(m4.makeBasis(x, y, z)); }
    function local(obj, wq) { obj.parent.getWorldQuaternion(q1); return q1.clone().invert().multiply(wq); }
    var falla = 0;
    function cadena(j0, j1, a, b, target, pole) {
      var p0 = j0.getWorldPosition(new T.Vector3());
      var dv = target.clone().sub(p0), dist = dv.length(), d = Math.min(Math.max(dist, 0.08), a + b - 0.002), dir = dv.normalize();
      if (dist - d > falla) falla = dist - d;
      var ca = (a * a + d * d - b * b) / (2 * d), hh = Math.sqrt(Math.max(0, a * a - ca * ca));
      var po = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir)));
      if (po.lengthSq() < 1e-8) po.set(0, 0, 1).sub(dir.clone().multiplyScalar(dir.z)); po.normalize();
      var mid = p0.clone().add(dir.clone().multiplyScalar(ca)).add(po.clone().multiplyScalar(hh)), end = p0.clone().add(dir.clone().multiplyScalar(d));
      j0.quaternion.copy(local(j0, base(p0.clone().sub(mid), po))); j0.updateMatrixWorld(true);
      j1.quaternion.copy(local(j1, base(mid.clone().sub(end), po))); j1.updateMatrixWorld(true);
    }
    function E(o, a, ord) { o.rotation.set((a[0] || 0) * D, (a[1] || 0) * D, (a[2] || 0) * D, ord || 'YXZ'); }
    function Q(a) { return new T.Quaternion().setFromEuler(new T.Euler((a[0] || 0) * D, (a[1] || 0) * D, (a[2] || 0) * D, 'YXZ')); }
    function V(a) { return new T.Vector3(a[0], a[1], a[2]); }
    function chestW(a) { return chestG.localToWorld(V(a)); }
    function brazoIK(k, p, s) {
      var arm = A[k], w = p[k + 'h'], c = p[k + 'hc'], hw = p[k + 'hw'];
      if (!w && !c) { E(arm.sh, p[k + 'a'], 'ZXY'); arm.el.rotation.set(p[k + 'e'] * D, 0, 0); arm.hand.quaternion.set(0, 0, 0, 1); return; }
      var mc = p[k + 'mc'], tg = w && c && mc !== undefined ? V(w).lerp(chestW(c), mc) : w ? V(w) : chestW(c), pl = p[k + 'ep'];
      var pole = pl ? V(pl) : chestG.localToWorld(new T.Vector3(0.25 * s, -0.35, -1)).sub(chestG.getWorldPosition(new T.Vector3()));
      if (hw) { var hq = Q(hw); tg.add(new T.Vector3(0, HO, 0).applyQuaternion(hq)); cadena(arm.sh, arm.el, UA, FA, tg, pole); arm.hand.quaternion.copy(local(arm.hand, hq)); }
      else { cadena(arm.sh, arm.el, UA, FA + HO, tg, pole); arm.hand.quaternion.set(0, 0, 0, 1); }
      arm.hand.updateMatrixWorld(true);
    }
    function piernaIK(k, p, yaw) {
      var fy = p[k + 'fy'], kp = p[k + 'kp'];
      var pole = kp ? V(kp) : new T.Vector3(Math.sin(yaw + fy * D), p.pup, Math.cos(yaw + fy * D));
      cadena(P[k].hip, P[k].kn, L1, L2, V(p[k + 'f']), pole);
      P[k].an.quaternion.copy(local(P[k].an, new T.Quaternion().setFromEuler(new T.Euler(p[k + 'fp'] * D, yaw + fy * D, (p[k + 'fr'] || 0) * D, 'YXZ'))));
    }
    function punto(n) {
      if (Array.isArray(n)) return V(n);
      if (n === 'lh' || n === 'rh') return A[n[0]].hand.localToWorld(new T.Vector3(0, -HO, 0));
      if (n === 'mh') return punto('lh').add(punto('rh')).multiplyScalar(0.5);
      if (n === 'lk' || n === 'rk') return P[n[0]].kn.localToWorld(new T.Vector3(0, -0.06, 0.02));
      if (n === 'lf' || n === 'rf') return P[n[0]].an.localToWorld(new T.Vector3(0, -0.03, 0.08));
      if (n === 'lt' || n === 'rt') return P[n[0]].hip.localToWorld(new T.Vector3(0, -0.2, 0));
      return new T.Vector3();
    }
    function cilindro(m, a, b) { var d = b.clone().sub(a), l = d.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(1, Math.max(0.001, l), 1); m.quaternion.setFromUnitVectors(UP, d.normalize()); }
    function aplicar(p) {
      root.position.set(p.pel[0], p.pel[1], p.pel[2]); E(root, p.pr); E(spine, p.sp); E(chestG, p.ch); E(neckG, p.hd);
      // escápulas: [elevación, protracción] de -1 a 1 (negativo = abajo / juntas)
      ['l', 'r'].forEach(function (k) {
        var s = k === 'l' ? 1 : -1, e = p[k + 'sc'] || [0, 0], el = e[0], pro = e[1];
        A[k].sh.position.set(s * (0.2 + 0.012 * pro), 0.22 + 0.035 * el, 0.045 * pro);
        esc[k].position.set(s * (0.095 + 0.04 * pro), 0.14 + 0.035 * el, -0.112 + 0.02 * Math.max(0, pro));
        esc[k].rotation.y = s * 0.35 * Math.max(0, pro);
      });
      // respiración: rs = costillas que se expanden a los lados, ab = abdomen (positivo se infla, negativo se mete)
      rib.scale.set(1.12 * (1 + 0.07 * p.rs), 1.05 * (1 + 0.02 * p.rs), 0.72 * (1 + 0.05 * p.rs));
      abd.scale.set(1.05 * (1 + 0.04 * p.ab), 1.1, 0.78 * (1 + 0.16 * p.ab));
      piso.position.y = -0.1 + 0.035 * p.pf; piso.scale.set(1.2 * (1 - 0.25 * p.pf), 0.35, 1);
      root.updateMatrixWorld(true); falla = 0;
      brazoIK('l', p, 1); brazoIK('r', p, -1);
      var yaw = (p.pr[1] || 0) * D;
      piernaIK('l', p, yaw); piernaIK('r', p, yaw);
      root.updateMatrixWorld(true);
      var mh = (bar || kb || dbg || bola || cajaM || lmBar || (palo && dyn.palo === 'man')) ? punto('mh') : null;
      if (bar) {
        if (dyn.barra === 'e') { bar.position.copy(chestW([0, 0.25, -0.1])); bar.quaternion.copy(chestG.getWorldQuaternion(q1)); }
        else { var lh = punto('lh'), rh = punto('rh'), ax = lh.clone().sub(rh).normalize(); bar.position.copy(mh); bar.quaternion.setFromUnitVectors(new T.Vector3(1, 0, 0), ax); }
        if (p.barY !== undefined) bar.position.y = Math.max(bar.position.y, p.barY);
      }
      if (palo && dyn.palo === 'man') { var lh2 = punto('lh'), rh2 = punto('rh'); palo.position.copy(mh); palo.quaternion.setFromUnitVectors(UP, lh2.clone().sub(rh2).normalize()); }
      if (kb) { kb.position.copy(mh); kb.position.y -= 0.07; kb.rotation.y = yaw; }
      if (dbg) { dbg.position.copy(mh); dbg.position.y -= 0.04; dbg.rotation.y = yaw; }
      if (bola) { var bw = p.bw ? V(p.bw) : mh.clone(), bh = p.bh === undefined ? 1 : p.bh, off = chestG.localToWorld(new T.Vector3(0, 0, 1)).sub(chestG.getWorldPosition(v1)).multiplyScalar(0.1);
        bola.position.copy(bw.lerp(mh.clone().add(off), bh)); }
      if (cajaM) { var cw = p.cw ? V(p.cw) : mh.clone(), cb = p.cb === undefined ? 1 : p.cb; cajaM.position.copy(cw.lerp(mh.clone().add(new T.Vector3(0, -0.04, 0)), cb)); cajaM.rotation.y = (p.cy || 0) * D; }
      if (rueda && p.rw) rueda.position.copy(V(p.rw));
      if (rodillo && p.rw) { rodillo.position.copy(V(p.rw)); rodillo.rotation.set(0, (p.ry || 0) * D, Math.PI / 2); }
      if (cojin) cojin.position.copy(punto('lk').add(punto('rk')).multiplyScalar(0.5));
      if (lmBar) { var pv = V(dyn.lm), le2 = dyn.lmh ? punto(dyn.lmh) : mh; lmBar.position.copy(pv); lmBar.quaternion.setFromUnitVectors(UP, le2.clone().sub(pv).normalize()); lmBar.scale.y = le2.distanceTo(pv) + 0.1; lmBar.children[1].scale.y = 1 / lmBar.scale.y; }
      bandas.forEach(function (b) { b.m.visible = b.parte === actual && (p.bv === undefined || p.bv > 0.5); if (b.m.visible) cilindro(b.m, punto(b.a), punto(b.b)); });
      if (dbL && p.dbl !== undefined && (actual.dyn || {}).db) dbL.visible = p.dbl > 0.5;
      if (cueEl.textContent !== p.cue) cueEl.textContent = p.cue || '';
    }
    // ---------- cámara: arrastrar para girar ----------
    function camDe(e) { return { az: (e.cam || 0) * D, el: (e.el === undefined ? 12 : e.el) * D, rad: e.rad || 4.1, ty: e.ty === undefined ? 0.72 : e.ty }; }
    var c0 = camDe(partes[0]), manual = false;
    var az = c0.az, elv = c0.el, rad = c0.rad, tgt = new T.Vector3(partes[0].tx || 0, c0.ty, partes[0].tz || 0);
    function ponCam() { cam.position.set(tgt.x + rad * Math.sin(az) * Math.cos(elv), tgt.y + rad * Math.sin(elv), tgt.z + rad * Math.cos(az) * Math.cos(elv)); cam.lookAt(tgt); }
    var drag = null, movido = false;
    el.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, az: az, el: elv }; movido = false; manual = true; });
    function mover(e) { if (!drag) return; var dx = e.clientX - drag.x; if (Math.abs(dx) > 4) movido = true; az = drag.az - dx * 0.008; elv = Math.max(-0.05, Math.min(1.1, drag.el + (e.clientY - drag.y) * 0.005)); }
    function soltar() { drag = null; }
    window.addEventListener('pointermove', mover); window.addEventListener('pointerup', soltar);
    var play = true; el.addEventListener('click', function () { if (!movido) play = !play; movido = false; });
    function tam() { if (!R) return; var w = el.clientWidth || 300, h = el.clientHeight || 375; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    // ---------- bucle: solo anima si está en pantalla ----------
    var t = 0, last = performance.now(), visible = true, vivo = true, raf = 0;
    var fuera = 0;
    var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; clearTimeout(fuera); if (visible) { creaR(); if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } } else fuera = setTimeout(function () { if (!visible) sale(); }, 2500); }, { rootMargin: '150px' }) : null;
    if (io) io.observe(el);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function cuadro(tt) {
      var tm = dur > 0 ? ((tt % dur) + dur) % dur : 0, i = 0;
      while (i < partes.length - 1 && tm >= t0[i + 1]) i++;
      var pe = partes[i];
      if (pe !== actual || !cuadro.ya) { actual = pe; cuadro.ya = 1; visibles(pe); }
      var p = muestra(pe._L, tm - t0[i]); aplicar(p);
      var cc = camDe(pe);
      return { p: p, tx: pe.follow ? p.pel[0] : (pe.tx || 0), tz: pe.followz ? p.pel[2] : (pe.tz || 0), c: cc };
    }
    function loop(now) {
      raf = 0; if (!vivo) return;
      if (!el.isConnected) { destroy(); return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (play && !reduce) t += dt;
      var c = cuadro(reduce ? dur * 0.3 : t);
      tgt.x += (c.tx - tgt.x) * 0.08; tgt.z += (c.tz - tgt.z) * 0.08; tgt.y += (c.c.ty - tgt.y) * 0.06; rad += (c.c.rad - rad) * 0.06;
      if (!manual) { var da = Math.atan2(Math.sin(c.c.az - az), Math.cos(c.c.az - az)); az += da * 0.06; elv += (c.c.el - elv) * 0.06; }
      ponCam();
      if (!R) creaR();
      if (cv.clientWidth && (cv.width !== Math.round(cv.clientWidth * R.getPixelRatio()))) tam();
      R.render(scene, cam);
      if (visible) raf = requestAnimationFrame(loop);
    }
    function destroy() { vivo = false; clearTimeout(fuera); if (io) io.disconnect(); window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', soltar); sale(); scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
    ponCam();
    if (opts && opts.captura) {
      creaR();
      // modo prueba: dibuja un instante concreto y devuelve cuánto le faltó a manos/pies para llegar a su objetivo
      return { destroy: destroy, dur: L.dur, en: function (tt, a) { var c = cuadro(tt); az = a !== undefined ? a * D : c.c.az; elv = c.c.el; rad = c.c.rad; tgt.set(c.tx, c.c.ty, c.tz); ponCam(); R.render(scene, cam); return { falla: falla, cue: c.p.cue, cv: cv }; } };
    }
    if (!io) { creaR(); raf = requestAnimationFrame(loop); }
    return { destroy: destroy };
  }
  window.Maniqui = { mount: mount, BASE: BASE, FOOT: FOOT, _vivos: [] };
})();
