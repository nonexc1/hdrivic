export interface PeruLocation {
  ciudad: string;
  distritos: string[];
}

export const PERU_LOCATIONS: PeruLocation[] = [
  {
    ciudad: "Lima",
    distritos: [
      "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo",
      "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia",
      "Jesús María", "La Molina", "La Victoria", "Lima (Cercado)", "Lince",
      "Los Olivos", "Lurigancho", "Lurín", "Magdalena del Mar", "Miraflores",
      "Pachacámac", "Pueblo Libre", "Puente Piedra", "Punta Hermosa",
      "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro",
      "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis",
      "San Martín de Porres", "San Miguel", "Santa Anita", "Santa Rosa",
      "Santiago de Surco", "Surquillo", "Villa El Salvador",
      "Villa María del Triunfo",
    ],
  },
  {
    ciudad: "Callao",
    distritos: [
      "Bellavista", "Callao", "Carmen de la Legua Reynoso",
      "La Perla", "La Punta", "Mi Perú", "Ventanilla",
    ],
  },
  {
    ciudad: "Arequipa",
    distritos: [
      "Alto Selva Alegre", "Arequipa (Cercado)", "Cayma", "Cerro Colorado",
      "Characato", "Chiguata", "Hunter", "José Luis Bustamante y Rivero",
      "Mariano Melgar", "Miraflores", "Mollebaya", "Paucarpata", "Pocsi",
      "Polobaya", "Quequeña", "Sabandía", "Sachaca", "Socabaya",
      "Tiabaya", "Uchumayo", "Yanahuara", "Yura",
    ],
  },
  {
    ciudad: "Cusco",
    distritos: [
      "Cusco (Cercado)", "San Jerónimo", "San Sebastián", "Santiago",
      "Saylla", "Wanchaq", "Poroy", "Ccorca",
    ],
  },
  {
    ciudad: "Trujillo",
    distritos: [
      "Trujillo (Cercado)", "El Porvenir", "Florencia de Mora",
      "Huanchaco", "La Esperanza", "Laredo", "Moche", "Poroto",
      "Salaverry", "Simbal", "Victor Larco Herrera",
    ],
  },
  {
    ciudad: "Piura",
    distritos: [
      "Piura (Cercado)", "Castilla", "Catacaos", "Cura Mori",
      "El Tallán", "La Arena", "La Unión", "Las Lomas", "Tambogrande", "Veintiseis de Octubre",
    ],
  },
  {
    ciudad: "Chiclayo",
    distritos: [
      "Chiclayo (Cercado)", "Chongoyape", "Eten", "Eten Puerto",
      "José Leonardo Ortiz", "La Victoria", "Lagunas", "Monsefú",
      "Nueva Arica", "Oyotún", "Picsi", "Pimentel", "Reque",
      "Santa Rosa", "Tumán",
    ],
  },
  {
    ciudad: "Iquitos",
    distritos: [
      "Iquitos (Cercado)", "Alto Nanay", "Fernando Lores",
      "Indiana", "Las Amazonas", "Mazán", "Napo", "Punchana",
      "San Juan Bautista", "Torres Causana",
    ],
  },
  {
    ciudad: "Huancayo",
    distritos: [
      "Huancayo (Cercado)", "Carhuacallanga", "El Tambo", "Chupaca",
      "Chilca", "Hualhuas", "Huancán", "Ingenio", "Pilcomayo",
      "Pucará", "Saño", "Sicaya", "Viques",
    ],
  },
  {
    ciudad: "Ica",
    distritos: [
      "Ica (Cercado)", "La Tinguiña", "Los Aquijes", "Ocucaje",
      "Pachacútec", "Parcona", "Pueblo Nuevo", "Salas", "San José de Los Molinos",
      "San Juan Bautista", "Santiago", "Subtanjalla", "Tate", "Yauca del Rosario",
    ],
  },
  {
    ciudad: "Pucallpa",
    distritos: [
      "Callería", "Campo Verde", "Iparía", "Manantay",
      "Masisea", "Nueva Requena", "Yarinacocha",
    ],
  },
  {
    ciudad: "Tarapoto",
    distritos: [
      "Tarapoto", "Morales", "La Banda de Shilcayo", "Alberto Leveau",
      "Cacatachi", "Chazuta", "Chipurana", "El Porvenir", "Huimbayoc",
      "Juan Guerra", "Papaplaya", "San Antonio", "Sauce",
    ],
  },
  {
    ciudad: "Tacna",
    distritos: [
      "Tacna (Cercado)", "Alto de la Alianza", "Calana", "Ciudad Nueva",
      "Inclán", "Pachia", "Palca", "Pocollay", "Sama",
    ],
  },
  {
    ciudad: "Huaraz",
    distritos: [
      "Huaraz (Cercado)", "Cochabamba", "Colcabamba", "Huanchay",
      "Independencia", "Jangas", "La Libertad", "Olleros",
      "Pampas Grande", "Paria", "Ponto", "Raurán",
    ],
  },
  {
    ciudad: "Puno",
    distritos: [
      "Puno (Cercado)", "Acora", "Amantaní", "Atuncolla", "Capachica",
      "Chucuito", "Coata", "Huata", "Mañazo", "Paucarcolla",
      "Pichacani", "Platería", "San Antonio", "Tiquillaca", "Vilque",
    ],
  },
  {
    ciudad: "Moquegua",
    distritos: [
      "Moquegua (Cercado)", "Carumas", "Cuchumbaya", "Mariscal Nieto",
      "Samegua", "San Cristóbal", "Torata",
    ],
  },
  {
    ciudad: "Ayacucho",
    distritos: [
      "Ayacucho (Cercado)", "Acocro", "Acos Vinchos", "Andrés Avelino Cáceres Dorregaray",
      "Jesús Nazareno", "Lucanas", "Ocros", "San Juan Bautista",
      "Santiago de Pischa", "Socos", "Tambillo",
    ],
  },
  {
    ciudad: "Cajamarca",
    distritos: [
      "Cajamarca (Cercado)", "Asunción", "Chetilla", "Cospan",
      "Encañada", "Jesús", "Llacanora", "Los Baños del Inca",
      "Magdalena", "Namora", "San Juan",
    ],
  },
  {
    ciudad: "Tumbes",
    distritos: [
      "Tumbes (Cercado)", "Corrales", "La Cruz", "Pampas de Hospital",
      "San Jacinto", "San Juan de la Virgen",
    ],
  },
  {
    ciudad: "Huánuco",
    distritos: [
      "Huánuco (Cercado)", "Amarilis", "Chinchao", "Churubamba",
      "Margos", "Quisqui", "San Francisco de Cayran",
      "San Pedro de Chaulan", "Santa María del Valle", "Yarumayo",
    ],
  },
  {
    ciudad: "Chimbote",
    distritos: [
      "Chimbote", "Coishco", "Macate", "Moro", "Nepeña",
      "Santa", "Samanco",
    ],
  },
];

export const CIUDADES = PERU_LOCATIONS.map((l) => l.ciudad);

export function getDistritos(ciudad: string): string[] {
  return PERU_LOCATIONS.find((l) => l.ciudad === ciudad)?.distritos ?? [];
}
