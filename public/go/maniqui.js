/* Sakros Go · biblioteca de ejercicios del maniquí 3D. Cada ejercicio: { cam, k: [[segundos, pose parcial], ...], props, dyn }.
   Cada pose hereda lo que no cambia de la anterior. Coordenadas: la figura mira a +z, su izquierda es +x, el piso es y = 0.
   pel = centro de la pelvis · pr/sp/ch/hd = inclinación [adelante, giro, lado] de pelvis, zona lumbar, tórax y cabeza
   lf/rf = tobillos (cinemática inversa) · lh/rh = manos en el mundo · lhc/rhc = manos respecto del tórax. */
(function () {
  var F = 0.08, EJ = window.MQ_EJ = window.MQ_EJ || {};
  function neg(a) { return a ? [a[0], -(a[1] || 0), -(a[2] || 0)] : a; }
  function nx(a) { return a ? [-a[0], a[1], a[2]] : a; }
  function espejo(p) {
    var q = {}, k;
    for (k in p) q[k] = p[k];
    function sw(a, b, f) { var x = p[a], y = p[b]; if (x !== undefined) q[b] = f ? f(x) : x; else delete q[b]; if (y !== undefined) q[a] = f ? f(y) : y; else delete q[a]; }
    if (p.pel) q.pel = nx(p.pel);
    ['pr', 'sp', 'ch', 'hd'].forEach(function (k2) { if (p[k2]) q[k2] = neg(p[k2]); });
    sw('la', 'ra', neg); sw('le', 're'); sw('lf', 'rf', nx); sw('lfy', 'rfy', function (v) { return -v; }); sw('lfp', 'rfp'); sw('lfr', 'rfr', function (v) { return -v; });
    sw('lh', 'rh', nx); sw('lhc', 'rhc', nx); sw('lep', 'rep', nx); sw('lhw', 'rhw', neg); sw('lkp', 'rkp', nx);
    ['bw', 'cw', 'rw'].forEach(function (k2) { if (p[k2]) q[k2] = nx(p[k2]); });
    ['ry', 'cy'].forEach(function (k2) { if (p[k2] !== undefined) q[k2] = -p[k2]; });
    return q;
  }
  function o() { var r = {}; for (var i = 0; i < arguments.length; i++) for (var k in arguments[i]) r[k] = arguments[i][k]; return r; }
  function esp(K) { return K.map(function (k) { return [k[0], espejo(k[1])]; }); }
  window.MQ = { F: F, espejo: espejo, esp: esp, o: o };
})();

/* ---------- Tren inferior: sentadillas y zancadas ---------- */
(function () {
  var M = window.MQ, F = M.F, o = M.o, EJ = window.MQ_EJ;
  // Sentadilla goblet a cajón: 3 s bajando, toca el cajón 1 s sin soltarse, 1 s subiendo.
  (function () {
    var up = { pel: [0, 0.955, 0], lf: [0.18, F, 0.02], rf: [-0.18, F, 0.02], lfy: 15, rfy: -15, pr: [0, 0, 0], sp: [0, 0, 0], ch: [0, 0, 0], hd: [0, 0, 0],
      lhc: [0.05, 0.08, 0.2], rhc: [-0.05, 0.08, 0.2], lep: [0.3, -1, 0.2], rep: [-0.3, -1, 0.2], cue: 'Pies al ancho de los hombros, puntas un poco afuera · pesa pegada al pecho' };
    var dn = o(up, { pel: [0, 0.52, -0.2], pr: [34, 0, 0], sp: [-4, 0, 0], ch: [-6, 0, 0], hd: [-22, 0, 0], cue: 'Toca el cajón 1 s sin soltarte · talones apoyados, espalda neutra' });
    EJ.kgoblet = { cam: 35, dyn: { kb: 'g' }, props: [{ t: 'caja', p: [0, -0.42], s: [0.45, 0.42, 0.4] }],
      k: [[0, up], [0.8, o(up, { cue: 'Baja en 3 s: cadera atrás y abajo, rodillas sobre la punta de los pies' })], [3, dn], [1, o(dn, { cue: 'Sube empujando el piso y exhala' })], [1, up]] };
  })();
  // Zancada lateral
  (function () {
    var arms = { la: [-55, 0, 10], ra: [-55, 0, -10], le: -70, re: -70 };
    var c = o(arms, { pel: [0, 0.955, 0], lf: [0.1, F, 0.02], rf: [-0.1, F, 0.02], lfy: 8, rfy: -8, pr: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], cue: 'De pie, pies juntos' });
    var stL = o(c, { pel: [0.18, 0.9, 0], lf: [0.62, 0.17, 0.05], lfy: 10, cue: 'Paso amplio al lado' });
    var plL = o(stL, { pel: [0.26, 0.92, 0], lf: [0.62, F, 0.05] });
    var dnL = o(plL, { pel: [0.38, 0.58, -0.16], pr: [30, 0, -4], sp: [0, 0, 6], hd: [-18, 0, 0], la: [-70, 0, 10], ra: [-70, 0, -10], le: -80, re: -80, cue: 'Cadera atrás sobre esa pierna · la otra estirada, rodilla sobre el pie' });
    var back = o(plL, { cue: 'Empuja el piso para volver al centro y exhala' });
    var K = [[0, c], [0.4, stL], [0.4, plL], [1.6, dnL], [0.5, back], [0.7, plL], [0.4, stL], [0.4, c]];
    EJ.gcurl = { cam: 0, k: K.concat(M.esp(K.slice(1))) };
  })();
})();

/* ---------- utilidades de posturas ---------- */
(function () {
  var M = window.MQ, F = M.F, o = M.o;
  // de pie, todo definido (primera pose de cada ejercicio)
  M.de = function (x) { return o({ pel: [0, 0.955, 0], pr: [0, 0, 0], sp: [0, 0, 0], ch: [0, 0, 0], hd: [0, 0, 0], lf: [0.12, F, 0.02], rf: [-0.12, F, 0.02], lfy: 8, rfy: -8, lfp: 0, rfp: 0, lfr: 0, rfr: 0, pup: 0 }, x || {}); };
  M.cad = { lhc: [0.2, -0.29, 0.06], rhc: [-0.2, -0.29, 0.06], lep: [1, -0.3, -0.6], rep: [-1, -0.3, -0.6] };   // manos en la cintura
  M.lado = { lhc: [0.22, -0.36, 0.02], rhc: [-0.22, -0.36, 0.02] };                                              // brazos a los lados (con mancuernas)
  M.pecho = { lhc: [0.07, 0.1, 0.18], rhc: [-0.07, 0.1, 0.18], lep: [0.4, -1, 0], rep: [-0.4, -1, 0] };            // manos al pecho (pesa o balón)
  M.arriba = { lhc: [0.17, 0.82, 0.05], rhc: [-0.17, 0.82, 0.05] };                                                // brazos arriba
  M.frente = { lhc: [0.14, 0.2, 0.6], rhc: [-0.14, 0.2, 0.6] };                                                    // brazos al frente
  // repite una secuencia: K = [[dur,pose],...] sin la primera pose
  M.rep = function (K, n) { var r = []; for (var i = 0; i < n; i++) r = r.concat(K); return r; };
})();

/* ---------- Tren inferior: sentadillas, zancadas, escalón ---------- */
(function () {
  var M = window.MQ, F = M.F, o = M.o, EJ = window.MQ_EJ, de = M.de;
  // Sentadilla posterior con barra
  (function () {
    var bar = { lhc: [0.43, 0.24, -0.06], rhc: [-0.43, 0.24, -0.06], lep: [0.4, -1, -0.4], rep: [-0.4, -1, -0.4] };
    var up = de(o(bar, { pel: [0, 0.95, 0], lf: [0.17, F, 0.02], rf: [-0.17, F, 0.02], lfy: 20, rfy: -20, hd: [0, 0, 0], cue: 'Barra sobre los trapecios, escápulas juntas · pies al ancho de los hombros' }));
    var aire = o(up, { cue: 'Toma aire y tensa el abdomen' });
    var dn = o(up, { pel: [0, 0.47, -0.22], pr: [42, 0, 0], sp: [-4, 0, 0], ch: [-4, 0, 0], hd: [-30, 0, 0], cue: 'Baja 2 s: cadera atrás y abajo, rodillas hacia los pies, pasa el paralelo' });
    var sube = o(up, { cue: 'Sube rápido empujando el piso' });
    EJ.sentadilla = { cam: 40, dyn: { barra: 'e' }, k: [[0, up], [0.8, aire], [2, dn], [0.25, o(dn, { cue: 'Sube rápido empujando el piso' })], [0.8, sube], [0.6, up]] };
  })();
  // Split squat con mancuernas (también Activo y Core)
  (function () {
    var arr = de(o(M.lado, { pel: [0, 0.9, -0.05], lf: [0.11, F, 0.36], rf: [-0.11, 0.15, -0.5], lfy: 4, rfy: -4, rfp: 55, cue: 'Un pie adelante y otro atrás, mancuernas a los lados' }));
    var ab = o(arr, { pel: [0, 0.52, -0.06], pr: [4, 0, 0], rf: [-0.11, 0.13, -0.52], rfp: 70, cue: 'Inhala y baja en vertical · la rodilla de adelante sigue al pie' });
    var su = o(arr, { cue: 'Activa el suelo pélvico y exhala al subir' });
    EJ.ksplit = { cam: 65, dyn: { db: '2' }, k: [[0, arr], [0.5, arr], [2, ab], [0.3, ab], [1.3, su]] };
  })();
  // Subida a escalón (Activo, Core y Base)
  function stepup(alto, pesas, aguanta) {
    var z = 0.36, y = alto + F;
    var ini = de(o(pesas ? M.lado : M.cad, { pel: [0, 0.955, -0.12], lf: [0.11, y, z], rf: [-0.11, F, -0.1], lfy: 4, pup: 0, cue: 'Pie completo sobre el escalón' }));
    ini.pel = [0.02, 0.955 - 0.02 + alto * 0.35, -0.16]; ini.pr = [12, 0, 0];
    var med = o(ini, { pel: [0.05, 0.92 + alto * 0.6, 0.12], pr: [16, 0, -2], rf: [-0.11, F + 0.04, -0.04], rfp: 30, cue: 'Sube empujando con el pie de arriba, sin impulso de abajo · exhala' });
    var top = o(ini, { pel: [0.08, alto + 0.95, 0.3], pr: [2, 0, -3], rf: [-0.1, alto + 0.32, 0.33], rfp: 10, cue: aguanta ? 'Arriba, aguanta 1 s sobre una pierna · pelvis nivelada' : 'Rodilla sobre el pie, pelvis horizontal' });
    var top2 = o(top, { cue: 'Baja en 3 s, controlado' });
    var baj = o(med, { pel: [0.04, 0.88 + alto * 0.55, 0.08], rf: [-0.11, F + 0.03, -0.06], cue: 'Baja en 3 s, controlado' });
    return { cam: 70, dyn: pesas ? { db: '2' } : {}, props: [{ t: 'caja', p: [0, 0.38], s: [0.5, alto, 0.4] }],
      k: [[0, ini], [0.5, ini], [0.9, med], [0.6, top], [aguanta ? 1 : 0.4, top2], [1.4, baj], [1.2, ini]] };
  }
  EJ.gstep = stepup(0.22, false, false);
  EJ.kstepup = stepup(0.32, true, false);
  EJ.xstepup = stepup(0.3, false, true);
  EJ['xstepup@1'] = stepup(0.18, false, true);
  EJ['xstepup@3'] = stepup(0.3, true, true);
  // Sentadilla a una pierna a cajón · niveles: 1 sentarse y pararse sin manos, 2 una pierna con apoyo, 3 sin apoyo
  function sent1(niv) {
    var caja = { t: 'caja', p: [0, -0.42], s: [0.45, niv === 2 ? 0.5 : 0.45, 0.4] };
    var dos = niv === 1, apoyo = niv === 2, ytop = caja.s[1];
    var brazos = apoyo ? { lh: [0.6, 0.95, 0.05], rhc: [-0.07, 0.05, 0.25], lep: [0.3, -1, -0.5], rep: [-0.3, -1, 0] } : { lhc: [0.12, 0.12, 0.5], rhc: [-0.12, 0.12, 0.5], lep: [0.5, -1, -0.3], rep: [-0.5, -1, -0.3] };
    var up = de(o(brazos, { pel: [0.04, 0.955, 0], lf: [0.12, F, 0.02], rf: dos ? [-0.12, F, 0.02] : [-0.1, 0.3, 0.32], rfp: dos ? 0 : 20, lfy: 6, rfy: -6,
      cue: dos ? 'De pie delante del cajón, brazos al frente' : 'De pie delante del cajón, sobre una pierna' }));
    if (dos) { up.lf = [0.16, F, 0.02]; up.rf = [-0.16, F, 0.02]; up.pel = [0, 0.955, 0]; }
    var dn = o(up, { pel: [dos ? 0 : 0.06, ytop + 0.13, -0.24], pr: [36, 0, 0], sp: [-4, 0, 0], hd: [-18, 0, 0], rf: dos ? up.rf : [-0.1, 0.22, 0.36], cue: 'Baja en 3 s hasta tocar el asiento · rodilla sobre el pie, pelvis nivelada' });
    var toca = o(dn, { cue: 'Toca sin dejarte caer y sube sin impulso' });
    return { cam: 50, props: [caja].concat(apoyo ? [{ t: 'pared', x: 0.68 }] : []), k: [[0, up], [0.6, up], [3, dn], [0.4, toca], [1.4, o(up, { cue: 'Sube sin impulso, tronco quieto' })]] };
  }
  EJ.xsent1 = sent1(3); EJ['xsent1@1'] = sent1(1); EJ['xsent1@2'] = sent1(2); EJ['xsent1@3'] = sent1(3);
  // Lanzamiento vertical desde sentadilla
  (function () {
    var ba = { lh: [0.07, 0.38, 0.1], rh: [-0.07, 0.38, 0.1], lep: [0.5, 0, -1], rep: [-0.5, 0, -1] };
    var sq = de(o(ba, { pel: [0, 0.66, -0.16], pr: [40, 0, 0], sp: [6, 0, 0], hd: [-25, 0, 0], lf: [0.2, F, 0.02], rf: [-0.2, F, 0.02], lfy: 15, rfy: -15, bh: 1, bw: [0, 0.3, 0.1], cue: 'Media sentadilla, balón entre las piernas' }));
    var sq2 = o(sq, { cue: 'Abdomen firme y suelo pélvico activo' });
    var ext = o(sq, { pel: [0, 1.0, 0.02], pr: [-4, 0, 0], sp: [-4, 0, 0], hd: [10, 0, 0], lf: [0.2, 0.14, 0.02], rf: [-0.2, 0.14, 0.02], lfp: 45, rfp: 45,
      lh: [0.08, 1.98, 0.2], rh: [-0.08, 1.98, 0.2], bh: 1, bw: [0, 2.05, 0.25], cue: 'Extiende piernas y cadera explosivo y lanza hacia arriba · exhala fuerte' });
    var vuela = o(ext, { pel: [0, 0.955, 0.02], pr: [0, 0, 0], hd: [20, 0, 0], lf: [0.2, F, 0.02], rf: [-0.2, F, 0.02], lfp: 0, rfp: 0, lh: [0.2, 1.75, 0.3], rh: [-0.2, 1.75, 0.3], bh: 0, bw: [0, 2.85, 0.55], cue: 'Déjalo caer delante' });
    var cae = o(vuela, { hd: [-15, 0, 0], lh: [0.25, 0.7, 0.2], rh: [-0.25, 0.7, 0.2], bw: [0, 0.13, 0.75], cue: 'Déjalo caer delante' });
    var rec = o(sq, { pel: [0, 0.58, 0.12], pr: [50, 0, 0], lh: [0.12, 0.13, 0.75], rh: [-0.12, 0.13, 0.75], bh: 1, bw: [0, 0.13, 0.75], cue: 'Recógelo y vuelve a la media sentadilla' });
    EJ.klanzscoop = { cam: 55, ty: 1.05, rad: 5.2, dyn: { balon: 1 }, k: [[0, sq], [0.6, sq2], [0.35, ext], [0.4, vuela], [0.65, cae], [0.9, o(rec, { bh: 0 })], [0.25, rec], [0.9, sq]] };
  })();
})();

