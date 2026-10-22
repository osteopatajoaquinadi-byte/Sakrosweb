"""Ilustraciones Sakros: 2 cuadros (inicio, final) por ejercicio.
Uso: python3 ejercicios.py <dir_salida> [id ...]
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fig import *  # noqa

R = {}


def ej(fn):
    R[fn.__name__.replace("_", "-")] = fn
    return fn


def sh_a_suelo(hip, th, y_tobillo=26, S=1.0, lado=1):
    """Ángulo de pierna para que el tobillo quede a y_tobillo (rodilla flexionada)."""
    k = pol(hip, th, BASE["th"] * S)
    s = max(-1, min(1, (y_tobillo - k[1]) / (BASE["sh"] * S)))
    a = math.degrees(math.asin(s))
    return a if lado > 0 else 180 - a


HIP_SUP = (520, 50)
BR_SUP = {"near": (-8, -4), "far": (-8, -4)}
RECTA = (0, 0, 92)


def supino(c, piernas=None, brazos=None, hl=(), hip=HIP_SUP, mira=92, **kw):
    c.suelo()
    c.colchoneta(140, 1040)
    p = piernas or {"near": RECTA, "far": RECTA}
    return c.figura(hip, torso=180, cabeza=180, brazos=brazos or BR_SUP, piernas=p, hl=hl, mira=mira, **kw)


def flexion(hip, th=48, ft=8):
    return (th, sh_a_suelo(hip, th), ft)


# ───────────────────────── SUPINO ─────────────────────────
@ej
def quad_set(c, i):
    c.suelo(); c.colchoneta(140, 1040)
    c.toalla((520 + 120, 34), 26)
    knee_up = 6 if i == 0 else 0
    J = c.figura(HIP_SUP, torso=180, cabeza=180, brazos=BR_SUP,
                 piernas={"near": (knee_up, -knee_up, 92 if i == 0 else 100), "far": (40, sh_a_suelo(HIP_SUP, 40), 8)},
                 hl={"near_leg"}, mira=92)
    if i == 1:
        k = J["near_knee"]
        c.flecha((k[0] - 10, k[1] + 120), (k[0] - 10, k[1] + 38))
        c.texto((k[0] + 40, k[1] + 150), "aprieta 5 s", 34)


@ej
def slr(c, i):
    far = flexion(HIP_SUP)
    a = 0 if i == 0 else 40
    J = supino(c, {"near": (a, a, 92 + a), "far": far}, hl={"near_leg"})
    if i == 1:
        c.arco(HIP_SUP, 300, 6, 36)


@ej
def heel_slide(c, i):
    th = 4 if i == 0 else 60
    near = (th, -th if i == 0 else sh_a_suelo(HIP_SUP, th), 92 if i == 0 else 20)
    J = supino(c, {"near": near, "far": RECTA}, hl={"near_leg"})
    if i == 1:
        a = J["near_ankle"]
        c.flecha((a[0] + 210, 70), (a[0] + 40, 70))


@ej
def serratus_punch(c, i):
    up = (90, 90)
    J = supino(c, {"near": flexion(HIP_SUP), "far": flexion(HIP_SUP)}, brazos={"near": up, "far": up},
               hl={"near_arm"}, sh_off=(0, 0 if i == 0 else 26))
    w = J["near_wrist"]
    if i == 1:
        c.flecha((w[0] + 60, w[1] - 70), (w[0] + 60, w[1] + 20))
        c.texto((w[0] + 90, w[1] - 40), "empuja al techo", 32)


@ej
def pelvic_tilt(c, i):
    J = supino(c, {"near": flexion(HIP_SUP), "far": flexion(HIP_SUP)}, hl={"torso"},
               hip=HIP_SUP if i == 0 else (HIP_SUP[0], HIP_SUP[1] + 4))
    if i == 0:
        c.flecha((HIP_SUP[0] - 120, 140), (HIP_SUP[0] - 120, 80), doble=False)
        c.texto((HIP_SUP[0] - 260, 210), "hueco lumbar", 32)
    else:
        c.arco((HIP_SUP[0] - 30, HIP_SUP[1]), 90, 200, 120)
        c.texto((HIP_SUP[0] - 300, 210), "espalda al suelo", 32)


@ej
def diaphragmatic(c, i):
    J = supino(c, {"near": flexion(HIP_SUP), "far": flexion(HIP_SUP)},
               brazos={"near": (60, -40), "far": (60, -40)})
    cx = HIP_SUP[0] - 60
    if i == 1:
        c.elipse((cx, 82), 70, 46, fill=(204, 232, 228), outline=C_HL, width=5)
        c.flecha((cx, 150), (cx, 230))
        c.texto((cx + 60, 230), "inhala: sube el abdomen", 30)
    else:
        c.elipse((cx, 70), 64, 30, fill=(226, 232, 240), outline=C_PROP, width=4)
        c.flecha((cx, 230), (cx, 150))
        c.texto((cx + 60, 230), "exhala lento", 30)


@ej
def ham_iso(c, i):
    hip = HIP_SUP
    J = supino(c, {"near": flexion(hip, 52, 0), "far": RECTA}, hl={"near_leg"})
    a = J["near_ankle"]
    if i == 0:
        c.texto((a[0] - 60, 230), "talón al suelo", 32)
    else:
        c.flecha((a[0] + 20, 60), (a[0] - 120, 60))
        c.texto((a[0] - 220, 260), "tira del talón", 32)
        c.texto((a[0] - 220, 216), "sin moverlo", 32)


@ej
def adductor_squeeze(c, i):
    hip = HIP_SUP
    J = supino(c, {"near": flexion(hip), "far": flexion(hip)}, hl={"near_leg", "far_leg"})
    k = J["near_knee"]
    if i == 0:
        c.balon((k[0] + 6, k[1] - 2), 40)
    else:
        c.elipse((k[0] + 6, k[1] - 2), 46, 30, fill=(253, 230, 138), outline=(217, 160, 40), width=5)
        c.flecha((k[0] + 6, k[1] + 120), (k[0] + 6, k[1] + 50))
        c.texto((k[0] + 50, k[1] + 120), "aprieta", 32)


@ej
def ankle_pumps(c, i):
    ft = 70 if i == 0 else 140
    ftn = -20 if i == 0 else 60
    J = supino(c, {"near": (0, 0, 60 if i == 0 else 130 - 30), "far": (0, 0, 60 if i == 0 else 100)},
               hl={"near_leg"})
    a = J["near_ankle"]
    if i == 0:
        c.arco(a, 90, 70, 5)
        c.texto((a[0] - 140, 200), "punta abajo", 32)
    else:
        c.arco(a, 90, 10, 100)
        c.texto((a[0] - 180, 200), "punta hacia ti", 32)


@ej
def glute_set(c, i):
    J = supino(c, {"near": RECTA, "far": RECTA}, hl=set() if i == 0 else {"torso"})
    if i == 1:
        x = HIP_SUP[0]
        c.flecha((x - 70, 150), (x - 20, 90))
        c.flecha((x + 70, 150), (x + 20, 90))
        c.texto((x - 130, 200), "aprieta glúteos 5 s", 32)


@ej
def supine_hip_abd(c, i):
    # vista desde arriba: eje hacia la izquierda
    c.rect(130, 120, 1000, 560, fill=(226, 232, 240), outline=(203, 213, 225), width=3, radius=10)
    J = c.frontal((640, 340), eje=180, brazos={"izq": (10, 0), "der": (10, 0)},
                  piernas={"izq": (3, 0), "der": (3 if i == 0 else 30, 0)}, hl={"der_leg"})
    if i == 1:
        a = J["der_ankle"]
        c.arco((640, 340), 250, -15, -48)
        c.texto((700, 600), "desliza la pierna hacia afuera", 32)


@ej
def ccf(c, i):
    # primer plano de cabeza y cuello, acostado
    c.suelo(); c.colchoneta(140, 1040)
    c.rect(220, 14, 400, 60, fill=(241, 245, 249), outline=C_PROP, width=4, radius=20)  # toalla
    S = 2.0
    hip = (1080, 60 + 29 * S)
    ang = 0 if i == 0 else -16
    J = c.figura(hip, torso=180, cabeza=180 + ang, brazos={"near": (-5, -2), "far": (-5, -2)},
                 piernas={"near": RECTA, "far": RECTA}, hl={"head"}, S=S, mira=92 + ang)
    h = J["head"]
    if i == 1:
        c.arco(h, 130, 60, 20)
        c.texto((h[0] + 40, h[1] + 210), "asiente suave: 'sí'", 34)
        c.texto((h[0] + 40, h[1] + 165), "mentón hacia adentro", 30)


# ─────────────────── PRONO / CUADRUPEDIA / LADO ───────────────────
@ej
def prone_hang(c, i):
    c.suelo()
    c.camilla(130, 720, 260)
    hip = (560, 260 + 28)
    sh = 0 if i == 0 else -40
    J = c.figura(hip, torso=180, cabeza=180, brazos={"near": (-90, -90), "far": (-90, -90)},
                 piernas={"near": (0, -12 if i == 0 else -52, -90 + (0 if i == 0 else -30)),
                          "far": (0, 0, -90)}, hl={"near_leg"}, mira=-90)
    if i == 1:
        a = J["near_ankle"]
        c.flecha((a[0] + 70, a[1] + 110), (a[0] + 70, a[1] + 10))
        c.texto((a[0] - 30, 560), "la pierna cae sola", 32)
    else:
        c.texto((560, 560), "rodilla fuera de la camilla", 32)


@ej
def crocodile(c, i):
    c.suelo(); c.colchoneta(120, 1060)
    hip = (560, 46)
    J = c.figura(hip, torso=180, cabeza=180, brazos={"near": (-160, 35), "far": (-160, 35)},
                 piernas={"near": (0, 0, -88), "far": (0, 0, -88)}, mira=-60)
    x = 420
    if i == 1:
        c.elipse((x, 82), 80, 26, fill=(204, 232, 228), outline=C_HL, width=5)
        c.flecha((x, 140), (x, 230))
        c.texto((x - 170, 280), "la espalda sube al inhalar", 32)
    else:
        c.texto((x - 170, 280), "frente sobre las manos", 32)


@ej
def bird_dog(c, i):
    c.suelo(); c.colchoneta(120, 1060)
    hip = (640, 270)
    if i == 0:
        br = {"near": (-90, -90), "far": (-90, -90)}
        pi = {"near": (-90, 0, 0), "far": (-90, 0, 0)}
        hl = set()
    else:
        br = {"near": (-90, -90), "far": (176, 176)}
        pi = {"near": (-6, -6, -20), "far": (-90, 0, 0)}
        hl = {"near_leg", "far_arm"}
    J = c.figura(hip, torso=178, cabeza=178, brazos=br, piernas=pi, hl=hl, mira=-60)
    if i == 1:
        c.flecha((J["near_ankle"][0] - 140, 420), (J["near_ankle"][0] + 20, 420))
        c.flecha((J["far_wrist"][0] + 140, 420), (J["far_wrist"][0] - 20, 420))
        c.texto((380, 620), "brazo y pierna opuestos", 34)


@ej
def clamshell(c, i):
    c.suelo(); c.colchoneta(120, 1060)
    # de lado, vista desde los pies: dibujamos de frente con piernas flexionadas
    hip = (520, 80)
    J = c.figura(hip, torso=180, cabeza=170, brazos={"near": (-20, -10), "far": (150, 60)},
                 piernas={"near": (30, -60, -30), "far": (30, -60, -30)}, hl=set(), mira=-30 + 120)
    k = J["near_knee"]
    if i == 1:
        # vista superior simplificada de la rodilla de arriba abriéndose
        c.seg(hip, (k[0], k[1] + 120), C_HL, 34)
        c.seg((k[0], k[1] + 120), J["near_ankle"], C_HL, 31)
        c.arco(J["near_ankle"], 230, 70, 100)
        c.texto((k[0] - 80, 420), "abre la rodilla", 32)
        c.texto((k[0] - 80, 380), "pies juntos", 32)


@ej
def sleeper(c, i):
    c.suelo(); c.colchoneta(120, 1060)
    hip = (720, 90)
    fa = 90 if i == 0 else 10
    J = c.figura(hip, torso=180, cabeza=180, brazos={"near": (60, 20), "far": (-90, fa)},
                 piernas={"near": (-30, -10, -60), "far": (-30, -10, -60)}, hl={"far_arm"}, mira=120,
                 sin_far=False)
    if i == 1:
        e = J["far_elbow"]
        c.arco(e, 110, 85, 20)
        c.texto((e[0] - 40, e[1] + 220), "baja la mano con la otra", 30)


@ej
def open_book(c, i):
    c.suelo(); c.colchoneta(120, 1060)
    hip = (640, 90)
    if i == 0:
        br = {"near": (0, 0), "far": (0, 0)}
        hl = set()
    else:
        br = {"near": (176, 176), "far": (0, 0)}
        hl = {"near_arm", "torso"}
    J = c.figura(hip, torso=180, cabeza=180, brazos=br, piernas={"near": (-40, -100, -40), "far": (-40, -100, -40)},
                 hl=hl, mira=90 if i == 1 else 60)
    if i == 1:
        c.arco(J["sh"], 210, 20, 160)
        c.texto((300, 500), "abre el brazo y mira la mano", 32)


@ej
def prone_y_t(c, i):
    # vista superior, acostado boca abajo
    c.rect(130, 60, 1000, 600, fill=(226, 232, 240), outline=(203, 213, 225), width=3, radius=10)
    br = {"izq": (90, 0), "der": (90, 0)} if i == 0 else {"izq": (145, 0), "der": (145, 0)}
    J = c.frontal((700, 330), eje=180, brazos=br, piernas={"izq": (3, 0), "der": (3, 0)},
                  hl={"izq_arm", "der_arm"})
    c.texto((300, 640), "T: brazos en cruz" if i == 0 else "Y: brazos en diagonal", 34)
    c.texto((300, 100), "pulgares arriba, eleva 5 cm", 30)


@ej
def copenhagen(c, i):
    c.suelo()
    c.rect(700, 0, 980, 190, radius=8)  # banco
    S = 1.0
    if i == 0:
        hip = (500, 160)
        ang = 192
    else:
        hip = (480, 240)
        ang = 178
    # vista frontal: cuerpo de lado, apoyado en antebrazo, pierna de arriba sobre el banco
    J = c.frontal(hip, eje=ang, brazos={"izq": (90, 90), "der": (10, 0)},
                  piernas={"izq": (-6, 0), "der": (14, 0)}, hl={"izq_leg", "der_leg", "torso"})
    if i == 1:
        c.flecha((hip[0], hip[1] - 120), (hip[0], hip[1] - 30))
        c.texto((150, 500), "eleva la cadera en línea", 32)


# ───────── versiones con articulaciones explícitas (reemplazan las anteriores) ─────────
def lado_tumbado(c, hip, hl_top=False, rodilla_top=None, brazo_top=None, brazo_bot=None):
    """Acostado de lado visto de frente, cabeza a la izquierda, rodillas flexionadas."""
    x, y = hip
    neck = (x - 172, y + 6)
    head = (x - 172 - 62, y + 18)
    k_bot, a_bot = (x + 120, y - 34), (x + 30, y - 52)
    k_top = rodilla_top or (x + 122, y - 20)
    a_top = (x + 34, y - 40)
    cad = [((x, y), k_bot, a_bot), ]
    cad = [([(x, y), k_bot, a_bot], "pierna", C_FAR)]
    if brazo_bot:
        cad.append((brazo_bot, "brazo", C_FAR))
    cad.append(([(x, y), neck], "torso", C_NEAR))
    cad.append(([(x, y), k_top, a_top], "pierna", C_HL if hl_top else C_NEAR))
    c.esqueleto(cad, cabeza=(head, 38, C_NEAR))
    if brazo_top:
        c.seg(*brazo_top[:2], brazo_top[2], 30)
        if len(brazo_top) > 3:
            c.seg(brazo_top[1], brazo_top[3], brazo_top[2], 27)
    return {"k_top": k_top, "a_top": a_top, "neck": neck, "head": head}


@ej
def clamshell(c, i):
    c.suelo(); c.colchoneta(120, 1060)
    hip = (560, 80)
    c.rect(280, 14, 350, 52, radius=16)  # cojín bajo la cabeza
    sh = (560 - 150, 92)
    J = lado_tumbado(c, hip, hl_top=True, rodilla_top=None if i == 0 else (650, 210),
                     brazo_top=[sh, (470, 40), C_NEAR, (540, 30)])
    if i == 1:
        c.arco(J["a_top"], 175, 70, 22 + 48)
        c.flecha((720, 110), (720, 220))
        c.texto((760, 230), "abre la rodilla", 32)
        c.texto((760, 186), "pies juntos", 32)
    else:
        c.texto((380, 300), "de lado, rodillas dobladas", 32)


@ej
def sleeper(c, i):
    c.suelo(); c.colchoneta(120, 1060)
    hip = (620, 80)
    c.rect(330, 14, 420, 52, radius=16)
    J = lado_tumbado(c, hip)
    sh = (470, 86)
    elbow = (440, 74)  # brazo de abajo hacia adelante (escorzo)
    fa_ang = 90 if i == 0 else 18
    wrist = pol(elbow, fa_ang, 90)
    c.seg(sh, elbow, C_HL, 30)
    c.seg(elbow, wrist, C_HL, 27)
    c.circ(wrist, 17, fill=C_HL)
    # mano de arriba sobre la muñeca
    c.seg((480, 100), (560, 150), C_NEAR, 30)
    c.seg((560, 150), (wrist[0] + 16, wrist[1] + 10), C_NEAR, 27)
    if i == 1:
        c.arco(elbow, 140, 85, 25)
        c.texto((300, 330), "la otra mano baja el antebrazo", 30)
    else:
        c.texto((300, 330), "sobre el hombro afectado, codo a 90°", 30)


@ej
def open_book(c, i):
    # vista desde arriba
    c.rect(130, 80, 1000, 600, fill=(226, 232, 240), outline=(203, 213, 225), width=3, radius=10)
    hip = (640, 360)
    sh = (470, 360)
    head = (400, 360)
    knee = (640, 220)
    ank = (770, 220)
    cad = [([hip, (640, 205), (775, 205)], "pierna", C_FAR),
           ([hip, sh], "torso", C_HL if i else C_NEAR),
           ([hip, knee, ank], "pierna", C_NEAR)]
    c.esqueleto(cad, cabeza=(head, 40, C_NEAR))
    c.seg(sh, (sh[0] + 6, 190), C_FAR, 30)
    hand_top = (sh[0] - 6, 200) if i == 0 else (sh[0] - 6, 540)
    c.seg(sh, hand_top, C_HL, 30)
    c.circ(hand_top, 18, fill=C_HL)
    c.circ((396, 330 if i == 0 else 390), 9, fill=C_NEAR)
    if i == 1:
        c.arco(sh, 200, -60, 60, doble=False)
        c.texto((560, 560), "abre el brazo, mira la mano", 32)
    else:
        c.texto((420, 560), "vista desde arriba, de lado", 32)


@ej
def copenhagen(c, i):
    c.suelo()
    c.rect(820, 0, 1060, 190, radius=8)  # banco
    elbow = (300, 16)
    sh = (300, 136)
    ank_top = (960, 214)
    hip = (560, 40) if i == 0 else lerp(sh, ank_top, 0.42)
    knee_top = lerp(hip, ank_top, 0.5)
    ank_bot = (870, 20) if i == 0 else (840, 120)
    cad = [([hip, lerp(hip, ank_bot, 0.5), ank_bot], "pierna", C_FAR),
           ([hip, sh], "torso", C_HL if i else C_NEAR),
           ([hip, knee_top, ank_top], "pierna", C_HL)]
    c.esqueleto(cad, cabeza=(pol(sh, 168 if i else 150, 84), 38, C_NEAR))
    c.seg(elbow, sh, C_NEAR, 30)
    c.seg(elbow, (390, 16), C_NEAR, 27)
    c.seg(sh, (380, 130 if i == 0 else 200), C_NEAR, 30)
    if i == 1:
        c.flecha((hip[0], hip[1] - 150), (hip[0], hip[1] - 40))
        c.texto((380, 470), "cadera arriba, cuerpo en línea", 32)
    else:
        c.texto((380, 470), "pierna de arriba sobre el banco", 32)


@ej
def prone_hang(c, i):
    c.suelo()
    c.camilla(80, 640, 260)
    hip = (500, 260 + 28)
    c.figura(hip, torso=180, cabeza=180, brazos={"near": (-2, -2), "far": (-2, -2)},
             piernas={"near": (0, -8 if i == 0 else -62, -80 if i == 0 else -150),
                      "far": (0, 0, -90)}, hl={"near_leg"}, mira=-90, sin_far=True)
    if i == 1:
        c.flecha((900, 300), (900, 180))
        c.texto((560, 560), "la pierna cae por su peso", 32)
    else:
        c.texto((560, 560), "rodilla fuera de la camilla", 32)


@ej
def ccf(c, i):
    c.suelo(); c.colchoneta(140, 1040)
    S = 1.6
    hip = (1100, 14 + 29 * S)
    ang = 0 if i == 0 else -14
    c.rect(220, 14, 420, 46, fill=(254, 243, 199), outline=(217, 160, 40), width=4, radius=14)
    J = c.figura(hip, torso=180, cabeza=180 + ang, brazos={"near": (-5, -2), "far": (-5, -2)},
                 piernas={"near": RECTA, "far": RECTA}, hl={"head"}, S=S, mira=92 + ang)
    h = J["head"]
    if i == 1:
        c.arco(h, 120, 70, 25)
        c.texto((h[0] - 380, h[1] + 230), "asiente suave, mentón adentro", 32)
    else:
        c.texto((h[0] - 380, h[1] + 230), "nuca apoyada en una toalla", 32)


@ej
def supine_hip_abd(c, i):
    c.rect(130, 120, 1000, 560, fill=(226, 232, 240), outline=(203, 213, 225), width=3, radius=10)
    J = c.frontal((640, 340), eje=180, brazos={"izq": (10, 0), "der": (10, 0)},
                  piernas={"izq": (3, 0), "der": (3 if i == 0 else 30, 0)}, hl={"der_leg"})
    if i == 1:
        c.arco((640, 340), 250, -15, -48)
        c.texto((200, 610), "desliza la pierna hacia afuera", 32)
    else:
        c.texto((200, 610), "boca arriba, piernas estiradas", 32)


@ej
def prone_y_t(c, i):
    c.rect(130, 60, 1000, 600, fill=(226, 232, 240), outline=(203, 213, 225), width=3, radius=10)
    br = {"izq": (90, 0), "der": (90, 0)} if i == 0 else {"izq": (130, 0), "der": (130, 0)}
    c.frontal((720, 330), eje=180, brazos=br, piernas={"izq": (3, 0), "der": (3, 0)},
              hl={"izq_arm", "der_arm"})
    c.texto((240, 640), "T: brazos en cruz" if i == 0 else "Y: brazos en diagonal", 34)
    c.texto((240, 20), "boca abajo, pulgares arriba, eleva 5 cm", 30)


# ───────────────────────── DE PIE ─────────────────────────
HY = 290  # altura de cadera de pie
AY = 22   # altura del tobillo apoyado


def pierna(hip, ankle, ft=0, s=1):
    th, sh, _ = ik(hip, ankle, BASE["th"], BASE["sh"], s)
    return (th, sh, ft)


def hombro(hip, torso):
    return pol(hip, torso, BASE["torso"] - 22)


def brazo_a(hip, torso, mano, s=-1):
    sh = hombro(hip, torso)
    _, _, e = ik(sh, mano, BASE["ua"], BASE["fa"], s)
    return (e, mano)


PARADO = {"near": (-90, -90, 0), "far": (-90, -90, 0)}
BR_LADO = {"near": (-84, -80), "far": (-88, -82)}


@ej
def step_down(c, i):
    c.suelo()
    c.escalon(380, 640, 110)
    hip = (560, 110 + HY) if i == 0 else (545, 110 + HY - 62)
    near = pierna(hip, (560, 110 + AY))
    far = pierna(hip, (640, 175), ft=-30) if i == 0 else pierna(hip, (680, AY + 8), ft=-10)
    br = {"near": (-30, -10), "far": (-34, -12)}
    c.figura(hip, torso=90 if i == 0 else 84, brazos=br, piernas={"near": near, "far": far},
             hl={"near_leg"}, mira=0)
    if i == 1:
        c.flecha((760, 200), (760, 70))
        c.texto((790, 160), "baja lento,", 30)
        c.texto((790, 120), "roza con el talón", 30)
    else:
        c.texto((700, 300), "de pie sobre el escalón", 30)


@ej
def single_leg_balance(c, i):
    c.suelo()
    base = 0
    if i == 1:
        c.elipse((560, 18), 120, 22, fill=(253, 230, 138), outline=(217, 160, 40), width=5)
        base = 26
    hip = (560, HY + base)
    near = pierna(hip, (566, AY + base))
    far = pierna(hip, (470, 150 + base), s=1)
    c.figura(hip, torso=90, brazos={"near": (-60, -40), "far": (-120, -140)},
             piernas={"near": near, "far": far}, hl={"near_leg"}, mira=0)
    c.texto((700, 360), "30 s en una pierna" if i == 0 else "más difícil: cojín", 32)
    if i == 1:
        c.texto((700, 316), "u ojos cerrados", 32)


@ej
def ankle_df_mob(c, i):
    c.suelo()
    c.pared(860)
    knee_x = 800 if i == 0 else 846
    ank = (700, AY)
    hip = (600, 250) if i == 0 else (640, 236)
    _, _, kk = ik(hip, ank, BASE["th"], BASE["sh"], 1)
    near = pierna(hip, ank)
    far = pierna(hip, (420, AY + 26), ft=-30)
    tor = 84
    br = {"near": brazo_a(hip, tor, (856, 470)), "far": brazo_a(hip, tor, (856, 450))}
    J = c.figura(hip, torso=tor, brazos=br, piernas={"near": near, "far": far}, hl={"near_leg"}, mira=0)
    k = J["near_knee"]
    if i == 1:
        c.flecha((k[0] - 80, k[1] + 70), (k[0] - 10, k[1] + 30))
        c.texto((240, 560), "rodilla a la pared,", 32)
        c.texto((240, 516), "talón sin despegar", 32)
    else:
        c.texto((240, 560), "pie a unos cm de la pared", 32)


@ej
def pendulum(c, i):
    c.suelo()
    c.mesa(720, 1000, 240)
    hip = (470, HY)
    tor = 14
    br = {"near": (-90, -90), "far": brazo_a(hip, tor, (770, 250))}
    J = c.figura(hip, torso=tor, cabeza=tor - 10, brazos=br,
                 piernas={"near": pierna(hip, (520, AY)), "far": pierna(hip, (400, AY))},
                 hl={"near_arm"}, mira=-60)
    w = J["near_wrist"]
    if i == 1:
        c.elipse((w[0], w[1] - 10), 80, 28, outline=C_ARROW, width=10)
        c.flecha((w[0] + 40, w[1] - 36), (w[0] - 10, w[1] - 38), head=26)
        c.texto((180, 640), "círculos pequeños, el brazo cuelga", 30)
    else:
        c.texto((180, 640), "inclínate y deja colgar el brazo", 30)


@ej
def iso_er(c, i):
    c.suelo()
    c.pared(300)
    J = c.frontal((490, HY), brazos={"izq": ((414, 318), (356, 312)), "der": (10, 0)},
                  piernas={"izq": (4, 0), "der": (4, 0)}, hl={"izq_arm"})
    c.toalla((440, 330), 16)
    if i == 1:
        c.flecha((420, 400), (350, 400))
        c.texto((640, 470), "empuja la pared", 32)
        c.texto((640, 426), "sin mover el brazo", 32)
    else:
        c.texto((640, 470), "codo a 90°, pegado", 32)
        c.texto((640, 426), "dorso contra la pared", 32)


@ej
def wall_slide(c, i):
    c.suelo()
    wall = 760
    hip = (520, HY) if i == 0 else (548, HY)
    sh = hombro(hip, 90)
    if i == 0:
        e = (wall - 16, sh[1] - 18)
        w = (wall - 16, sh[1] + 70)
    else:
        e = (wall - 16, sh[1] + 82)
        w = (wall - 16, sh[1] + 166)
    c.pared(wall)
    c.figura(hip, torso=90, brazos={"near": (e, w), "far": (e, w)}, piernas=PARADO, hl={"near_arm"}, mira=0)
    if i == 1:
        c.flecha((wall - 70, sh[1] - 20), (wall - 70, sh[1] + 120))
        c.texto((150, 640), "desliza los antebrazos hacia arriba", 30)
    else:
        c.texto((150, 640), "antebrazos apoyados en la pared", 30)


@ej
def wrist_ext_stretch(c, i):
    c.suelo()
    hip = (480, HY)
    sh = hombro(hip, 90)
    near_e, near_w = (sh[0] + 92, sh[1]), (sh[0] + 176, sh[1])
    ang_mano = 0 if i == 0 else -80
    mano_pt = pol(near_w, ang_mano, 44)
    br = {"near": (near_e, near_w), "far": brazo_a(hip, 90, (mano_pt[0] + 14, mano_pt[1] + 8), s=-1)}
    J = c.figura(hip, torso=90, brazos=br, piernas=PARADO, hl={"near_arm"}, mira=0,
                 manos={"near": ang_mano})
    c.seg(near_w, pol(near_w, ang_mano, 50), C_HL, 24)
    c.circ(pol(near_w, ang_mano, 40), 16, fill=C_NEAR)
    if i == 1:
        c.arco(near_w, 70, 10, -70)
        c.texto((560, 560), "codo estirado,", 32)
        c.texto((560, 516), "lleva la mano hacia abajo", 32)
    else:
        c.texto((560, 560), "brazo al frente, palma abajo", 32)


@ej
def tyler_twist(c, i):
    c.suelo()
    cx = 560
    if i == 0:
        lw, rw = (cx - 10, 330), (cx + 10, 470)
        br = {"izq": ((cx - 120, 300), lw), "der": ((cx + 120, 380), rw)}
    else:
        lw, rw = (cx - 160, 420), (cx + 160, 420)
        br = {"izq": ((cx - 150, 340), lw), "der": ((cx + 150, 340), rw)}
    J = c.frontal((cx, HY), brazos=br, piernas={"izq": (4, 0), "der": (4, 0)}, hl={"izq_arm"})
    c.line([lw, rw], col=(234, 88, 12), w=26)
    if i == 0:
        c.texto((700, 600), "barra vertical, tuerce", 30)
        c.texto((700, 560), "con la mano sana", 30)
    else:
        c.texto((180, 640), "barra horizontal: suelta lento con la mano afectada", 28)
        c.arco(lw, 70, 200, 330)


@ej
def star_reach(c, i):
    c.suelo()
    for a in (0, 150, 210):
        c.d.line([P(560, 4), P(*pol((560, 4), a, 330))], fill=(203, 213, 225), width=6)
    hip = (560, 250) if i == 0 else (600, 245)
    toe = (840, AY) if i == 0 else (300, AY)
    near = pierna(hip, (566, AY))
    far = pierna(hip, (toe[0] - (30 if i == 0 else -20), AY + 10), ft=0 if i == 0 else 180)
    tor = 80 if i == 0 else 66
    br = {"near": brazo_a(hip, tor, (hip[0] + 30, hip[1] + 20)), "far": brazo_a(hip, tor, (hip[0] + 34, hip[1] + 16))}
    c.figura(hip, torso=tor, brazos=br, piernas={"near": near, "far": far}, hl={"near_leg"}, mira=0)
    c.texto((300, 620), "alcanza adelante" if i == 0 else "alcanza atrás", 32)
    c.texto((300, 576), "toca apenas con la punta", 30)


@ej
def askling_diver(c, i):
    c.suelo()
    hip = (560, HY - 10)
    near = pierna(hip, (566, AY))
    if i == 0:
        tor, br = 90, {"near": (60, 70), "far": (64, 74)}
        far = pierna(hip, (520, 80), ft=-10)
    else:
        tor, br = 22, {"near": (10, 10), "far": (12, 12)}
        far = (178, 178, -100)
    c.figura(hip, torso=tor, brazos=br, piernas={"near": near, "far": far}, hl={"near_leg"},
             mira=0 if i == 0 else -40)
    if i == 1:
        c.arco(hip, 240, 110, 40)
        c.texto((120, 640), "inclínate como un clavadista", 32)
    else:
        c.texto((120, 640), "de pie en la pierna lesionada", 32)


@ej
def askling_glider(c, i):
    c.suelo()
    c.mesa(760, 1000, 250)
    hip = (600, HY - 10) if i == 0 else (560, HY - 70)
    near = pierna(hip, (620, AY))
    far = pierna(hip, (560, AY), ft=0) if i == 0 else pierna(hip, (300, AY), ft=-10)
    tor = 84 if i == 0 else 66
    br = {"near": brazo_a(hip, tor, (790, 260)), "far": brazo_a(hip, tor, (800, 256))}
    c.figura(hip, torso=tor, brazos=br, piernas={"near": near, "far": far}, hl={"near_leg"}, mira=0)
    c.toalla((560 if i == 0 else 320, 14), 16)
    if i == 1:
        c.flecha((480, 90), (360, 90))
        c.texto((120, 640), "desliza la pierna sana atrás", 32)
    else:
        c.texto((120, 640), "manos en un apoyo", 32)


@ej
def walking(c, i):
    c.suelo()
    hip = (560, HY - 6)
    if i == 0:
        p = {"near": pierna(hip, (650, AY + 12), ft=20), "far": pierna(hip, (450, AY + 6), ft=-30)}
        b = {"near": (-110, -95), "far": (-60, -20)}
    else:
        p = {"far": pierna(hip, (650, AY + 12), ft=20), "near": pierna(hip, (450, AY + 6), ft=-30)}
        b = {"far": (-110, -95), "near": (-60, -20)}
    c.figura(hip, torso=88, brazos=b, piernas=p, hl={"near_leg"}, mira=0)
    c.texto((120, 640), "erguido, pasos regulares" if i == 0 else "brazos sueltos, ritmo cómodo", 32)


def andador(c, x):
    c.line([(x, 0), (x + 20, 250)], w=12)
    c.line([(x + 170, 0), (x + 150, 250)], w=12)
    c.line([(x + 6, 250), (x + 164, 250)], w=14)
    c.line([(x + 4, 120), (x + 166, 120)], w=8)


@ej
def gait_aid(c, i):
    c.suelo()
    hip = (480, HY - 4) if i == 0 else (540, HY - 4)
    wx = 600 if i == 0 else 620
    andador(c, wx)
    if i == 0:
        p = {"near": pierna(hip, (490, AY)), "far": pierna(hip, (476, AY))}
    else:
        p = {"near": pierna(hip, (610, AY + 8), ft=10), "far": pierna(hip, (470, AY + 4), ft=-20)}
    tor = 84
    br = {"near": brazo_a(hip, tor, (wx + 30, 262)), "far": brazo_a(hip, tor, (wx + 40, 262))}
    c.figura(hip, torso=tor, brazos=br, piernas=p, hl={"near_leg"}, mira=0)
    if i == 0:
        c.flecha((wx + 40, 330), (wx + 140, 330))
        c.texto((120, 640), "1. adelanta el andador", 32)
    else:
        c.texto((120, 640), "2. pierna operada  3. pierna sana", 32)


@ej
def stair_training(c, i):
    c.suelo()
    h = 60
    if i == 0:
        for n in range(4):
            c.rect(600 + n * 110, 0, 1100, h * (n + 1), radius=4)
        hip = (530, HY + 30)
        p = {"far": pierna(hip, (650, h + AY)), "near": pierna(hip, (520, AY))}
        c.figura(hip, torso=86, brazos={"near": (-70, -30), "far": (-60, -20)}, piernas=p, hl={"near_leg"}, mira=0)
        c.texto((80, 640), "subir: primero la sana", 32)
    else:
        for n in range(4):
            c.rect(0, 0, 520 - n * 110, h * (n + 1), radius=4)
        hip = (380, h * 2 + HY - 20)
        p = {"far": pierna(hip, (330, h * 2 + AY)), "near": pierna(hip, (470, h + AY + 20), ft=-10)}
        c.figura(hip, torso=88, brazos={"near": (-70, -30), "far": (-60, -20)}, piernas=p, hl={"near_leg"}, mira=-10)
        c.texto((560, 640), "bajar: primero la operada", 32)


@ej
def doorway_stretch(c, i):
    c.suelo()
    post = 430
    c.rect(post - 40, 0, post, 660, radius=4)
    hip = (500, HY) if i == 0 else (600, HY)
    sh = hombro(hip, 90 if i == 0 else 84)
    e = (post + 16, sh[1] - 4)
    w = (post + 16, sh[1] + 100)
    p = PARADO if i == 0 else {"near": pierna(hip, (680, AY)), "far": pierna(hip, (520, AY))}
    J = c.figura(hip, torso=90 if i == 0 else 84, brazos={"near": None, "far": None}, piernas=p, hl=set(), mira=0)
    c.seg(sh, e, C_HL, 30)
    c.seg(e, w, C_HL, 27)
    c.circ(w, 16, fill=C_HL)
    if i == 1:
        c.flecha((700, 420), (800, 420))
        c.texto((560, 640), "da un paso al frente", 32)
    else:
        c.texto((560, 640), "antebrazo en el marco", 32)


# ───────────────────────── SENTADO ─────────────────────────
SEAT = 128


def sentado(c, x=520, tor=90, brazos=None, hl=(), cab=None, mira=0, silla=True, piernas=None, **kw):
    if silla:
        c.silla(x - 20, SEAT)
    hip = (x, SEAT + 26)
    p = piernas or {"near": pierna(hip, (x + 150, AY)), "far": pierna(hip, (x + 140, AY))}
    return c.figura(hip, torso=tor, cabeza=cab, brazos=brazos or {"near": (-70, -10), "far": (-72, -12)},
                    piernas=p, hl=hl, mira=mira, **kw)


@ej
def chin_tuck(c, i):
    c.suelo()
    S = 1.0
    c.silla(500, SEAT)
    hip = (520, SEAT + 26)
    J = c.figura(hip, torso=90, cabeza=90, brazos={"near": (-70, -10), "far": (-72, -12)},
                 piernas={"near": pierna(hip, (670, AY)), "far": pierna(hip, (660, AY))},
                 hl={"head"}, mira=0, sin_far=False)
    # repintar la cabeza en la posición del ejercicio
    neck = J["neck"]
    head = (neck[0] + 34, neck[1] + 56) if i == 0 else (neck[0] - 4, neck[1] + 62)
    c.circ(J["head"], 40, fill=C_BG)
    c.seg(neck, (head[0], head[1] - 20), C_HL, 27)
    c.circ(head, 38, fill=C_HL)
    c.circ(pol(head, 0, 36), 9, fill=C_HL)
    if i == 1:
        c.flecha((head[0] + 140, head[1]), (head[0] + 60, head[1]))
        c.texto((700, 300), "lleva la cabeza atrás,", 30)
        c.texto((700, 260), "mentón recto", 30)
    else:
        c.texto((700, 300), "cabeza adelantada", 30)


@ej
def cervical_rot_snag(c, i):
    c.suelo()
    c.rect(380, 120, 740, 150, radius=6)
    J = c.frontal((560, 170), brazos={"izq": ((440, 260), (500, 420)), "der": ((690, 300), (650, 420))},
                  sin_piernas=True, cabeza_giro=0 if i == 0 else -1, hl={"head"})
    h = J["head"]
    neck = J["cuello"]
    c.line([(500, 420), (h[0] - 30, h[1] - 50), (h[0] + 30, h[1] - 50), (650, 420)], col=(217, 160, 40), w=12)
    if i == 1:
        c.arco(h, 80, 60, 150)
        c.flecha((650, 430), (720, 470))
        c.texto((760, 300), "gira la cabeza", 30)
        c.texto((760, 260), "y tira de la toalla", 30)
    else:
        c.texto((760, 300), "toalla bajo la base", 30)
        c.texto((760, 260), "del cráneo", 30)


@ej
def breathing_478(c, i):
    c.suelo()
    tor = 98
    hip = (520, SEAT + 26)
    mano = (560, SEAT + 90)
    J = sentado(c, tor=tor, brazos={"near": brazo_a(hip, tor, mano), "far": brazo_a(hip, tor, (566, SEAT + 150))})
    if i == 0:
        c.texto((720, 420), "inhala por la nariz", 32)
        c.texto((720, 370), "1 · 2 · 3 · 4", 40, col=C_HL)
    else:
        c.texto((720, 420), "exhala por la boca", 32)
        c.texto((720, 370), "1 · 2 · 3 · 4 · 5 · 6", 40, col=C_ARROW)


def antebrazo_mesa(c, i, extra=None, hl_far=False):
    c.mesa(620, 960, 230)
    hip = (500, SEAT + 26)
    tor = 90
    sh = hombro(hip, tor)
    e = (650, 248)
    w = (760, 248)
    return hip, tor, sh, e, w


@ej
def wrist_ext_iso(c, i):
    c.suelo()
    c.mesa(560, 760, 230)
    hip = (440, SEAT + 26)
    e, w = (600, 250), (740, 250)
    hand = (782, 250)
    far = brazo_a(hip, 90, (hand[0] - 4, 280))
    J = sentado(c, x=440, brazos={"near": (e, w), "far": far}, hl={"near_arm"})
    c.seg(w, hand, C_HL, 24)
    if i == 1:
        c.flecha((820, 200), (820, 290))
        c.texto((560, 500), "intenta subir la mano;", 30)
        c.texto((560, 456), "la otra mano lo impide", 30)
    else:
        c.texto((560, 500), "mano fuera del borde,", 30)
        c.texto((560, 456), "palma abajo", 30)


@ej
def grip_ball(c, i):
    c.suelo()
    c.mesa(560, 800, 230)
    hip = (440, SEAT + 26)
    e, w = (600, 250), (740, 250)
    J = sentado(c, x=440, brazos={"near": (e, w), "far": (-70, -10)}, hl={"near_arm"})
    if i == 0:
        c.balon((782, 262), 36)
        c.texto((560, 500), "pelota blanda en la mano", 30)
    else:
        c.elipse((782, 258), 30, 22, fill=(253, 230, 138), outline=(217, 160, 40), width=5)
        c.flecha((782, 360), (782, 300))
        c.flecha((782, 160), (782, 220))
        c.texto((560, 500), "aprieta 3–5 s y suelta", 30)


@ej
def forearm_rot(c, i):
    # vista de frente: el antebrazo apunta hacia quien mira
    c.suelo()
    c.rect(300, 200, 820, 232, radius=6)  # borde de la mesa
    J = c.frontal((560, 220), brazos={"izq": ((470, 300), (476, 270)), "der": ((660, 300), (640, 260))},
                  sin_piernas=True, hl={"izq_arm"})
    hand = (476, 268)
    ang = 90 if i == 0 else 150
    top = pol(hand, ang, 170)
    c.line([hand, top], col=(120, 85, 50), w=18)
    c.seg(pol(top, ang - 90, 50), pol(top, ang + 90, 50), C_PROP, 34)
    c.circ(hand, 22, fill=C_HL)
    if i == 1:
        c.arco(hand, 210, 95, 145)
        c.texto((700, 520), "gira lento la palma", 30)
        c.texto((700, 480), "hacia abajo y arriba", 30)
    else:
        c.texto((700, 520), "martillo vertical", 30)


@ej
def ankle_band_4(c, i):
    c.suelo(); c.colchoneta(160, 1060)
    hip = (360, 44)
    tor = 98
    toe_ang = 90 if i == 0 else 30
    J = c.figura(hip, torso=tor, brazos={"near": brazo_a(hip, tor, (520, 230)), "far": brazo_a(hip, tor, (514, 236))},
                 piernas={"near": (0, 0, toe_ang), "far": (2, 2, 90)}, hl={"near_leg"}, mira=0)
    toe = J["near_toe"]
    c.banda((520, 230), (toe[0] + 6, toe[1] + 4))
    c.banda((514, 236), (toe[0] + 2, toe[1] - 4))
    if i == 1:
        c.arco(J["near_ankle"], 90, 80, 30)
        c.texto((560, 440), "empuja la punta contra la banda", 30)
        c.texto((560, 396), "y luego afuera, adentro, hacia ti", 28)
    else:
        c.texto((560, 440), "banda en la planta del pie", 30)


@ej
def sit_to_stand(c, i):
    c.suelo()
    c.silla(500, SEAT)
    cross = {"near": (-60, 150), "far": (-56, 150)}
    if i == 0:
        hip = (520, SEAT + 26)
        J = c.figura(hip, torso=62, brazos=cross,
                     piernas={"near": pierna(hip, (640, AY)), "far": pierna(hip, (630, AY))},
                     hl={"near_leg", "far_leg"}, mira=-20)
        c.texto((700, 520), "inclínate adelante", 30)
    else:
        hip = (610, HY)
        J = c.figura(hip, torso=90, brazos=cross, piernas={"near": pierna(hip, (640, AY)), "far": pierna(hip, (630, AY))},
                     hl={"near_leg", "far_leg"}, mira=0)
        c.flecha((780, 200), (780, 380))
        c.texto((820, 300), "levántate", 30)
        c.texto((820, 260), "sin manos", 30)
