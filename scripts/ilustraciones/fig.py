"""Dibujador de ilustraciones de ejercicios Sakros (figura de líneas).

Lienzo de 1120x746 (se reduce a 560x373). Coordenadas del modelo con el eje y
hacia arriba desde el suelo. Ángulos absolutos en grados: 0 = derecha, 90 = arriba.
"""
import math
from PIL import Image, ImageDraw, ImageFont

W, H = 1120, 746
FLOOR = 668

BASE = dict(torso=172, neck=26, head=38, ua=92, fa=84, hand=26, th=138, sh=130, ft=40)

C_BG = (255, 255, 255)
C_FLOOR = (203, 213, 225)
C_PROP = (148, 163, 184)
C_PROP_FILL = (241, 245, 249)
C_NEAR = (71, 85, 105)
C_FAR = (184, 196, 212)
C_HL = (15, 118, 110)
C_HL_FAR = (122, 186, 178)
C_ARROW = (200, 148, 58)
C_TXT = (100, 116, 139)

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def P(x, y):
    return (x, FLOOR - y)


def pol(p, ang, ln):
    a = math.radians(ang)
    return (p[0] + ln * math.cos(a), p[1] + ln * math.sin(a))


def ik(a, b, l1, l2, s=1):
    """Dos segmentos de a hacia b; devuelve (ang1, ang2, punto_medio). s elige el lado del codo/rodilla."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    d = max(1e-6, min(math.hypot(dx, dy), l1 + l2 - 0.01))
    base = math.atan2(dy, dx)
    c = max(-1, min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))
    a1 = base + s * math.acos(c)
    m = (a[0] + l1 * math.cos(a1), a[1] + l1 * math.sin(a1))
    a2 = math.atan2(b[1] - m[1], b[0] - m[0])
    return math.degrees(a1), math.degrees(a2), m


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


class Lienzo:
    def __init__(self):
        self.im = Image.new("RGB", (W, H), C_BG)
        self.d = ImageDraw.Draw(self.im)

    # ── primitivas ──
    def seg(self, a, b, col, w):
        A, B = P(*a), P(*b)
        self.d.line([A, B], fill=col, width=int(w))
        r = w / 2
        for q in (A, B):
            self.d.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=col)

    def circ(self, c, r, fill=None, outline=None, width=5):
        x, y = P(*c)
        self.d.ellipse([x - r, y - r, x + r, y + r], fill=fill, outline=outline, width=width)

    def elipse(self, c, rx, ry, fill=None, outline=None, width=5):
        x, y = P(*c)
        self.d.ellipse([x - rx, y - ry, x + rx, y + ry], fill=fill, outline=outline, width=width)

    def rect(self, x0, y0, x1, y1, fill=C_PROP_FILL, outline=C_PROP, width=5, radius=10):
        a, b = P(x0, y1), P(x1, y0)
        self.d.rounded_rectangle([a, b], radius=radius, fill=fill, outline=outline, width=width)

    def poly(self, pts, fill=C_PROP_FILL, outline=C_PROP, width=5):
        self.d.polygon([P(*p) for p in pts], fill=fill, outline=outline, width=width)

    def line(self, pts, col=C_PROP, w=7):
        self.d.line([P(*p) for p in pts], fill=col, width=int(w), joint="curve")

    def suelo(self):
        self.d.line([(30, FLOOR + 4), (W - 30, FLOOR + 4)], fill=C_FLOOR, width=7)

    def colchoneta(self, x0=120, x1=1000):
        self.rect(x0, -3, x1, 14, fill=(226, 232, 240), outline=(203, 213, 225), width=3, radius=7)

    def _punta(self, ip, col, head):
        (xa, ya), (xb, yb) = ip[-2], ip[-1]
        ang = math.atan2(yb - ya, xb - xa)
        p1 = (xb + head * 0.25 * math.cos(ang), yb + head * 0.25 * math.sin(ang))
        p2 = (xb - head * math.cos(ang - 0.48), yb - head * math.sin(ang - 0.48))
        p3 = (xb - head * math.cos(ang + 0.48), yb - head * math.sin(ang + 0.48))
        self.d.polygon([p1, p2, p3], fill=col)

    def flecha(self, a, b, ctrl=None, col=C_ARROW, w=11, head=30, doble=False):
        """Flecha recta o curva (con punto de control)."""
        if ctrl is None:
            pts = [a, b]
        else:
            pts = [((1 - t) ** 2 * a[0] + 2 * (1 - t) * t * ctrl[0] + t ** 2 * b[0],
                    (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * ctrl[1] + t ** 2 * b[1]) for t in [i / 30 for i in range(31)]]
        ip = [P(*p) for p in pts]
        self.d.line(ip, fill=col, width=w, joint="curve")
        self._punta(ip, col, head)
        if doble:
            self._punta(ip[::-1], col, head)

    def arco(self, c, r, a0, a1, **kw):
        n = 30
        pts = [pol(c, a0 + (a1 - a0) * i / n, r) for i in range(n + 1)]
        col = kw.get("col", C_ARROW)
        ip = [P(*p) for p in pts]
        self.d.line(ip, fill=col, width=kw.get("w", 11), joint="curve")
        self._punta(ip, col, kw.get("head", 30))
        if kw.get("doble"):
            self._punta(ip[::-1], col, kw.get("head", 30))

    def texto(self, xy, s, size=34, col=C_TXT, centro=False):
        f = ImageFont.truetype(FONT, size)
        x, y = P(*xy)
        if centro:
            bb = self.d.textbbox((0, 0), s, font=f)
            x -= (bb[2] - bb[0]) / 2
        self.d.text((x, y), s, fill=col, font=f)

    # ── props ──
    def silla(self, x, alto=150, cara=1):
        """Silla vista de lado; cara=1 respaldo a la izquierda."""
        x0, x1 = x - 70, x + 70
        self.rect(x0, alto - 14, x1, alto, radius=6)
        bx = x0 if cara == 1 else x1
        self.line([(bx, alto), (bx, alto + 150)], w=12)
        self.line([(x0 + 10, alto - 14), (x0 + 10, 0)], w=10)
        self.line([(x1 - 10, alto - 14), (x1 - 10, 0)], w=10)

    def mesa(self, x0, x1, alto=230):
        self.rect(x0, alto - 18, x1, alto, radius=6)
        self.line([(x0 + 20, alto - 18), (x0 + 20, 0)], w=10)
        self.line([(x1 - 20, alto - 18), (x1 - 20, 0)], w=10)

    def camilla(self, x0, x1, alto=170):
        self.rect(x0, alto - 26, x1, alto, radius=8)
        self.line([(x0 + 30, alto - 26), (x0 + 30, 0)], w=12)
        self.line([(x1 - 30, alto - 26), (x1 - 30, 0)], w=12)

    def pared(self, x):
        self.rect(x, 0, x + 40, 700, fill=(226, 232, 240), outline=(203, 213, 225), width=3, radius=0)

    def escalon(self, x0, x1, alto=70):
        self.rect(x0, 0, x1, alto, radius=6)

    def balon(self, c, r=34, col=(253, 230, 138)):
        self.circ(c, r, fill=col, outline=(217, 160, 40), width=5)

    def toalla(self, c, r=20):
        self.circ(c, r, fill=(254, 243, 199), outline=(217, 160, 40), width=4)

    def banda(self, a, b):
        self.line([a, b], col=(234, 88, 12), w=8)

    # ── figura lateral ──
    def figura(self, hip, torso=90, cabeza=None, brazos=None, piernas=None, hl=(), S=1.0,
               mira=None, sin_far=False, sh_off=(0, 0), manos=None):
        """
        brazos: {'near': (ua, fa), 'far': (ua, fa)}; manos opcional: {'near': ang}
        piernas: {'near': (th, sh, ft), 'far': (...)}
        mira: ángulo de la cara (nariz) para orientar la cabeza.
        hl: partes resaltadas: near_arm, far_arm, near_leg, far_leg, torso, head
        """
        Ld = {k: v * S for k, v in BASE.items()}
        brazos = brazos or {"near": (-90, -90), "far": (-90, -90)}
        piernas = piernas or {"near": (-90, -90, 0), "far": (-90, -90, 0)}
        manos = manos or {}
        cabeza = torso if cabeza is None else cabeza
        wl, wa, wt = 34 * S, 30 * S, 58 * S
        J = {"hip": hip}
        J["neck"] = pol(hip, torso, Ld["torso"])
        J["sh"] = pol(hip, torso, Ld["torso"] - 22 * S)
        J["sh"] = (J["sh"][0] + sh_off[0], J["sh"][1] + sh_off[1])
        J["head"] = pol(J["neck"], cabeza, Ld["neck"] + Ld["head"])

        for lado in ("far", "near"):
            th, sh, ft = piernas[lado]
            k = pol(hip, th, Ld["th"])
            a = pol(k, sh, Ld["sh"])
            J[lado + "_knee"], J[lado + "_ankle"], J[lado + "_toe"] = k, a, pol(a, ft, Ld["ft"])
            br = brazos.get(lado)
            if br is None:
                continue
            if isinstance(br[0], tuple):
                e, w = br
                fa = math.degrees(math.atan2(w[1] - e[1], w[0] - e[0]))
            else:
                ua, fa = br
                e = pol(J["sh"], ua, Ld["ua"])
                w = pol(e, fa, Ld["fa"])
            J[lado + "_elbow"], J[lado + "_wrist"] = e, w
            J[lado + "_hand"] = pol(w, manos.get(lado, fa), Ld["hand"])

        def col(parte, lado):
            if parte in hl:
                return C_HL if lado == "near" else C_HL_FAR
            return C_NEAR if lado == "near" else C_FAR

        def pierna(lado):
            c = col(lado + "_leg", lado)
            self.seg(hip, J[lado + "_knee"], c, wl)
            self.seg(J[lado + "_knee"], J[lado + "_ankle"], c, wl * 0.92)
            self.seg(J[lado + "_ankle"], J[lado + "_toe"], c, wl * 0.7)

        def brazo(lado):
            if lado + "_elbow" not in J:
                return
            c = col(lado + "_arm", lado)
            self.seg(J["sh"], J[lado + "_elbow"], c, wa)
            self.seg(J[lado + "_elbow"], J[lado + "_wrist"], c, wa * 0.9)
            self.seg(J[lado + "_wrist"], J[lado + "_hand"], c, wa * 0.75)

        if not sin_far:
            pierna("far")
            brazo("far")
        ct = C_HL if "torso" in hl else C_NEAR
        self.seg(hip, J["neck"], ct, wt)
        ch = C_HL if "head" in hl else C_NEAR
        self.seg(J["neck"], pol(J["neck"], cabeza, Ld["neck"] + 6), ch, wa * 0.9)
        self.circ(J["head"], Ld["head"], fill=ch)
        if mira is not None:
            n = pol(J["head"], mira, Ld["head"] * 0.95)
            self.circ(n, 9 * S, fill=ch)
        pierna("near")
        brazo("near")
        J["S"] = S
        return J

    # ── figura frontal / vista superior ──
    def frontal(self, centro, eje=90, brazos=None, piernas=None, hl=(), S=1.0, cabeza_giro=0,
                hombro_ancho=1.0, sin_piernas=False):
        """
        Figura simétrica vista de frente (o desde arriba si está acostada).
        eje: dirección de los pies a la cabeza. brazos/piernas: ángulos relativos al
        eje hacia abajo (0 = paralelo al cuerpo hacia los pies; positivo = hacia afuera).
        brazos: {'izq': (ua, fa), 'der': (ua, fa)}; piernas: {'izq': (th, sh), 'der': (...)}
        """
        Ld = {k: v * S for k, v in BASE.items()}
        brazos = brazos or {"izq": (12, 0), "der": (12, 0)}
        piernas = piernas or {"izq": (4, 0), "der": (4, 0)}
        abajo = eje + 180
        perp = eje - 90  # hacia la derecha de la imagen si eje=90
        hw, sw = 34 * S, 74 * S * hombro_ancho
        pelvis = centro
        cuello = pol(pelvis, eje, Ld["torso"])
        hombro_c = pol(pelvis, eje, Ld["torso"] - 24 * S)
        J = {}
        wl, wa, wt = 34 * S, 30 * S, 58 * S

        def col(parte):
            return C_HL if parte in hl else C_NEAR

        for lado, s in (("izq", -1), ("der", 1)):
            cad = pol(pelvis, perp, s * hw)
            th, sh = piernas[lado]
            k = pol(cad, abajo - s * th, Ld["th"])
            a = pol(k, abajo - s * (th + sh), Ld["sh"])
            J[lado + "_knee"], J[lado + "_ankle"] = k, a
            if not sin_piernas:
                c = col(lado + "_leg")
                self.seg(cad, k, c, wl)
                self.seg(k, a, c, wl * 0.92)
                self.circ(pol(a, abajo, 6 * S), 18 * S, fill=c)
        self.seg(pol(pelvis, perp, -hw), pol(pelvis, perp, hw), col("torso"), wt * 0.9)
        # tronco como trapecio
        hi, hd = pol(hombro_c, perp, -sw), pol(hombro_c, perp, sw)
        pi, pd = pol(pelvis, perp, -hw * 1.2), pol(pelvis, perp, hw * 1.2)
        self.poly([hi, hd, pd, pi], fill=col("torso"), outline=col("torso"), width=1)
        self.seg(hi, hd, col("torso"), wa)
        self.seg(pelvis, cuello, col("torso"), wt * 0.6)
        cab = pol(cuello, eje, Ld["neck"] + Ld["head"])
        self.seg(cuello, pol(cuello, eje, Ld["neck"] + 6), col("head"), wa * 0.9)
        self.circ(cab, Ld["head"], fill=col("head"))
        if cabeza_giro:
            n = pol(cab, perp, cabeza_giro * Ld["head"] * 0.9)
            self.circ(n, 10 * S, fill=col("head"))
        J["head"] = cab
        for lado, s in (("izq", -1), ("der", 1)):
            hom = hi if s < 0 else hd
            if isinstance(brazos[lado][0], tuple):
                e, w = brazos[lado]
            else:
                ua, fa = brazos[lado]
                e = pol(hom, abajo - s * ua, Ld["ua"])
                w = pol(e, abajo - s * fa, Ld["fa"])
            c = col(lado + "_arm")
            self.seg(hom, e, c, wa)
            self.seg(e, w, c, wa * 0.9)
            self.circ(w, 17 * S, fill=c)
            J[lado + "_sh"], J[lado + "_elbow"], J[lado + "_wrist"] = hom, e, w
        J["pelvis"], J["cuello"] = pelvis, cuello
        return J

    def esqueleto(self, cadenas, cabeza=None, mira=None, S=1.0):
        """Dibuja cadenas de puntos explícitos: [(pts, tipo, col)], tipo: torso|pierna|brazo."""
        anchos = {"torso": 58, "pierna": 34, "brazo": 30}
        for pts, tipo, col in cadenas:
            w = anchos[tipo] * S
            for n in range(len(pts) - 1):
                f = 1.0 if n == 0 else (0.92 if n == 1 else 0.72)
                self.seg(pts[n], pts[n + 1], col, w * f)
        if cabeza:
            c, r, col = cabeza
            self.circ(c, r * S, fill=col)
            if mira is not None:
                self.circ(pol(c, mira, r * S * 0.95), 9 * S, fill=col)

    def caja(self):
        import numpy as np
        a = np.asarray(self.im).astype(int)
        bg = np.all(a == C_BG, axis=2) | np.all(a == C_FLOOR, axis=2) | np.all(a == (226, 232, 240), axis=2)
        ys, xs = np.where(~bg)
        if len(xs) == 0:
            x0, x1, y0, y1 = 0, W, 0, H
        else:
            x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), min(H, max(ys.max(), FLOOR + 12))
        return x0, x1, y0, y1

    def guardar(self, ruta, caja=None, min_w=640):
        x0, x1, y0, y1 = caja or self.caja()
        pad = 40
        x0, x1, y0, y1 = x0 - pad, x1 + pad, y0 - pad, y1 + pad // 2
        cw, ch = x1 - x0, y1 - y0
        cw = max(cw, min_w, ch * 1.5)
        ch = cw / 1.5
        cx = (x0 + x1) / 2
        box = (int(cx - cw / 2), int(y1 - ch), int(cx + cw / 2), int(y1))
        lienzo = Image.new("RGB", (W * 3, H * 3), C_BG)
        lienzo.paste(self.im, (W, H))
        # extender el suelo a los lados
        dd = ImageDraw.Draw(lienzo)
        dd.line([(0, H + FLOOR + 4), (W * 3, H + FLOOR + 4)], fill=C_FLOOR, width=7)
        lienzo.paste(self.im.crop((30, 0, W - 30, H)), (W + 30, H))
        im = lienzo.crop((box[0] + W, box[1] + H, box[2] + W, box[3] + H)).resize((W // 2, round(W // 2 / 1.5)), Image.LANCZOS)
        im.save(ruta, "JPEG", quality=86, optimize=True, progressive=True)
