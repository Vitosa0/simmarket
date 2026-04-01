const VARIOS_GROUP = "Varios";

const RESOURCE_GROUPS = {
  Agricultura: ["Semillas", "Manzanas", "Naranjas", "Uvas", "Grano", "Caña de azucar", "Algodon", "Vacas", "Cerdos", "Granos de cafe", "Cacao", "Verduras", "Forraje"],
  Alimento: ["Masa", "Salsa", "Bistec", "Salchichas", "Huevos", "Leche", "Cafe en polvo", "Harina", "Pan", "Tarta de manzana", "Jugo de naranja", "Sidra de manzana", "Cerveza de jengibre", "Pizza congelada", "Pasta", "Mantequilla", "Queso", "Chocolate", "Azucar", "Hamburguesa", "Lasana", "Albondigas", "Cocteles", "Aceite vegetal", "Ensalada", "Samosa", "Sopa de calabaza"],
  "Construcción": ["Madera", "Concreto reforzado", "Bloques", "Cemento", "Arcilla", "Caliza", "Vigas de acero", "Tablones", "Ventanas", "Herramientas", "Unidades de construccion"],
  Moda: ["Tela", "Cuero", "Ropa interior", "Guantes", "Vestido", "Tacon", "Bolsos de mano", "Zapatillas", "Reloj de lujo", "Collar"],
  "Energía": ["Petroleo", "Gasolina", "Diesel", "Electricidad", "Etanol", "Metano", "Combustible para cohetes"],
  "Electrónica": ["Procesadores", "Componentes electronicos", "Baterias", "Pantallas", "Telefonos inteligentes", "Tabletas", "Laptops", "Monitores", "Televisores", "Electronicos de alto grado", "Cuadricoptero", "Robots"],
  Automotor: ["Computadora a bordo", "Motor electrico", "Interior de coche de lujo", "Interior basico", "Carroceria", "Motor de combustion", "E-car economico", "E-car de lujo", "Coche economico", "Coche de lujo", "Camion", "Excavadora"],
  Aeroespacial: ["Fuselaje", "Ala", "Computadora de vuelo", "Cabina", "Control de actitud", "Tanque de propelente", "Propulsor solido", "Motor cohete", "Escudo termico", "Propulsor ionico", "Motor de turbina"],
  Recursos: ["Agua", "Transporte", "Minerales", "Bauxita", "Silicio", "Quimicos", "Aluminio", "Plastico", "Mineral de hierro", "Acero", "Arena", "Vidrio", "Mineral de oro", "Barras de oro", "Fibras de carbono", "Compuesto de carbono"],
  "Investigación": ["Investigacion agricola", "Investigacion energetica", "Investigacion minera", "Investigacion electronica", "Investigacion ganadera", "Investigacion quimica", "Software", "Investigacion automotriz", "Investigacion de moda", "Investigacion aeroespacial", "Investigacion de materiales", "Recetas"],
  Estacional: ["Calabaza", "Conejo de Pascua", "Cream egg", "Sorpresas navidenas", "Adorno de navidad", "Calabaza de Halloween", "Disfraz de bruja", "Arbol", "Dulces de ramadan", "Helado de chocolate", "Helado de manzana"]
};

const GROUP_ORDER = Object.keys(RESOURCE_GROUPS);

function normalizeLabel(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const GROUP_BY_LABEL = new Map();
GROUP_ORDER.forEach((group) => {
  RESOURCE_GROUPS[group].forEach((label) => {
    GROUP_BY_LABEL.set(normalizeLabel(label), group);
  });
});

function groupForLabel(label) {
  return GROUP_BY_LABEL.get(normalizeLabel(label)) || VARIOS_GROUP;
}

function groupOrderIndex(group) {
  const index = GROUP_ORDER.indexOf(group);
  return index === -1 ? GROUP_ORDER.length : index;
}

module.exports = {
  VARIOS_GROUP,
  RESOURCE_GROUPS,
  GROUP_ORDER,
  normalizeLabel,
  groupForLabel,
  groupOrderIndex
};