/* ---------- Bisagra de cadera, tirones y empujes con barra ---------- */
(function () {
  var M = window.MQ, F = M.F, o = M.o, EJ = window.MQ_EJ, de = M.de;
  var D = Math.PI / 180;
  // centro de los hombros con la columna neutra y la pelvis inclinada p grados
  M.hom = function (pel, p) { return [pel[0], pel[1] + 0.51 * Math.cos(p * D), pel[2] + 0.51 * Math.sin(p * D)]; };
  M.pelDe = function (sh, p) { return [sh[0], sh[1] - 0.51 * Math.cos(p * D), sh[2] - 0.51 * Math.sin(p * D)]; };
  var pelDe = M.pelDe;
  var pies = { lf: [0.12, F, 0.02], rf: [-0.12, F, 0.02], lfy: 6, rfy: -6 };
  var codosAtras = { lep: [0.3, -0.2, -1], rep: [-0.3, -0.2, -1] };
  // Peso muerto con barra desde el suelo
  function muerto(cue1) {
    var g = 0.25, up = de(o(pies, codosAtras, { pel: [0, 0.955, 0], lh: [g, 0.89, 0.1], rh: [-g, 0.89, 0.1], hd: [0, 0, 0] }));
    var p0 = 62, sh0 = [0, 0.83, 0.12], ab = o(up, { pel: pelDe(sh0, p0), pr: [p0, 0, 0], hd: [-38, 0, 0], lh: [g, 0.225, 0.07], rh: [-g, 0.225, 0.07], cue: cue1 });
    var tens = o(ab, { cue: 'Activa los dorsales y quita la holgura de la barra' });
    var mitad = o(ab, { pel: pelDe([0, 1.1, 0.12], 42), pr: [42, 0, 0], hd: [-25, 0, 0], lh: [g, 0.52, 0.08], rh: [-g, 0.52, 0.08], cue: 'Empuja el piso con la barra rozando el cuerpo' });
    var top = o(up, { cue: 'Bloquea cadera y rodillas a la vez, sin echarte atrás' });
    var baja = o(mitad, { cue: 'Baja con la cadera atrás primero · sin rebote' });
    return { cam: 60, dyn: { barra: 'h' }, k: [[0, ab], [0.8, tens], [0.9, mitad], [0.8, top], [0.6, top], [1, baja], [0.9, ab], [0.4, ab]] };
  }
  EJ.muerto = muerto('Tibias tocan la barra: cadera entre rodillas y hombros, pecho arriba');
  EJ.kmuertobarra = muerto('Barra sobre el medio del pie, espalda neutra · inhala y activa el abdomen');
  // Peso muerto rumano (barra o mancuernas)
  function rdl(barra, cues) {
    var g = barra ? 0.25 : 0.17, up = de(o(pies, codosAtras, { pel: [0, 0.955, 0], lh: [g, 0.89, 0.1], rh: [-g, 0.89, 0.1], cue: cues[0] }));
    var p = 70, sh = [0, 0.96, 0.12], ab = o(up, { pel: pelDe(sh, p), pr: [p, 0, 0], hd: [-30, 0, 0], lh: [g, 0.4, 0.14], rh: [-g, 0.4, 0.14], cue: cues[1] });
    ab.pel[1] -= 0.02;
    return { cam: 70, dyn: barra ? { barra: 'h' } : { db: '2', dbo: 'x' }, k: [[0, up], [0.6, o(up, { cue: cues[0] })], [2, ab], [0.3, o(ab, { cue: cues[2] })], [1.2, o(up, { cue: cues[2] })]] };
  }
  EJ.krdl = rdl(true, ['De pie, barra delante de los muslos, rodillas suaves', 'Cadera atrás con la columna neutra, la barra cerca de las piernas', 'Exhala y sube empujando la cadera al frente']);
  EJ.gbisagra = rdl(false, ['Mancuernas delante de los muslos, rodillas suaves', 'Cadera atrás y espalda recta: baja hasta media tibia', 'Sube empujando la cadera al frente y aprieta los glúteos · exhala']);
  // Bisagra con palo: 3 contactos (cabeza, espalda alta y sacro)
  function bisPalo(kb) {
    var palo = { lhc: [0.05, -0.3, -0.2], rhc: [-0.03, 0.34, -0.19], lep: [1, -0.2, 0.2], rep: [-1, 0.6, 0.2] };
    var bola = { lh: [0.06, 0.86, 0.14], rh: [-0.06, 0.86, 0.14], lep: [0.4, 0, -1], rep: [-0.4, 0, -1] };
    var up = de(o(kb ? bola : palo, pies, { pel: [0, 0.955, 0], cue: kb ? 'Kettlebell liviana con las dos manos, rodillas suaves' : 'Palo en la espalda: cabeza, espalda alta y sacro en contacto' }));
    var p = 58, ab = o(up, { pel: pelDe([0, 1.05, 0.13], p), pr: [p, 0, 0], hd: [-12, 0, 0], cue: 'Cadera atrás, como si cerraras una puerta con el glúteo · sin perder contactos' });
    ab.pel[1] -= 0.03;
    if (kb) { ab.lh = [0.06, 0.4, 0.2]; ab.rh = [-0.06, 0.4, 0.2]; ab.hd = [-30, 0, 0]; }
    return { cam: 75, dyn: kb ? { kb: 'g' } : { palo: 'esp' }, k: [[0, up], [0.6, up], [2, ab], [0.6, o(ab, { cue: 'Siente el estiramiento atrás del muslo' })], [1.4, o(up, { cue: 'Vuelve apretando el glúteo · rodillas quietas, peso al medio del pie' })], [0.4, up]] };
  }
  EJ.xbisagra = bisPalo(false); EJ['xbisagra@1'] = bisPalo(false); EJ['xbisagra@2'] = bisPalo(false); EJ['xbisagra@3'] = bisPalo(true);
  // Peso muerto rumano / bisagra a una pierna (apoyo en la izquierda)
  function rdl1(apoyo, kb, aguanta, rango) {
    var p = rango ? 80 : 70, st = [0.1, F, 0.02];
    var colg = apoyo ? { lh: [0.58, 1.0, 0.1], rhc: [-0.12, -0.3, 0.12], lep: [0.2, -1, -0.5], rep: [-0.4, -0.6, -1] } : { lhc: [0.14, -0.3, 0.15], rhc: [-0.14, -0.3, 0.15], lep: [0.4, -0.6, -1], rep: [-0.4, -0.6, -1] };
    var up = de(o(colg, { pel: [0.06, 0.955, 0], lf: st, rf: [-0.1, 0.2, -0.08], rfp: 25, lfy: 4, rfy: -4, cue: 'De pie sobre una pierna, rodilla suave' }));
    var sh = M.hom([0.06, 0.88, -0.12], p), u = [0, Math.cos(p * D), Math.sin(p * D)];
    var hip = [-0.04, 0.88 - 0.03 * u[1], -0.12 - 0.03 * u[2]];
    var ab = o(up, { pel: [0.06, 0.88, -0.12], pr: [p, 0, 0], hd: [-25, 0, 0], rf: [hip[0], hip[1] - 0.86 * u[1], hip[2] - 0.86 * u[2]], rfp: 80, cue: 'Tronco adelante y pierna atrás como un sube y baja · pelvis paralela al suelo' });
    if (!apoyo) { ab.lhc = [0.12, -0.05, 0.6]; ab.rhc = [-0.12, -0.05, 0.6]; } else { ab.lh = [0.58, 0.9, 0.3]; ab.rhc = [-0.1, -0.1, 0.58]; }
    var arr = o(up, { cue: aguanta ? 'Arriba, aguanta 2 s sobre una pierna' : 'Vuelve apretando el glúteo de la pierna de apoyo' });
    if (aguanta) { arr.rf = [-0.1, 0.42, 0.22]; arr.rfp = 15; }
    return { cam: apoyo ? -80 : 80, props: apoyo ? [{ t: 'pared', x: 0.66 }] : [], dyn: kb ? { db: 'r', carga: 'kb' } : {}, k: [[0, up], [0.4, up], [2, ab], [0.3, o(ab, { cue: 'Pelvis sin girar, espalda neutra' })], [1.4, arr], [aguanta ? 2 : 0.4, o(arr, { cue: aguanta ? 'Aguanta 2 s y vuelve a bajar' : arr.cue })], [0.5, up]] };
  }
  EJ.xrdl1 = rdl1(false, false, false, false); EJ['xrdl1@1'] = bisPalo(false); EJ['xrdl1@2'] = rdl1(true, false, false, false); EJ['xrdl1@3'] = rdl1(false, false, false, false);
  EJ.xbis1 = rdl1(false, false, true, true); EJ['xbis1@1'] = rdl1(true, false, true, true); EJ['xbis1@2'] = rdl1(false, false, true, true); EJ['xbis1@3'] = rdl1(false, true, true, true);
  // Remo con barra en bisagra
  (function () {
    var p = 58, pel = pelDe([0, 1.1, 0.12], p); pel[1] -= 0.02;
    var ab = de(o(pies, { pel: pel, pr: [p, 0, 0], hd: [-30, 0, 0], lh: [0.25, 0.52, 0.16], rh: [-0.25, 0.52, 0.16], lep: [0.5, 1, -0.6], rep: [-0.5, 1, -0.6], cue: 'Bisagra con la columna neutra · agarre al ancho de los hombros' }));
    var ar = o(ab, { lh: [0.25, 0.8, -0.02], rh: [-0.25, 0.8, -0.02], cue: 'Tira de la barra al abdomen llevando los codos atrás · exhala' });
    EJ.kremobarra = { cam: 75, dyn: { barra: 'h' }, k: [[0, ab], [0.5, ab], [0.8, ar], [0.4, o(ar, { cue: 'El tronco no se levanta para ayudar' })], [1.4, o(ab, { cue: 'Baja controlado' })]] };
  })();
  // Extensión de espalda a 45°, isométrica
  (function () {
    var u = [0, Math.SQRT1_2, Math.SQRT1_2], an = [0, 0.32, -0.62], pel = [0, an[1] + 0.9 * u[1], an[2] + 0.9 * u[2]];
    var brazos = { lhc: [-0.07, 0.08, 0.17], rhc: [0.07, 0.04, 0.17], lep: [1, -0.5, 0], rep: [-1, -0.5, 0] };
    var neu = de(o(brazos, { pel: pel, pr: [45, 0, 0], hd: [0, 0, 0], lf: [0.12, an[1], an[2]], rf: [-0.12, an[1], an[2]], lfy: 0, rfy: 0, lfp: 45, rfp: 45, pup: -1, cue: 'Cuerpo alineado: aguanta 5 s · nunca en hiperextensión' }));
    var ab = o(neu, { pel: [0, pel[1] - 0.05, pel[2] + 0.04], pr: [110, 0, 0], hd: [-10, 0, 0], cue: 'Baja controlado con la espalda neutra' });
    EJ.kextension = { cam: 80, ty: 0.75, props: [{ t: 'caja', m: 'pad', p: [0, -0.08], y: 0.5, s: [0.42, 0.12, 0.62], rx: 45 }, { t: 'caja', p: [0, -0.62], s: [0.4, 0.2, 0.2], m: 'pad' }],
      k: [[0, ab], [0.4, ab], [1.4, o(neu, { cue: 'Abdomen firme: sube solo hasta alinear el cuerpo' })], [5, neu], [1.4, ab]] };
  })();
  // Cargada de potencia desde colgado
  (function () {
    var g = 0.27, up = de(o(pies, codosAtras, { pel: [0, 0.955, 0], lh: [g, 0.89, 0.1], rh: [-g, 0.89, 0.1], cue: 'Barra en la cadera, agarre algo más ancho que los hombros, brazos largos' }));
    var p = 38, colg = o(up, { pel: pelDe([0, 1.15, 0.18], p), pr: [p, 0, 0], hd: [-20, 0, 0], lh: [g, 0.58, 0.16], rh: [-g, 0.58, 0.16], cue: 'Barra sobre las rodillas: hombros un poco por delante, espalda neutra' });
    colg.pel[1] -= 0.02;
    var ext = o(up, { pel: [0, 1.04, 0.0], pr: [-6, 0, 0], ch: [-4, 0, 0], hd: [5, 0, 0], lf: [0.14, 0.15, 0.02], rf: [-0.14, 0.15, 0.02], lfp: 50, rfp: 50, lh: [g, 1.05, 0.12], rh: [-g, 1.05, 0.12], lep: [1, 0.6, -0.3], rep: [-1, 0.6, -0.3], cue: 'Extiende cadera, rodillas y tobillos en un solo salto · encoge los hombros' });
    var tir = o(ext, { pel: [0, 0.98, 0.0], lf: [0.17, F, 0.02], rf: [-0.17, F, 0.02], lfp: 0, rfp: 0, lh: [g, 1.3, 0.12], rh: [-g, 1.3, 0.12], lep: [1, 1, -0.2], rep: [-1, 1, -0.2], cue: 'Tira de los codos arriba con la barra pegada' });
    var rec = o(tir, { pel: [0, 0.8, -0.1], pr: [18, 0, 0], ch: [0, 0, 0], hd: [-5, 0, 0], lh: [g - 0.03, 1.27, 0.2], rh: [-g + 0.03, 1.27, 0.2], lep: [0.3, 0, 1], rep: [-0.3, 0, 1], lfy: 15, rfy: -15, cue: 'Métete debajo: codos adelante, barra sobre los hombros en ¼ de sentadilla' });
    var de2 = o(rec, { pel: [0, 0.955, 0], pr: [0, 0, 0], hd: [0, 0, 0], lh: [g - 0.03, 1.47, 0.14], rh: [-g + 0.03, 1.47, 0.14], cue: 'Ponte de pie y reajusta' });
    var bajar = o(up, { lep: codosAtras.lep, rep: codosAtras.rep, cue: 'Baja la barra a la cadera y reajusta' });
    EJ.cargada = { cam: 60, dyn: { barra: 'h' }, k: [[0, up], [0.5, up], [1, colg], [0.3, colg], [0.2, ext], [0.15, tir], [0.18, rec], [0.6, rec], [0.8, de2], [0.6, de2], [1, bajar]] };
  })();
  // Push press
  (function () {
    var g = 0.24, rack = { lh: [g, 1.48, 0.15], rh: [-g, 1.48, 0.15], lep: [0.4, -0.3, 1], rep: [-0.4, -0.3, 1] };
    var up = de(o(pies, rack, { pel: [0, 0.955, 0], cue: 'Barra sobre los hombros, codos un poco adelantados' }));
    var dip = o(up, { pel: [0, 0.84, 0.0], lh: [g, 1.37, 0.15], rh: [-g, 1.37, 0.15], cue: 'Flexiona las rodillas 10–15 cm en vertical, tronco recto' });
    var drive = o(up, { pel: [0, 1.0, 0], lf: [0.12, 0.13, 0.02], rf: [-0.12, 0.13, 0.02], lfp: 40, rfp: 40, lh: [g, 1.85, 0.08], rh: [-g, 1.85, 0.08], lep: [1, 0, 0.2], rep: [-1, 0, 0.2], cue: 'Sin pausa, extiende las piernas y empuja con el impulso' });
    var lock = o(up, { lh: [g, 2.07, -0.01], rh: [-g, 2.07, -0.01], lep: [1, 0, 0], rep: [-1, 0, 0], hd: [6, 0, 0], ch: [-3, 0, 0], cue: 'Bloquea los codos arriba: la cabeza pasa entre los brazos' });
    var amort = o(dip, { cue: 'Baja la barra a los hombros amortiguando con las rodillas' });
    EJ.pushpress = { cam: 55, ty: 0.95, rad: 4.6, dyn: { barra: 'h' }, k: [[0, up], [0.5, up], [0.6, dip], [0.25, drive], [0.25, lock], [0.8, lock], [0.7, amort], [0.6, up]] };
  })();
  // Landmine press a una mano y landmine jammer
  (function () {
    var piv = [0, 0.03, 1.95];
    var up = de(o(pies, { pel: [0, 0.955, 0], pr: [6, 0, 0], rh: [-0.14, 1.38, 0.2], lhc: [0.2, -0.29, 0.06], rep: [-0.6, -1, -0.2], lep: [1, -0.3, -0.6], cue: 'Extremo de la barra a la altura del hombro' }));
    var arr = o(up, { pr: [8, 0, 0], ch: [3, 0, 0], rh: [-0.06, 1.68, 0.62], cue: 'Empuja en diagonal exhalando, sin rotar ni arquear la zona lumbar' });
    var lp = [[0, up], [0.5, o(up, { cue: 'Abdomen firme al 50–70 %' })], [0.8, arr], [0.3, arr], [1.3, o(up, { cue: 'Baja controlado' })]];
    EJ.klandmine = { cam: 55, ty: 0.9, dyn: { lm: piv, lmh: 'rh' }, props: [{ t: 'lm', p: [piv[0], piv[2]] }], k: lp.concat(M.esp(lp.slice(1))) };
    var sq = o(up, { pel: [0, 0.78, -0.12], pr: [24, 0, 0], lf: [0.17, F, 0.02], rf: [-0.17, F, 0.02], rh: [-0.14, 1.18, 0.17], cue: 'Barra al hombro, en media sentadilla' });
    var em = o(sq, { pel: [0, 0.98, 0.03], pr: [8, 0, 0], lf: [0.17, 0.12, 0.04], rf: [-0.17, 0.12, 0.04], lfp: 35, rfp: 35, rh: [-0.05, 1.66, 0.66], cue: 'Extiende piernas y cadera explosivo y empuja hasta extender el brazo · exhala fuerte' });
    var jp = [[0, sq], [0.6, o(sq, { cue: 'Abdomen firme al 70 %, suelo pélvico activo' })], [0.3, em], [0.3, em], [0.7, o(sq, { cue: 'Recibe la barra al hombro amortiguando con las piernas' })], [0.3, sq]];
    EJ.kjammer = { cam: 55, ty: 0.9, dyn: { lm: piv, lmh: 'rh' }, props: [{ t: 'lm', p: [piv[0], piv[2]] }], k: jp.concat(M.esp(jp.slice(1))) };
  })();
  // Press de hombros con mancuernas, sentado
  (function () {
    var sit = de({ pel: [0, 0.55, -0.12], pr: [-4, 0, 0], lf: [0.2, F, 0.38], rf: [-0.2, F, 0.38], lfy: 10, rfy: -10, lh: [0.3, 1.12, -0.04], rh: [-0.3, 1.12, -0.04], lep: [1, -0.6, 0.2], rep: [-1, -0.6, 0.2], cue: 'Sentado con la espalda apoyada, mancuernas a la altura de los hombros' });
    var up = o(sit, { lh: [0.17, 1.6, -0.06], rh: [-0.17, 1.6, -0.06], cue: 'Empuja arriba hasta casi extender · exhala' });
    EJ.gpress = { cam: 35, ty: 0.85, dyn: { db: '2', dbo: 'x' }, props: [{ t: 'banco', p: [0, -0.12], s: [0.42, 0.45, 0.42] }, { t: 'caja', m: 'pad', p: [0, -0.37], s: [0.38, 1.05, 0.06], y: 0 }],
      k: [[0, sit], [0.5, sit], [1, up], [0.3, up], [1.6, o(sit, { cue: 'Baja controlado hasta la altura de las orejas' })]] };
  })();
  // Dominadas
  (function () {
    var bh = 2.28, g = 0.34, col = de({ pel: [0, bh - 0.6 - 0.51 + 0.02, -0.02], pr: [-4, 0, 0], hd: [6, 0, 0], lh: [g, bh, 0], rh: [-g, bh, 0], lep: [1, -0.2, -0.4], rep: [-1, -0.2, -0.4], lf: [0.1, 0.42, -0.2], rf: [-0.1, 0.42, -0.2], lfp: 40, rfp: 40, lfy: 0, rfy: 0, cue: 'Cuelga con los brazos extendidos y las escápulas activas' });
    var top = o(col, { pel: [0, bh - 0.68, -0.06], pr: [-8, 0, 0], hd: [10, 0, 0], lf: [0.1, 0.42 + 0.48, -0.25], rf: [-0.1, 0.42 + 0.48, -0.25], cue: 'Lleva el pecho a la barra hasta pasar la barbilla' });
    EJ.dominadas = { cam: 30, ty: 1.45, rad: 6, el: 6, props: [{ t: 'barra', y: bh, p: [0, 0] }], k: [[0, col], [0.6, col], [1, top], [0.3, top], [2, o(col, { cue: 'Baja en 2 s hasta extender los brazos' })]] };
  })();
  // Jalón con banda, de rodillas
  (function () {
    var anc = [0, 2.15, 0.75];
    var kn = de({ pel: [0, 0.57, -0.04], lf: [0.12, F, -0.46], rf: [-0.12, F, -0.46], lfy: 0, rfy: 0, lfp: 160, rfp: 160, lkp: [0, -0.3, 1], rkp: [0, -0.3, 1],
      lh: [0.16, 1.62, 0.38], rh: [-0.16, 1.62, 0.38], lep: [1, -0.3, 0], rep: [-1, -0.3, 0], cue: 'De rodillas, banda anclada arriba y adelante' });
    var ti = o(kn, { lh: [0.24, 1.14, 0.2], rh: [-0.24, 1.14, 0.2], lep: [0.6, -1, -0.4], rep: [-0.6, -1, -0.4], cue: 'Codos abajo y atrás hasta el pecho · exhala, sin arquear la zona lumbar' });
    EJ.kjalon = { cam: 60, ty: 0.85, dyn: { banda: [['lh', anc], ['rh', anc]] }, props: [{ t: 'ancla', p: [anc[0], anc[2]], y: anc[1] }],
      k: [[0, kn], [0.5, o(kn, { cue: 'Abdomen firme al 30–50 %' })], [0.9, ti], [0.4, ti], [1.4, o(kn, { cue: 'Vuelve controlado' })]] };
  })();
})();

