# Registro de los videos de Sakros Go

Estado de `public/go/media/` el 27 de noviembre de 2026, antes de reajustar los recortes. **Esta versión funciona bien**: si un recorte nuevo queda peor, se vuelve a esta.

- Commit de referencia en `main`: `59a2913` («video del módulo de equilibrio»).
- Para recuperar un video: `git checkout 59a2913 -- public/go/media/<clave>.mp4 public/go/media/<clave>.jpg`
- Para recuperar todos: `git checkout 59a2913 -- public/go/media/`
- La columna «huella» es el SHA-1 abreviado del archivo: si cambia, el video se reemplazó.

| Clave | Duración | Peso | Huella | Ejercicios que lo usan |
|---|---|---|---|---|
| `abdomen-b` | 35.0 s | 5701 KB | `0d6e4794a9` | gcoreb (Abdomen: bird dog + plancha lateral) |
| `activacion-a` | 13.0 s | 2521 KB | `8a613508ac` | actA (Activación: aterrizajes y frenadas) |
| `apertura-lado` | 10.0 s | 2254 KB | `b241e90fa5` | fsm3 (Apertura de brazo de lado) |
| `aterrizaje-2` | 6.4 s | 1178 KB | `36fc3a17c3` | — |
| `aterrizar` | 20.8 s | 7601 KB | `c6e819a9e4` | actB (Activación: frenadas y aterrizajes); xmat (Módulo: aterrizar y frenar) |
| `bajada-escalon` | 5.8 s | 935 KB | `4037d5f975` | xstepdown (Bajada controlada de escalón) |
| `birddog-banda` | 10.0 s | 907 KB | `ac86de4834` | kbirddogc (Bird dog con banda o tobillera) |
| `birddog` | 10.0 s | 4209 KB | `86ea78b6c7` | kbirddog (Bird dog); kextension (Bird dog con pausa (extensores)); xbirddog (Bird dog) |
| `bisagra-palo` | 10.0 s | 2556 KB | `39cac6d14d` | gbisagra (Bisagra de cadera → peso muerto rumano con mancuernas); xbisagra (Bisagra de cadera con palo) |
| `circulo-hombro` | 10.0 s | 3063 KB | `b08dca47ff` | fsm4 (Círculo de hombro con tronco rotado) |
| `clean` | 17.0 s | 7513 KB | `4526727bb3` | cargada (Clean (levantamiento desde colgado)); powerclean (Power clean (desde el suelo)) |
| `copenhague` | 10.0 s | 1731 KB | `3c9153fd51` | copenhague (Plancha Copenhague) |
| `deadbug-disco` | 14.0 s | 6121 KB | `b04131539a` | kdeadbugc (Dead bug con peso unilateral) |
| `deadbug` | 10.0 s | 3750 KB | `39c23ce81c` | kdeadbug (Dead bug); xdeadbug (Dead bug) |
| `dominadas` | 10.0 s | 2812 KB | `4bb2f69e47` | dominadas (Dominadas) |
| `drop-jump` | 8.7 s | 2277 KB | `611612f0c0` | cajon (Salto al cajón / drop jump) |
| `equilibrio-rodilla` | 10.0 s | 2806 KB | `211a357559` | xequi (Equilibrio (desafío del día)) |
| `equilibrio-suelo` | 10.0 s | 2702 KB | `f72923767c` | xmequi (Módulo: equilibrio y suelo) |
| `faslr1` | 8.0 s | 1648 KB | `f246812e18` | faslr1 (Elevación de pierna con ayuda de las manos) |
| `faslr2` | 10.0 s | 947 KB | `320e31bd47` | faslr2 (Elevación de pierna con banda) |
| `faslr3` | 10.0 s | 906 KB | `c431568ee5` | faslr3 (Bajada de la pierna contraria) |
| `fds1` | 10.0 s | 2055 KB | `837cd148bf` | fds1 (Toque de pies con rodillo) |
| `fil2` | 10.0 s | 2325 KB | `b9dfa87f7d` | fil1 (Estocada arrodillada con palo) |
| `flex-pared` | 10.0 s | 4716 KB | `03522b0eba` | gflex (Flexiones de brazos (progresión)) |
| `flexiones` | 10.0 s | 3599 KB | `18d484f717` | xempuje (Flexión de brazos) |
| `flexor-cadera` | 7.2 s | 1190 KB | `6937cf6fee` | regen (Regeneración) |
| `fms-aslr` | 16.4 s | 1808 KB | `14d60b0fd2` | — |
| `fms-ds` | 9.2 s | 1181 KB | `2d2183ec81` | — |
| `fms-hs` | 27.3 s | 3282 KB | `fa3f51c0ca` | — |
| `fms-il` | 16.2 s | 1875 KB | `1e0326609f` | — |
| `fms-rs` | 30.2 s | 3728 KB | `c188e041cc` | — |
| `fms-sm` | 7.2 s | 791 KB | `aecebdca17` | — |
| `fms-tspu` | 16.3 s | 1725 KB | `acfd03974d` | — |
| `fsm1` | 10.0 s | 4762 KB | `77f8e8e513` | fsm1 (Brazos contra la pared) |
| `fsm2` | 10.0 s | 5168 KB | `bc1f81868e` | fsm2 (Remo con palo contra la pared) |
| `ftspu2` | 10.0 s | 2187 KB | `966dfdef0c` | ftspu2 (Caminata en 4 apoyos) |
| `goblet-profunda` | 10.0 s | 3233 KB | `626ffa7323` | kgobletp (Sentadilla goblet profunda) |
| `granjero` | 6.9 s | 2668 KB | `e1ca148fc6` | kgranjero (Paseo de granjero pesado) |
| `hombro-atacante` | 11.0 s | 1814 KB | `a84409eeb8` | vhombro (Hombro de atacante: manguito y escápula) |
| `jalon-banda` | 10.0 s | 3969 KB | `21238f7d3f` | kjalon (Jalón con banda o polea) |
| `landmine-jammer` | 10.0 s | 3586 KB | `b3240ee096` | kjammer (Landmine jammer (empuje explosivo)) |
| `landmine-press` | 24.0 s | 5202 KB | `fc55df1f67` | klandmine (Landmine press a una mano, de pie); landmine (Landmine press a una mano) |
| `lanz-atras` | 9.1 s | 3205 KB | `a43f1d9e11` | klanzatras (Lanzamiento hacia atrás por encima de la cabeza) |
| `lanz-rotacional` | 10.0 s | 2987 KB | `21ad11803d` | klanzfront (Lanzamiento frontal en estocada) |
| `lanz-supino` | 7.0 s | 2441 KB | `b06ed4c2c5` | klanzsup (Lanzamiento vertical de balón, boca arriba) |
| `lateral-abduccion` | 10.0 s | 1786 KB | `0003f08845` | — |
| `lateral-completa` | 10.0 s | 1813 KB | `8e396142c2` | — |
| `lateral-corte` | 10.0 s | 3047 KB | `7dc5b9a01a` | — |
| `lateral-rodillas` | 10.0 s | 1927 KB | `94ca5df1d8` | frs2 (Elevación de cadera de lado) |
| `mini-band` | 10.0 s | 1810 KB | `8488f3cdfa` | bandalateral (Desplazamiento lateral con mini band) |
| `movilidad-cadera` | 43.8 s | 7126 KB | `79d98b0544` | movA (Movilidad: cadera y tronco) |
| `pallof-pie` | 10.0 s | 2656 KB | `099d3d24f1` | gtricep (Pallof press con banda); xpallof (Pallof press) |
| `pallof-semirrodillas` | 10.0 s | 3704 KB | `54deb3754b` | kpallofsr (Pallof press en estocada) |
| `pase-pecho` | 10.0 s | 2682 KB | `886ac55891` | klanzpecho (Pase de pecho con balón medicinal); xlanz (Lanzamiento con balón medicinal) |
| `paseo-maleta` | 10.0 s | 2360 KB | `dbe0363c78` | kmaleta (Paseo de maleta); kcarrera (Paseo de pesos con cambios (granjero → maleta)); gpatada (Paseo con carga (maleta)); xcarry (Paseo con carga) |
| `paso-cruzado` | 10.0 s | 2406 KB | `613014b6b3` | — |
| `peso-muerto` | 10.0 s | 3648 KB | `d6ed22db80` | muerto (Peso muerto); kmuertobarra (Peso muerto con barra o trap bar) |
| `pilar` | 24.0 s | 5230 KB | `a139def3b5` | pilarA (Preparación del pilar); pilarB (Preparación del pilar + pared) |
| `plancha-lateral` | 25.0 s | 3568 KB | `08c1090e45` | klateralr (Plancha lateral sobre rodillas); klateral (Plancha lateral completa); klateralabd (Plancha lateral con abducción de cadera) |
| `pm-una-pierna` | 10.0 s | 2533 KB | `5f58bc54b2` | xbis1 (Bisagra a una pierna) |
| `pmr-mancuernas` | 10.0 s | 3869 KB | `48c2178fd0` | krdl (Peso muerto rumano con mancuernas); rdlbarra (Peso muerto rumano con barra) |
| `press-sentado` | 10.0 s | 1998 KB | `0b49fbb1b6` | gpress (Press de hombros con mancuernas, sentado) |
| `puente-bilateral` | 18.0 s | 7163 KB | `94eda1fd0a` | kpuente (Puente glúteo bilateral); gpuente (Puente de glúteo) |
| `puente-una-pierna` | 6.0 s | 2045 KB | `e3b8bb944f` | kpuente1 (Puente a una pierna (apoyo amplio)); fhs2 (Puente de glúteo con pierna elevada) |
| `puente` | 5.9 s | 463 KB | `8bc197ce5f` | puenteexp (Puentes explosivos) |
| `push-press` | 10.0 s | 1983 KB | `9f46519933` | pushpress (Push press); pushjerk (Push jerk) |
| `remo-bisagra` | 10.0 s | 3454 KB | `e6c5efa0a5` | kremobisagra (Remo con mancuerna en bisagra, sin apoyo) |
| `respiracion-diafragmatica` | 12.0 s | 1480 KB | `c7d4aba25a` | kcalma (Vuelta a la calma); xprep (Respiración y abdomen profundo) |
| `salto-ataque` | 6.0 s | 1416 KB | `e8cc1266e0` | vsalto (Salto de ataque (aproximación de 3 pasos)) |
| `salto-bloqueo` | 13.0 s | 2797 KB | `b1bc9e96d4` | vbloqueo (Salto de bloqueo con desplazamiento) |
| `sent-frontal` | 8.9 s | 4759 KB | `13a415a593` | frontal (Sentadilla frontal); ksentbarra (Sentadilla frontal con barra) |
| `sentadilla-cajon` | 10.9 s | 2088 KB | `89782ee0e5` | xsent (Sentadilla con tempo); boxsquat (Sentadilla a cajón alto) |
| `sentadilla-posterior` | 10.0 s | 3553 KB | `1052c83a09` | sentadilla (Sentadilla posterior) |
| `sentadilla-silla` | 5.6 s | 992 KB | `357108d29b` | gsilla (Sentadilla a silla → sentadilla goblet) |
| `skater` | 11.6 s | 4145 KB | `7f88c0fc16` | skater (Skater / caída lateral) |
| `snap-down` | 14.0 s | 7368 KB | `20a9629704` | — |
| `split-squat` | 10.0 s | 4363 KB | `93020db6f0` | ksplit (Split squat con mancuernas) |
| `swing` | 6.9 s | 2076 KB | `1e920eabdb` | kswing (Kettlebell swing) |
| `tejido-a` | 16.0 s | 2817 KB | `01ea599add` | tejidoA (Tejido blando: tren inferior); frodPI (Rodillo: piernas) |
| `toque-hombro` | 10.0 s | 1807 KB | `703e39d882` | kplanchat (Plancha completa con toque de hombro) |
| `zancada-estatica` | 15.6 s | 3088 KB | `55cf49c51c` | xzanc (Zancada estática) |
| `zancada-lateral` | 6.0 s | 1373 KB | `10b476c421` | gcurl (Zancada lateral) |
| `zancada-rodilla` | 6.8 s | 1700 KB | `bb72a86640` | xzancdin (Zancada dinámica) |

