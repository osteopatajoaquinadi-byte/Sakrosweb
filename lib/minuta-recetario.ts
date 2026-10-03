/*
 * Recetario precargado para la minuta de 10 días.
 *
 * El código elige las preparaciones (rotando proteínas, respetando
 * restricciones y sin repetir) y calcula las porciones en gramos según los
 * macros del paciente. La IA solo se usa como respaldo cuando las
 * restricciones dejan sin opciones del recetario.
 */

/* ── Ingredientes: macros por 100 g ── */
type Tag =
  | "gluten" | "lacteo" | "mani" | "marisco" | "huevo" | "soja"
  | "frutosSecos" | "cerdo" | "carne" | "pescado" | "animal";

type Ingrediente = {
  nombre: string;
  p: number; h: number; g: number; k: number;
  tags?: Tag[];
  unidad?: { g: number; singular: string; plural: string };
};

const I: Record<string, Ingrediente> = {
  huevo: { nombre: "Huevos", p: 13, h: 1, g: 10, k: 143, tags: ["huevo", "animal"], unidad: { g: 55, singular: "huevo", plural: "huevos" } },
  clara: { nombre: "Claras de huevo", p: 11, h: 1, g: 0, k: 52, tags: ["huevo", "animal"] },
  quesoCabra: { nombre: "Queso de cabra", p: 22, h: 2, g: 30, k: 364, tags: ["lacteo", "animal"] },
  quesoFresco: { nombre: "Queso fresco", p: 17, h: 3, g: 13, k: 200, tags: ["lacteo", "animal"] },
  yogur: { nombre: "Yogur griego natural", p: 9, h: 4, g: 5, k: 97, tags: ["lacteo", "animal"] },
  palta: { nombre: "Palta", p: 2, h: 2, g: 15, k: 160 },
  espinaca: { nombre: "Espinaca", p: 3, h: 1, g: 0, k: 23 },
  tomate: { nombre: "Tomate", p: 1, h: 3, g: 0, k: 18 },
  tomateTriturado: { nombre: "Tomate triturado", p: 1, h: 5, g: 0, k: 30 },
  champinon: { nombre: "Champiñones", p: 3, h: 2, g: 0, k: 22 },
  pimenton: { nombre: "Pimentón", p: 1, h: 5, g: 0, k: 31 },
  zapallito: { nombre: "Zapallo italiano", p: 1, h: 2, g: 0, k: 17 },
  brocoli: { nombre: "Brócoli", p: 3, h: 4, g: 0, k: 34 },
  coliflor: { nombre: "Coliflor", p: 2, h: 3, g: 0, k: 25 },
  hojas: { nombre: "Hojas verdes", p: 1, h: 1, g: 0, k: 15 },
  pepino: { nombre: "Pepino", p: 1, h: 2, g: 0, k: 15 },
  cebolla: { nombre: "Cebolla", p: 1, h: 8, g: 0, k: 40 },
  esparragos: { nombre: "Espárragos", p: 2, h: 2, g: 0, k: 20 },
  repollo: { nombre: "Repollo", p: 1, h: 3, g: 0, k: 25 },
  chucrut: { nombre: "Chucrut", p: 1, h: 2, g: 0, k: 19 },
  berenjena: { nombre: "Berenjena", p: 1, h: 3, g: 0, k: 25 },
  berries: { nombre: "Berries", p: 1, h: 10, g: 0, k: 50 },
  aceite: { nombre: "Aceite de oliva", p: 0, h: 0, g: 100, k: 884 },
  almendras: { nombre: "Almendras", p: 21, h: 10, g: 50, k: 579, tags: ["frutosSecos"] },
  nueces: { nombre: "Nueces", p: 15, h: 7, g: 65, k: 654, tags: ["frutosSecos"] },
  harinaAlmendra: { nombre: "Harina de almendra", p: 21, h: 10, g: 50, k: 580, tags: ["frutosSecos"] },
  chia: { nombre: "Semillas de chía", p: 17, h: 8, g: 31, k: 486 },
  semillasZapallo: { nombre: "Semillas de zapallo", p: 30, h: 5, g: 49, k: 559 },
  coco: { nombre: "Chips de coco", p: 7, h: 7, g: 65, k: 660 },
  aceitunas: { nombre: "Aceitunas", p: 1, h: 3, g: 11, k: 115 },
  lecheCoco: { nombre: "Leche de coco", p: 2, h: 3, g: 21, k: 200 },
  salmon: { nombre: "Salmón", p: 20, h: 0, g: 13, k: 208, tags: ["pescado", "animal"] },
  merluza: { nombre: "Merluza", p: 18, h: 0, g: 1, k: 82, tags: ["pescado", "animal"] },
  reineta: { nombre: "Reineta", p: 19, h: 0, g: 2, k: 95, tags: ["pescado", "animal"] },
  atun: { nombre: "Atún al agua", p: 26, h: 0, g: 1, k: 116, tags: ["pescado", "animal"] },
  sardinas: { nombre: "Sardinas", p: 25, h: 0, g: 11, k: 208, tags: ["pescado", "animal"] },
  jurel: { nombre: "Jurel", p: 23, h: 0, g: 7, k: 160, tags: ["pescado", "animal"] },
  congrio: { nombre: "Congrio", p: 18, h: 0, g: 1, k: 85, tags: ["pescado", "animal"] },
  camarones: { nombre: "Camarones", p: 24, h: 0, g: 1, k: 99, tags: ["marisco", "animal"] },
  choritos: { nombre: "Choritos", p: 12, h: 4, g: 2, k: 86, tags: ["marisco", "animal"] },
  pollo: { nombre: "Pechuga de pollo", p: 31, h: 0, g: 4, k: 165, tags: ["carne", "animal"] },
  trutro: { nombre: "Trutro de pollo deshuesado", p: 24, h: 0, g: 9, k: 177, tags: ["carne", "animal"] },
  pavo: { nombre: "Pechuga de pavo", p: 29, h: 0, g: 2, k: 135, tags: ["carne", "animal"] },
  jamonPavo: { nombre: "Jamón de pavo", p: 20, h: 2, g: 3, k: 110, tags: ["carne", "animal"] },
  vacuno: { nombre: "Posta de vacuno", p: 21, h: 0, g: 4, k: 130, tags: ["carne", "animal"] },
  molida: { nombre: "Carne molida 5%", p: 21, h: 0, g: 5, k: 137, tags: ["carne", "animal"] },
  cerdo: { nombre: "Lomo de cerdo", p: 22, h: 0, g: 6, k: 143, tags: ["cerdo", "carne", "animal"] },
  cordero: { nombre: "Cordero", p: 20, h: 0, g: 15, k: 215, tags: ["carne", "animal"] },
  tofu: { nombre: "Tofu firme", p: 15, h: 2, g: 9, k: 144, tags: ["soja"] },
  tempeh: { nombre: "Tempeh", p: 19, h: 9, g: 11, k: 192, tags: ["soja"] },
  edamame: { nombre: "Edamame", p: 11, h: 5, g: 5, k: 121, tags: ["soja"] },
  lentejas: { nombre: "Lentejas cocidas", p: 9, h: 12, g: 0, k: 116 },
  garbanzos: { nombre: "Garbanzos cocidos", p: 9, h: 15, g: 3, k: 164 },
  hummus: { nombre: "Hummus", p: 8, h: 10, g: 10, k: 170 },
  lupino: { nombre: "Lupino", p: 16, h: 7, g: 3, k: 119 },
  protVegetal: { nombre: "Proteína vegetal en polvo", p: 80, h: 5, g: 7, k: 400 },
};