/* ---------- Suelo: planchas, flexiones, cuatro apoyos, boca arriba ---------- */
(function () {
  var M = window.MQ, F = M.F, o = M.o, EJ = window.MQ_EJ, de = M.de, D = Math.PI / 180;
  function U(p) { return [0, Math.cos(p * D), Math.sin(p * D)]; }
  function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  // une varios ejercicios en uno (cortes limpios entre partes)
  // une varios ejercicios en uno: cada parte conserva sus posturas, su cámara y sus implementos
  M.une = function (lista, extra) { return o({ partes: lista }, extra && extra.cam !== undefined && lista.length === 1 ? { } : {}); };
  var plano = { lhw: [-90, 0, 0], rhw: [-90, 0, 0] };
  // línea del cuerpo desde los tobillos (punta de pies, y≈0.2) o desde las rodillas
  function desdePies(anz, shY) { var p = Math.acos(Math.min(1, (shY - 0.2) / 1.41)) / D, u = U(p); return { p: p, pel: add([0, 0.2, anz], u, 0.9), sh: add([0, 0.2, anz], u, 1.41) }; }
  function desdeRod(kz, shY) { var p = Math.acos(Math.min(1, (shY - 0.06) / 0.99)) / D, u = U(p); return { p: p, pel: add([0, 0.06, kz], u, 0.48), sh: add([0, 0.06, kz], u, 0.99) }; }
  M.desdePies = desdePies; M.desdeRod = desdeRod;
  function pies(z) { return { lf: [0.11, 0.2, z], rf: [-0.11, 0.2, z], lfp: 75, rfp: 75, lfy: 0, rfy: 0, pup: -1 }; }
  function rodillas(kz) { return { lf: [0.11, F, kz - 0.44], rf: [-0.11, F, kz - 0.44], lfp: 160, rfp: 160, lfy: 0, rfy: 0, lkp: [0, -1, 0.15], rkp: [0, -1, 0.15], pup: 0 }; }
  // ---- Flexiones ----
  function flexSuelo(rod, cueA) {
    var base = rod ? -0.25 : -0.72, top = rod ? desdeRod(base, 0.58) : desdePies(base, 0.58), bot = rod ? desdeRod(base, 0.2) : desdePies(base, 0.22), hz = top.sh[2] + 0.04;
    var ma = o(plano, { lh: [0.24, 0.025, hz], rh: [-0.24, 0.025, hz], lep: [0.7, 0, -1], rep: [-0.7, 0, -1] });
    var arr = de(o(rod ? rodillas(base) : pies(base), ma, { pel: top.pel, pr: [top.p, 0, 0], hd: [-6, 0, 0], cue: cueA }));
    var ab = o(arr, { pel: bot.pel, pr: [bot.p, 0, 0], cue: 'Baja en 3 s, codos a 45° del cuerpo · escápulas se juntan' });
    return { cam: 70, el: 14, ty: 0.4, rad: 5.1, k: [[0, arr], [0.4, arr], [3, ab], [0.2, ab], [1, o(arr, { cue: 'Empuja y exhala · cuerpo recto, sin hundir la zona lumbar' })], [0.3, arr]] };
  }
  function flexApoyo(alto, zA) {   // manos en un banco/cajón (alto) o en la pared (alto = 0)
    if (!alto) {
      var w = 1.0, an = [0, F, -0.12], s0 = add(an, U(22), 1.41), s1 = add(an, U(32), 1.41);
      var mw = { lh: [0.25, 1.38, w - 0.01], rh: [-0.25, 1.38, w - 0.01], lhw: [0, 0, 180], rhw: [0, 0, 180], lep: [0.8, -0.6, -0.3], rep: [-0.8, -0.6, -0.3] };
      var a = de(o(mw, { pel: add(an, U(22), 0.9), pr: [22, 0, 0], lf: [0.12, F, -0.12], rf: [-0.12, F, -0.12], lfy: 0, rfy: 0, cue: 'Manos en la pared algo más anchas que los hombros, cuerpo recto' }));
      var b = o(a, { pel: add(an, U(32), 0.9), pr: [32, 0, 0], cue: 'Baja el pecho a la pared en 3 s, codos a 45°' });
      return { cam: 115, props: [{ t: 'pared', z: w }], k: [[0, a], [0.4, a], [3, b], [0.2, b], [1, o(a, { cue: 'Empuja y exhala' })], [0.3, a]] };
    }
    var anz = -0.62, t = desdePies(anz, alto + 0.6), bt = desdePies(anz, alto + 0.17), hz = t.sh[2] + 0.02;
    var ma = o(plano, { lh: [0.24, alto + 0.025, hz], rh: [-0.24, alto + 0.025, hz], lep: [0.7, 0, -1], rep: [-0.7, 0, -1] });
    var ar = de(o(pies(anz), ma, { pel: t.pel, pr: [t.p, 0, 0], hd: [-4, 0, 0], cue: 'Manos en el borde, cuerpo recto de los talones a la cabeza' }));
    var ab = o(ar, { pel: bt.pel, pr: [bt.p, 0, 0], cue: 'Baja el pecho al borde · la cadera no se queda atrás' });
    return { cam: 70, ty: 0.55, props: [{ t: 'caja', p: [0, hz + 0.08], s: [0.7, alto, 0.32], m: zA ? 'pad' : undefined }], k: [[0, ar], [0.4, ar], [2.5, ab], [0.2, ab], [1, o(ar, { cue: 'Empuja hasta extender los brazos · exhala' })], [0.3, ar]] };
  }
  EJ.gflex = flexApoyo(0.45, 1);
  EJ.xempuje = flexApoyo(0.45, 1); EJ['xempuje@1'] = flexApoyo(0); EJ['xempuje@2'] = flexApoyo(0.45, 1); EJ['xempuje@3'] = flexSuelo(true, 'Rodillas apoyadas, cuerpo recto de las rodillas a la cabeza');
  EJ.ftspu3 = flexApoyo(0.4);
  // Bajada lenta de flexión
  (function () {
    var f = flexSuelo(false, 'Plancha alta, cuerpo en bloque'), arr = f.k[0][1], kz = -0.25;
    var suelo = desdePies(-0.72, 0.15), ab = o(arr, { pel: [0, 0.16, suelo.pel[2] + 0.02], pr: [90, 0, 0], cue: 'Baja lento en 3–4 s hasta el suelo, en bloque' });
    var rt = desdeRod(kz, 0.58), rod = o(ab, rodillas(kz), { pel: [0, 0.18, 0.05], pr: [90, 0, 0], cue: 'Apoya las rodillas para volver arriba' });
    var up = o(rod, { pel: rt.pel, pr: [rt.p, 0, 0], cue: 'Apoya las rodillas para volver arriba' });
    EJ.ftspu4 = { cam: 70, el: 14, ty: 0.4, rad: 5.1, k: [[0, arr], [0.4, arr], [3.5, ab], [0.4, ab], [0.6, rod], [1, up], [0.6, o(up, pies(-0.72), { pel: arr.pel, pr: arr.pr, cue: 'Vuelve a la plancha alta y repite' })], [0.3, arr]] };
  })();
  // ---- Planchas ----
  function planchaAnt(rod) {
    var kz = -0.3, s = rod ? desdeRod(kz, 0.34) : desdePies(-0.78, 0.34), ez = s.sh[2];
    var bz = o(plano, { lh: [0.2, 0.025, ez + 0.3], rh: [-0.2, 0.025, ez + 0.3], lep: [0.1, -1, 0], rep: [-0.1, -1, 0] });
    var p = de(o(rod ? rodillas(kz) : pies(-0.78), bz, { pel: s.pel, pr: [s.p, 0, 0], hd: [-4, 0, 0], cue: rod ? 'Antebrazos bajo los hombros, rodillas apoyadas, cuerpo recto' : 'Antebrazos bajo los hombros, cuerpo recto de los talones a la cabeza' }));
    var r1 = o(p, { pel: add(p.pel, [0, 0.006, 0], 1), cue: 'Abdomen firme y respira durante toda la plancha' });
    return { cam: 72, el: 14, ty: 0.35, rad: 5.1, k: [[0, p], [1.2, p], [1.5, r1], [1.5, o(p, { cue: 'Sin hundir la zona lumbar ni subir la cadera' })], [1.5, r1], [1.5, p]] };
  }
  EJ.kplanchar = planchaAnt(true);
  EJ.xplancha = planchaAnt(true); EJ['xplancha@1'] = planchaAnt(true); EJ['xplancha@2'] = planchaAnt(false);
  // plancha alta con toque de hombro (desafío)
  (function () {
    var s = desdePies(-0.75, 0.58), hz = s.sh[2] + 0.02;
    var b = de(o(pies(-0.75), plano, { lf: [0.2, 0.2, -0.75], rf: [-0.2, 0.2, -0.75], pel: s.pel, pr: [s.p, 0, 0], lh: [0.22, 0.025, hz], rh: [-0.22, 0.025, hz], lep: [0.7, 0, -1], rep: [-0.7, 0, -1], cue: 'Plancha alta, pies separados, cuerpo recto' }));
    var t1 = o(b, { pr: [s.p, 0, 2], rh: [0.18, 0.5, hz - 0.05], rhw: [0, 0, 0], rep: [-1, 0.5, -0.5], cue: 'Toca el hombro contrario sin que la cadera se mueva' });
    var K = [[0, b], [0.6, b], [0.7, t1], [0.3, t1], [0.7, b]];
    EJ['xplancha@3'] = { cam: 30, el: 18, ty: 0.35, rad: 5.1, k: K.concat(M.esp(K.slice(1))) };
  })();
  // Plancha lateral (sobre el antebrazo derecho, cabeza hacia -x, mirando a la cámara)
  function lateral(rod, abd, hold) {
    var th = rod ? 62 : 73.5, u = [-Math.sin(th * D), Math.cos(th * D), 0], lat = [-Math.cos(th * D), -Math.sin(th * D), 0];
    var anc = rod ? [0.3, 0.1, 0] : [0.62, 0.12, 0];
    var pel = rod ? add(anc, u, 0.48) : add(anc, u, 0.9), sc = add(pel, u, 0.51), sr = add(sc, lat, 0.2);
    var low = function (k, y) { return [k[0] - lat[0] * 0.1 * 0 + 0, y, k[2]]; };
    var piern = rod ? { rf: [anc[0] + 0.05, 0.07, -0.42], lf: [anc[0] + 0.12, 0.17, -0.4], lkp: [0, 0.3, 1], rkp: [0, 0, 1], lfp: 90, rfp: 90, lfr: 0, rfr: 0, lfy: 0, rfy: 0 }
      : { rf: [anc[0] + 0.88 * Math.sin(th * D) * 0 + 0.08, 0.07, 0], lf: [anc[0] + 0.1, 0.2, 0.02], lfp: 0, rfp: 0, lfr: 0, rfr: 0, lfy: 0, rfy: 0, pup: 0, lkp: [0, 0, 1], rkp: [0, 0, 1] };
    piern.rf = [piern.rf[0] - 0.02, piern.rf[1], piern.rf[2]];
    var arm = { rh: [sr[0], 0.025, sr[2] + 0.3], rhw: [-90, 0, 0], rep: [0, -1, 0], lhc: [0.24, -0.3, 0.04], lep: [0.2, 1, -0.6] };
    var arriba = de(o(piern, arm, { pel: pel, pr: [0, 0, th], hd: [0, 0, -8], cue: rod ? 'De costado, antebrazo bajo el hombro y rodillas flexionadas' : 'De costado, antebrazo bajo el hombro, piernas extendidas' }));
    var abajo = o(arriba, { pel: add(pel, [0, -1, 0], rod ? 0.15 : 0.2), pr: [0, 0, th + (rod ? 12 : 10)], sp: [0, 0, -6], ch: [0, 0, -4], cue: 'Abdomen firme: sube la cadera hasta alinear el cuerpo' });
    var K = [[0, abajo], [0.6, abajo], [1, arriba], [hold || 3, o(arriba, { cue: 'Aguanta respirando · cadera alineada' })]];
    if (abd) { var lv = o(arriba, { lf: [anc[0] + 0.05, 0.62, 0.02], cue: 'Sube y baja la pierna de arriba sin que la cadera caiga' }); K = [[0, arriba], [0.8, arriba], [0.9, lv], [0.9, arriba], [0.9, lv], [0.9, arriba]]; }
    else K.push([1.2, abajo]);
    return { cam: 8, el: 14, ty: 0.45, tx: -0.15, rad: 5.1, k: K };
  }
  EJ.klateral = lateral(false); EJ.klateralr = lateral(true); EJ.klateralabd = lateral(false, true); EJ.frs2 = lateral(true, false, 2);
  // ---- Cuatro apoyos ----
  var cuatro = de(o(plano, { pel: [0, 0.6, -0.32], pr: [88, 0, 0], hd: [-6, 0, 0], lh: [0.2, 0.025, 0.2], rh: [-0.2, 0.025, 0.2], lep: [0.3, 0, -1], rep: [-0.3, 0, -1],
    lf: [0.12, F, -0.82], rf: [-0.12, F, -0.82], lfy: 0, rfy: 0, lfp: 160, rfp: 160, lkp: [0, -1, 0.3], rkp: [0, -1, 0.3], cue: 'Manos bajo los hombros, rodillas bajo las caderas · activa el abdomen profundo' }));
  M.cuatro = cuatro;
  function birddog(modo, hold) {
    var q = cuatro, h = hold || 3;
    var brazo = { lh: [0.2, 0.63, 0.78], lhw: [0, 0, 0], lep: [1, 0, 0] }, pierna = { rf: [-0.12, 0.62, -1.22], rfp: 90, rkp: [0, -1, 0] };
    var e1 = o(q, brazo, pierna, { cue: 'Exhala: brazo y pierna contraria a la altura del tronco · la pelvis no rota' });
    var K;
    if (modo === 'partes') { var a1 = o(q, brazo, { cue: 'Primero solo el brazo · el tronco no se mueve' }), p1 = o(q, pierna, { cue: 'Ahora solo la pierna · la pelvis no rota' });
      K = [[0, q], [0.5, q], [1, a1], [h, a1], [1, q], [1, p1], [h, p1], [1, q]]; }
    else if (modo === 'codo') { var junta = o(q, { lh: [0.02, 0.32, -0.08], lhw: [0, 0, 0], lep: [0.2, 0.3, -1], rf: [-0.1, 0.36, -0.42], rfp: 120, rkp: [0, -1, 1], cue: 'Junta el codo con la rodilla bajo el cuerpo' });
      K = [[0, q], [0.5, q], [1.2, e1], [2, o(e1, { cue: 'Aguanta 2 s' })], [1, junta], [0.3, junta], [1, e1], [1, q]]; }
    else K = [[0, q], [0.6, q], [1.2, e1], [h, o(e1, { cue: 'Aguanta ' + h + ' s respirando' })], [1.2, o(q, { cue: 'Vuelve barriendo el suelo con la mano y la rodilla' })], [0.3, q]];
    K = K.concat(M.esp(K.slice(1)));
    return { cam: 90, el: 16, ty: 0.42, rad: 5.1, dyn: modo === 'banda' ? { banda: [['lh', 'rf'], ['rh', 'lf']] } : {}, k: K };
  }
  EJ.kbirddog = birddog('', 3); EJ.kbirddogc = birddog('banda', 3);
  EJ.xbirddog = birddog('', 3); EJ['xbirddog@1'] = birddog('partes', 3); EJ['xbirddog@2'] = birddog('', 3); EJ['xbirddog@3'] = birddog('banda', 3);
  EJ.frs3 = birddog('codo', 2);
  // Gateo con rodillas suspendidas
  (function () {
    var g = o(cuatro, { pel: [0, 0.64, -0.3], lf: [0.12, 0.17, -0.74], rf: [-0.12, 0.17, -0.74], lfp: 75, rfp: 75, lkp: [0, -1, 0.6], rkp: [0, -1, 0.6], cue: 'Despega las rodillas 2–3 cm del suelo' });
    function paso(dz, n) { var r = o(g, { pel: [0, 0.64, -0.3 + dz], lh: [0.2, 0.025, 0.2 + dz], rh: [-0.2, 0.025, 0.2 + dz], lf: [0.12, 0.17, -0.74 + dz], rf: [-0.12, 0.17, -0.74 + dz] }); r.cue = n; return r; }
    var c = 'Mano y pie contrarios a la vez · la cadera no se mueve', s = 0.16;
    function mueve(a, dz, lado) { var b = paso(dz, c), m = o(a, {}); if (lado) { m.rh = [-0.2, 0.08, a.rh[2] + s / 2]; m.lf = [0.12, 0.24, a.lf[2] + s / 2]; b.lh = a.lh; b.rf = a.rf; } else { m.lh = [0.2, 0.08, a.lh[2] + s / 2]; m.rf = [-0.12, 0.24, a.rf[2] + s / 2]; b.rh = a.rh; b.lf = a.lf; } m.pel = [0, 0.64, a.pel[2] + s / 2]; return [m, b]; }
    var K = [[0, g], [0.6, g]], a = g, i, r;
    var p0 = paso(0, c), p1 = o(p0, { rh: [-0.2, 0.025, 0.2 + s], lf: [0.12, 0.17, -0.74 + s], pel: [0, 0.64, -0.3 + s / 2] }), p2 = paso(s, c);
    var p3 = o(p2, { lh: [0.2, 0.025, 0.2 + 2 * s], rf: [-0.12, 0.17, -0.74 + 2 * s], pel: [0, 0.64, -0.3 + 1.5 * s] }), p4 = paso(2 * s, c);
    function lev(a2, b2, k1, k2) { var m = o(a2, {}); m[k1] = [b2[k1][0], b2[k1][1] + 0.06, (a2[k1][2] + b2[k1][2]) / 2]; m[k2] = [b2[k2][0], b2[k2][1] + 0.06, (a2[k2][2] + b2[k2][2]) / 2]; m.pel = [0, 0.64, (a2.pel[2] + b2.pel[2]) / 2]; return m; }
    K.push([0.35, lev(p0, p1, 'rh', 'lf')], [0.35, p1], [0.35, lev(p1, p2, 'lh', 'rf')], [0.35, p2], [0.35, lev(p2, p3, 'lh', 'rf')], [0.35, p3], [0.35, lev(p3, p4, 'rh', 'lf')], [0.35, p4], [0.5, o(p4, { cue: 'Y vuelve hacia atrás igual' })]);
    K.push([0.35, lev(p4, p3, 'rh', 'lf')], [0.35, p3], [0.35, lev(p3, p2, 'lh', 'rf')], [0.35, p2], [0.35, lev(p2, p1, 'lh', 'rf')], [0.35, p1], [0.35, lev(p1, p0, 'rh', 'lf')], [0.35, p0], [0.4, g]);
    EJ.frs4 = { cam: 70, el: 16, ty: 0.42, rad: 5.1, k: K };
  })();
  // Plancha alta con rodilla al codo
  (function () {
    var s = desdePies(-0.75, 0.58), hz = s.sh[2] + 0.02;
    var b = de(o(pies(-0.75), plano, { pel: s.pel, pr: [s.p, 0, 0], lh: [0.22, 0.025, hz], rh: [-0.22, 0.025, hz], lep: [0.7, 0, -1], rep: [-0.7, 0, -1], cue: 'Plancha alta, manos bajo los hombros' }));
    var k1 = o(b, { pel: add(s.pel, [0, 0.03, 0], 1), lf: [0.3, 0.42, 0.12], lfp: 40, lkp: [1, -0.4, 0.4], cue: 'Rodilla hacia el codo del mismo lado, lento · la cadera no rota ni sube' });
    var K = [[0, b], [0.5, b], [1.2, k1], [0.5, k1], [1.2, b]];
    EJ.frs1 = { cam: 50, el: 16, ty: 0.4, rad: 5.1, k: K.concat(M.esp(K.slice(1))) };
  })();
  // Caminata de manos con rodillas apoyadas
  (function () {
    var kz = -0.3, q = o(cuatro, rodillas(kz), { pel: [0, 0.6, -0.3 + 0.05], lh: [0.2, 0.025, 0.22], rh: [-0.2, 0.025, 0.22] });
    var lej = desdeRod(kz, 0.5), hz = lej.sh[2] + 0.12;
    var st = [[0, q]], cz = 0.22, n = 3, d = (hz - 0.22) / n;
    for (var i = 1; i <= n; i++) {
      var f = i / n, pz = 0.22 + d * i, pl = { pel: [0, 0.6 - (0.6 - lej.pel[1]) * f, -0.25 + (lej.pel[2] + 0.25) * f], pr: [88 - (88 - lej.p) * f, 0, 0] };
      st.push([0.35, o(st[st.length - 1][1], pl, { lh: [0.2, 0.08, pz - d / 2] , cue: 'Camina con las manos adelante · la cadera no se hunde' })]);
      st.push([0.3, o(st[st.length - 1][1], { lh: [0.2, 0.025, pz] })]);
      st.push([0.35, o(st[st.length - 1][1], { rh: [-0.2, 0.08, pz - d / 2] })]);
      st.push([0.3, o(st[st.length - 1][1], { rh: [-0.2, 0.025, pz] })]);
    }
    var lejos = st[st.length - 1][1];
    st.push([1, o(lejos, { cue: 'Plancha sobre las rodillas, abdomen activo' })]);
    var back = st.slice(1, -1).reverse().map(function (x, i, arr) { return [0.33, o(x[1], { cue: 'Vuelve caminando con las manos' })]; });
    EJ.ftspu2 = { cam: 70, el: 16, ty: 0.4, rad: 5.1, k: st.concat(back).concat([[0.33, o(q, { cue: 'Vuelve caminando con las manos' })], [0.5, q]]) };
  })();
  // Brazos al frente arrodillado (pesa al pecho)
  (function () {
    var k = de(o(rodillas(0), { pel: [0, 0.57, -0.02], lh: [0.07, 1.1, 0.2], rh: [-0.07, 1.1, 0.2], lep: [0.5, -1, 0], rep: [-0.5, -1, 0], cue: 'Arrodillado, tronco erguido, pesa liviana al pecho' }));
    var f = o(k, { lh: [0.07, 1.1, 0.6], rh: [-0.07, 1.1, 0.6], cue: 'Estira los brazos al frente sin arquear la zona lumbar · abdomen activo' });
    EJ.ftspu1 = { cam: 65, ty: 0.65, dyn: { dbg: 1 }, k: [[0, k], [0.5, k], [1.2, f], [1, f], [1.2, o(k, { cue: 'Vuelve sin mover la pelvis' })], [0.4, k]] };
  })();
  // Rollout con rueda, rango corto
  (function () {
    var kz = 0, ini = de(o(rodillas(kz), plano, { pel: [0, 0.57, 0.0], pr: [62, 0, 0], hd: [-25, 0, 0], lh: [0.12, 0.17, 0.5], rh: [-0.12, 0.17, 0.5], lhw: [-30, 0, 0], rhw: [-30, 0, 0], lep: [0.3, 0, -1], rep: [-0.3, 0, -1], rw: [0, 0.09, 0.5], cue: 'De rodillas, rueda bajo los hombros' }));
    var l = desdeRod(kz, 0.42), fu = o(ini, { pel: l.pel, pr: [l.p, 0, 0], hd: [-10, 0, 0], lh: [0.12, 0.17, l.sh[2] + 0.35], rh: [-0.12, 0.17, l.sh[2] + 0.35], rw: [0, 0.09, l.sh[2] + 0.35], cue: 'Rueda adelante solo hasta donde la zona lumbar se mantiene neutra' });
    EJ.krollout = { cam: 75, ty: 0.45, rad: 5.1, dyn: { rodillo: 1 }, k: [[0, ini], [0.6, o(ini, { cue: 'Abdomen firme al 70 %' })], [1.6, fu], [0.4, fu], [1.3, o(ini, { cue: 'Exhala al volver' })], [0.3, ini]] };
  })();
  // ---- Boca arriba ----
  var sup = de({ pel: [0, 0.13, 0], pr: [-90, 0, 0], hd: [0, 0, 0], lf: [0.12, 0.1, 0.9], rf: [-0.12, 0.1, 0.9], lfp: -90, rfp: -90, lfy: 0, rfy: 0, lkp: [0, 1, 0], rkp: [0, 1, 0], la: [0, 0, 8], ra: [0, 0, -8], le: 0, re: 0 });
  M.sup = sup;
  // Dead bug
  (function () {
    var b = o(sup, { lh: [0.2, 0.68, -0.5], rh: [-0.2, 0.68, -0.5], lep: [1, 0, 0], rep: [-1, 0, 0], lf: [0.12, 0.6, 0.47], rf: [-0.12, 0.6, 0.47], lfp: -20, rfp: -20, cue: 'Boca arriba, brazos al techo, caderas y rodillas a 90°' });
    var e = o(b, { lh: [0.2, 0.2, -1.1], rf: [-0.12, 0.22, 0.9], rfp: -60, cue: 'Exhala y extiende un brazo y la pierna contraria · la zona lumbar no se despega' });
    var K = [[0, b], [0.6, b], [1.4, e], [0.6, e], [1.2, b]];
    EJ._deadbug = { cam: 75, el: 22, ty: 0.3, rad: 5.1, k: K.concat(M.esp(K.slice(1))) };
  })();
  // Curl-up de McGill
  (function () {
    var b = o(sup, { lh: [0.08, 0.03, -0.14], rh: [-0.08, 0.03, -0.14], lep: [1, -0.3, 0.2], rep: [-1, -0.3, 0.2], lhw: [90, 0, 0], rhw: [90, 0, 0], lf: [0.15, F, 0.42], lfp: 0, lfy: 0, lkp: [0.1, 1, 0.3], cue: 'Boca arriba, una rodilla flexionada · manos bajo la zona lumbar' });
    var up = o(b, { ch: [14, 0, 0], hd: [4, 0, 0], cue: 'Eleva solo cabeza y hombros unos centímetros · aguanta respirando corto' });
    var K = [[0, b], [0.8, o(b, { cue: 'Inhala, activa el suelo pélvico y el abdomen al 30 %' })], [1, up], [3, o(up, { cue: 'La zona lumbar no se aplana, el mentón no se pega al pecho' })], [1, b], [0.5, b]];
    EJ.kcurlup = { cam: 70, el: 20, ty: 0.25, rad: 5.1, k: K };
  })();
  EJ.gcorea = M.une([EJ._deadbug, planchaAnt(true)]);
  EJ.gcoreb = M.une([birddog('', 3), lateral(true)], { cam: 40 });
})();