## Cambios del 27-11-2026 (recortes y videos nuevos)

Todo lo anterior a esta sección describe los videos **antes** de estos cambios (commit `59a2913`).
Para volver uno atrás: `git checkout 59a2913 -- public/go/media/<clave>.mp4 public/go/media/<clave>.jpg`.

| Clave | Qué cambió | Fuente |
|---|---|---|
| pallof-semirrodillas | Solo las presiones (3,8 s), sin la preparación ni el cambio de lado | mismo clip, 3,6–7,4 s |
| faslr2 | Sin los 2 s acostado al inicio (7,4 s) | mismo clip, 2,2–9,6 s |
| lanz-atras | Solo tomar el balón y lanzar (4,8 s), sin los 4 s de preparación | mismo clip, 4,3–9,1 s |
| birddog | Solo el tramo con extensión de pierna (3 s) | mismo clip, 7–10 s |
| salto-ataque | Solo la carrera, el salto y la caída (3 s), sin la vuelta caminando | mismo clip, 0,3–3,3 s |
| puente | Sin el último 0,4 s, que mostraba otro ejercicio | mismo clip, 0–5,45 s |
| push-press | Encuadre más cerrado, 900×1124 | IMG_6654, 17–27 s |
| paso-cruzado | Encuadre más cerrado, 864×1080 | IMG_6677, 6,5–16,5 s |
| paseo-maleta | Ahora camina con la pesa (antes estaba quieto), 960×1200 | IMG_6537, 54,3–57 s |
| power-clean (nuevo) | Power clean de perfil; lo usa `powerclean` (antes usaba `clean`) | IMG_6660, 17,5–23,6 s |
| remo-barra (nuevo) | Remo con barra en bisagra; lo usa `kremobarra` (antes maniquí) | IMG_6656, 14,8–20,8 s |