/* ── Recetas ── */
type Rol = "prot" | "grasa" | "fijo";
type Item = [keyof typeof I, number, Rol]; // ingrediente, gramos base, rol
type Receta = { id: string; n: string; items: Item[]; grupo: string; temas?: number[] };

// temas: índices de TEMAS (0 antiinflamatorio … 9 consolidación) donde la receta encaja mejor
const DESAYUNOS: Receta[] = [
  { id: "b1", n: "Omelette de espinaca y queso de cabra", grupo: "huevo", temas: [3, 5], items: [["huevo", 165, "prot"], ["espinaca", 60, "fijo"], ["quesoCabra", 25, "fijo"], ["palta", 50, "grasa"]] },
  { id: "b2", n: "Shakshuka de tomate y pimentón", grupo: "huevo", temas: [0, 4], items: [["huevo", 165, "prot"], ["tomateTriturado", 150, "fijo"], ["pimenton", 60, "fijo"], ["cebolla", 30, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "b3", n: "Huevos pochados sobre espárragos y palta", grupo: "huevo", temas: [6, 9], items: [["huevo", 165, "prot"], ["esparragos", 100, "fijo"], ["palta", 60, "grasa"]] },
  { id: "b4", n: "Frittata al horno de zapallo italiano y champiñones", grupo: "huevo", temas: [7, 8], items: [["huevo", 165, "prot"], ["zapallito", 80, "fijo"], ["champinon", 60, "fijo"], ["quesoFresco", 30, "fijo"], ["aceite", 5, "grasa"]] },
  { id: "b5", n: "Huevos revueltos con champiñones y ciboulette", grupo: "huevo", temas: [7, 8], items: [["huevo", 165, "prot"], ["champinon", 80, "fijo"], ["aceite", 8, "grasa"]] },
  { id: "b6", n: "Panqueques de harina de almendra con berries", grupo: "huevo", temas: [4, 9], items: [["huevo", 110, "prot"], ["harinaAlmendra", 30, "grasa"], ["berries", 60, "fijo"]] },
  { id: "b7", n: "Tortilla de claras con espinaca y tomate", grupo: "huevo", temas: [5, 6], items: [["clara", 200, "prot"], ["espinaca", 60, "fijo"], ["tomate", 60, "fijo"], ["palta", 50, "grasa"]] },
  { id: "b8", n: "Huevos cocidos con palta, tomate y semillas de zapallo", grupo: "huevo", temas: [5, 7], items: [["huevo", 165, "prot"], ["tomate", 80, "fijo"], ["semillasZapallo", 10, "fijo"], ["palta", 60, "grasa"]] },
  { id: "b9", n: "Budín de chía con yogur griego y berries", grupo: "lacteo", temas: [1, 3, 4], items: [["yogur", 200, "prot"], ["chia", 25, "fijo"], ["berries", 60, "fijo"], ["nueces", 15, "grasa"]] },
  { id: "b10", n: "Huevos al plato con berenjena asada y tomate", grupo: "huevo", temas: [0, 9], items: [["huevo", 165, "prot"], ["berenjena", 100, "fijo"], ["tomate", 80, "fijo"], ["aceite", 8, "grasa"]] },
  { id: "b11", n: "Revuelto de tofu con cúrcuma y espinaca", grupo: "vegetal", temas: [0, 6], items: [["tofu", 180, "prot"], ["espinaca", 60, "fijo"], ["pimenton", 50, "fijo"], ["aceite", 8, "grasa"]] },
  { id: "b12", n: "Batido verde con proteína vegetal, berries y leche de coco", grupo: "vegetal", temas: [4, 8], items: [["protVegetal", 30, "prot"], ["espinaca", 50, "fijo"], ["berries", 60, "fijo"], ["chia", 10, "fijo"], ["lecheCoco", 100, "grasa"]] },
];

const PRINCIPALES: Receta[] = [
  { id: "m1", n: "Salmón al horno con espárragos y limón", grupo: "salmon", temas: [0, 2, 5], items: [["salmon", 150, "prot"], ["esparragos", 150, "fijo"], ["aceite", 5, "grasa"]] },
  { id: "m2", n: "Pollo salteado al wok con brócoli y pimentón", grupo: "pollo", temas: [6, 9], items: [["pollo", 150, "prot"], ["brocoli", 120, "fijo"], ["pimenton", 80, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m3", n: "Posta de vacuno a la plancha con ensalada verde y palta", grupo: "vacuno", temas: [8], items: [["vacuno", 150, "prot"], ["hojas", 80, "fijo"], ["tomate", 80, "fijo"], ["palta", 60, "grasa"]] },
  { id: "m4", n: "Merluza al vapor con zapallo italiano y salsa verde", grupo: "pescadoBlanco", temas: [5, 9], items: [["merluza", 170, "prot"], ["zapallito", 150, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m5", n: "Guiso de pavo con berenjena y tomate", grupo: "pavo", temas: [3, 9], items: [["pavo", 150, "prot"], ["berenjena", 120, "fijo"], ["tomateTriturado", 100, "fijo"], ["cebolla", 30, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m6", n: "Sardinas en papillote con pimentón y cebolla", grupo: "pescadoAzul", temas: [2, 5], items: [["sardinas", 120, "prot"], ["pimenton", 100, "fijo"], ["cebolla", 40, "fijo"], ["aceite", 5, "grasa"]] },
  { id: "m7", n: "Reineta a la parrilla con coliflor asada", grupo: "pescadoBlanco", temas: [6, 9], items: [["reineta", 160, "prot"], ["coliflor", 150, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m8", n: "Ensalada tibia de lomo de cerdo, hojas verdes y nueces", grupo: "cerdo", temas: [8, 9], items: [["cerdo", 150, "prot"], ["hojas", 100, "fijo"], ["pepino", 80, "fijo"], ["nueces", 15, "grasa"]] },
  { id: "m9", n: "Pollo al curry suave con coliflor y leche de coco", grupo: "pollo", temas: [0, 7], items: [["trutro", 150, "prot"], ["coliflor", 120, "fijo"], ["cebolla", 30, "fijo"], ["lecheCoco", 60, "grasa"]] },
  { id: "m10", n: "Ensalada de atún con pepino, tomate y palta", grupo: "atun", temas: [2, 9], items: [["atun", 130, "prot"], ["pepino", 100, "fijo"], ["tomate", 100, "fijo"], ["palta", 60, "grasa"]] },
  { id: "m11", n: "Cordero braseado con repollo salteado", grupo: "cordero", temas: [8], items: [["cordero", 150, "prot"], ["repollo", 150, "fijo"], ["aceite", 5, "grasa"]] },
  { id: "m12", n: "Brochetas de pavo con pimentón, zapallo italiano y cebolla", grupo: "pavo", temas: [3, 9], items: [["pavo", 150, "prot"], ["pimenton", 80, "fijo"], ["zapallito", 80, "fijo"], ["cebolla", 30, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m13", n: "Salteado de camarones con zapallo italiano y ajo", grupo: "marisco", temas: [7], items: [["camarones", 150, "prot"], ["zapallito", 150, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m14", n: "Pastel de lentejas y verduras con huevo", grupo: "legumbre", temas: [1, 9], items: [["lentejas", 120, "fijo"], ["huevo", 110, "prot"], ["zapallito", 80, "fijo"], ["espinaca", 50, "fijo"], ["aceite", 8, "grasa"]] },
  { id: "m15", n: "Albóndigas de vacuno al horno en salsa de tomate", grupo: "vacuno", temas: [8], items: [["molida", 150, "prot"], ["tomateTriturado", 120, "fijo"], ["hojas", 60, "fijo"], ["aceite", 8, "grasa"]] },
  { id: "m16", n: "Congrio al horno con hierbas y espárragos", grupo: "pescadoBlanco", temas: [5, 6], items: [["congrio", 170, "prot"], ["esparragos", 120, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m17", n: "Bowl de pollo con verduras asadas y palta", grupo: "pollo", temas: [4, 9], items: [["pollo", 150, "prot"], ["berenjena", 80, "fijo"], ["pimenton", 60, "fijo"], ["zapallito", 60, "fijo"], ["palta", 60, "grasa"]] },
  { id: "m18", n: "Crema de zapallo italiano con tofu salteado", grupo: "tofu", temas: [1, 6], items: [["tofu", 200, "prot"], ["zapallito", 200, "fijo"], ["cebolla", 30, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m19", n: "Tempeh salteado con brócoli y sésamo", grupo: "tempeh", temas: [1, 3], items: [["tempeh", 150, "prot"], ["brocoli", 150, "fijo"], ["aceite", 8, "grasa"]] },
  { id: "m20", n: "Ceviche de reineta con pepino, cebolla morada y palta", grupo: "pescadoBlanco", temas: [5, 7], items: [["reineta", 160, "prot"], ["pepino", 80, "fijo"], ["cebolla", 30, "fijo"], ["palta", 60, "grasa"]] },
  { id: "m21", n: "Choritos al vapor con ensalada de tomate", grupo: "marisco", temas: [7, 8], items: [["choritos", 250, "prot"], ["tomate", 100, "fijo"], ["hojas", 60, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m22", n: "Lomo de cerdo al horno con chucrut y espinaca", grupo: "cerdo", temas: [1, 3], items: [["cerdo", 150, "prot"], ["chucrut", 80, "fijo"], ["espinaca", 80, "fijo"], ["aceite", 8, "grasa"]] },
  { id: "m23", n: "Garbanzos al curry con espinaca y huevo duro", grupo: "legumbre", temas: [0, 1], items: [["garbanzos", 100, "fijo"], ["huevo", 110, "prot"], ["espinaca", 100, "fijo"], ["lecheCoco", 50, "grasa"]] },
  { id: "m24", n: "Hamburguesa casera de pavo con champiñones y ensalada", grupo: "pavo", temas: [7, 9], items: [["pavo", 150, "prot"], ["champinon", 100, "fijo"], ["hojas", 60, "fijo"], ["palta", 50, "grasa"]] },
  { id: "m25", n: "Jurel con ensalada chilena y aceitunas", grupo: "pescadoAzul", temas: [2, 5], items: [["jurel", 140, "prot"], ["tomate", 120, "fijo"], ["cebolla", 30, "fijo"], ["aceitunas", 30, "grasa"]] },
  { id: "m26", n: "Tofu al horno con berenjena y tomate", grupo: "tofu", temas: [0, 4], items: [["tofu", 200, "prot"], ["berenjena", 120, "fijo"], ["tomate", 80, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m27", n: "Salmón salteado con repollo y sésamo", grupo: "salmon", temas: [2, 6], items: [["salmon", 150, "prot"], ["repollo", 150, "fijo"], ["aceite", 5, "grasa"]] },
  { id: "m28", n: "Guiso de lentejas con verduras y tempeh", grupo: "legumbre", temas: [1, 8], items: [["lentejas", 100, "fijo"], ["tempeh", 100, "prot"], ["zapallito", 80, "fijo"], ["cebolla", 30, "fijo"], ["aceite", 8, "grasa"]] },
  // Vegetarianas / veganas
  { id: "m29", n: "Tofu salteado al wok con pimentón, brócoli y sésamo", grupo: "tofu", temas: [6, 9], items: [["tofu", 200, "prot"], ["pimenton", 80, "fijo"], ["brocoli", 100, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m30", n: "Curry de garbanzos, coliflor y tofu con leche de coco", grupo: "legumbre", temas: [0, 1], items: [["garbanzos", 80, "fijo"], ["tofu", 120, "prot"], ["coliflor", 100, "fijo"], ["lecheCoco", 60, "grasa"]] },
  { id: "m31", n: "Hamburguesas de lentejas y champiñones con ensalada", grupo: "legumbre", temas: [1, 7], items: [["lentejas", 120, "fijo"], ["protVegetal", 20, "prot"], ["champinon", 80, "fijo"], ["hojas", 60, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m32", n: "Ensalada tibia de lupino, tomate, pepino y palta", grupo: "lupino", temas: [4, 6], items: [["lupino", 150, "prot"], ["tomate", 100, "fijo"], ["pepino", 80, "fijo"], ["palta", 60, "grasa"]] },
  { id: "m33", n: "Tempeh a la plancha con espárragos y salsa verde", grupo: "tempeh", temas: [5, 8], items: [["tempeh", 150, "prot"], ["esparragos", 120, "fijo"], ["aceite", 10, "grasa"]] },
  { id: "m34", n: "Berenjenas rellenas de lentejas y tofu", grupo: "tofu", temas: [0, 9], items: [["tofu", 120, "prot"], ["lentejas", 80, "fijo"], ["berenjena", 150, "fijo"], ["tomateTriturado", 80, "fijo"], ["aceite", 8, "grasa"]] },
  { id: "m35", n: "Frittata de verduras con queso fresco", grupo: "huevo", temas: [3, 9], items: [["huevo", 165, "prot"], ["zapallito", 100, "fijo"], ["pimenton", 60, "fijo"], ["quesoFresco", 40, "fijo"], ["aceite", 8, "grasa"]] },
  { id: "m36", n: "Ensalada de huevo, espárragos y queso de cabra", grupo: "huevo", temas: [5, 6], items: [["huevo", 165, "prot"], ["esparragos", 100, "fijo"], ["hojas", 60, "fijo"], ["quesoCabra", 30, "fijo"], ["aceite", 8, "grasa"]] },
];

const SNACKS: Receta[] = [
  { id: "s1", n: "Mix de almendras y nueces", grupo: "fs", temas: [2, 4], items: [["almendras", 15, "grasa"], ["nueces", 10, "fijo"]] },
  { id: "s2", n: "Bastones de pepino y pimentón con hummus", grupo: "hummus", temas: [1, 9], items: [["hummus", 60, "fijo"], ["pepino", 80, "fijo"], ["pimenton", 50, "fijo"]] },
  { id: "s3", n: "Huevo duro con aceitunas", grupo: "huevo", temas: [8], items: [["huevo", 55, "prot"], ["aceitunas", 30, "grasa"]] },
  { id: "s4", n: "Yogur griego natural con nueces", grupo: "lacteo", temas: [1, 3], items: [["yogur", 150, "prot"], ["nueces", 10, "grasa"]] },
  { id: "s5", n: "Queso de cabra con pepino", grupo: "lacteo", temas: [9], items: [["quesoCabra", 30, "fijo"], ["pepino", 100, "fijo"]] },
  { id: "s6", n: "Chips de coco con almendras", grupo: "fs", temas: [8], items: [["coco", 15, "grasa"], ["almendras", 10, "fijo"]] },
  { id: "s7", n: "Palta con limón y semillas de zapallo", grupo: "palta", temas: [5, 7], items: [["palta", 80, "grasa"], ["semillasZapallo", 10, "fijo"]] },
  { id: "s8", n: "Yogur griego con berries y chía", grupo: "lacteo", temas: [4], items: [["yogur", 100, "prot"], ["berries", 80, "fijo"], ["chia", 10, "fijo"]] },
  { id: "s9", n: "Rollitos de jamón de pavo con palta", grupo: "pavo", temas: [3], items: [["jamonPavo", 60, "prot"], ["palta", 40, "grasa"]] },
  { id: "s10", n: "Edamame con sal de mar", grupo: "soja", temas: [7], items: [["edamame", 100, "prot"]] },
  { id: "s11", n: "Lupino aliñado con oliva y limón", grupo: "lupino", temas: [1, 6], items: [["lupino", 80, "prot"], ["aceite", 5, "grasa"]] },
  { id: "s12", n: "Batido de proteína vegetal con leche de coco", grupo: "vegetal", temas: [8], items: [["protVegetal", 20, "prot"], ["lecheCoco", 100, "grasa"]] },
];

/* ── Restricciones ── */
export type Restricciones = Partial<Record<
  "sinGluten" | "sinLacteos" | "sinMani" | "sinMariscos" | "sinHuevo" | "sinSoja" |
  "vegetariano" | "vegano" | "sinFrutosSecos" | "sinCerdo", boolean
>>;

function prohibidos(r: Restricciones): Set<Tag> {
  const s = new Set<Tag>();
  if (r.sinGluten) s.add("gluten");
  if (r.sinLacteos) s.add("lacteo");
  if (r.sinMani) s.add("mani");
  if (r.sinMariscos) s.add("marisco");
  if (r.sinHuevo) s.add("huevo");
  if (r.sinSoja) s.add("soja");
  if (r.sinFrutosSecos) s.add("frutosSecos");
  if (r.sinCerdo) s.add("cerdo");
  if (r.vegetariano) { s.add("carne"); s.add("pescado"); s.add("marisco"); }
  if (r.vegano) s.add("animal");
  return s;
}

const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function permitida(rec: Receta, prohib: Set<Tag>, terminos: string[]) {
  const porTag = rec.items.every(([ing]) => !(I[ing].tags ?? []).some((t) => prohib.has(t)));
  if (!porTag) return false;
  // "Otras restricciones" escritas a mano: se excluye la receta si algún
  // término coincide con su nombre o sus ingredientes.
  const texto = norm([rec.n, ...rec.items.map(([ing]) => I[ing].nombre)].join(" "));
  return !terminos.some((t) => texto.includes(t));
}

// "alergia al kiwi, intolerancia a la fructosa" → ["kiwi", "fructosa"]
function terminosOtras(otras?: string) {
  if (!otras) return [];
  const vacias = new Set(["alergia", "alergico", "alergica", "intolerancia", "sin", "al", "a", "la", "el", "los", "las", "de", "del", "y", "o", "no", "come", "evitar"]);
  return norm(otras)
    .split(/[,;/\n]+|\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 3 && !vacias.has(x))
    .map((x) => x.replace(/s$/, ""));
}

/* ── Porciones ── */
// Rango de gramos por ingrediente según su rol
function rango(ing: keyof typeof I, rol: Rol, desayuno: boolean): [number, number, number] {
  const x = I[ing];
  if (rol === "prot") {
    // Huevos: hasta 4 al desayuno, hasta 3 en el resto de las comidas
    if (x.unidad) return [x.unidad.g * 1, x.unidad.g * (desayuno ? 4 : 3), x.unidad.g];
    if (ing === "protVegetal") return [15, 40, 5];
    if (ing === "yogur") return [100, 250, 25];
    if (ing === "clara") return [120, 300, 30];
    if (ing === "jamonPavo" || ing === "lupino" || ing === "edamame") return [40, 150, 10];
    return [100, 250, 10];
  }
  if (rol === "grasa") {
    if (ing === "aceite") return [3, 20, 1];
    if (ing === "palta") return [30, 120, 10];
    if (ing === "lecheCoco") return [40, 120, 10];
    if (ing === "aceitunas") return [15, 60, 5];
    return [10, 35, 5]; // frutos secos, coco, harina de almendra
  }
  return [0, 0, 1];
}

const redondear = (v: number, paso: number) => Math.round(v / paso) * paso;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Comida = { n: string; v: string[]; p: number; h: number; g: number; k: number; id: string };

function porcionar(rec: Receta, objetivoP: number, objetivoG: number): Comida {
  const gramos: Record<number, number> = {};
  const suma = (filtro: (r: Rol) => boolean, m: "p" | "g") =>
    rec.items.reduce((t, [ing, base, rol], idx) => (filtro(rol) ? t + ((gramos[idx] ?? base) * I[ing][m]) / 100 : t), 0);

  // 1) Proteína: ajusta el ingrediente proteico al objetivo
  rec.items.forEach(([ing, base, rol], idx) => {
    if (rol !== "prot") return;
    const [min, max, paso] = rango(ing, rol, rec.id.startsWith("b"));
    const falta = objetivoP - suma((r) => r === "fijo", "p");
    gramos[idx] = clamp(redondear((falta / I[ing].p) * 100 || base, paso), min, max);
  });
  // 2) Grasa: completa con la fuente de grasa
  rec.items.forEach(([ing, base, rol], idx) => {
    if (rol !== "grasa") return;
    const [min, max, paso] = rango(ing, rol, rec.id.startsWith("b"));
    const falta = objetivoG - suma((r) => r !== "grasa", "g");
    gramos[idx] = clamp(redondear((falta / I[ing].g) * 100 || base, paso), min, max);
  });

  let p = 0, h = 0, g = 0, k = 0;
  const v = rec.items.map(([ing, base], idx) => {
    const gr = gramos[idx] ?? base;
    const x = I[ing];
    p += (gr * x.p) / 100; h += (gr * x.h) / 100; g += (gr * x.g) / 100; k += (gr * x.k) / 100;
    if (x.unidad) {
      const u = Math.round(gr / x.unidad.g);
      return `${u} ${u === 1 ? x.unidad.singular : x.unidad.plural}`;
    }
    return `${x.nombre} ${gr} g`;
  });
  return { id: rec.id, n: rec.n, v, p: Math.round(p), h: Math.round(h), g: Math.round(g), k: Math.round(k) };
}

/* ── Selección de recetas ── */
function elegir(pool: Receta[], usadas: Set<string>, evitarGrupos: string[], tema: number, azar: () => number) {
  const candidatos = pool.filter((r) => !usadas.has(r.id));
  const lista = candidatos.length ? candidatos : pool; // si se agotan, se permite repetir
  let mejor: Receta | null = null;
  let mejorPuntaje = -Infinity;
  for (const r of lista) {
    let puntaje = azar();
    if (r.temas?.includes(tema)) puntaje += 2;
    if (evitarGrupos.includes(r.grupo)) puntaje -= 3;
    if (usadas.has(r.id)) puntaje -= 5;
    if (puntaje > mejorPuntaje) { mejorPuntaje = puntaje; mejor = r; }
  }
  return mejor;
}

// Reparto de los macros del día entre las comidas
const REPARTO = { b: 0.25, a: 0.35, c: 0.3, s: 0.1 } as const;

export type DiaMinuta = {
  i: number;
  t: string;
  b?: Comida; a?: Comida; c?: Comida; s?: Comida;
};

/**
 * Genera la minuta de 10 días con el recetario.
 * Devuelve los días armados y los índices de días que no se pudieron
 * completar con el recetario (para generarlos con IA).
 */
export function generarMinutaLocal(opts: {
  temas: string[];
  prot: number;
  fat: number;
  restricciones: Restricciones;
  otras?: string;
}): { dias: (DiaMinuta | null)[]; faltantes: number[] } {
  const prohib = prohibidos(opts.restricciones);
  const terminos = terminosOtras(opts.otras);
  const pools = {
    b: DESAYUNOS.filter((r) => permitida(r, prohib, terminos)),
    a: PRINCIPALES.filter((r) => permitida(r, prohib, terminos)),
    c: PRINCIPALES.filter((r) => permitida(r, prohib, terminos)),
    s: SNACKS.filter((r) => permitida(r, prohib, terminos)),
  };
  const usadas = new Set<string>();
  let semilla = Math.floor(Math.random() * 1e9);
  const azar = () => {
    semilla = (semilla * 1103515245 + 12345) % 2147483648;
    return semilla / 2147483648;
  };

  const dias: (DiaMinuta | null)[] = [];
  const faltantes: number[] = [];
  let gruposAyer: string[] = [];

  // Con pocas opciones (< 8 principales) la minuta quedaría repetitiva:
  // esos días se piden a la IA.
  const recetarioSuficiente = pools.b.length >= 2 && pools.a.length >= 8 && pools.s.length >= 2;

  for (let d = 0; d < opts.temas.length; d++) {
    if (!recetarioSuficiente) { dias.push(null); faltantes.push(d + 1); continue; }
    const tema = d;
    const b = elegir(pools.b, usadas, [], tema, azar)!;
    usadas.add(b.id);
    const a = elegir(pools.a, usadas, gruposAyer, tema, azar)!;
    usadas.add(a.id);
    const c = elegir(pools.c, usadas, [...gruposAyer, a.grupo], tema, azar)!;
    usadas.add(c.id);
    const s = elegir(pools.s, usadas, [], tema, azar)!;
    usadas.add(s.id);
    // Los snacks y desayunos son menos: se liberan cada vuelta completa
    if (pools.s.every((r) => usadas.has(r.id))) pools.s.forEach((r) => usadas.delete(r.id));
    if (pools.b.every((r) => usadas.has(r.id))) pools.b.forEach((r) => usadas.delete(r.id));
    gruposAyer = [a.grupo, c.grupo];

    dias.push({
      i: d + 1,
      t: opts.temas[d].split(" — ")[0],
      b: porcionar(b, opts.prot * REPARTO.b, opts.fat * REPARTO.b),
      a: porcionar(a, opts.prot * REPARTO.a, opts.fat * REPARTO.a),
      c: porcionar(c, opts.prot * REPARTO.c, opts.fat * REPARTO.c),
      s: porcionar(s, opts.prot * REPARTO.s, opts.fat * REPARTO.s),
    });
  }
  return { dias, faltantes };
}