/* ---------- Remos, bandas, puentes y correctivos ---------- */
(function () {
  var M = window.MQ, F = M.F, o = M.o, EJ = window.MQ_EJ, de = M.de, D = Math.PI / 180, sup = M.sup;
  var pies = { lf: [0.13, F, 0.02], rf: [-0.13, F, 0.02], lfy: 6, rfy: -6 };
  // Remo con mancuerna con apoyo (mano y rodilla izquierdas en el banco)
  function remoBanco() {
    var b = de({ pel: [0.12, 0.87, -0.22], pr: [84, 0, 0], hd: [-10, 0, 0], lf: [0.22, 0.52, -0.72], lfp: 160, lfy: 0, lkp: [0, -1, 0.2], rf: [-0.24, F, -0.12], rfy: -10, rkp: [0, 0, 1],
      lh: [0.3, 0.475, 0.32], lhw: [-90, 0, 0], lep: [1, 0, -1], rh: [-0.1, 0.36, 0.3], rep: [-0.2, 1, -1], cue: 'Mano y rodilla del mismo lado en el banco, espalda neutra' });
    var t = o(b, { rh: [-0.12, 0.74, 0.08], cue: 'Tira llevando el codo atrás, cerca del cuerpo · exhala' });
    return { cam: -70, el: 16, ty: 0.6, rad: 4.4, dyn: { db: 'r' }, props: [{ t: 'banco', p: [0.27, -0.2], s: [0.36, 0.45, 1.25] }],
      k: [[0, b], [0.5, o(b, { cue: 'Abdomen firme al 30–50 %' })], [0.9, t], [0.4, o(t, { cue: 'Sin rotar el tronco' })], [1.4, o(b, { cue: 'Baja controlado' })]] };
  }
  EJ.kremomanc = remoBanco(); EJ.gremom = remoBanco(); EJ['xtiron@3'] = remoBanco();
  // Remo con banda de pie
  function remoBanda() {
    var anc = [0, 1.22, 1.15];
    var b = de(o(pies, { pel: [0, 0.93, -0.02], pr: [4, 0, 0], lh: [0.15, 1.2, 0.56], rh: [-0.15, 1.2, 0.56], lep: [0.5, -1, -0.3], rep: [-0.5, -1, -0.3], cue: 'Banda anclada a la altura del pecho, rodillas un poco flexionadas' }));
    var t = o(b, { lh: [0.22, 1.12, 0.06], rh: [-0.22, 1.12, 0.06], lep: [0.3, -0.4, -1], rep: [-0.3, -0.4, -1], cue: 'Codos atrás, cerca del cuerpo, y junta las escápulas · exhala' });
    return { cam: 60, dyn: { banda: [['lh', anc], ['rh', anc]] }, props: [{ t: 'ancla', p: [0, anc[2]], y: anc[1] }],
      k: [[0, b], [0.5, b], [0.9, t], [0.6, o(t, { cue: 'Hombros lejos de las orejas, tronco quieto' })], [2, o(b, { cue: 'Vuelve en 2 s sin que la banda te arrastre' })]] };
  }
  EJ.gremob = remoBanda(); EJ.kremoband = remoBanda(); EJ.xtiron = remoBanda(); EJ['xtiron@1'] = remoBanda(); EJ['xtiron@2'] = remoBanda();
  // Face pull
  (function () {
    var anc = [0, 1.62, 1.15];
    var b = de(o(pies, { pel: [0, 0.94, 0], lh: [0.07, 1.58, 0.55], rh: [-0.07, 1.58, 0.55], lep: [1, 0, -0.2], rep: [-1, 0, -0.2], cue: 'Banda a la altura de la cara · abdomen firme al 30 %' }));
    var t = o(b, { lh: [0.3, 1.66, 0.1], rh: [-0.3, 1.66, 0.1], lep: [1, 0.1, -0.6], rep: [-1, 0.1, -0.6], cue: 'Tira hacia la cara separando las manos · pulgares hacia atrás' });
    EJ.kfacepull = { cam: 50, ty: 1.0, dyn: { banda: [['lh', anc], ['rh', anc]] }, props: [{ t: 'ancla', p: [0, anc[2]], y: anc[1] }],
      k: [[0, b], [0.5, b], [0.9, t], [0.6, o(t, { cue: 'Escápulas atrás y abajo · exhala' })], [1.4, o(b, { cue: 'Vuelve controlado' })]] };
  })();
  // Chop en diagonal (banda o polea arriba a la izquierda)
  function chop(rod) {
    var anc = [1.0, 2.05, 0.25], y0 = rod ? -0.38 : 0;
    var arr = de({ pel: [0, 0.93 + y0, 0], pr: [0, 22, 0], ch: [0, 10, 0], hd: [0, 6, 0], lf: [0.17, F, 0.02], rf: [-0.17, F, 0.02], lfy: -14, rfy: -30,
      lh: [0.5, 1.65 + y0, 0.32], rh: [0.44, 1.6 + y0, 0.3], lep: [0.3, -1, -0.5], rep: [-0.5, -1, -0.2], cue: 'De lado a la banda, brazos casi estirados' });
    var ab = o(arr, { pr: [6, -18, 0], ch: [6, -16, 0], hd: [0, -10, 0], lfy: 26, rfy: 10, lh: [-0.26, 0.95 + y0, 0.38], rh: [-0.32, 0.92 + y0, 0.34], cue: 'Lleva la banda en diagonal a la cadera contraria, girando desde cadera y pies · exhala' });
    return { cam: 15, ty: 0.9, dyn: { banda: [['mh', anc]] }, props: [{ t: 'ancla', p: [anc[0], anc[2]], y: anc[1] }],
      k: [[0, arr], [0.6, o(arr, { cue: 'Abdomen firme al 50–70 %' })], [0.9, ab], [0.3, ab], [1.4, o(arr, { cue: 'Vuelve controlado, el tronco firme' })]] };
  }
  EJ.kchop = chop(); EJ.gmartillo = chop();
  // Monster walk con mini banda en las rodillas
  (function () {
    var y = 0.78, h = { pel: [0, y, -0.1], pr: [24, 0, 0], hd: [-12, 0, 0], lhc: [0.2, -0.29, 0.06], rhc: [-0.2, -0.29, 0.06], lep: [1, -0.3, -0.6], rep: [-1, -0.3, -0.6] };
    function st(x, lx, rx, ly, ry, c) { return de(o(h, { pel: [x, y, -0.1], lf: [lx, ly || F, 0.03], rf: [rx, ry || F, 0.03], lfy: 10, rfy: -10, cue: c })); }
    var c1 = 'Media sentadilla, banda en las rodillas · abdomen firme al 30 %', c2 = 'Pasos cortos al lado sin juntar los pies · rodillas empujan hacia afuera';
    var K = [[0, st(-0.3, -0.3 + 0.17, -0.3 - 0.17, 0, 0, c1)], [0.5, st(-0.3, -0.13, -0.47, 0, 0, c2)]], x = -0.3;
    for (var i = 0; i < 3; i++) { K.push([0.3, st(x + 0.06, x + 0.27, x - 0.17, 0.14, F, c2)]); K.push([0.25, st(x + 0.1, x + 0.37, x - 0.17, F, F, c2)]); K.push([0.3, st(x + 0.16, x + 0.37, x - 0.03, F, 0.13, c2)]); K.push([0.25, st(x + 0.2, x + 0.37, x + 0.03, F, F, c2)]); x += 0.2; }
    for (var j = 0; j < 3; j++) { K.push([0.3, st(x - 0.06, x + 0.17, x - 0.27, F, 0.14, c2)]); K.push([0.25, st(x - 0.1, x + 0.17, x - 0.37, F, F, c2)]); K.push([0.3, st(x - 0.16, x + 0.03, x - 0.37, 0.13, F, c2)]); K.push([0.25, st(x - 0.2, x - 0.03, x - 0.37, F, F, c2)]); x -= 0.2; }
    K.push([0.4, K[0][1]]);
    EJ.kmonster = { cam: 15, el: 14, dyn: { banda: [['lk', 'rk']] }, k: K };
  })();
  // Hombro de atacante: rotación externa con banda + Y-T-W en bisagra
  (function () {
    var anc = [-0.49, 1.48, 1.2];
    var re0 = de(o(pies, { pel: [0, 0.955, 0], lhc: [0.2, -0.29, 0.06], lep: [1, -0.3, -0.6], rh: [-0.49, 1.48, 0.31], rep: [-1, -0.05, -1], bv: 1, cue: 'Rotación externa: codo a la altura del hombro, banda adelante' }));
    var re1 = o(re0, { rh: [-0.49, 1.79, 0.02], rep: [-1, -1, -0.1], cue: 'Gira el antebrazo hacia arriba · baja lento en 3 s' });
    var p = 45, pel = M.pelDe([0, 1.18, 0.3], p);
    var h = o(re0, { pel: pel, pr: [p, 0, 0], hd: [-20, 0, 0], lhc: [0.2, -0.2, 0.42], rhc: [-0.2, -0.2, 0.42], lh: undefined, rh: undefined, lep: [1, -0.4, -1], rep: [-1, -0.4, -1], bv: 0, cue: 'Y-T-W en bisagra: pulgares arriba, escápulas atrás y abajo' });
    delete h.lh; delete h.rh;
    var Y = o(h, { lhc: [0.5, 0.74, 0.05], rhc: [-0.5, 0.74, 0.05], lep: [1, -1, 0], rep: [-1, -1, 0], cue: 'Y: brazos arriba en diagonal' }), Tt = o(h, { lhc: [0.8, 0.22, 0.02], rhc: [-0.8, 0.22, 0.02], lep: [0, -1, -1], rep: [0, -1, -1], cue: 'T: brazos a los lados' });
    var W = o(h, { lhc: [0.42, 0.26, -0.08], rhc: [-0.42, 0.26, -0.08], lep: [1, -0.6, -1], rep: [-1, -0.6, -1], cue: 'W: codos atrás y abajo' });
    EJ._rext = { cam: 30, ty: 1.0, dyn: { banda: [['rh', anc]] }, props: [{ t: 'ancla', p: [anc[0], anc[2]], y: anc[1] }], k: [[0, re0], [0.5, re0], [0.9, re1], [0.3, re1], [3, re0]] };
    EJ._ytw = { cam: 60, k: [[0, h], [0.5, h], [1, Y], [0.6, Y], [1, h], [1, Tt], [0.6, Tt], [1, h], [1, W], [0.6, W], [1, h]] };
    EJ.vhombro = M.une([EJ._rext, EJ._ytw], { cam: 40 });
  })();
  // Hip thrust con barra
  function thrust(cue0) {
    var bz = -0.6, sh = [0, 0.46, bz + 0.22];
    var ab = de({ pel: [0, 0.2, 0.0], pr: [-62, 0, 0], hd: [20, 0, 0], lf: [0.15, F, 0.55], rf: [-0.15, F, 0.55], lfy: 6, rfy: -6, pup: 0.8, lh: [0.3, 0.38, 0.06], rh: [-0.3, 0.38, 0.06], lep: [1, 0.3, -0.5], rep: [-1, 0.3, -0.5], cue: cue0 });
    var arr = o(ab, { pel: [0, 0.46, 0.12], pr: [-90, 0, 0], hd: [30, 0, 0], lh: [0.3, 0.6, 0.15], rh: [-0.3, 0.6, 0.15], cue: 'Empuja con los talones hasta alinear rodillas, cadera y hombros' });
    return { cam: 45, el: 18, ty: 0.45, rad: 4.4, dyn: { barra: 'h' }, props: [{ t: 'banco', p: [0, bz], s: [1.0, 0.42, 0.4] }],
      k: [[0, ab], [0.5, ab], [1, arr], [1, o(arr, { cue: 'Aprieta los glúteos 1 s · mentón metido, costillas abajo' })], [1.5, o(ab, { cue: 'Baja controlado hasta casi tocar el suelo' })], [0.3, ab]] };
  }
  EJ.hipthrust = thrust('Espalda alta en el borde del banco, barra sobre la cadera');
  EJ.khipthrust = thrust('Espalda alta en el banco, barra o mancuerna sobre la cadera · inhala abajo');
  EJ.khipthrustp = thrust('Igual, con más carga · abdomen firme al 70 %');
  // Puente de glúteo con una rodilla abrazada (pie derecho apoyado)
  (function () {
    var b = o(sup, { rf: [-0.13, F, 0.42], rfp: 0, rfy: 0, rkp: [0, 1, 0.3], lf: [0.13, 0.62, 0.12], lfp: -10, lkp: [0, 0.4, -1], lh: [0.14, 0.52, -0.12], rh: [0.04, 0.55, -0.12], lep: [1, -0.3, 0], rep: [-0.3, -1, 0], cue: 'Boca arriba, un pie apoyado y la otra rodilla abrazada al pecho' });
    var u = o(b, { pel: [0, 0.31, 0.05], pr: [-108, 0, 0], hd: [18, 0, 0], lf: [0.13, 0.8, 0.06], lh: [0.14, 0.7, -0.18], rh: [0.04, 0.72, -0.18], cue: 'Sube la cadera apretando el glúteo de la pierna apoyada, sin arquear' });
    EJ.fhs2 = { cam: 75, el: 16, ty: 0.3, rad: 4.6, k: [[0, b], [0.5, b], [1.2, u], [1, u], [2, o(b, { cue: 'Baja lento' })]] };
  })();
  // Elevación de rodilla a 90° con palo sobre los hombros (y con apertura)
  function rodilla90(abre) {
    var palo = { lhc: [0.46, 0.27, -0.06], rhc: [-0.46, 0.27, -0.06], lep: [0.5, -1, -0.3], rep: [-0.5, -1, -0.3] };
    var b = de(o(palo, pies, { pel: [0, 0.955, 0], cue: 'De pie, palo sobre los hombros' }));
    var up = o(b, { pel: [-0.02, 0.96, 0], lf: [0.12, 0.47, 0.47], lfp: -12, lkp: [0, 0, 1], cue: 'Rodilla a 90°, punta del pie arriba · pelvis y palo no se inclinan' });
    var K = [[0, b], [0.5, b], [0.9, up], [abre ? 0.6 : 3, o(up, { cue: abre ? 'Abre la rodilla hacia el lado' : 'Aguanta 3 s' })]];
    if (abre) { var ab = o(up, { lf: [0.5, 0.5, 0.18], lfy: 60, lkp: [1, 0, 0.3], cue: 'Abre la rodilla hacia el lado y vuelve al centro' }); K.push([0.9, ab], [0.5, ab], [0.9, up]); }
    K.push([1, o(b, { cue: 'Baja controlado y cambia de pierna' })]);
    K = K.concat(M.esp(K.slice(1)));
    return { cam: 30, dyn: { palo: 'hom' }, k: K };
  }
  EJ.fhs3 = rodilla90(false); EJ.fhs4 = rodilla90(true);
  // Sentado contra la pared: brazos en W deslizando arriba / remo con palo
  var wz = -0.42;
  var sent = de({ pel: [0, 0.14, wz + 0.16], lf: [-0.14, 0.07, 0.36], rf: [0.14, 0.07, 0.3], lfy: -40, rfy: 40, lkp: [1, 0.6, 0.3], rkp: [-1, 0.6, 0.3], lfr: 0, rfr: 0, pup: 0 });
  (function () {
    var w = o(sent, { lh: [0.44, 0.88, wz + 0.04], rh: [-0.44, 0.88, wz + 0.04], lhw: [0, 0, 0], rhw: [0, 0, 0], lep: [0.8, -0.6, -1], rep: [-0.8, -0.6, -1], cue: 'Espalda contra la pared, brazos en W apoyados' });
    var a = o(w, { lh: [0.24, 1.22, wz + 0.04], rh: [-0.24, 1.22, wz + 0.04], lep: [1, -0.2, -1], rep: [-1, -0.2, -1], cue: 'Desliza arriba sin despegar codos, muñecas ni la zona lumbar' });
    EJ.fsm1 = { cam: 30, el: 14, ty: 0.55, rad: 3.8, props: [{ t: 'pared', z: wz }], k: [[0, w], [0.5, w], [1.6, a], [0.4, a], [1.6, o(w, { cue: 'Y vuelve' })]] };
    var pl = o(sent, { rh: [-0.14, 1.12, wz + 0.05], lh: [0.12, 0.3, wz + 0.05], rep: [-1, 0.5, 0.3], lep: [1, -0.3, 0.3], cue: 'Palo por detrás de la espalda, una mano arriba y otra abajo' });
    var t = o(pl, { rh: [-0.12, 1.24, wz + 0.05], lh: [0.12, 0.2, wz + 0.05], cue: 'Tira con la mano de abajo para subir el brazo de arriba · aguanta 2 s' });
    EJ.fsm2 = { cam: 25, el: 14, ty: 0.55, rad: 3.8, dyn: { palo: 'man' }, props: [{ t: 'pared', z: wz }], k: [[0, pl], [0.5, pl], [1, t], [2, t], [1, pl]] };
  })();
  // De lado (sobre el lado derecho, cabeza hacia -x): apertura de brazo y círculo de hombro
  (function () {
    var lado = de({ pel: [0.3, 0.25, 0], pr: [0, 0, 90], hd: [0, 0, -10], lf: [0.75, 0.24, 0.38], rf: [0.75, 0.08, 0.38], lfy: 90, rfy: 90, lfp: 0, rfp: 0, lfr: 90, rfr: 90, lkp: [0, 0, 1], rkp: [0, 0, 1],
      rh: [-0.2, 0.03, 0.55], rhw: [-90, 0, 0], rep: [0, -1, 0.3], lh: [-0.2, 0.1, 0.55], lhw: [-90, 0, 0], lep: [0, 1, 0.3], cue: 'De lado, rodillas a 90° sobre un cojín, brazos adelante' });
    var ab = o(lado, { ch: [0, 55, 0], hd: [0, 50, -10], lh: [-0.18, 0.2, -0.55], lhw: [90, 0, 0], lep: [0, 1, -0.3], cue: 'Abre el brazo de arriba al otro lado siguiéndolo con la mirada · exhala' });
    var mid = o(lado, { ch: [0, 30, 0], hd: [0, 25, -10], lh: [-0.2, 0.95, 0.05], lhw: [0, 0, 0], lep: [0, 1, 0], cue: 'Abre el brazo de arriba al otro lado siguiéndolo con la mirada · exhala' });
    var props = [{ t: 'colch', p: [0.2, 0.1], s: [1.6, 1.0] }];
    EJ.fsm3 = { cam: 20, el: 50, ty: 0.25, tx: 0.15, rad: 3.9, dyn: { cojin: 1 }, props: props, k: [[0, lado], [0.5, lado], [0.9, mid], [0.9, ab], [1.5, o(ab, { cue: 'Las rodillas no se despegan' })], [1.6, o(lado, { cue: 'Vuelve controlado' })]] };
    var c1 = o(lado, { lh: [-0.78, 0.4, 0.15], lhw: [0, 0, 90], lep: [0, 1, 0], ch: [0, 10, 0], cue: 'Brazo de arriba en un círculo grande por encima de la cabeza' });
    var c2 = o(lado, { lh: [-0.45, 0.85, -0.2], lhw: [0, 0, 0], lep: [0, 1, 0], ch: [0, 35, 0], hd: [0, 30, -10], cue: 'Brazo de arriba en un círculo grande por encima de la cabeza' });
    var c3 = o(lado, { lh: [-0.05, 0.35, -0.5], lhw: [90, 0, 0], lep: [0.3, 1, -0.3], ch: [0, 50, 0], hd: [0, 40, -10], cue: 'Y por detrás de la espalda, sin despegar las rodillas' });
    var c4 = o(lado, { lh: [0.15, 0.5, -0.1], lhw: [90, 0, 0], lep: [0.3, 1, -0.3], ch: [0, 25, 0], cue: 'Y por detrás de la espalda, sin despegar las rodillas' });
    EJ.fsm4 = { cam: 20, el: 50, ty: 0.25, tx: 0.15, rad: 3.9, dyn: { cojin: 1 }, props: props, k: [[0, lado], [0.6, lado], [1, c1], [1, c2], [1, c3], [0.9, c4], [1.1, lado]] };
  })();
  // ---- Elevación de pierna boca arriba ----
  function pierna(a, x) { var r = a * D; return [x, 0.13 + 0.86 * Math.sin(r), 0.03 + 0.86 * Math.cos(r)]; }
  (function () {
    var b = o(sup, { lh: [-0.05, 0.3, 0.06], rh: [-0.2, 0.3, 0.06], lep: [1, -0.4, -0.4], rep: [-1, -0.4, -0.4], ch: [6, 0, 0], cue: 'Boca arriba, toma la pierna por detrás del muslo' });
    b.lh = [-0.05, 0.22, 0.02]; b.rh = [-0.2, 0.22, 0.02];
    var u = o(b, { rf: pierna(78, -0.12), rfp: -10, rkp: [0, 0, 1], lh: [-0.05, 0.38, 0.1], rh: [-0.2, 0.38, 0.1], cue: 'Súbela estirada lo más que puedas · empuja la otra pierna contra el suelo' });
    EJ.faslr1 = { cam: 75, el: 16, ty: 0.3, rad: 4.6, k: [[0, b], [0.5, b], [1.4, u], [2, o(u, { cue: 'Aguanta 2 s' })], [1.4, b]] };
    var bb = o(sup, { lh: [0.05, 0.45, -0.2], rh: [-0.2, 0.45, -0.2], lep: [1, -0.4, -0.4], rep: [-1, -0.4, -0.4], cue: 'Boca arriba, banda en el pie de la pierna que sube' });
    var u2 = o(bb, { rf: pierna(80, -0.12), rfp: -20, rkp: [0, 0, 1], lh: [0.0, 0.6, -0.15], rh: [-0.18, 0.6, -0.15], cue: 'Sube la pierna estirada con ayuda de la banda' });
    var fl = o(u2, { rf: [-0.12, 0.6, 0.35], rkp: [0, 1, 0], cue: 'Arriba, dobla la rodilla y vuelve a estirarla' });
    EJ.faslr2 = { cam: 75, el: 16, ty: 0.3, rad: 4.6, dyn: { banda: [['lh', 'rf'], ['rh', 'rf']] }, k: [[0, bb], [0.5, bb], [1.4, u2], [0.8, fl], [0.8, u2], [1.8, o(bb, { cue: 'Baja lento' })]] };
    var h = o(u2, { cue: 'Sostén una pierna arriba con la banda' });
    var lo = o(h, { lf: [0.12, 0.17, 0.9], lfp: -80, cue: 'Baja la otra pierna estirada hasta casi tocar el suelo · zona lumbar pegada' });
    var hi = o(h, { lf: pierna(70, 0.12), lfp: -20, lkp: [0, 0, 1], cue: 'Y vuelve a subirla' });
    EJ.faslr3 = { cam: 75, el: 16, ty: 0.3, rad: 4.6, dyn: { banda: [['lh', 'rf'], ['rh', 'rf']] }, k: [[0, hi], [0.5, h], [1.6, lo], [0.3, lo], [1.4, hi], [0.3, hi]] };
    var k4 = o(sup, { rh: [-0.2, 0.74, -0.5], rep: [-1, 0, 0], lhc: [0.24, -0.3, 0.06], lep: [1, 0, 0], lf: [0.15, F, 0.42], lfp: 0, lkp: [0.1, 1, 0.3], rf: pierna(80, -0.12), rfp: -20, rkp: [0, 0, 1], cue: 'Pesa liviana arriba con el brazo estirado · activación suave del abdomen' });
    var k4b = o(k4, { rf: [-0.12, 0.18, 0.9], rfp: -80, cue: 'Baja la pierna estirada sin que la zona lumbar se despegue ni la pesa se mueva' });
    EJ.faslr4 = { cam: 75, el: 16, ty: 0.3, rad: 4.6, dyn: { db: 'r', dbo: 'x' }, k: [[0, k4], [0.5, k4], [1.8, k4b], [0.3, k4b], [1.5, o(k4, { cue: 'Y súbela de nuevo' })]] };
  })();
})();

