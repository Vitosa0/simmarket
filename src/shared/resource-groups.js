const GROUP_DEFINITIONS = [
  {
    key: "agriculture",
    es: "Agricultura",
    en: "Agriculture",
    labels: ["Semillas", "Manzanas", "Naranjas", "Uvas", "Grano", "Caña de azucar", "Algodon", "Vacas", "Cerdos", "Granos de cafe", "Cacao", "Verduras", "Forraje"]
  },
  {
    key: "food",
    es: "Alimento",
    en: "Food",
    labels: ["Masa", "Salsa", "Bistec", "Salchichas", "Huevos", "Leche", "Cafe en polvo", "Harina", "Pan", "Tarta de manzana", "Jugo de naranja", "Sidra de manzana", "Cerveza de jengibre", "Pizza congelada", "Pasta", "Mantequilla", "Queso", "Chocolate", "Azucar", "Hamburguesa", "Lasana", "Albondigas", "Cocteles", "Aceite vegetal", "Ensalada", "Samosa", "Sopa de calabaza"]
  },
  {
    key: "construction",
    es: "Construcción",
    en: "Construction",
    labels: ["Madera", "Concreto reforzado", "Bloques", "Cemento", "Arcilla", "Caliza", "Vigas de acero", "Tablones", "Ventanas", "Herramientas", "Unidades de construccion"]
  },
  {
    key: "fashion",
    es: "Moda",
    en: "Fashion",
    labels: ["Tela", "Cuero", "Ropa interior", "Guantes", "Vestido", "Tacon", "Bolsos de mano", "Zapatillas", "Reloj de lujo", "Collar"]
  },
  {
    key: "energy",
    es: "Energía",
    en: "Energy",
    labels: ["Petroleo", "Gasolina", "Diesel", "Electricidad", "Etanol", "Metano", "Combustible para cohetes"]
  },
  {
    key: "electronics",
    es: "Electrónica",
    en: "Electronics",
    labels: ["Procesadores", "Componentes electronicos", "Baterias", "Pantallas", "Telefonos inteligentes", "Tabletas", "Laptops", "Monitores", "Televisores", "Electronicos de alto grado", "Cuadricoptero", "Robots"]
  },
  {
    key: "automotive",
    es: "Automotor",
    en: "Automotive",
    labels: ["Computadora a bordo", "Motor electrico", "Interior de coche de lujo", "Interior basico", "Carroceria", "Motor de combustion", "E-car economico", "E-car de lujo", "Coche economico", "Coche de lujo", "Camion", "Excavadora"]
  },
  {
    key: "aerospace",
    es: "Aeroespacial",
    en: "Aerospace",
    labels: ["Fuselaje", "Ala", "Computadora de vuelo", "Cabina", "Control de actitud", "Tanque de propelente", "Propulsor solido", "Motor cohete", "Escudo termico", "Propulsor ionico", "Motor de turbina"]
  },
  {
    key: "resources",
    es: "Recursos",
    en: "Resources",
    labels: ["Agua", "Transporte", "Minerales", "Bauxita", "Silicio", "Quimicos", "Aluminio", "Plastico", "Mineral de hierro", "Acero", "Arena", "Vidrio", "Mineral de oro", "Barras de oro", "Fibras de carbono", "Compuesto de carbono"]
  },
  {
    key: "research",
    es: "Investigación",
    en: "Research",
    labels: ["Investigacion agricola", "Investigacion energetica", "Investigacion minera", "Investigacion electronica", "Investigacion ganadera", "Investigacion quimica", "Software", "Investigacion automotriz", "Investigacion de moda", "Investigacion aeroespacial", "Investigacion de materiales", "Recetas"]
  },
  {
    key: "seasonal",
    es: "Estacional",
    en: "Seasonal",
    labels: ["Calabaza", "Conejo de Pascua", "Cream egg", "Sorpresas navidenas", "Adorno de navidad", "Calabaza de Halloween", "Disfraz de bruja", "Arbol", "Dulces de ramadan", "Helado de chocolate", "Helado de manzana"]
  }
];

const VARIOS_GROUP_KEY = "misc";
const VARIOS_GROUP = "Varios";
const VARIOS_GROUP_EN = "Miscellaneous";
const GROUP_ORDER = GROUP_DEFINITIONS.map((group) => group.es);

function normalizeLabel(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const GROUP_BY_LABEL = new Map();
const GROUP_BY_IDENTITY = new Map();

GROUP_DEFINITIONS.forEach((group, index) => {
  group.labels.forEach((label) => {
    GROUP_BY_LABEL.set(normalizeLabel(label), group);
  });
  [group.key, group.es, group.en].forEach((identity) => {
    GROUP_BY_IDENTITY.set(normalizeLabel(identity), { group, index });
  });
});

function groupDefinitionForLabel(label) {
  return GROUP_BY_LABEL.get(normalizeLabel(label)) || null;
}

function resolveGroup(value) {
  return GROUP_BY_IDENTITY.get(normalizeLabel(value)) || null;
}

function groupKeyForLabel(label) {
  return groupDefinitionForLabel(label)?.key || VARIOS_GROUP_KEY;
}

function groupForLabel(label) {
  return groupDefinitionForLabel(label)?.es || VARIOS_GROUP;
}

function groupEnglishForLabel(label) {
  return groupDefinitionForLabel(label)?.en || VARIOS_GROUP_EN;
}

function groupDisplayName(value, locale = "es") {
  const resolved = resolveGroup(value);
  if (!resolved) {
    return locale === "en" ? VARIOS_GROUP_EN : VARIOS_GROUP;
  }
  return locale === "en" ? resolved.group.en : resolved.group.es;
}

function groupOrderIndex(group) {
  const resolved = resolveGroup(group);
  return resolved ? resolved.index : GROUP_DEFINITIONS.length;
}

module.exports = {
  GROUP_DEFINITIONS,
  VARIOS_GROUP,
  VARIOS_GROUP_EN,
  VARIOS_GROUP_KEY,
  GROUP_ORDER,
  normalizeLabel,
  groupKeyForLabel,
  groupForLabel,
  groupEnglishForLabel,
  groupDisplayName,
  groupOrderIndex
};