Los cortes desde los originales (HLG del iPhone) se ajustaron al color de los clips actuales
por coincidencia de histograma (60 %), h264 CRF 24, sin audio, etiquetas bt709.

## Cambios del 27-11-2026 (segunda tanda: videos nuevos del Drive, IMG_1531–1569)

| Clave | Ejercicios | Fuente |
|---|---|---|
| remo-mancuerna (nuevo) | kremomanc, gremom (antes maniquí) | IMG_1537, 9–19 s |
| plancha-rodilla-codo (nuevo) | frs1 (antes maniquí) | IMG_1539, 11,5–21,5 s |
| estocada-despegue (nuevo) | fil2 (antes maniquí) | IMG_1540, 6–16 s |
| toque-sentadilla (nuevo) | fds2 (antes sin imagen) | IMG_1543, 11,5–21 s |
| gateo-suspendido (nuevo) | frs4 | IMG_1554, 15–27 s |
| step-up (nuevo) | kstepup, gstep, xstepup (antes maniquí) | IMG_1555, 5–15 s |
| lanz-frontal (nuevo) | klanzfront (antes mostraba el rotacional) | IMG_1549, 8,5–21,5 s |
| lanz-rotacional | ahora también klanzrot (antes sin video) | sin cambio |
| flexion-cajon (nuevo) | ftspu3 | IMG_1566, 11–21 s |
| tejido-b (nuevo) | tejidoB, frodPS | IMG_1563 14–19,5 s + IMG_1564 26–31 s |
| prep-core (nuevo) | kprep | IMG_1556 8–12 s + IMG_1557 8–14 s |
| rodillo-pies (nuevo) | frodPR | IMG_1531 9–14 s + IMG_1532 6–11 s |
| birddog | reemplazado: bird dog completo de perfil (antes 8 s quieto) | IMG_1560, 7,5–16,5 s |

Volver atrás el bird dog: `git checkout 59a2913 -- public/go/media/birddog.mp4 public/go/media/birddog.jpg`.