/* ---------- Caminar con carga, lanzamientos y saltos ---------- */
(function () {
  var M = window.MQ, F = M.F, o = M.o, EJ = window.MQ_EJ, de = M.de, D = Math.PI / 180;
  // Caminar ida y vuelta (con giro). brazos(fase) devuelve los campos de los brazos para cada paso.
  M.camina = function (base, brazos, opt) {
    opt = opt || {}; var L = opt.paso || 0.42, n = opt.n || 4, tp = opt.t || 0.5, y = opt.y || 0.95, z0 = -L * n / 2, K = [];
    function pie(dir, side, z) { return [dir * side * 0.11, F, z]; }
    function pose(dir, lz, rz, sw, lift, f, cue) {
      var c = o(base, brazos(f, dir), { pr: [opt.lean || 2, dir > 0 ? 0 : 180, 0], pel: [0, y + (lift ? 0.02 : -0.01), (lz + rz) / 2 + dir * 0.04], lf: pie(dir, 1, lz), rf: pie(dir, -1, rz), lfy: 0, rfy: 0, lfp: 0, rfp: 0, cue: cue });
      if (lift) { if (sw === 'l') { c.lf = [c.lf[0], 0.15, lz]; c.lfp = -10; } else { c.rf = [c.rf[0], 0.15, rz]; c.rfp = -10; } }
      return c;
    }
    var cue = opt.cue || '';
    function ida(dir, zs) {
      var lz = zs, rz = zs, k = [];
      for (var i = 0; i < n; i++) {
        var izq = i % 2 === 0, nz = (izq ? rz : lz) + dir * L * (i === 0 ? 0.5 : 1), mid = ((izq ? lz : rz) + nz) / 2;
        if (izq) { k.push([tp / 2, pose(dir, mid, rz, 'l', true, 0.5, cue)]); lz = nz; k.push([tp / 2, pose(dir, lz, rz, 'l', false, 1, cue)]); }
        else { k.push([tp / 2, pose(dir, lz, mid, 'r', true, -0.5, cue)]); rz = nz; k.push([tp / 2, pose(dir, lz, rz, 'r', false, -1, cue)]); }
      }
      var cierra = lz * dir > rz * dir ? 'r' : 'l', zf = dir > 0 ? Math.max(lz, rz) : Math.min(lz, rz);
      k.push([tp / 2, pose(dir, cierra === 'l' ? (lz + zf) / 2 : lz, cierra === 'r' ? (rz + zf) / 2 : rz, cierra, true, 0, cue)]);
      k.push([tp / 2, pose(dir, zf, zf, cierra, false, 0, cue)]);
      return { k: k, z: zf };
    }
    function gira(dir, z, cue2) {   // de dir a -dir con dos pasitos
      var a = pose(dir, z, z, 'l', false, 0, cue2), b = o(a, { pr: [opt.lean || 2, 90, 0], lf: [0, 0.12, z - 0.11 * dir], rf: [0, F, z + 0.11 * dir], pel: [0, y, z] });
      var c = o(b, { lf: [0, F, z - 0.11 * dir] }), d = pose(-dir, z, z, 'r', false, 0, cue2);
      return [[0.35, b], [0.25, c], [0.4, d]];
    }
    var p0 = pose(1, z0, z0, 'l', false, 0, opt.cue0 || cue); K.push([0, p0], [0.4, p0]);
    var a = ida(1, z0); K = K.concat(a.k); K = K.concat(gira(1, a.z, opt.cueVuelta || cue));
    var b = ida(-1, a.z); K = K.concat(b.k).concat(gira(-1, b.z, cue));
    return K;
  };
  function carga(una, dos) { return function (f, dir) { var s = una ? 0.01 : 0.0; return dos ? { lhc: [0.24, -0.36, 0.02], rhc: [-0.24, -0.36, 0.02], lep: [0.3, -0.3, -1], rep: [-0.3, -0.3, -1] } : { lhc: [0.22, -0.3, 0.06 + 0.1 * f], rhc: [-0.24, -0.36, 0.02], lep: [0.3, -0.3, -1], rep: [-0.3, -0.3, -1] }; }; }
  var erg = de({ pr: [2, 0, 0], hd: [0, 0, 0] });
  EJ.kgranjero = { cam: 50, follow: false, followz: true, el: 14, rad: 4.8, dyn: { db: '2', carga: 'kb' }, k: M.camina(erg, carga(false, true), { cue: 'Erguido, costillas abajo, pasos cortos · respira', cue0: 'Una pesa pesada en cada mano · abdomen firme al 70 %' }) };
  EJ.xcarry = { cam: 50, followz: true, el: 14, rad: 4.8, dyn: { db: 'r', carga: 'kb' }, k: M.camina(erg, carga(true, false), { cue: 'El tronco no se inclina hacia la carga · hombros nivelados', cue0: 'Maleta: una carga en una mano, erguido' }) };
  (function () {
    var K = M.camina(erg, carga(false, true), { cue: 'Granjero: una carga en cada mano, erguido', cueVuelta: 'A mitad del recorrido deja una y sigue con una sola (maleta)' });
    var mitad = Math.floor(K.length / 2);
    K = K.map(function (k, i) { var p = o(k[1], { dbl: i <= mitad ? 1 : 0 }); if (i > mitad) { p.lhc = [0.22, -0.3, 0.06]; if (i > mitad + 1) p.cue = 'Maleta: sin inclinarte hacia la carga · respira'; } return [k[0], p]; });
    EJ.kcarrera = { cam: 50, followz: true, el: 14, rad: 4.8, dyn: { db: '2', carga: 'kb' }, k: K };
  })();
  // Caminata rápida e intervalos suaves
  function balanceo(amp) { return function (f, dir) { return { lhc: [0.22, -0.3, 0.05 - amp * f], rhc: [-0.22, -0.3, 0.05 + amp * f], lep: [0.3, -0.3, -1], rep: [-0.3, -0.3, -1] }; }; }
  EJ.gcaminata = { cam: 50, followz: true, el: 14, rad: 4.8, k: M.camina(erg, balanceo(0.22), { paso: 0.55, t: 0.55, n: 4, cue: 'Caminata rápida: puedes hablar, pero no cantar' }) };
  EJ.ginterv = { cam: 50, followz: true, el: 14, rad: 4.8, k: M.camina(de({ hd: [0, 0, 0] }), function (f) { return { lhc: [0.2, -0.12, 0.12 - 0.22 * f], rhc: [-0.2, -0.12, 0.12 + 0.22 * f], lep: [0.3, -1, -0.6], rep: [-0.3, -1, -0.6] }; }, { paso: 0.62, t: 0.42, n: 4, y: 0.94, lean: 6, cue: 'Intervalo: ritmo más alto 1 min, suave 1–2 min' }) };

  // ---- Lanzamientos con balón medicinal ----
  // Pase de pecho contra la pared
  function pecho() {
    var w = 2.0, b = de({ pel: [0, 0.92, 0], lf: [0.16, F, 0.02], rf: [-0.16, F, 0.02], lh: [0.12, 1.22, 0.24], rh: [-0.12, 1.22, 0.24], lep: [1, -0.6, -0.4], rep: [-1, -0.6, -0.4], bh: 1, bw: [0, 1.22, 0.3], cue: 'Balón al pecho, frente a la pared · activa el abdomen' });
    var c = o(b, { pel: [0, 0.86, -0.02], pr: [6, 0, 0], cue: 'Carga las piernas' });
    var l = o(b, { pel: [0, 0.95, 0.04], pr: [10, 0, 0], lh: [0.12, 1.25, 0.72], rh: [-0.12, 1.25, 0.72], lep: [1, -0.3, 0], rep: [-1, -0.3, 0], bh: 1, bw: [0, 1.25, 0.8], lf: [0.16, 0.12, 0.04], rf: [-0.16, 0.12, 0.04], lfp: 30, rfp: 30, cue: 'Empuja explosivo y exhala fuerte' });
    var pa = o(l, { lf: [0.16, F, 0.02], rf: [-0.16, F, 0.02], lfp: 0, rfp: 0, pel: [0, 0.92, 0.02], bh: 0, bw: [0, 1.32, w - 0.14], cue: 'La fuerza sale de piernas y tronco firme' });
    var vu = o(pa, { lh: [0.13, 1.25, 0.55], rh: [-0.13, 1.25, 0.55], bh: 0, bw: [0, 1.25, 1.0], cue: 'Recibe amortiguando' });
    var re = o(b, { bh: 1, bw: [0, 1.25, 0.6], cue: 'Recibe amortiguando' });
    return { cam: 120, rad: 5.2, tz: 0.8, props: [{ t: 'pared', z: w }], dyn: { balon: 1 }, k: [[0, b], [0.5, c], [0.25, l], [0.35, pa], [0.4, vu], [0.25, o(re, { pel: [0, 0.86, -0.02] })], [0.6, b]] };
  }
  EJ.xlanz = pecho(); EJ['xlanz@1'] = pecho(); EJ['xlanz@2'] = pecho(); EJ['xlanz@3'] = pecho();
  // Lanzamiento por encima de la cabeza
  (function () {
    var w = 2.6, b = de({ pel: [0, 0.94, 0], lf: [0.14, F, 0.02], rf: [-0.14, F, 0.02], lh: [0.12, 1.22, 0.24], rh: [-0.12, 1.22, 0.24], lep: [1, -0.6, -0.4], rep: [-1, -0.6, -0.4], bh: 1, bw: [0, 1.2, 0.3], cue: 'Balón de 2–4 kg, frente a la pared' });
    var up = o(b, { lh: [0.12, 1.92, -0.12], rh: [-0.12, 1.92, -0.12], lep: [1, 0.2, 0.3], rep: [-1, 0.2, 0.3], hd: [4, 0, 0], cue: 'Balón arriba con las costillas abajo · sin arquear la zona lumbar' });
    var paso = o(up, { pel: [0, 0.9, 0.18], pr: [-4, 0, 0], lf: [0.14, F, 0.48], lfy: 0, rf: [-0.14, 0.13, 0.0], rfp: 35, lh: [0.12, 1.88, -0.05], rh: [-0.12, 1.88, -0.05], cue: 'Da un paso y lanza al frente exhalando fuerte' });
    var tira = o(paso, { pel: [0, 0.9, 0.28], pr: [22, 0, 0], lh: [0.12, 1.5, 0.85], rh: [-0.12, 1.5, 0.85], lep: [1, -0.2, 0], rep: [-1, -0.2, 0], bh: 0, bw: [0, 1.6, 1.0], cue: 'Da un paso y lanza al frente exhalando fuerte' });
    var vu = o(tira, { pr: [16, 0, 0], bw: [0, 1.7, w - 0.15], cue: 'Recoge y repite' });
    var cae = o(vu, { pel: [0, 0.94, 0.18], pr: [0, 0, 0], lh: [0.2, 0.8, 0.35], rh: [-0.2, 0.8, 0.35], lep: [0.3, -0.3, -1], rep: [-0.3, -0.3, -1], rf: [-0.14, F, 0.3], rfp: 0, lf: [0.14, F, 0.48], bw: [0, 0.13, w - 0.4], cue: 'Recoge y repite' });
    EJ.klanzover = { cam: 120, rad: 5.8, ty: 1.0, tz: 1.0, props: [{ t: 'pared', z: w }], dyn: { balon: 1 }, k: [[0, b], [0.6, b], [0.6, up], [0.3, paso], [0.18, tira], [0.4, vu], [0.6, cae], [0.6, o(cae, { bh: 1, bw: [0, 1.2, 0.5] })], [0.001, b], [0.4, b]] };
  })();
  // Lanzamiento rotacional de pie (pared a la derecha)
  (function () {
    var w = -2.0;
    var b = de({ pel: [0, 0.9, 0], lf: [0.2, F, 0.02], rf: [-0.2, F, 0.02], lfy: 0, rfy: 0, lh: [0.18, 0.95, 0.3], rh: [-0.06, 0.95, 0.35], lep: [1, -0.5, -0.4], rep: [-0.3, -1, -0.4], bh: 1, bw: [0.06, 0.95, 0.4], cue: 'De lado a la pared, balón a la altura de la cadera' });
    var c = o(b, { pel: [0.05, 0.86, 0], pr: [8, 30, 0], ch: [0, 20, 0], lfy: -10, rfy: -30, lh: [0.42, 0.9, 0.0], rh: [0.3, 0.92, 0.12], cue: 'Carga la cadera de atrás · abdomen firme y suelo pélvico activo' });
    var t = o(b, { pel: [-0.06, 0.92, 0], pr: [6, -55, 0], ch: [0, -20, 0], hd: [0, -15, 0], lfy: 60, rfy: 10, lf: [0.2, 0.12, 0.02], lfp: 40, lh: [-0.45, 1.1, 0.5], rh: [-0.55, 1.05, 0.4], bh: 0, bw: [-0.6, 1.1, 0.5], cue: 'Lanza girando la cadera y el pie de atrás · exhala fuerte' });
    var vu = o(t, { bw: [w + 0.15, 1.15, 0.6], cue: 'Pelvis y tronco giran juntos' });
    var vu2 = o(vu, { pel: [0, 0.9, 0], pr: [0, -30, 0], ch: [0, 0, 0], lf: [0.2, F, 0.02], lfp: 0, lh: [-0.2, 1.0, 0.45], rh: [-0.32, 1.0, 0.4], bw: [-1.0, 1.0, 0.55], cue: 'Recibe el rebote' });
    EJ.klanzrotp = { cam: 5, rad: 5.2, tx: -0.6, props: [{ t: 'pared', x: w }], dyn: { balon: 1 }, k: [[0, b], [0.5, b], [0.8, c], [0.25, t], [0.35, vu], [0.4, vu2], [0.3, o(vu2, { bh: 1, bw: [-0.4, 1.0, 0.5] })], [0.6, b]] };
  })();
  // Levantar una caja del suelo, girar con los pies y dejarla en la mesa
  function levantar(silla) {
    var y0 = silla ? 0.45 : 0, caja = [0, y0 + 0.12, 0.38], mesa = [0.9, 0.86, 0.05];
    var b = de({ pel: [0, 0.955, 0], lf: [0.15, F, 0.02], rf: [-0.15, F, 0.02], lhc: [0.22, -0.3, 0.08], rhc: [-0.22, -0.3, 0.08], lep: [0.3, -0.3, -1], rep: [-0.3, -0.3, -1], cb: 0, cw: caja, cy: 0, cue: 'La caja delante de los pies' });
    delete b.lhc; delete b.rhc; b.lh = [0.2, 0.86, 0.1]; b.rh = [-0.2, 0.86, 0.1];
    var p = silla ? 40 : 55, ab = o(b, { pel: M.pelDe([0, silla ? 1.25 : 1.0, 0.18], p), pr: [p, 0, 0], hd: [-20, 0, 0], lh: [0.2, y0 + 0.16, 0.38], rh: [-0.2, y0 + 0.16, 0.38], lep: [1, 0, -0.4], rep: [-1, 0, -0.4], cue: 'Bisagra de cadera y rodillas, espalda neutra' });
    ab.pel[1] -= 0.06;
    var toma = o(ab, { cb: 1, cue: 'Activa el abdomen y exhala al levantar' });
    var arr = o(b, { lh: [0.19, 1.05, 0.28], rh: [-0.19, 1.05, 0.28], lep: [1, -0.5, -0.3], rep: [-1, -0.5, -0.3], cb: 1, cue: 'Caja cerca del cuerpo' });
    var g1 = o(arr, { pr: [0, 45, 0], lfy: 30, lf: [0.18, F, -0.04], rf: [-0.08, 0.13, 0.12], lh: [0.35, 1.05, 0.16], rh: [0.15, 1.05, 0.32], cy: 45, cue: 'Gira con los pies, no con la cintura' });
    var g2 = o(g1, { pr: [0, 90, 0], lfy: 0, rfy: 0, lf: [0.0, F, -0.12], rf: [0.0, F, 0.14], pel: [0.04, 0.955, 0.01], lh: [0.42, 1.05, -0.17], rh: [0.42, 1.05, 0.21], cy: 90, cue: 'Gira con los pies, no con la cintura' });
    var deja = o(g2, { pel: [0.1, 0.93, 0.01], pr: [18, 90, 0], lh: [0.68, 0.94, -0.14], rh: [0.68, 0.94, 0.24], cb: 1, cue: 'Déjala en la mesa' });
    var suelta = o(deja, { cb: 0, cw: [0.72, 0.98, 0.05], cue: 'Déjala en la mesa' });
    var vuelve = o(g2, { cb: 0, cw: [0.72, 0.98, 0.05], lh: [0.42, 0.86, -0.12], rh: [0.42, 0.86, 0.18], cue: 'Y vuelve a empezar' });
    return { cam: 30, el: 18, rad: 4.6, tx: 0.3, dyn: { caja: 1 }, props: [{ t: 'mesa', p: [0.9, 0.05], s: [0.6, 0.86, 0.7] }].concat(silla ? [{ t: 'caja', p: [0, 0.38], s: [0.45, 0.45, 0.4] }] : []),
      k: [[0, b], [0.5, b], [1.2, ab], [0.3, toma], [1.2, arr], [0.6, g1], [0.6, g2], [0.6, deja], [0.3, suelta], [0.6, vuelve], [0.001, o(vuelve, { cw: caja })], [0.001, o(b, { cw: caja })], [0.4, b]] };
  }
  EJ.xlevantar = levantar(false); EJ['xlevantar@1'] = levantar(true); EJ['xlevantar@2'] = levantar(false); EJ['xlevantar@3'] = levantar(false);

  // ---- Saltos ----
  var brazosAtras = { lhc: [0.24, -0.25, -0.3], rhc: [-0.24, -0.25, -0.3], lep: [0.3, 0.5, 1], rep: [-0.3, 0.5, 1] };
  var brazosArriba = { lhc: [0.18, 0.75, 0.25], rhc: [-0.18, 0.75, 0.25], lep: [0.3, -0.5, -1], rep: [-0.3, -0.5, -1] };
  var brazosFrente = { lhc: [0.2, -0.05, 0.45], rhc: [-0.2, -0.05, 0.45], lep: [0.3, -1, -0.3], rep: [-0.3, -1, -0.3] };
  function salto(pies, y, z, extra) { return o({ pel: [pies.x || 0, y, z] }, extra || {}); }
  // Salto al cajón
  (function () {
    var bz = 0.62, bh = 0.55, bf = { lf: [0.15, F, 0.02], rf: [-0.15, F, 0.02], lfy: 8, rfy: -8, lfp: 0, rfp: 0 };
    var de0 = de(o(bf, brazosFrente, { pel: [0, 0.955, 0], cue: 'Frente al cajón, a un paso' }));
    var cm = o(de0, brazosAtras, { pel: [0, 0.72, -0.12], pr: [35, 0, 0], hd: [-20, 0, 0], cue: 'Contramovimiento rápido: cadera y brazos atrás' });
    var desp = o(de0, brazosArriba, { pel: [0, 1.02, 0.08], pr: [6, 0, 0], hd: [0, 0, 0], lf: [0.15, 0.16, 0.06], rf: [-0.15, 0.16, 0.06], lfp: 50, rfp: 50, cue: 'Lanza los brazos arriba y salta' });
    var vu = o(desp, { pel: [0, 1.38, 0.38], pr: [20, 0, 0], lf: [0.15, 0.78, 0.45], rf: [-0.15, 0.78, 0.45], lfp: 10, rfp: 10, pup: 1, cue: 'Lanza los brazos arriba y salta' });
    var at = o(de0, brazosFrente, { pel: [0, bh + 0.74, bz - 0.1], pr: [30, 0, 0], hd: [-15, 0, 0], lf: [0.15, bh + F, bz], rf: [-0.15, bh + F, bz], pup: 0, cue: 'Cae con los dos pies a la vez, en silencio · rodillas alineadas' });
    var arr = o(at, { pel: [0, bh + 0.955, bz], pr: [0, 0, 0], hd: [0, 0, 0], cue: 'Ponte de pie' });
    var b1 = o(arr, { pel: [0.02, bh + 0.92, bz - 0.15], rf: [-0.15, 0.3, bz - 0.4], rfp: 10, cue: 'Baja caminando y descansa 20 s' });
    var b2 = o(b1, { pel: [0.03, 0.97, bz - 0.36], lf: [0.15, bh + F, bz], rf: [-0.15, F, -0.25], rfp: 0, cue: 'Baja caminando y descansa 20 s' });
    var b3 = o(b2, { pel: [0, 0.955, -0.1], lf: [0.15, F, 0.02], rf: [-0.15, F, -0.1], cue: 'Baja caminando y descansa 20 s' });
    EJ.cajon = { cam: 70, rad: 5, ty: 0.9, tz: 0.3, props: [{ t: 'caja', p: [0, bz + 0.05], s: [0.55, bh, 0.45] }],
      k: [[0, de0], [0.6, de0], [0.4, cm], [0.18, desp], [0.18, vu], [0.2, at], [0.6, at], [0.6, arr], [0.4, arr], [0.5, b1], [0.5, b2], [0.5, b3], [0.6, o(de0, { pel: [0, 0.955, 0] })]] };
  })();
  // Skater / caída lateral
  (function () {
    var x = 0.42, aterr = function (s) { return de({ pel: [s * (x - 0.08), 0.74, -0.12], pr: [30, 0, -s * 6], hd: [-15, 0, 0], lf: s > 0 ? [x + 0.02, F, 0.02] : [-x + 0.3, 0.35, -0.3], rf: s > 0 ? [x - 0.3, 0.35, -0.3] : [-x - 0.02, F, 0.02], lfy: 6, rfy: -6, lfp: s > 0 ? 0 : 50, rfp: s > 0 ? 50 : 0,
      lhc: [0.24, -0.1, 0.35 * (s > 0 ? -0.2 : 1)], rhc: [-0.24, -0.1, 0.35 * (s > 0 ? 1 : -0.2)], lep: [0.3, -1, -0.5], rep: [-0.3, -1, -0.5], cue: 'Cae sobre el antepié, cadera atrás, rodilla alineada · aguanta 2 s' }); };
    var L = aterr(1), R = aterr(-1);
    var vuelo = function (s) { return o(s > 0 ? R : L, { pel: [0, 1.05, -0.02], pr: [12, 0, 0], lf: [0.25, 0.35, -0.05], rf: [-0.25, 0.35, -0.05], lfp: 30, rfp: 30, cue: 'Salta de lado lo más lejos que puedas' }); };
    var empR = o(R, { pel: [-(x - 0.12), 0.82, -0.08], cue: 'Salta de lado lo más lejos que puedas' }), empL = o(L, { pel: [x - 0.12, 0.82, -0.08], cue: 'Salta de lado lo más lejos que puedas' });
    EJ.skater = { cam: 10, rad: 5, k: [[0, R], [2, R], [0.25, empR], [0.3, vuelo(1)], [0.25, L], [2, L], [0.25, empL], [0.3, vuelo(-1)], [0.25, R]] };
  })();
  // Salto de ataque: aproximación de 3 pasos (izquierda-derecha-izquierda)
  (function () {
    var z0 = -1.3, c = 'Aproximación de 3 pasos: izquierda, derecha, izquierda';
    var p0 = de(o(brazosFrente, { pel: [0, 0.94, z0], pr: [8, 0, 0], lf: [0.12, F, z0], rf: [-0.12, F, z0], cue: c }));
    var s1 = o(p0, { pel: [0, 0.94, z0 + 0.3], pr: [14, 0, 0], lf: [0.12, F, z0 + 0.5], rf: [-0.12, 0.14, z0 + 0.05], rfp: 30, cue: c });
    var s2 = o(s1, brazosAtras, { pel: [0, 0.82, z0 + 1.15], pr: [22, 0, 0], lf: [0.12, 0.2, z0 + 0.75], lfp: 40, rf: [-0.12, F, z0 + 1.4], rfp: -15, cue: 'Penúltimo paso largo y rápido, brazos atrás' });
    var s3 = o(s2, brazosAtras, { pel: [0, 0.7, z0 + 1.5], pr: [32, 0, 0], hd: [-15, 0, 0], lf: [0.17, F, z0 + 1.62], rf: [-0.15, F, z0 + 1.48], lfp: 0, rfp: 0, lfy: -10, cue: 'Junta los pies, baja la cadera y lanza los brazos arriba' });
    var up = o(s3, brazosArriba, { pel: [0, 1.05, z0 + 1.62], pr: [4, 0, 0], hd: [5, 0, 0], lf: [0.15, 0.18, z0 + 1.66], rf: [-0.15, 0.18, z0 + 1.6], lfp: 55, rfp: 55, lfy: 0, cue: 'Despega a dos pies con todo' });
    var air = o(up, { pel: [0, 1.55, z0 + 1.75], pr: [-4, 0, 0], ch: [-8, 15, 0], lf: [0.14, 0.72, z0 + 1.6], rf: [-0.14, 0.72, z0 + 1.6], lfp: 40, rfp: 40, lhc: [0.3, 0.6, 0.45], rhc: [-0.26, 0.62, -0.2], rep: [-0.6, -0.2, -0.6], cue: 'Arriba: brazo de ataque atrás y codo alto' });
    var hit = o(air, { pel: [0, 1.52, z0 + 1.8], ch: [12, -15, 0], lhc: [0.24, -0.1, 0.3], rhc: [-0.12, 0.85, 0.3], rep: [-0.6, -0.2, -1], cue: 'Remata' });
    var land = o(s3, brazosFrente, { pel: [0, 0.75, z0 + 1.72], pr: [28, 0, 0], ch: [0, 0, 0], lf: [0.17, F, z0 + 1.85], rf: [-0.17, F, z0 + 1.85], lfy: 8, rfy: -8, cue: 'Cae con los dos pies a la vez, rodillas sobre los pies, en silencio' });
    var st = o(land, { pel: [0, 0.94, z0 + 1.85], pr: [4, 0, 0], hd: [0, 0, 0], cue: 'Vuelve a tu posición y descansa solo 5–10 s' });
    EJ.vsalto = { cam: 75, rad: 5.8, ty: 1.0, followz: true, k: [[0, p0], [0.6, p0], [0.35, s1], [0.3, s2], [0.18, s3], [0.15, up], [0.22, air], [0.12, hit], [0.3, land], [0.5, land], [0.6, st], [1.2, st]] };
  })();
  // Salto de bloqueo con desplazamiento (alterna calle y diagonal)
  (function () {
    var manos = { lhc: [0.24, 0.32, 0.25], rhc: [-0.24, 0.32, 0.25], lep: [0.6, -1, -0.3], rep: [-0.6, -1, -0.3] };
    function base(x, cue) { return de(o(manos, { pel: [x, 0.9, 0], pr: [6, 0, 0], lf: [x + 0.17, F, 0.02], rf: [x - 0.17, F, 0.02], cue: cue })); }
    function bloqueo(dx, diag) {
      var c0 = base(0, 'De frente a la red, manos a la altura de los hombros'), x = dx;
      var p1 = o(c0, { pel: [x * 0.45, 0.88, 0], lf: dx > 0 ? [0.17 + x * 0.55, 0.12, 0.02] : c0.lf, rf: dx < 0 ? [-0.17 + x * 0.55, 0.12, 0.02] : c0.rf, cue: 'Desplázate 1–2 pasos laterales' });
      var p2 = base(x, 'Desplázate 1–2 pasos laterales');
      var cg = o(p2, { pel: [x, 0.72, -0.06], pr: [24, 0, 0], cue: 'Carga y salta a dos pies' });
      var up = o(p2, { pel: [x, 1.32, 0.04], pr: [-2, diag ? -dx * 12 : 0, 0], ch: [0, diag ? -dx * 14 : 0, 0], lf: [x + 0.15, 0.36, 0.0], rf: [x - 0.15, 0.36, 0.0], lfp: 45, rfp: 45,
        lhc: [0.17, 0.82, 0.33], rhc: [-0.17, 0.82, 0.33], lep: [0.6, -1, -0.3], rep: [-0.6, -1, -0.3], cue: diag ? 'Diagonal: gira las manos hacia el centro de la cancha' : 'Calle: sube con las manos cerrando la línea' });
      var cae = o(cg, { pel: [x, 0.76, -0.04], cue: 'Cae en el mismo lugar, estable 1 s · sin irte adelante' });
      var vuelta = o(c0, { cue: 'Vuelve al centro' });
      return [[0.35, p1], [0.3, p2], [0.2, cg], [0.25, up], [0.3, up], [0.25, cae], [1, cae], [0.7, vuelta], [0.4, vuelta]];
    }
    var c0 = base(0, 'De frente a la red, manos a la altura de los hombros');
    EJ.vbloqueo = { cam: 15, rad: 5.2, ty: 1.0, k: [[0, c0], [0.6, c0]].concat(bloqueo(0.6, false), bloqueo(-0.6, true), bloqueo(0.6, true), bloqueo(-0.6, false)) };
  })();
  // Paso cruzado: base → empuje con la pierna de adentro → la rodilla de afuera cruza por delante → aceleración corta
  (function () {
    var b = de({ pel: [0, 0.76, -0.08], pr: [26, 0, 0], hd: [-12, 0, 0], lf: [0.32, F, 0.04], rf: [-0.32, F, 0.04], lfy: 8, rfy: -8, lhc: [0.24, -0.15, 0.3], rhc: [-0.24, -0.15, 0.3], lep: [0.3, -1, -0.5], rep: [-0.3, -1, -0.5], cue: 'Base atlética, peso en el borde interno del pie' });
    var gira = o(b, { pel: [0.16, 0.8, -0.06], pr: [24, 40, 0], ch: [0, -20, 0], lfy: 30, cue: 'Empuja con la pierna de adentro y cruza la rodilla de afuera por delante' });
    var cruza = o(gira, { pel: [0.36, 0.84, -0.02], pr: [30, 70, 0], ch: [0, -15, 0], rf: [0.2, 0.32, 0.22], rfp: -10, rfy: -20, rkp: [1, 0, 0.2], lhc: [0.22, -0.2, -0.25], rhc: [-0.22, 0.05, 0.4], cue: '«Como si rompieras un vidrio» · hombros y brazos contrarrotan' });
    var ap = o(cruza, { pel: [0.62, 0.84, 0.0], pr: [28, 85, 0], ch: [0, 0, 0], rf: [0.78, F, 0.02], rfp: 0, rfy: -85, lf: [0.4, 0.14, 0.05], lfp: 40, lfy: -80, lhc: [0.22, 0.0, 0.35], rhc: [-0.22, -0.2, -0.2], cue: 'Sal con una aceleración corta de 3–5 m' });
    var a2 = o(ap, { pel: [1.05, 0.88, 0.0], pr: [22, 88, 0], lf: [1.25, F, 0.12], lfp: 0, lfy: -88, rf: [0.85, 0.16, -0.05], rfp: 40, lhc: [0.22, -0.2, -0.2], rhc: [-0.22, 0.0, 0.35], cue: 'Sal con una aceleración corta de 3–5 m' });
    var a3 = o(a2, { pel: [1.5, 0.9, 0.0], rf: [1.72, F, -0.1], rfp: 0, lf: [1.3, 0.16, 0.1], lfp: 40, lhc: [0.22, 0.0, 0.35], rhc: [-0.22, -0.2, -0.2], cue: 'Cada repetición al 100 %' });
    var K = [[0, b], [0.8, b], [0.18, gira], [0.16, cruza], [0.16, ap], [0.18, a2], [0.18, a3], [0.8, a3]];
    var K2 = M.esp(K).map(function (k, i) { return [i ? k[0] : 0.001, k[1]]; });
    EJ.mdcross = { cam: 0, rad: 6, follow: true, k: K.concat([[0.001, b], [0.5, b]]).concat(K2).concat([[0.001, b], [0.5, b]]) };
  })();
})();

