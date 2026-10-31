/* Sakros Go · maniquí 3D para ejercicios sin video.
   Uso: Maniqui.mount(contenedor, 'sent' | 'zlat' | 'bird' | 'shuf') → { destroy }.
   Las piernas usan cinemática inversa: los pies quedan fijos en el piso y la rodilla sigue la punta del pie.
   Requiere three.js r128 (window.THREE). */
(function () {
  var D = Math.PI / 180, FOOT = 0.08, L1 = 0.45, L2 = 0.44, UA = 0.29, FA = 0.27;
  var ROJO = 0xc9402a;

  function pose(o) {
    var b = { pel: [0, 0.97, 0], pr: [0, 0, 0], sp: [0, 0, 0], ch: [0, 0, 0], hd: [0, 0, 0],
      la: [0, 0, 6], ra: [0, 0, -6], le: -8, re: -8, lf: [0.12, FOOT, 0.02], rf: [-0.12, FOOT, 0.02],
      lfy: 8, rfy: -8, lfp: 0, rfp: 0, pup: 0, kb: false, cue: '' };
    for (var k in o) b[k] = o[k];
    return b;
  }
  function mezcla(a, b, t) {
    if (typeof a === 'number') return a + (b - a) * t;
    if (Array.isArray(a)) return a.map(function (x, i) { return mezcla(x, b[i], t); });
    if (typeof a === 'boolean' || typeof a === 'string') return t < 1 ? a : b;
    var o = {}; for (var k in a) o[k] = mezcla(a[k], b[k] === undefined ? a[k] : b[k], t); return o;
  }
  function ext(p, o) { var c = {}; for (var k in p) c[k] = p[k]; for (var j in o) c[j] = o[j]; return pose(c); }

  // ---------- Ejercicios: poses clave [segundo, pose] ----------
  var EJ = {};
  // Sentadilla goblet: tempo 3 s bajando, 1 s de pausa, 1 s subiendo.
  (function () {
    var up = pose({ pel: [0, 0.955, 0], lf: [0.18, FOOT, 0.02], rf: [-0.18, FOOT, 0.02], lfy: 15, rfy: -15,
      la: [-38, 0, -12], ra: [-38, 0, 12], le: -118, re: -118, kb: true, cue: 'Pies al ancho de los hombros, puntas un poco afuera' });
    var dn = ext(up, { pel: [0, 0.5, -0.19], pr: [36, 0, 0], sp: [-6, 0, 0], ch: [-8, 0, 0], hd: [-24, 0, 0],
      la: [-55, 0, -10], ra: [-55, 0, 10], le: -110, re: -110, cue: 'Pausa 1 s abajo · talones apoyados, espalda neutra' });
    var down = ext(up, { cue: 'Baja en 3 s: cadera atrás y abajo, rodillas sobre la punta de los pies' });
    var rise = ext(dn, { cue: 'Sube empujando el piso y exhala' });
    EJ.sent = { cam: 35, k: [[0, up], [0.8, down], [3.8, dn], [4.8, rise], [5.8, up]] };
  })();
  // Zancada lateral.
  (function () {
    var arms = { la: [-55, 0, 10], ra: [-55, 0, 10 * -1], le: -70, re: -70 };
    var c = pose(Object.assign({ pel: [0, 0.955, 0], lf: [0.1, FOOT, 0.02], rf: [-0.1, FOOT, 0.02], cue: 'De pie, pies juntos' }, arms));
    var stL = pose(Object.assign({ pel: [0.18, 0.9, 0], lf: [0.62, 0.15, 0.05], rf: [-0.1, FOOT, 0.02], lfy: 10, cue: 'Paso amplio al lado' }, arms));
    var plL = pose(Object.assign({ pel: [0.26, 0.92, 0], lf: [0.62, FOOT, 0.05], rf: [-0.1, FOOT, 0.02], lfy: 10, cue: 'Paso amplio al lado' }, arms));
    var dnL = pose({ pel: [0.38, 0.58, -0.16], pr: [30, 0, -4], sp: [0, 0, 6], hd: [-18, 0, 0], lf: [0.62, FOOT, 0.05], rf: [-0.1, FOOT, 0.02], lfy: 10,
      la: [-70, 0, 10], ra: [-70, 0, -10], le: -80, re: -80, cue: 'Cadera atrás sobre esa pierna · la otra estirada, rodilla sobre el pie' });
    function esp(p) { var q = JSON.parse(JSON.stringify(p)); q.pel[0] *= -1; var l = q.lf; q.lf = [-p.rf[0], p.rf[1], p.rf[2]]; q.rf = [-l[0], l[1], l[2]]; q.lfy = -p.rfy; q.rfy = -p.lfy; q.pr = [p.pr[0], -p.pr[1], -p.pr[2]]; q.sp = [p.sp[0], -p.sp[1], -p.sp[2]]; return q; }
    var back = ext(plL, { cue: 'Empuja el piso para volver al centro y exhala' });
    EJ.zlat = { cam: 0, k: [[0, c], [0.4, stL], [0.8, plL], [2.4, dnL], [2.9, back], [3.6, plL], [4, stL], [4.4, c], [4.8, esp(stL)], [5.2, esp(plL)], [6.8, esp(dnL)], [7.3, esp(back)], [8, esp(plL)], [8.4, esp(stL)], [8.8, c]] };
  })();
  // Bird dog.
  (function () {
    var q = pose({ pel: [0, 0.6, -0.32], pr: [90, 0, 0], hd: [-8, 0, 0], la: [-90, 0, 0], ra: [-90, 0, 0], le: 0, re: 0,
      lf: [0.12, FOOT, -0.82], rf: [-0.12, FOOT, -0.82], lfy: 0, rfy: 0, lfp: 160, rfp: 160, pup: 0.4,
      cue: 'Manos bajo los hombros, rodillas bajo las caderas · activa el abdomen profundo' });
    var e1 = ext(q, { la: [-180, 0, 0], rf: [-0.12, 0.62, -1.22], rfp: 90, cue: 'Brazo y pierna contraria a la altura del tronco · la pelvis no gira' });
    var e1h = ext(e1, { cue: 'Mantén 2 s' });
    var r1 = ext(q, { cue: 'Vuelve controlado' });
    var e2 = ext(q, { ra: [-180, 0, 0], lf: [0.12, 0.62, -1.22], lfp: 90, cue: 'Cambia de lado' });
    var e2h = ext(e2, { cue: 'Mantén 2 s' });
    EJ.bird = { cam: 90, k: [[0, q], [0.6, q], [1.8, e1], [3.8, e1h], [5, r1], [5.6, r1], [6.8, e2], [8.8, e2h], [10, q]] };
  })();
  // Shuffle con corte.
  (function () {
    var H = 0.74, W = 0.34, st = 0.3, k = [], t = 0;
    function at(x, lx, rx, ly, ry, roll, yy, cue) {
      return pose({ pel: [x, yy || H, -0.08], pr: [24, 0, roll || 0], sp: [-4, 0, 0], hd: [-14, 0, 0], lf: [lx, ly || FOOT, 0.05], rf: [rx, ry || FOOT, 0.05],
        lfy: 8, rfy: -8, la: [-35, 0, 25], ra: [-35, 0, -25], le: -70, re: -70, cue: cue });
    }
    var x = -0.6, c1 = 'Base baja, peso en el borde interno del pie', c2 = 'Empuja el piso con la pierna de afuera · los pies no se juntan', c3 = 'Frena con la pierna de afuera y baja el centro de gravedad', c4 = 'Sal explosivo hacia el otro lado';
    k.push([t, at(x, x + W, x - W, 0, 0, 0, 0, c1)]); t += 0.5; k.push([t, at(x, x + W, x - W, 0, 0, 0, 0, c2)]);
    for (var i = 0; i < 3; i++) { t += st; k.push([t, at(x + 0.13, x + W + 0.3, x - W, 0.15, FOOT, -3, 0, c2)]); x += 0.13;
      t += st * 0.6; k.push([t, at(x + 0.13, x + W + 0.27, x - W + 0.15, FOOT, 0.13, 0, 0, c2)]); x += 0.13;
      t += st * 0.4; k.push([t, at(x, x + W, x - W, 0, 0, 0, 0, i === 2 ? c3 : c2)]); }
    t += st; k.push([t, at(x + 0.12, x + W + 0.25, x - W, FOOT, FOOT, -8, 0.66, c3)]);
    t += 0.4; k.push([t, at(x + 0.05, x + W + 0.25, x - W, FOOT, FOOT, -12, 0.62, c4)]);
    var x2 = x;
    for (var j = 0; j < 3; j++) { t += st; k.push([t, at(x2 - 0.13, x2 + W, x2 - W - 0.3, FOOT, 0.15, 3, 0, c4)]); x2 -= 0.13;
      t += st * 0.6; k.push([t, at(x2 - 0.13, x2 + W - 0.15, x2 - W - 0.27, 0.13, FOOT, 0, 0, c2)]); x2 -= 0.13;
      t += st * 0.4; k.push([t, at(x2, x2 + W, x2 - W, 0, 0, 0, 0, c2)]); }
    t += st; k.push([t, at(-0.6, -0.6 + W, -0.6 - W, 0, 0, 0, 0, c1)]);
    EJ.shuf = { cam: 0, k: k, follow: false };
  })();

  function ease(t) { return 0.5 - 0.5 * Math.cos(Math.PI * t); }
  function muestra(K, tt) {
    var dur = K[K.length - 1][0]; tt = tt % dur;
    for (var i = 0; i < K.length - 1; i++) if (tt <= K[i + 1][0]) {
      var a = K[i], b = K[i + 1], u = (tt - a[0]) / Math.max(1e-6, b[0] - a[0]);
      var p = mezcla(a[1], b[1], ease(u)); p.cue = b[1].cue || a[1].cue; return p;
    }
    return K[K.length - 1][1];
  }

  function mount(el, id, opts) {
    var T = window.THREE, ej = EJ[id];
    if (!T || !ej) return null;
    opts = opts || {};
    var cv = document.createElement('canvas'); cv.className = 'mq-cv'; el.appendChild(cv);
    var marca = document.createElement('span'); marca.className = 'mq-marca'; marca.innerHTML = 'SAKROS <b>Go</b>'; el.appendChild(marca);
    var cueEl = document.createElement('span'); cueEl.className = 'mq-cue'; el.appendChild(cueEl);
    var R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: false });
    R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.outputEncoding = T.sRGBEncoding;
    var scene = new T.Scene(), bg = 0xe3e8ed; scene.background = new T.Color(bg); scene.fog = new T.Fog(bg, 7, 14);
    var cam = new T.PerspectiveCamera(32, 4 / 5, 0.1, 50);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a96a3, 0.75));
    var key = new T.DirectionalLight(0xffffff, 0.95); key.position.set(2.5, 4.5, 3); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    var sc = key.shadow.camera; sc.left = -2.5; sc.right = 2.5; sc.top = 2.5; sc.bottom = -2.5; sc.near = 1; sc.far = 12; scene.add(key);
    var rim = new T.DirectionalLight(0xdfe8ff, 0.35); rim.position.set(-3, 2.5, -3); scene.add(rim);
    var floor = new T.Mesh(new T.CircleGeometry(4, 64), new T.MeshStandardMaterial({ color: 0xcdd4db, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    var grid = new T.GridHelper(4, 16, 0x9aa6b2, 0xb3bcc5); grid.material.opacity = 0.35; grid.material.transparent = true; grid.position.y = 0.001; scene.add(grid);
    var mat = new T.MeshStandardMaterial({ color: 0xe6e9ec, roughness: 0.45, metalness: 0.04 });
    var jmat = new T.MeshStandardMaterial({ color: ROJO, roughness: 0.5, metalness: 0.08 });
    var dmat = new T.MeshStandardMaterial({ color: 0x2c3540, roughness: 0.6 });
    var kbmat = new T.MeshStandardMaterial({ color: 0x2c3540, roughness: 0.5, metalness: 0.3 });
    function M(g, m) { var o = new T.Mesh(g, m || mat); o.castShadow = true; o.receiveShadow = true; return o; }
    function elip(r, sx, sy, sz, m) { var o = M(new T.SphereGeometry(r, 24, 16), m); o.scale.set(sx, sy, sz); return o; }
    function seg(len, r0, r1) { var g = new T.Group(), c = M(new T.CylinderGeometry(r1, r0, len, 22)); c.position.y = -len / 2; g.add(c); return g; }
    function joint(r) { return M(new T.SphereGeometry(r, 18, 12), jmat); }
    // ---------- cuerpo ----------
    var root = new T.Group(); scene.add(root);
    root.add(elip(0.15, 1.18, 0.72, 0.85));                          // pelvis
    var gl = elip(0.085, 1, 1, 0.9); gl.position.set(0.07, -0.04, -0.07); root.add(gl);   // glúteos
    var gr = elip(0.085, 1, 1, 0.9); gr.position.set(-0.07, -0.04, -0.07); root.add(gr);
    var spine = new T.Group(); spine.position.y = 0.06; root.add(spine);                   // zona lumbar
    var abd = elip(0.12, 1.05, 1.1, 0.78); abd.position.y = 0.12; spine.add(abd);
    var chestG = new T.Group(); chestG.position.y = 0.23; spine.add(chestG);              // zona torácica
    var rib = elip(0.165, 1.12, 1.05, 0.72); rib.position.y = 0.11; chestG.add(rib);
    var neckG = new T.Group(); neckG.position.y = 0.28; chestG.add(neckG);
    var neck = M(new T.CylinderGeometry(0.045, 0.055, 0.09, 14)); neck.position.y = 0.03; neckG.add(neck);
    var head = elip(0.1, 0.9, 1.12, 1.02); head.position.set(0, 0.15, 0.01); neckG.add(head);
    var jaw = elip(0.07, 1, 0.7, 1); jaw.position.set(0, 0.09, 0.04); neckG.add(jaw);
    var visor = elip(0.03, 2.1, 0.55, 0.6, dmat); visor.position.set(0, 0.17, 0.085); neckG.add(visor);
    function brazo(s) {
      var sh = new T.Group(); sh.position.set(0.2 * s, 0.22, 0); chestG.add(sh);
      var del = elip(0.06, 1, 1.05, 1); sh.add(del);
      sh.add(seg(UA, 0.05, 0.04));
      var el2 = new T.Group(); el2.position.y = -UA; sh.add(el2); el2.add(joint(0.04));
      el2.add(seg(FA, 0.04, 0.03));
      var hand = new T.Group(); hand.position.y = -FA - 0.045; el2.add(hand);
      hand.add(elip(0.045, 0.75, 1.25, 0.5)); return { sh: sh, el: el2, hand: hand };
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
      var tip = M(new T.BoxGeometry(0.092, 0.03, 0.03), jmat); tip.position.set(0, -0.055, 0.19); an.add(tip); // punta del pie
      return { hip: hip, kn: kn, an: an };
    }
    var A = { l: brazo(1), r: brazo(-1) }, P = { l: pierna(1), r: pierna(-1) };
    var kb = new T.Group(); var kbB = M(new T.SphereGeometry(0.085, 20, 14), kbmat); kb.add(kbB);
    var kbH = M(new T.TorusGeometry(0.055, 0.014, 10, 24), kbmat); kbH.position.y = 0.09; kb.add(kbH); scene.add(kb);
    // ---------- cinemática inversa ----------
    var q1 = new T.Quaternion(), m4 = new T.Matrix4(), v1 = new T.Vector3(), v2 = new T.Vector3();
    function base(yv, zh) { var y = yv.clone().normalize(), z = zh.clone().sub(y.clone().multiplyScalar(zh.dot(y))).normalize(), x = new T.Vector3().crossVectors(y, z).normalize();
      return new T.Quaternion().setFromRotationMatrix(m4.makeBasis(x, y, z)); }
    function local(obj, wq) { obj.parent.getWorldQuaternion(q1); return q1.clone().invert().multiply(wq); }
    function ik(leg, target, pole, footQ) {
      var hip = leg.hip.getWorldPosition(new T.Vector3());
      var dv = target.clone().sub(hip), d = Math.min(Math.max(dv.length(), 0.1), L1 + L2 - 0.002), dir = dv.normalize();
      var a = (L1 * L1 + d * d - L2 * L2) / (2 * d), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
      var po = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
      var knee = hip.clone().add(dir.clone().multiplyScalar(a)).add(po.clone().multiplyScalar(hh)), ank = hip.clone().add(dir.clone().multiplyScalar(d));
      leg.hip.quaternion.copy(local(leg.hip, base(hip.clone().sub(knee), po))); leg.hip.updateMatrixWorld(true);
      leg.kn.quaternion.copy(local(leg.kn, base(knee.clone().sub(ank), po))); leg.kn.updateMatrixWorld(true);
      leg.an.quaternion.copy(local(leg.an, footQ));
    }
    function E(o, a) { o.rotation.set((a[0] || 0) * D, (a[1] || 0) * D, (a[2] || 0) * D, 'YXZ'); }
    function footQ(yaw, fy, fp) { return new T.Quaternion().setFromEuler(new T.Euler(fp * D, yaw + fy * D, 0, 'YXZ')); }
    function aplicar(p) {
      root.position.set(p.pel[0], p.pel[1], p.pel[2]); E(root, p.pr); E(spine, p.sp); E(chestG, p.ch); E(neckG, p.hd);
      E(A.l.sh, p.la); E(A.r.sh, p.ra); A.l.el.rotation.set(p.le * D, 0, 0); A.r.el.rotation.set(p.re * D, 0, 0);
      root.updateMatrixWorld(true);
      var yaw = (p.pr[1] || 0) * D;
      // la rodilla sigue la dirección de la punta del pie
      var pl = new T.Vector3(Math.sin(yaw + p.lfy * D), p.pup, Math.cos(yaw + p.lfy * D)), pr = new T.Vector3(Math.sin(yaw + p.rfy * D), p.pup, Math.cos(yaw + p.rfy * D));
      ik(P.l, new T.Vector3(p.lf[0], p.lf[1], p.lf[2]), pl, footQ(yaw, p.lfy, p.lfp));
      ik(P.r, new T.Vector3(p.rf[0], p.rf[1], p.rf[2]), pr, footQ(yaw, p.rfy, p.rfp));
      root.updateMatrixWorld(true);
      if (p.kb) { A.l.hand.getWorldPosition(v1); A.r.hand.getWorldPosition(v2); kb.visible = true; kb.position.copy(v1.add(v2).multiplyScalar(0.5)); kb.position.y -= 0.07; kb.rotation.y = yaw; }
      else kb.visible = false;
      if (cueEl.textContent !== p.cue) cueEl.textContent = p.cue || '';
    }
    // ---------- cámara: arrastrar para girar ----------
    var az = ej.cam * D, elv = 12 * D, rad = 4.1, tgt = new T.Vector3(0, 0.72, 0);
    function ponCam() { cam.position.set(tgt.x + rad * Math.sin(az) * Math.cos(elv), tgt.y + rad * Math.sin(elv), tgt.z + rad * Math.cos(az) * Math.cos(elv)); cam.lookAt(tgt); }
    var drag = null, movido = false;
    cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, az: az, el: elv }; movido = false; });
    window.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - drag.x; if (Math.abs(dx) > 4) movido = true; az = drag.az - dx * 0.008; elv = Math.max(-0.05, Math.min(1.1, drag.el + (e.clientY - drag.y) * 0.005)); });
    window.addEventListener('pointerup', function () { drag = null; });
    var play = true; el.addEventListener('click', function () { if (!movido) play = !play; movido = false; });
    function tam() { var w = el.clientWidth || 300, h = el.clientHeight || 375; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    // ---------- bucle: solo anima si está en pantalla ----------
    var t = 0, last = performance.now(), visible = true, vivo = true, raf = 0;
    var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }) : null;
    if (io) io.observe(el);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function loop(now) {
      raf = 0; if (!vivo) return;
      if (!el.isConnected) { destroy(); return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (play && !reduce) t += dt;
      var p = muestra(ej.k, reduce ? ej.k[Math.floor(ej.k.length / 2)][0] : t); aplicar(p);
      var tx = ej.follow === false || ej.cam === 0 ? 0 : p.pel[0]; tgt.x += (tx - tgt.x) * 0.08; ponCam();
      if (cv.clientWidth && (cv.width !== Math.round(cv.clientWidth * R.getPixelRatio()))) tam();
      R.render(scene, cam);
      if (visible) raf = requestAnimationFrame(loop);
    }
    function destroy() { vivo = false; if (io) io.disconnect(); R.dispose(); scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
    tam(); ponCam(); raf = requestAnimationFrame(loop);
    return { destroy: destroy };
  }
  window.Maniqui = { mount: mount, ejercicios: Object.keys(EJ) };
})();