/* ---------- Movilidad, rodillo y circuitos (ejercicios compuestos) ---------- */
(function () {
  var M = window.MQ, F = M.F, o = M.o, EJ = window.MQ_EJ, de = M.de, D = Math.PI / 180, sup = M.sup, cuatro = M.cuatro;
  var plano = { lhw: [-90, 0, 0], rhw: [-90, 0, 0] }, une = M.une;
  function rodK(kz) { return { lf: [0.12, F, kz - 0.44], rf: [-0.12, F, kz - 0.44], lfp: 160, rfp: 160, lfy: 0, rfy: 0, lkp: [0, -1, 0.15], rkp: [0, -1, 0.15], pup: 0 }; }
  function ida(a, b, t, n) { var K = [[0, a]]; for (var i = 0; i < (n || 2); i++) K.push([t, b], [t, a]); return K; }
  var X = {};   // piezas
  // -- rodillo --
  var sentado = de({ pel: [0, 0.27, 0], pr: [-28, 0, 0], hd: [10, 0, 0], lh: [0.24, 0.025, -0.38], rh: [-0.24, 0.025, -0.38], lep: [0.3, 0, -1], rep: [-0.3, 0, -1], lf: [0.1, 0.2, 0.86], rf: [-0.1, 0.2, 0.86], lfp: -60, rfp: -60, lfy: 0, rfy: 0, lkp: [0, 1, 0], rkp: [0, 1, 0], rw: [0, 0.075, 0.62], ry: 0 });
  X.gemelos = { cam: 75, el: 18, ty: 0.3, rad: 4.4, dyn: { rodillo: 1 }, k: ida(o(sentado, { cue: 'Rodillo en gemelos: rueda lento del tendón de Aquiles a la corva' }), o(sentado, { pel: [0, 0.27, -0.2], lh: [0.24, 0.025, -0.58], rh: [-0.24, 0.025, -0.58], lf: [0.1, 0.22, 0.66], rf: [-0.1, 0.22, 0.66], cue: 'Cruza la otra pierna encima para dar más presión' }), 1.4) };
  X.isquios = { cam: 75, el: 18, ty: 0.3, rad: 4.4, dyn: { rodillo: 1 }, k: ida(o(sentado, { pel: [0, 0.27, -0.05], rw: [0, 0.075, 0.3], lf: [0.1, 0.13, 0.8], rf: [-0.1, 0.13, 0.8], cue: 'Rodillo en isquiotibiales: de la rodilla a la cadera' }), o(sentado, { pel: [0, 0.27, 0.12], rw: [0, 0.075, 0.3], lh: [0.24, 0.025, -0.21], rh: [-0.24, 0.025, -0.21], lf: [0.1, 0.13, 0.97], rf: [-0.1, 0.13, 0.97], cue: 'En la zona poplítea, presión suave y sostenida' }), 1.4) };
  var pron = de(o(plano, { pel: [0, 0.27, 0], pr: [84, 0, 0], hd: [-5, 0, 0], lh: [0.2, 0.025, 0.86], rh: [-0.2, 0.025, 0.86], lep: [0.1, -1, 0], rep: [-0.1, -1, 0], lf: [0.12, 0.13, -0.82], rf: [-0.12, 0.13, -0.82], lfp: 120, rfp: 120, lfy: 0, rfy: 0, lkp: [0, -1, 0], rkp: [0, -1, 0], rw: [0, 0.075, -0.3] }));
  X.cuads = { cam: 75, el: 18, ty: 0.3, rad: 4.6, dyn: { rodillo: 1 }, k: ida(o(pron, { cue: 'Rodillo en cuádriceps: boca abajo, apoyado en los antebrazos' }), o(pron, { pel: [0, 0.27, 0.22], lf: [0.12, 0.13, -0.6], rf: [-0.12, 0.13, -0.6], rw: [0, 0.075, -0.3], cue: 'De la rodilla a la cadera, lento' }), 1.4) };
  var esp = de({ pel: [0, 0.3, 0.12], pr: [-104, 0, 0], hd: [12, 0, 0], lhc: [0.1, 0.47, -0.06], rhc: [-0.1, 0.47, -0.06], lep: [1, 0.2, 0], rep: [-1, 0.2, 0], lf: [0.17, F, 0.6], rf: [-0.17, F, 0.6], lfy: 0, rfy: 0, lkp: [0, 1, 0.3], rkp: [0, 1, 0.3], rw: [0, 0.075, -0.3] });
  X.espalda = { cam: 75, el: 18, ty: 0.3, rad: 4.4, dyn: { rodillo: 1 }, k: ida(o(esp, { cue: 'Rodillo bajo la espalda alta, manos detrás de la cabeza' }), o(esp, { pel: [0, 0.3, 0.0], ch: [-14, 0, 0], hd: [-6, 0, 0], cue: 'Extiéndete sobre él en 3–4 alturas' }), 1.5) };
  X.gluteo = { cam: 40, el: 18, ty: 0.35, rad: 4.4, dyn: { balon: 'chico' }, k: ida(de({ pel: [0, 0.32, 0], pr: [-22, 0, 0], hd: [10, 0, 0], lh: [0.26, 0.025, -0.35], rh: [-0.26, 0.025, -0.35], lep: [0.3, 0, -1], rep: [-0.3, 0, -1], lf: [-0.04, 0.38, 0.36], lfp: 0, lfy: -70, lkp: [1, 0.4, 0.2], rf: [-0.16, F, 0.45], rfy: 0, rkp: [0, 1, 0.4], bh: 0, bw: [0.1, 0.11, -0.04], cue: 'Pelotita en glúteo: cruza el tobillo sobre la rodilla' }),
    de({ pel: [-0.03, 0.32, 0.06], pr: [-22, 0, 4], hd: [10, 0, 0], lh: [0.26, 0.025, -0.35], rh: [-0.26, 0.025, -0.35], lep: [0.3, 0, -1], rep: [-0.3, 0, -1], lf: [-0.04, 0.38, 0.36], lfp: 0, lfy: -70, lkp: [1, 0.4, 0.2], rf: [-0.16, F, 0.45], rfy: 0, rkp: [0, 1, 0.4], bh: 0, bw: [0.1, 0.11, -0.04], cue: 'Llega a los rotadores profundos, 30–45 s por lado' }), 1.5) };
  var boca = de(o({ pel: [0, 0.12, 0], pr: [90, 0, 0], hd: [10, 0, 0], lf: [0.13, 0.06, -0.85], rf: [-0.13, 0.06, -0.85], lfp: 160, rfp: 160, lfy: 0, rfy: 0, lkp: [0, -1, 0], rkp: [0, -1, 0] }, { lh: [0.08, 0.06, 0.78], rh: [-0.08, 0.06, 0.78], lep: [1, 0, 0.2], rep: [-1, 0, 0.2], lhw: [-90, 0, -30], rhw: [-90, 0, 30] }));
  X.psoas = { cam: 70, el: 22, ty: 0.25, rad: 4.4, k: ida(o(boca, { cue: 'Kettlebell invertida en psoas: boca abajo, asa en el abdomen' }), o(boca, { pel: [0, 0.13, 0], cue: 'Respira lento: deja que el peso entre al exhalar' }), 2) };
  X.cocodrilo = { cam: 70, el: 22, ty: 0.25, rad: 4.4, k: ida(o(boca, { cue: 'Boca abajo, frente sobre las manos' }), o(boca, { pel: [0, 0.135, -0.005], sp: [-2, 0, 0], cue: 'Inhala a la espalda baja y a los costados · exhala lento 6–8 s' }), 2.5) };
  X.pie = { cam: 40, ty: 0.6, dyn: { balon: 'chico' }, k: ida(de({ lhc: [0.2, -0.29, 0.06], rhc: [-0.2, -0.29, 0.06], lep: [1, -0.3, -0.6], rep: [-1, -0.3, -0.6], pel: [-0.05, 0.94, 0], lf: [0.12, 0.17, 0.05], lfp: 0, bh: 0, bw: [0.12, 0.06, 0.12], cue: 'Pelota bajo la planta del pie, 30 s por pie' }), de({ lhc: [0.2, -0.29, 0.06], rhc: [-0.2, -0.29, 0.06], lep: [1, -0.3, -0.6], rep: [-1, -0.3, -0.6], pel: [-0.05, 0.94, 0], lf: [0.12, 0.17, -0.07], lfp: 0, bh: 0, bw: [0.12, 0.06, 0.12], cue: 'Rueda lento del talón a los dedos' }), 1.2) };
  // -- respiración 90/90 con pies en la pared --
  var r90 = o(sup, { lf: [0.12, 0.6, 0.5], rf: [-0.12, 0.6, 0.5], lfp: -90, rfp: -90, lkp: [0, 1, 0], rkp: [0, 1, 0], lhc: [0.17, 0.04, 0.13], rhc: [-0.17, 0.04, 0.13], lep: [1, 0.3, 0], rep: [-1, 0.3, 0] });
  X.resp90 = { cam: 115, el: 18, ty: 0.3, rad: 4.4, props: [{ t: 'pared', z: 0.6 }], k: [[0, o(r90, { cue: 'Boca arriba, pies en la pared, cadera y rodillas a 90°' })], [4, o(r90, { ch: [-3, 0, 0], cue: 'Inhala 4 s por la nariz, costillas hacia los lados' })], [6, o(r90, { cue: 'Exhala 6–8 s: cierra y eleva el piso pélvico' })]] };
  // -- cuatro apoyos --
  X.gato = { cam: 90, el: 16, ty: 0.42, rad: 4.4, k: ida(o(cuatro, { pel: [0, 0.62, -0.32], pr: [72, 0, 0], sp: [10, 0, 0], ch: [8, 0, 0], hd: [24, 0, 0], cue: 'Gato: redondea la espalda despacio' }), o(cuatro, { pel: [0, 0.58, -0.32], pr: [100, 0, 0], sp: [-8, 0, 0], ch: [-6, 0, 0], hd: [-26, 0, 0], cue: 'Camello: extiende la espalda sin forzar' }), 1.6) };
  X.torac = { cam: 30, el: 22, ty: 0.42, rad: 4.4, k: ida(o(cuatro, { lhc: [0.08, 0.46, -0.08], lhw: [0, 0, 0], lep: [1, 0, -0.3], ch: [0, -25, 0], hd: [0, -15, 0], cue: 'Rotación torácica en 4 apoyos: mano detrás de la cabeza' }), o(cuatro, { lhc: [0.08, 0.46, -0.08], lhw: [0, 0, 0], lep: [1, 0.6, -0.3], ch: [0, 45, 0], hd: [0, 30, 0], cue: 'Abre el codo al techo siguiéndolo con la mirada' }), 1.3) };
  X.torac.k.forEach(function (k) { delete k[1].lh; });
  // -- puente --
  var pu = o(sup, { lf: [0.15, F, 0.42], rf: [-0.15, F, 0.42], lfp: 0, rfp: 0, lfy: 0, rfy: 0, lkp: [0, 1, 0.3], rkp: [0, 1, 0.3], la: [0, 0, 20], ra: [0, 0, -20] });
  X.puente = { cam: 75, el: 16, ty: 0.3, rad: 4.4, k: [[0, o(pu, { cue: 'Puente glúteo: pies apoyados, abdomen firme' })], [1, o(pu, { pel: [0, 0.33, 0.06], pr: [-110, 0, 0], hd: [18, 0, 0], cue: 'Empuja con los talones: rodilla, cadera y hombro alineados · 2 s arriba' })], [2, o(pu, { pel: [0, 0.33, 0.06], pr: [-110, 0, 0], hd: [18, 0, 0], cue: 'Costillas abajo, aprieta los glúteos' })], [1.2, o(pu, { cue: 'Baja controlado' })]] };
  // -- Pallof press (banda a la izquierda) --
  (function () {
    var anc = [1.1, 1.2, 0.1], b = de({ pel: [0, 0.9, 0], lf: [0.18, F, 0.02], rf: [-0.18, F, 0.02], lh: [0.03, 1.2, 0.18], rh: [-0.03, 1.2, 0.18], lep: [0.4, -1, -0.3], rep: [-0.4, -1, -0.3], cue: 'Pallof press: banda a la altura del pecho, de lado' });
    var e = o(b, { lh: [0.03, 1.22, 0.58], rh: [-0.03, 1.22, 0.58], lep: [0.4, -1, 0], rep: [-0.4, -1, 0], cue: 'Extiende los brazos y aguanta 2 s sin que el tronco gire' });
    X.pallof = { cam: 20, ty: 0.85, dyn: { banda: [['mh', anc]] }, props: [{ t: 'ancla', p: [anc[0], anc[2]], y: anc[1] }], k: [[0, b], [0.4, b], [0.8, e], [2, e], [0.9, b]] };
  })();
  // -- de pie --
  var cad = M.cad;
  X.sentLibre = { cam: 35, k: ida(de(o(M.frente, { lf: [0.17, F, 0.02], rf: [-0.17, F, 0.02], lfy: 14, rfy: -14, lep: [0.4, -1, -0.3], rep: [-0.4, -1, -0.3], cue: 'Sentadilla con los brazos al frente' })), de(o(M.frente, { pel: [0, 0.6, -0.18], pr: [32, 0, 0], hd: [-20, 0, 0], lf: [0.17, F, 0.02], rf: [-0.17, F, 0.02], lfy: 14, rfy: -14, lep: [0.4, -1, -0.3], rep: [-0.4, -1, -0.3], cue: 'Cadera atrás y abajo, rodillas sobre los pies' })), 1.3) };
  X.bisagra = { cam: 75, k: ida(de(o(cad, { cue: 'Bisagra de cadera: manos en la cintura, rodillas suaves' })), de(o(cad, { pel: M.pelDe([0, 1.08, 0.12], 55), pr: [55, 0, 0], hd: [-15, 0, 0], cue: 'Cadera atrás con la espalda neutra' })), 1.3) };
  X.hombros = { cam: 20, k: (function () { var b = de({ la: [0, 0, 8], ra: [0, 0, -8], le: -8, re: -8, ch: [0, 0, 0] }), K = [[0, o(b, { cue: 'Círculos de hombros hacia atrás' })]]; [[-8, 0, 8], [-5, 0, 8], [0, 0, 8]].forEach(function () {}); for (var i = 0; i < 3; i++) K.push([0.5, o(b, { ch: [-4, 0, 0], la: [-10, 0, 14], ra: [-10, 0, -14], cue: 'Círculos de hombros ×10 hacia atrás y ×10 hacia adelante' })], [0.5, o(b, { ch: [3, 0, 0], la: [10, 0, 10], ra: [10, 0, -10], cue: 'Círculos de hombros ×10 hacia atrás y ×10 hacia adelante' })]); return K; })() };
  X.rotTronco = { cam: 10, k: ida(de({ lhc: [0.12, 0.12, 0.3], rhc: [-0.12, 0.12, 0.3], lep: [1, -0.3, 0], rep: [-1, -0.3, 0], pr: [0, 10, 0], ch: [0, 30, 0], hd: [0, 15, 0], cue: 'Rotaciones de tronco de pie' }), de({ lhc: [0.12, 0.12, 0.3], rhc: [-0.12, 0.12, 0.3], lep: [1, -0.3, 0], rep: [-1, -0.3, 0], pr: [0, -10, 0], ch: [0, -30, 0], hd: [0, -15, 0], cue: 'Gira de un lado al otro sin forzar' }), 0.9) };
  X.rodillas = { cam: 35, k: [[0, de(o(cad, { cue: 'Elevación de rodillas' }))], [0.45, de(o(cad, { lf: [0.12, 0.5, 0.42], lfp: -10, lkp: [0, 0, 1], cue: 'Elevación de rodillas ×10 por pierna' }))], [0.45, de(o(cad, {}))], [0.45, de(o(cad, { rf: [-0.12, 0.5, 0.42], rfp: -10, rkp: [0, 0, 1], cue: 'Elevación de rodillas ×10 por pierna' }))], [0.45, de(o(cad, {}))]] };
  X.marcha = { cam: 35, k: M.rep([[0.35, de({ lf: [0.12, 0.3, 0.2], lfp: -5, la: [20, 0, 6], ra: [-25, 0, -6], le: -60, re: -60, cue: 'Marcha en el lugar subiendo de a poco el ritmo' })], [0.35, de({ la: [0, 0, 6], ra: [0, 0, -6], le: -60, re: -60, cue: 'Marcha en el lugar subiendo de a poco el ritmo' })], [0.35, de({ rf: [-0.12, 0.3, 0.2], rfp: -5, la: [-25, 0, 6], ra: [20, 0, -6], le: -60, re: -60, cue: 'Marcha en el lugar subiendo de a poco el ritmo' })], [0.35, de({ la: [0, 0, 6], ra: [0, 0, -6], le: -60, re: -60, cue: 'Marcha en el lugar subiendo de a poco el ritmo' })]], 3) };
  X.marcha.k.unshift([0, de({ le: -60, re: -60 })]);
  // -- estiramientos --
  var cab = de(o(cad, { pel: [0, 0.55, -0.06], lf: [0.12, F, 0.42], rf: [-0.12, F, -0.5], rfp: 160, lfy: 4, rfy: 0, rkp: [0, -1, 0.2] }));
  X.flexor = { cam: 75, k: ida(o(cab, { cue: 'Flexor de cadera: rodilla de atrás en el suelo' }), o(cab, { pel: [0, 0.53, 0.06], pr: [-4, 0, 0], cue: 'Lleva la cadera adelante apretando el glúteo de atrás · 30 s' }), 2) };
  X.isquio = { cam: 75, props: [{ t: 'caja', p: [0, 0.58], s: [0.4, 0.3, 0.3] }], k: ida(de(o(cad, { pel: [0, 0.95, -0.04], lf: [0.12, 0.38, 0.6], lfp: -45, lkp: [0, 1, 0.2], cue: 'Isquiotibiales: talón en el escalón, pierna estirada' })), de(o(cad, { pel: M.pelDe([0, 1.32, 0.18], 35), pr: [35, 0, 0], lf: [0.12, 0.38, 0.6], lfp: -45, lkp: [0, 1, 0.2], cue: 'Cadera atrás con la espalda recta · 30 s por lado' })), 2) };
  X.pecho = { cam: 20, props: [{ t: 'pared', x: 0.62 }], k: ida(de({ lh: [0.6, 1.45, 0.05], lhw: [0, 0, -90], lep: [0, -1, 0], rhc: [-0.2, -0.29, 0.06], rep: [-1, -0.3, -0.6], pel: [0.05, 0.955, 0], cue: 'Pecho en la pared: brazo apoyado' }), de({ lh: [0.6, 1.45, 0.05], lhw: [0, 0, -90], lep: [0, -1, 0], rhc: [-0.2, -0.29, 0.06], rep: [-1, -0.3, -0.6], pel: [0.05, 0.955, 0.03], pr: [0, -25, 0], lfy: -15, rfy: -35, cue: 'Gira el cuerpo hacia el lado contrario · 30 s por lado' }), 2) };
  X.tobillo = { cam: 115, props: [{ t: 'pared', z: 0.55 }], k: ida(de({ pel: [0, 0.92, -0.06], lf: [0.11, F, 0.3], rf: [-0.11, F, -0.3], lh: [0.2, 1.3, 0.54], rh: [-0.2, 1.3, 0.54], lhw: [0, 0, 180], rhw: [0, 0, 180], lep: [0.5, -1, -0.3], rep: [-0.5, -1, -0.3], cue: 'Movilidad de tobillo: rodilla a la pared' }), de({ pel: [0, 0.86, 0.06], lf: [0.11, F, 0.3], rf: [-0.11, F, -0.3], lh: [0.2, 1.3, 0.54], rh: [-0.2, 1.3, 0.54], lhw: [0, 0, 180], rhw: [0, 0, 180], lep: [0.5, -1, -0.3], rep: [-0.5, -1, -0.3], cue: 'La rodilla toca la pared sin levantar el talón · ×10 por lado' }), 1) };
  X.respPie = { cam: 30, k: [[0, de(o(M.pecho, { lhc: [0.16, 0.04, 0.14], rhc: [-0.16, 0.04, 0.14], cue: 'Respiración lenta' }))], [4, de(o(M.pecho, { lhc: [0.17, 0.04, 0.15], rhc: [-0.17, 0.04, 0.15], ch: [-3, 0, 0], cue: 'Inhala 4 s' }))], [6, de(o(M.pecho, { lhc: [0.16, 0.04, 0.14], rhc: [-0.16, 0.04, 0.14], cue: 'Exhala 6 s' }))]] };
  X.ab90 = { cam: 40, el: 20, ty: 0.35, k: ida(de({ pel: [0, 0.13, 0], lf: [-0.08, 0.08, 0.5], rf: [-0.62, 0.08, -0.25], lfy: -70, rfy: -100, lkp: [1, 0.5, 0.3], rkp: [-0.3, 0.6, 0.8], lhc: [0.1, 0.05, 0.3], rhc: [-0.1, 0.05, 0.3], lep: [1, -0.5, 0], rep: [-1, -0.5, 0], pr: [4, -15, 0], cue: '90/90 de cadera: tronco erguido' }), de({ pel: [0, 0.13, 0], rf: [0.08, 0.08, 0.5], lf: [0.62, 0.08, -0.25], rfy: 70, lfy: 100, rkp: [-1, 0.5, 0.3], lkp: [0.3, 0.6, 0.8], lhc: [0.1, 0.05, 0.3], rhc: [-0.1, 0.05, 0.3], lep: [1, -0.5, 0], rep: [-1, -0.5, 0], pr: [4, 15, 0], cue: 'Gira las piernas de un lado al otro' }), 1.6) };
  // -- saltos y carrera suaves --
  X.skip = { cam: 50, k: [[0, de({ cue: 'Skipping suave' })]].concat(M.rep([[0.22, de({ pel: [0, 1.0, 0], lf: [0.12, 0.45, 0.35], lfp: -10, lkp: [0, 0, 1], rf: [-0.12, 0.14, 0.0], rfp: 40, la: [35, 0, 8], ra: [-45, 0, -8], le: -80, re: -80, cue: 'Skipping suave 2×20 s' })], [0.22, de({ pel: [0, 0.95, 0], la: [0, 0, 8], ra: [0, 0, -8], le: -80, re: -80, cue: 'Skipping suave 2×20 s' })], [0.22, de({ pel: [0, 1.0, 0], rf: [-0.12, 0.45, 0.35], rfp: -10, rkp: [0, 0, 1], lf: [0.12, 0.14, 0.0], lfp: 40, la: [-45, 0, 8], ra: [35, 0, -8], le: -80, re: -80, cue: 'Skipping suave 2×20 s' })], [0.22, de({ pel: [0, 0.95, 0], la: [0, 0, 8], ra: [0, 0, -8], le: -80, re: -80, cue: 'Skipping suave 2×20 s' })]], 3)) };
  X.zancadas = { cam: 70, k: ida(de(o(cad, { cue: 'Zancadas ×6 por lado' })), de(o(cad, { pel: [0, 0.55, 0.2], lf: [0.11, F, 0.62], rf: [-0.11, 0.14, -0.3], rfp: 60, cue: 'Paso largo, rodilla de atrás cerca del suelo · tronco erguido' })), 0.9) };
  X.saltitos = { cam: 30, k: [[0, de({ cue: 'Saltitos en el lugar' })]].concat(M.rep([[0.2, de({ pel: [0, 0.89, 0], cue: 'Saltitos en el lugar 2×20 s' })], [0.18, de({ pel: [0, 1.04, 0], lf: [0.12, 0.13, 0.02], rf: [-0.12, 0.13, 0.02], lfp: 40, rfp: 40, cue: 'Saltitos en el lugar 2×20 s' })]], 5)) };
  X.snap = { cam: 40, k: [[0, de(o(M.arriba, { pel: [0, 0.99, 0], lf: [0.14, 0.14, 0.02], rf: [-0.14, 0.14, 0.02], lfp: 40, rfp: 40, cue: 'Snap-down: de puntillas con los brazos arriba' }))], [0.6, de(o(M.arriba, { pel: [0, 0.99, 0], lf: [0.14, 0.14, 0.02], rf: [-0.14, 0.14, 0.02], lfp: 40, rfp: 40, cue: 'Snap-down: de puntillas con los brazos arriba' }))],
    [0.2, de({ pel: [0, 0.72, -0.12], pr: [32, 0, 0], hd: [-15, 0, 0], lf: [0.17, F, 0.02], rf: [-0.17, F, 0.02], lfy: 10, rfy: -10, lhc: [0.24, -0.25, -0.25], rhc: [-0.24, -0.25, -0.25], lep: [0.3, 0.5, 1], rep: [-0.3, 0.5, 1], cue: 'Baja de golpe a la posición de aterrizaje y congela 2 s' })], [2, de({ pel: [0, 0.72, -0.12], pr: [32, 0, 0], hd: [-15, 0, 0], lf: [0.17, F, 0.02], rf: [-0.17, F, 0.02], lfy: 10, rfy: -10, lhc: [0.24, -0.25, -0.25], rhc: [-0.24, -0.25, -0.25], lep: [0.3, 0.5, 1], rep: [-0.3, 0.5, 1], cue: 'Rodillas sobre los pies, tronco quieto' })], [0.8, de(o(M.arriba, { cue: 'Snap-down: de puntillas con los brazos arriba' }))]] };
  X.hop = { cam: 70, k: [[0, de(o(cad, { pel: [0.06, 0.95, -0.2], lf: [0.1, F, -0.2], rf: [-0.1, 0.3, -0.3], rfp: 20, cue: 'Hop and stick: sobre una pierna' }))], [0.5, de(o(cad, { pel: [0.06, 0.82, -0.25], pr: [20, 0, 0], lf: [0.1, F, -0.2], rf: [-0.1, 0.3, -0.35], rfp: 20, cue: 'Salto corto a una pierna' }))], [0.25, de(o(cad, { pel: [0.06, 1.08, 0.05], pr: [6, 0, 0], lf: [0.1, 0.25, 0.0], lfp: 30, rf: [-0.1, 0.38, -0.1], rfp: 20, cue: 'Salto corto a una pierna' }))], [0.25, de(o(cad, { pel: [0.06, 0.8, 0.18], pr: [24, 0, 0], hd: [-10, 0, 0], lf: [0.1, F, 0.25], rf: [-0.1, 0.32, 0.12], rfp: 20, cue: 'Cae en la misma pierna y aguanta 2 s · rodilla sobre el pie' }))], [2, de(o(cad, { pel: [0.06, 0.82, 0.18], pr: [22, 0, 0], hd: [-10, 0, 0], lf: [0.1, F, 0.25], rf: [-0.1, 0.32, 0.12], rfp: 20, cue: 'Cae en la misma pierna y aguanta 2 s · rodilla sobre el pie' }))], [0.8, de(o(cad, { pel: [0.06, 0.95, -0.2], lf: [0.1, F, -0.2], rf: [-0.1, 0.3, -0.3], rfp: 20, cue: 'Vuelve y repite' }))]] };
  X.equil = { cam: -30, props: [{ t: 'pared', x: 0.7 }], k: ida(de({ pel: [0.08, 0.955, 0], lf: [0.12, F, 0.02], rf: [-0.12, F, 0.02], lh: [0.68, 1.15, 0.05], lhw: [0, 0, -90], lep: [0, -1, -0.5], rhc: [-0.2, -0.29, 0.06], rep: [-1, -0.3, -0.6], cue: 'Equilibrio cerca de una pared' }), de({ pel: [0.1, 0.955, 0], lf: [0.12, F, 0.02], rf: [-0.08, 0.32, 0.12], rfp: 10, lh: [0.68, 1.15, 0.05], lhw: [0, 0, -90], lep: [0, -1, -0.5], rhc: [-0.2, -0.29, 0.06], rep: [-1, -0.3, -0.6], cue: 'Sobre una pierna, movimientos lentos, respirando' }), 2.5, 1) };
  X.tandem = { cam: 50, followz: true, k: (function () { var K = [[0, de({ la: [0, 0, 25], ra: [0, 0, -25], le: -10, re: -10, lf: [0.03, F, -0.5], rf: [-0.03, F, -0.75], pel: [0, 0.955, -0.62], cue: 'Camina talón con punta, en línea' })]], z = -0.5, zr = -0.75;
    for (var i = 0; i < 4; i++) { var izq = i % 2 === 1; if (izq) { var nz = zr + 0.26; K.push([0.5, de({ la: [0, 0, 25], ra: [0, 0, -25], le: -10, re: -10, lf: [0.03, 0.15, (z + nz) / 2], rf: [-0.03, F, zr], pel: [0, 0.96, (z + zr) / 2 + 0.06], hd: [0, 30, 0], cue: 'Mira a los lados mientras caminas en línea' })]); z = nz; K.push([0.5, de({ la: [0, 0, 25], ra: [0, 0, -25], le: -10, re: -10, lf: [0.03, F, z], rf: [-0.03, F, zr], pel: [0, 0.955, (z + zr) / 2], hd: [0, 0, 0], cue: 'Mira a los lados mientras caminas en línea' })]); }
      else { var nr = z + 0.26; K.push([0.5, de({ la: [0, 0, 25], ra: [0, 0, -25], le: -10, re: -10, rf: [-0.03, 0.15, (zr + nr) / 2], lf: [0.03, F, z], pel: [0, 0.96, (z + zr) / 2 + 0.06], hd: [0, -30, 0], cue: 'Mira a los lados mientras caminas en línea' })]); zr = nr; K.push([0.5, de({ la: [0, 0, 25], ra: [0, 0, -25], le: -10, re: -10, rf: [-0.03, F, zr], lf: [0.03, F, z], pel: [0, 0.955, (z + zr) / 2], hd: [0, 0, 0], cue: 'Mira a los lados mientras caminas en línea' })]); } }
    return K; })() };
  X.cambio = { cam: 10, rad: 5, k: (function () { var b = de({ pel: [0, 0.76, -0.08], pr: [26, 0, 0], hd: [-12, 0, 0], lf: [0.32, F, 0.04], rf: [-0.32, F, 0.04], lhc: [0.24, -0.15, 0.3], rhc: [-0.24, -0.15, 0.3], lep: [0.3, -1, -0.5], rep: [-0.3, -1, -0.5], cue: 'Cambio de dirección: frena y sal hacia donde te indican' });
    function at(x) { return o(b, { pel: [x, 0.76, -0.08], lf: [x + 0.32, F, 0.04], rf: [x - 0.32, F, 0.04] }); }
    var fr = o(b, { pel: [0.45, 0.68, -0.08], pr: [26, 0, -8], lf: [0.95, F, 0.04], rf: [0.2, F, 0.04], cue: 'Frena con la pierna de afuera, cadera baja' });
    return [[0, b], [0.4, b], [0.3, at(0.3)], [0.25, fr], [0.4, fr], [0.35, at(0.0)], [0.3, at(-0.3)], [0.25, M.espejo(fr)], [0.4, M.espejo(fr)], [0.35, b]]; })() };
  X.paredMarcha = (function () { var an = [0, 0.2, -0.32], u = [0, Math.cos(45 * D), Math.sin(45 * D)], pel = [0, an[1] + 0.9 * u[1], an[2] + 0.9 * u[2]];
    var b = de({ pel: pel, pr: [45, 0, 0], hd: [-5, 0, 0], lf: [0.12, 0.2, -0.32], rf: [-0.12, 0.2, -0.32], lfp: 60, rfp: 60, lfy: 0, rfy: 0, lh: [0.22, 1.32, 0.86], rh: [-0.22, 1.32, 0.86], lhw: [0, 0, 180], rhw: [0, 0, 180], lep: [0.6, -1, -0.3], rep: [-0.6, -1, -0.3], cue: 'Pared: inclínate unos 45° con las manos en la pared' });
    var up = o(b, { lf: [0.12, 0.62, 0.15], lfp: -10, lkp: [0, 0, 1], cue: 'Marching: rodilla arriba y aguanta 2 s' });
    return { cam: 115, props: [{ t: 'pared', z: 0.88 }], k: [[0, b], [0.5, b], [0.5, up], [2, up], [0.5, b], [0.5, M.espejo(up)], [2, M.espejo(up)], [0.5, b]] }; })();
  X.flexPared = (function () { var w = 1.0, an = [0, F, -0.12], U = function (p) { return [0, Math.cos(p * D), Math.sin(p * D)]; };
    var a = de({ lh: [0.25, 1.38, w - 0.01], rh: [-0.25, 1.38, w - 0.01], lhw: [0, 0, 180], rhw: [0, 0, 180], lep: [0.8, -0.6, -0.3], rep: [-0.8, -0.6, -0.3], pel: [0, F + 0.9 * U(22)[1], -0.12 + 0.9 * U(22)[2]], pr: [22, 0, 0], lf: [0.12, F, -0.12], rf: [-0.12, F, -0.12], lfy: 0, rfy: 0, cue: 'Flexión en la pared ×8' });
    var b = o(a, { pel: [0, F + 0.9 * U(32)[1], -0.12 + 0.9 * U(32)[2]], pr: [32, 0, 0], cue: 'Cuerpo recto, codos a 45°' });
    return { cam: 115, props: [{ t: 'pared', z: w }], k: ida(a, b, 1.1) }; })();
  // ---------- ejercicios compuestos ----------
  EJ.tejidoA = une([X.gemelos, X.isquios, X.cuads, X.gluteo, X.psoas], { cam: 70 });
  EJ.tejidoB = une([X.espalda, X.gemelos, X.gluteo, X.psoas], { cam: 70 });
  EJ.frodPI = une([X.cuads, X.gemelos, X.gluteo], { cam: 70 });
  EJ.frodPS = une([X.espalda], {});
  EJ.frodPC = une([X.espalda, X.gluteo, X.cuads, X.gemelos], { cam: 70 });
  EJ.frodPR = une([X.pie, X.gemelos, X.cuads, X.gluteo], { cam: 60 });
  var lat = window.MQ_EJ.klateralr, plancha = window.MQ_EJ.kplanchar;
  EJ.pilarA = une([plancha, lat, X.puente, X.pallof], { cam: 40 });
  EJ.pilarB = une([plancha, lat, X.puente, X.pallof, X.paredMarcha], { cam: 40 });
  EJ.regen = une([X.resp90, X.flexor], { cam: 75 });
  EJ.gcalor = une([X.marcha, X.hombros, X.gato, X.sentLibre, X.rotTronco, X.rodillas], { cam: 45 });
  EJ.gestira = une([X.flexor, X.isquio, X.pecho, X.respPie], { cam: 55 });
  EJ.kprep = une([X.resp90, X.gato, X.ab90, X.puente], { cam: 60 });
  EJ.xmequi = une([X.equil, X.tandem], { cam: 30 });
  EJ.xcalma = une([X.cocodrilo], {});
  EJ.xmsuelo = une([X.resp90, X.respPie], { cam: 60 });
  EJ.xmat = une([X.snap, X.hop, X.cambio], { cam: 40 });
  var act = une([X.tobillo, X.torac], { cam: 50 });
  EJ.factPI = une([X.tobillo, X.torac, X.resp90, X.sentLibre, X.bisagra, X.puente], { cam: 55 });
  EJ.factPS = une([X.tobillo, X.torac, X.resp90, X.flexPared, window.MQ_EJ.gremob], { cam: 55 });
  EJ.factPC = une([X.tobillo, X.torac, X.resp90, X.sentLibre, X.flexPared, window.MQ_EJ.gremob, window.MQ_EJ.kbirddog], { cam: 55 });
  EJ.factPR = une([X.tobillo, X.torac, X.resp90, X.skip, X.zancadas, X.saltitos], { cam: 55 });
  M.X = X;
})();

/* ---------- Correctivos de Prep: sentadilla profunda, estocada y cadera ---------- */
(function () {
  var M = window.MQ, F = M.F, o = M.o, EJ = window.MQ_EJ, de = M.de, D = Math.PI / 180;
  var ancho = { lf: [0.17, F, 0.02], rf: [-0.17, F, 0.02], lfy: 14, rfy: -14 };
  // Toque de pies con rodillo entre las rodillas, puntas sobre un libro
  (function () {
    var b = de(o(M.arriba, { lf: [0.09, F + 0.03, 0.02], rf: [-0.09, F + 0.03, 0.02], lfy: 0, rfy: 0, lfp: -8, rfp: -8, lep: [1, 0, 0], rep: [-1, 0, 0], cue: 'Puntas sobre un libro, cojín entre las rodillas · brazos arriba, inhala' }));
    var t = o(b, { pel: [0, 0.9, -0.2], pr: [80, 0, 0], sp: [30, 0, 0], ch: [30, 0, 0], hd: [20, 0, 0], lhc: [0.08, 0.95, 0.1], rhc: [-0.08, 0.95, 0.1], cue: 'Exhala y baja a tocar las puntas apretando el cojín, rodillas estiradas' });
    delete t.lhc; delete t.rhc; t.lh = [0.08, 0.1, 0.17]; t.rh = [-0.08, 0.1, 0.17];
    var b2 = o(b); delete b2.lhc; delete b2.rhc; b2.lh = [0.17, 1.95, 0.05]; b2.rh = [-0.17, 1.95, 0.05];
    var mid = o(b2, { pel: [0, 0.95, -0.1], pr: [40, 0, 0], sp: [20, 0, 0], ch: [20, 0, 0], hd: [25, 0, 0], lh: [0.1, 0.55, 0.3], rh: [-0.1, 0.55, 0.3], cue: 'Sube desenrollando la columna' });
    EJ.fds1 = { cam: 70, dyn: { cojin: 1 }, props: [{ t: 'caja', p: [0, 0.14], s: [0.36, 0.03, 0.14] }], k: [[0, b2], [0.6, b2], [1.8, t], [1, t], [1.2, mid], [1.2, b2]] };
  })();
  // Toque de pies a sentadilla profunda
  (function () {
    var t = de(o(ancho, { pel: [0, 0.88, -0.22], pr: [82, 0, 0], sp: [30, 0, 0], ch: [30, 0, 0], hd: [15, 0, 0], lh: [0.17, 0.08, 0.18], rh: [-0.17, 0.08, 0.18], lep: [1, 0, -0.5], rep: [-1, 0, -0.5], cue: 'Toca las puntas de los pies con las rodillas estiradas' }));
    var sq = o(t, { pel: [0, 0.4, -0.08], pr: [45, 0, 0], sp: [10, 0, 0], ch: [0, 0, 0], hd: [-25, 0, 0], lep: [1, 0.2, -0.1], rep: [-1, 0.2, -0.1], cue: 'Sin soltar los pies, baja a sentadilla profunda: codos empujan las rodillas, pecho arriba' });
    EJ.fds2 = { cam: 40, k: [[0, t], [0.8, t], [1.6, sq], [1.2, sq], [1.4, o(t, { cue: 'Sube la cadera sin soltar los pies y vuelve a bajar' })]] };
  })();
  // Sentadilla con apoyo y brazos arriba (rodillo vertical delante)
  (function () {
    var p = [0, 0.42], ap = { lh: [0.07, 0.98, 0.38], rh: [-0.07, 1.02, 0.38], lep: [0.5, -1, -0.3], rep: [-0.5, -1, -0.3] };
    var b = de(o(ancho, ap, { cue: 'Frente a un rodillo vertical, manos apoyadas' }));
    var sq = o(b, { pel: [0, 0.38, -0.1], pr: [24, 0, 0], hd: [-6, 0, 0], lh: [0.07, 0.62, 0.38], rh: [-0.07, 0.66, 0.38], cue: 'Baja a sentadilla profunda apoyado, talones en el suelo' });
    var a1 = o(sq, { lh: [0.2, 1.4, 0.0], lep: [1, 0, 0], cue: 'Abajo, suelta un brazo y llévalo arriba' });
    var a2 = o(a1, { rh: [-0.2, 1.4, 0.0], rep: [-1, 0, 0], cue: 'Luego el otro' });
    var up = o(a2, { pel: [0, 0.955, 0], pr: [0, 0, 0], hd: [0, 0, 0], lh: [0.17, 1.95, 0.05], rh: [-0.17, 1.95, 0.05], cue: 'Sube con los brazos arriba' });
    EJ.fds3 = { cam: 50, props: [{ t: 'caja', p: [0, 0.48], s: [0.12, 0.96, 0.12], m: 'pad' }], k: [[0, b], [0.5, b], [2, sq], [0.8, a1], [0.8, a2], [0.5, a2], [1.5, up], [0.5, up], [1, b]] };
  })();
  // Sentadilla profunda con mini banda en las rodillas y brazos arriba
  (function () {
    var b = de(o(ancho, { lh: [0.17, 1.95, 0.05], rh: [-0.17, 1.95, 0.05], lep: [1, 0, 0], rep: [-1, 0, 0], cue: 'Mini banda sobre las rodillas, brazos arriba' }));
    var sq = o(b, { pel: [0, 0.4, -0.12], pr: [26, 0, 0], hd: [-6, 0, 0], lh: [0.2, 1.42, 0.2], rh: [-0.2, 1.42, 0.2], lfy: 18, rfy: -18, cue: 'Baja lento empujando las rodillas contra la banda, talones en el suelo' });
    EJ.fds4 = { cam: 25, dyn: { banda: [['lk', 'rk']] }, k: [[0, b], [0.5, b], [2.5, sq], [0.8, sq], [1.5, o(b, { cue: 'Sube sin que las rodillas se junten' })], [0.4, b]] };
  })();
  // Arrodillado: pie izquierdo adelante, rodilla derecha en el suelo
  var cab = de(o(M.cad, { pel: [0, 0.56, -0.05], lf: [0.13, F, 0.42], rf: [-0.13, F, -0.5], rfp: 160, lfy: 4, rfy: 0, rkp: [0, -1, 0.2] }));
  // Dorsiflexión de tobillo con palo junto al pie
  (function () {
    var b = o(cab, { lh: [0.2, 0.78, 0.5], lep: [1, 0, -0.5], cue: 'Arrodillado, palo apoyado junto al dedo pequeño del pie de adelante' });
    var f = o(b, { pel: [0.02, 0.56, 0.08], lf: [0.13, F, 0.42], lkp: [0.5, 0, 1], lh: [0.24, 0.78, 0.58], cue: 'Lleva la rodilla adelante, por fuera del palo, sin levantar el talón · 2 s' });
    EJ.fil1 = { cam: 60, props: [{ t: 'caja', p: [0.24, 0.58], s: [0.025, 0.85, 0.025] }], k: [[0, b], [0.5, b], [1, f], [2, f], [1, b]] };
  })();
  // Estocada arrodillada con despegue
  (function () {
    var b = o(cab, { cue: 'Estocada, rodilla de atrás en el suelo, tronco erguido' });
    var u = o(b, { pel: [0, 0.62, -0.04], rf: [-0.13, 0.12, -0.5], rfp: 120, cue: 'Despega la rodilla de atrás unos centímetros · 2 s sin mover el tronco' });
    EJ.fil2 = { cam: 70, k: [[0, b], [0.6, b], [0.8, u], [2, u], [0.8, o(b, { cue: 'Vuelve a apoyarla suave' })], [0.4, b]] };
  })();
  // Rotación de tronco arrodillado con palo sobre los hombros (pies en línea)
  (function () {
    var b = o(cab, { lf: [0.0, F, 0.42], rf: [0.0, F, -0.5], pel: [0, 0.56, -0.05], lhc: [0.46, 0.27, -0.06], rhc: [-0.46, 0.27, -0.06], lep: [0.5, -1, -0.3], rep: [-0.5, -1, -0.3], cue: 'Rodilla de atrás en el suelo, pies en línea, palo sobre los hombros' });
    var g = o(b, { ch: [0, 45, 0], sp: [0, 10, 0], hd: [0, 10, 0], cue: 'Gira el tronco hacia la pierna de adelante, sin mover la pelvis' });
    EJ.fil3 = { cam: 25, dyn: { palo: 'hom' }, k: [[0, b], [0.5, b], [1.2, g], [0.6, g], [1.2, o(b, { cue: 'Y vuelve' })], [0.4, b]] };
  })();
  // Estocada isométrica con banda a la altura del pecho (anclada a la derecha)
  (function () {
    var anc = [-1.1, 1.05, 0.1];
    var b = o(cab, { pel: [0, 0.6, -0.05], rf: [-0.13, 0.12, -0.5], rfp: 120, lh: [-0.15, 1.05, 0.4], rh: [-0.25, 1.05, 0.38], lep: [1, -0.6, -0.3], rep: [-0.3, -1, -0.3], cue: 'En estocada, rodilla de atrás cerca del suelo, banda al lado' });
    var t = o(b, { lh: [0.08, 1.05, 0.15], rh: [-0.02, 1.05, 0.15], cue: 'Tira de la banda al pecho sin que el tronco gire ni se incline' });
    EJ.fil4 = { cam: 30, dyn: { banda: [['mh', anc]] }, props: [{ t: 'ancla', p: [anc[0], anc[2]], y: anc[1] }], k: [[0, b], [0.5, b], [0.9, t], [0.6, t], [1.2, b]] };
  })();
  // Rotaciones de cadera con el pie sobre un cajón alto
  (function () {
    var b = de({ pel: [-0.04, 0.955, -0.02], lf: [0.12, 0.58, 0.45], lfp: 0, lfy: 0, lkp: [0, 0.3, 1], rf: [-0.12, F, 0.0], lh: [0.1, 0.98, 0.42], rh: [0.14, 0.98, 0.42], lep: [0.5, -1, -0.3], rep: [-0.5, -1, -0.3], cue: 'Pie sobre un cajón alto, cadera y rodilla a 90°, manos en la rodilla' });
    var i = o(b, { lkp: [-0.8, 0.3, 1], lh: [0.0, 0.98, 0.42], rh: [0.04, 0.98, 0.42], lfr: 10, cue: 'Gira la rodilla hacia dentro desde la cadera' });
    var e = o(b, { lkp: [1, 0.3, 0.6], lh: [0.24, 0.96, 0.4], rh: [0.28, 0.96, 0.4], lfr: -10, cue: 'Y hacia fuera, sin mover la pelvis ni el pie de apoyo' });
    EJ.fhs1 = { cam: 25, props: [{ t: 'caja', p: [0.12, 0.5], s: [0.4, 0.5, 0.4] }], k: [[0, b], [0.5, b], [0.9, i], [0.9, e], [0.9, i], [0.9, e], [0.8, b]] };
  })();
})();

/* ---------- Velocidad multidireccional: desplazamiento lateral y corte ---------- */
(function () {
  var M = window.MQ, F = M.F, EJ = window.MQ_EJ, de = M.de;
  var H = 0.74, W = 0.34, st = 0.3, k = [], t = 0;
  function at(x, lx, rx, ly, ry, roll, yy, cue) {
    return de({ pel: [x, yy || H, -0.08], pr: [24, 0, roll || 0], sp: [-4, 0, 0], hd: [-14, 0, 0], lf: [lx, ly || F, 0.05], rf: [rx, ry || F, 0.05],
      lfy: 8, rfy: -8, la: [-35, 0, 25], ra: [-35, 0, -25], le: -70, re: -70, cue: cue });
  }
  var x = -0.6, c1 = 'Base baja, peso en el borde interno del pie', c2 = 'Empuja el piso con la pierna de afuera · los pies no se juntan', c3 = 'Frena con la pierna de afuera y baja el centro de gravedad', c4 = 'Sal explosivo hacia el otro lado';
  k.push([0, at(x, x + W, x - W, 0, 0, 0, 0, c1)]); k.push([0.5, at(x, x + W, x - W, 0, 0, 0, 0, c2)]);
  for (var i = 0; i < 3; i++) { k.push([st, at(x + 0.13, x + W + 0.3, x - W, 0.15, F, -3, 0, c2)]); x += 0.13;
    k.push([st * 0.6, at(x + 0.13, x + W + 0.27, x - W + 0.15, F, 0.13, 0, 0, c2)]); x += 0.13;
    k.push([st * 0.4, at(x, x + W, x - W, 0, 0, 0, 0, i === 2 ? c3 : c2)]); }
  k.push([st, at(x + 0.12, x + W + 0.25, x - W, F, F, -8, 0.66, c3)]);
  k.push([0.4, at(x + 0.05, x + W + 0.25, x - W, F, F, -12, 0.62, c4)]);
  var x2 = x;
  for (var j = 0; j < 3; j++) { k.push([st, at(x2 - 0.13, x2 + W, x2 - W - 0.3, F, 0.15, 3, 0, c4)]); x2 -= 0.13;
    k.push([st * 0.6, at(x2 - 0.13, x2 + W - 0.15, x2 - W - 0.27, 0.13, F, 0, 0, c2)]); x2 -= 0.13;
    k.push([st * 0.4, at(x2, x2 + W, x2 - W, 0, 0, 0, 0, c2)]); }
  k.push([st, at(-0.6, -0.6 + W, -0.6 - W, 0, 0, 0, 0, c1)]);
  EJ.mdcut = { cam: 0, rad: 4.6, k: k };
})();
