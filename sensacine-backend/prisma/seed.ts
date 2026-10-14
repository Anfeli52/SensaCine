import {
  PrismaClient,
  Rol,
  TipoRestriccion,
  EstadoReserva,
  EstadoOrdenCocina
} from "@prisma/client";
import bcrypt from "bcrypt";
import { getCinemaDateStr, getCinemaTodayUtcMidnight } from "../src/common/helpers/dateUtils";

const prisma = new PrismaClient();

const PELICULAS_SEED = [
  {
    titulo: "Spider-Man: Across the Spider-Verse",
    sinopsis:
      "Miles Morales se catapulta a través del Multiverso, donde se encuentra con un equipo de Spider-People encargados de proteger su existencia. Cuando los héroes chocan sobre cómo manejar una nueva amenaza, Miles debe redefinir lo que significa ser un héroe.",
    duracionMinutos: 140,
    genero: "Animación / Acción / Aventura",
    clasificacion: "PG",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    estado: "activa",
    precioBaseExperiencia: 28000,
  },
  {
    titulo: "Oppenheimer",
    sinopsis:
      "La historia del científico estadounidense J. Robert Oppenheimer y su papel fundamental en el Proyecto Manhattan durante la Segunda Guerra Mundial para desarrollar las primeras armas nucleares del mundo.",
    duracionMinutos: 180,
    genero: "Drama / Historia / Biografía",
    clasificacion: "R",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    estado: "activa",
    precioBaseExperiencia: 32000,
  },
  {
    titulo: "Dune: Part Two",
    sinopsis:
      "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia. Ante la difícil elección entre el amor de su vida y el destino del universo, intenta evitar un terrible futuro que solo él puede prever.",
    duracionMinutos: 166,
    genero: "Ciencia Ficción / Aventura",
    clasificacion: "PG-13",
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    estado: "activa",
    precioBaseExperiencia: 30000,
  },
  {
    titulo: "El Viaje de Chihiro",
    sinopsis:
      "Chihiro, una niña caprichosa de diez años, viaja en auto con sus padres hacia su nuevo hogar. En el camino, atraviesan un túnel que los lleva a un mundo misterioso y mágico gobernado por la bruja Yubaba, donde los humanos son transformados en animales.",
    duracionMinutos: 125,
    genero: "Animación / Fantasía / Aventura",
    clasificacion: "PG",
    posterUrl: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    estado: "activa",
    precioBaseExperiencia: 26000,
  },
  {
    titulo: "Interstellar",
    sinopsis:
      "Al ver que la vida en la Tierra está llegando a su fin, un grupo de exploradores y científicos asume la misión más importante de la historia humana: viajar más allá de nuestra galaxia a través de un agujero de gusano para encontrar un nuevo hogar.",
    duracionMinutos: 169,
    genero: "Ciencia Ficción / Drama / Aventura",
    clasificacion: "PG-13",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    estado: "activa",
    precioBaseExperiencia: 29000,
  },
  {
    titulo: "Gladiador",
    sinopsis:
      "El leal general romano Máximo Décimo Meridio es traicionado cuando Cómodo, el ambicioso hijo del emperador Marco Aurelio, asesina a su padre y toma el trono. Convertido en esclavo y gladiador, Máximo lucha para regresar a Roma y vengar a su familia.",
    duracionMinutos: 155,
    genero: "Acción / Drama / Aventura",
    clasificacion: "R",
    posterUrl: "https://image.tmdb.org/t/p/w500/ehGpN04zAJbbSnxcZMDzfln6TY1.jpg",
    estado: "activa",
    precioBaseExperiencia: 27000,
  },
  {
    titulo: "Kung Fu Panda 4",
    sinopsis:
      "Po, el Guerrero Dragón, es llamado por el destino para convertirse en el líder espiritual del Valle de la Paz. Para ello debe encontrar y entrenar a un nuevo Guerrero Dragón, mientras una poderosa hechicera que cambia de forma amenaza la paz.",
    duracionMinutos: 94,
    genero: "Animación / Acción / Comedia",
    clasificacion: "PG",
    posterUrl: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
    estado: "activa",
    precioBaseExperiencia: 24000,
  },
  {
    titulo: "Coco",
    sinopsis:
      "Miguel sueña con ser músico a pesar de la prohibición de su familia. En su búsqueda por cumplir su sueño, viaja a la Tierra de los Muertos, donde descubre los secretos de su historia familiar con la ayuda del carismático Héctor.",
    duracionMinutos: 105,
    genero: "Animación / Aventura / Fantasía",
    clasificacion: "PG",
    posterUrl: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
    estado: "activa",
    precioBaseExperiencia: 24000,
  },
];

const RESTRICCIONES_SEED = [
  { nombre: "Maní", tipo: TipoRestriccion.alergia, descripcion: "Alergia a cacahuates o maní" },
  { nombre: "Gluten", tipo: TipoRestriccion.intolerancia, descripcion: "Intolerancia al gluten / enfermedad celíaca" },
  { nombre: "Lácteos", tipo: TipoRestriccion.intolerancia, descripcion: "Intolerancia a la lactosa o proteína de leche" },
  { nombre: "Mariscos", tipo: TipoRestriccion.alergia, descripcion: "Alergia a mariscos y crustáceos" },
  { nombre: "Huevos", tipo: TipoRestriccion.alergia, descripcion: "Alergia al huevo y derivados" },
  { nombre: "Frutos Secos", tipo: TipoRestriccion.alergia, descripcion: "Alergia a nueces, almendras, pistachos y avellanas" },
  { nombre: "Pescado", tipo: TipoRestriccion.alergia, descripcion: "Alergia a pescados de agua dulce o salada" },
  { nombre: "Soja", tipo: TipoRestriccion.alergia, descripcion: "Alergia a la soja y derivados de leguminosas" },
  { nombre: "Vegetariano", tipo: TipoRestriccion.preferencia, descripcion: "Dieta vegetariana sin carnes ni pescados" },
  { nombre: "Vegano", tipo: TipoRestriccion.preferencia, descripcion: "Dieta 100% basada en vegetales sin productos de origen animal" },
  { nombre: "Otra restricción", tipo: TipoRestriccion.alergia, descripcion: "Restricción indicada manualmente por el comensal (ver notas)" },
];

const PRODUCTOS_POR_PELICULA: Record<string, Array<{
  nombre: string;
  descripcion: string;
  categoria: string;
  ordenMenu: number;
  imagenUrl: string;
  restricciones: string[];
}>> = {
  "El Viaje de Chihiro": [
    {
      nombre: "Onigiri Mágico de Haku",
      descripcion: "Bocadillo de arroz japonés al vapor envuelto en alga nori crujiente con relleno de salmón ahumado.",
      categoria: "Entrada",
      ordenMenu: 1,
      imagenUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Pescado"],
    },
    {
      nombre: "Ramen Humeante de los Dioses",
      descripcion: "Caldo artesanal con fideos tradicionales, chashu de cerdo caramelizado, huevo ajitsuke marinado y cebollín fresco.",
      categoria: "Plato Fuerte",
      ordenMenu: 2,
      imagenUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten", "Huevos", "Soja"],
    },
    {
      nombre: "Baozi Dulce de Sin Cara",
      descripcion: "Panecillos suaves al vapor rellenos de frijol rojo dulce y toque de matcha ceremonial.",
      categoria: "Postre",
      ordenMenu: 3,
      imagenUrl: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten"],
    },
    {
      nombre: "Té Floral de Yubaba",
      descripcion: "Infusión aromática de flor de cerezo silvestre, jazmín y gotas de miel pura.",
      categoria: "Bebida",
      ordenMenu: 4,
      imagenUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
      restricciones: [],
    },
  ],
  "Oppenheimer": [
    {
      nombre: "Cóctel Manhattan Cuántico",
      descripcion: "Elíxir ahumado servido bajo campana de cristal con infusión de frutos rojos y romero flameado.",
      categoria: "Bebida",
      ordenMenu: 1,
      imagenUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
      restricciones: [],
    },
    {
      nombre: "Trinity Smoked Brisket",
      descripcion: "Corte de res angus ahumado a baja temperatura con leña de mezquite por 14 horas, puré rústico y salsa BBQ de carbón.",
      categoria: "Plato Fuerte",
      ordenMenu: 2,
      imagenUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Lácteos"],
    },
    {
      nombre: "Volcán Fisión de Chocolate",
      descripcion: "Soufflé tibio de chocolate amargo 70% con centro fundido y helado artesanal de vainilla Bourbon.",
      categoria: "Postre",
      ordenMenu: 3,
      imagenUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten", "Lácteos", "Huevos"],
    },
  ],
  "Dune: Part Two": [
    {
      nombre: "Elíxir de Especia Melange",
      descripcion: "Bebida cítrica infusionada con canela de Ceilán, jengibre y polvo dorado comestible de Arrakis.",
      categoria: "Bebida",
      ordenMenu: 1,
      imagenUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80",
      restricciones: [],
    },
    {
      nombre: "Festín del Desierto Fremen",
      descripcion: "Cordero braseado al azafrán servido sobre cuscús perlado con dátiles, piñones y almendras tostadas.",
      categoria: "Plato Fuerte",
      ordenMenu: 2,
      imagenUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten", "Frutos Secos"],
    },
    {
      nombre: "Arena Crujiente de Shai-Hulud",
      descripcion: "Capas de masa filo crocante con crema de naranja, pistachos molidos y miel del desierto.",
      categoria: "Postre",
      ordenMenu: 3,
      imagenUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten", "Frutos Secos", "Lácteos"],
    },
  ],
  "Interstellar": [
    {
      nombre: "Crema de Maíz Cooper Station",
      descripcion: "Crema aterciopelada de maíz dulce con aceite de trufa blanca y crutones de pan rústico.",
      categoria: "Entrada",
      ordenMenu: 1,
      imagenUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Lácteos", "Gluten"],
    },
    {
      nombre: "Medallón Agujero Negro Gargantúa",
      descripcion: "Solomillo de res en reducción de vino tinto con risotto nero al calamar y espárragos grillados.",
      categoria: "Plato Fuerte",
      ordenMenu: 2,
      imagenUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Lácteos", "Mariscos"],
    },
    {
      nombre: "Esferas de la Quinta Dimensión",
      descripcion: "Mousse de moras y arándanos encapsulado en esfera de caramelo soplado con niebla helada.",
      categoria: "Postre",
      ordenMenu: 3,
      imagenUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Lácteos"],
    },
  ],
  "Spider-Man: Across the Spider-Verse": [
    {
      nombre: "Pizza Slice Brooklyn Multiverse",
      descripcion: "Focaccia artesanal con salsa pomodoro, mozzarella di bufala fresca y hojas de albahaca.",
      categoria: "Entrada",
      ordenMenu: 1,
      imagenUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten", "Lácteos"],
    },
    {
      nombre: "Smash Burger Miles Morales",
      descripcion: "Doble carne jugosa con queso cheddar madurado, cebolla caramelizada y salsa casera en pan brioche.",
      categoria: "Plato Fuerte",
      ordenMenu: 2,
      imagenUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten", "Lácteos", "Huevos"],
    },
    {
      nombre: "Dona Glaseada Spidey",
      descripcion: "Dona artesanal horneada con glaseado de frambuesa silvestre y telaraña de chocolate blanco.",
      categoria: "Postre",
      ordenMenu: 3,
      imagenUrl: "https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten", "Lácteos", "Huevos"],
    },
  ],
  "Kung Fu Panda 4": [
    {
      nombre: "Dumplings del Valle de la Paz",
      descripcion: "Empanaditas al vapor rellenas de carne magra, jengibre y shiitake servidas con salsa de soja dulce.",
      categoria: "Entrada",
      ordenMenu: 1,
      imagenUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten", "Soja"],
    },
    {
      nombre: "Fideos de la Sabiduría del Sr. Ping",
      descripcion: "Tallarines salteados al wok con pollo tierno, verduras crujientes y aceite de sésamo tostado.",
      categoria: "Plato Fuerte",
      ordenMenu: 2,
      imagenUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten", "Soja"],
    },
    {
      nombre: "Bao Dulce de Luna Dorada",
      descripcion: "Panecillos esponjosos rellenos de frijol rojo dulce y miel de flores silvestres.",
      categoria: "Postre",
      ordenMenu: 3,
      imagenUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Gluten"],
    },
  ],
  "Gladiador": [
    {
      nombre: "Tabla Imperial del Senado",
      descripcion: "Prosciutto di Parma, queso pecorino romano madurado, uvas frescas y pan tostado con hierbas.",
      categoria: "Entrada",
      ordenMenu: 1,
      imagenUrl: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Lácteos", "Gluten"],
    },
    {
      nombre: "Costillar Máximo al Romero",
      descripcion: "Costillas asadas a las brasas con papas rústicas al horno y reducción de vino tinto especiado.",
      categoria: "Plato Fuerte",
      ordenMenu: 2,
      imagenUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      restricciones: [],
    },
    {
      nombre: "Higos Glaseados con Mascarpone",
      descripcion: "Higos asados con miel silvestre, crema de mascarpone suave y nueces tostadas.",
      categoria: "Postre",
      ordenMenu: 3,
      imagenUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
      restricciones: ["Lácteos", "Frutos Secos"],
    },
  ],
  "Coco": [
    {
      nombre: "Pan de muerto",
      descripcion: "Pan de muerto tradicional, suave y ligeramente dulce, inspirado en las tradiciones mexicanas del Día de Muertos.",
      categoria: "Entrada",
      ordenMenu: 1,
      imagenUrl: "https://images.getrecipekit.com/20230117012442-25102021-xcd_0029-20-20editado.png?aspect_ratio=16:9&quality=90&",
      restricciones: ["Gluten", "Huevos", "Lácteos"],
    },
    {
      nombre: "Tacos al pastor",
      descripcion: "Tacos al pastor con carne sazonada, cebolla, cilantro y un toque de piña, inspirados en los sabores tradicionales de México.",
      categoria: "Plato principal",
      ordenMenu: 2,
      imagenUrl: "https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/C07AE049-11C3-4672-A96A-A547C15F0116/Derivates/FE1D05A4-0A44-4007-9A42-5CAFD9F8F798.jpg",
      restricciones: [],
    },
    {
      nombre: "Elote mexicano",
      descripcion: "Elote asado acompañado de mayonesa, queso y un toque de limón, inspirado en la comida callejera mexicana.",
      categoria: "Acompañamiento",
      ordenMenu: 3,
      imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYzDDOr92mY5MMMXnA8JFLdwrsqjY-TXFDjhvsOV-hfWrm30bQqG-8x8Iy&s=10",
      restricciones: ["Lácteos", "Huevos"],
    },
    {
      nombre: "Agua de jamaica",
      descripcion: "Bebida refrescante de flor de jamaica con un sabor dulce y ligeramente ácido.",
      categoria: "Bebida",
      ordenMenu: 4,
      imagenUrl: "https://cloudfront-us-east-1.images.arcpublishing.com/infobae/IDNEPYYXRJBFHBLLZZ5BO5OJDY.jpg",
      restricciones: [],
    },
    {
      nombre: "Chocolate mexicano",
      descripcion: "Chocolate caliente de textura cremosa con un toque de canela, inspirado en los sabores tradicionales mexicanos.",
      categoria: "Bebida",
      ordenMenu: 5,
      imagenUrl: "https://www.piloncilloyvainilla.com/wp-content/uploads/2025/01/spiced-mexican-chocolate9.webp",
      restricciones: ["Lácteos"],
    },
    {
      nombre: "Churros con canela",
      descripcion: "Churros crujientes por fuera y suaves por dentro, acompañadoscon azúcar y canela.",
      categoria: "Postre",
      ordenMenu: 6,
      imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzzXaAqxJmerLKnE_aMhPiak9Fb8ZgShZJuw2yxgO2w0Z6s4FeoRbwreV1&s=10",
      restricciones: ["Gluten", "Huevos"],
    },
  ],
};

function createUtcDate(dateStr: string, hours: number, minutes = 0): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}
function getFechasDinamicas(): string[] {
  const fechas: string[] = [];
  const todayStr = getCinemaDateStr();
  const [year, month, day] = todayStr.split("-").map(Number);
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(year, month - 1, day + i));
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    fechas.push(`${yyyy}-${mm}-${dd}`);
  }
  return fechas;
}

async function seedUsuarios(): Promise<void> {
  console.log("👥 Configurando usuarios...");
  const passwordHashAdmin = await bcrypt.hash("Admin1234!", 10);
  const passwordHashUser = await bcrypt.hash("Cliente1234!", 10);
  const passwordHashCocina = await bcrypt.hash("Cocina1234!", 10);

  const usuarios = [
    {
      nombre: "Administrador SensaCine",
      email: "admin@sensacine.com",
      passwordHash: passwordHashAdmin,
      rol: Rol.admin,
      estado: "activo",
    },
    {
      nombre: "Carlos Mendoza",
      email: "cliente@sensacine.com",
      passwordHash: passwordHashUser,
      rol: Rol.cliente,
      estado: "activo",
    },
    {
      nombre: "María Rodríguez",
      email: "maria@sensacine.com",
      passwordHash: passwordHashUser,
      rol: Rol.cliente,
      estado: "activo",
    },
    {
      nombre: "Andrés Felipe",
      email: "andres@sensacine.com",
      passwordHash: passwordHashUser,
      rol: Rol.cliente,
      estado: "activo",
    },
    {
      nombre: "Chef Chef Gourmet",
      email: "cocina@sensacine.com",
      passwordHash: passwordHashCocina,
      rol: Rol.cocina,
      estado: "activo",
    },
  ];

  for (const u of usuarios) {
    const existing = await prisma.usuario.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.usuario.create({ data: u });
      console.log(`  ➕ Usuario creado: ${u.email} (${u.rol})`);
    } else {
      console.log(`  ℹ️ Usuario ya existía: ${u.email}`);
    }
  }
}

async function seedRestricciones(): Promise<void> {
  console.log("🥗 Configurando restricciones alimentarias...");
  for (const r of RESTRICCIONES_SEED) {
    const existing = await prisma.restriccionAlimentaria.findFirst({
      where: { nombre: r.nombre },
    });
    if (!existing) {
      await prisma.restriccionAlimentaria.create({ data: r });
      console.log(`  ➕ Restricción agregada: ${r.nombre} (${r.tipo})`);
    } else {
      console.log(`  ℹ️ Restricción ya existía: ${r.nombre}`);
    }
  }
}

async function seedPeliculas(): Promise<void> {
  console.log(`🎬 Configurando ${PELICULAS_SEED.length} películas...`);
  for (const pelicula of PELICULAS_SEED) {
    const existing = await prisma.pelicula.findFirst({
      where: { titulo: pelicula.titulo },
    });

    if (!existing) {
      await prisma.pelicula.create({ data: pelicula });
      console.log(`  ➕ Película agregada: "${pelicula.titulo}"`);
    } else {
      console.log(`  ℹ️ Película ya existía: "${pelicula.titulo}"`);
    }
  }
}

async function seedSalas(): Promise<void> {
  console.log("🏛️ Configurando Salas y Asientos...");
  const SALAS_SEED = [
    { nombre: "Sala 1 - Premiere Dolby Atmos", filas: 5, asientosPorFila: 8, capacidad: 40 },
    { nombre: "Sala 2 - IMAX Laser Sensorial", filas: 5, asientosPorFila: 10, capacidad: 50 },
    { nombre: "Sala 3 - 4DX Multisensory VIP", filas: 4, asientosPorFila: 6, capacidad: 24 },
  ];

  for (const salaConfig of SALAS_SEED) {
    const existing = await prisma.sala.findFirst({
      where: { nombre: salaConfig.nombre },
    });

    if (existing) {
      console.log(`  ℹ️ Sala ya existía: "${existing.nombre}"`);
      continue;
    }

    const sala = await prisma.sala.create({
      data: {
        nombre: salaConfig.nombre,
        capacidad: salaConfig.capacidad,
        estado: "activa",
      },
    });
    console.log(`  ➕ Sala creada: "${sala.nombre}" (${sala.capacidad} asientos)`);

    const asientosToCreate = [];
    for (let f = 0; f < salaConfig.filas; f++) {
      const letraFila = String.fromCodePoint(65 + f);
      for (let n = 1; n <= salaConfig.asientosPorFila; n++) {
        asientosToCreate.push({
          idSala: sala.id,
          fila: letraFila,
          numero: n,
        });
      }
    }
    await prisma.asiento.createMany({
      data: asientosToCreate,
      skipDuplicates: true,
    });
    console.log(`     🪑 ${asientosToCreate.length} asientos generados para ${sala.nombre}`);
  }
}

async function seedMenu(): Promise<void> {
  console.log("🍽️ Configurando Menú Sensorial y Gastronómico por Película...");
  const todasRestricciones = await prisma.restriccionAlimentaria.findMany();
  const restriccionMap = new Map(todasRestricciones.map(r => [r.nombre, r.id]));

  for (const [tituloPelicula, platos] of Object.entries(PRODUCTOS_POR_PELICULA)) {
    const pelicula = await prisma.pelicula.findFirst({
      where: { titulo: tituloPelicula },
    });

    if (!pelicula) {
      console.warn(`  ⚠️ No se encontró la película "${tituloPelicula}" para asociar menú.`);
      continue;
    }

    for (const plato of platos) {
      let producto = await prisma.producto.findFirst({
        where: {
          idPelicula: pelicula.id,
          nombre: plato.nombre,
        },
      });

      if (!producto) {
        producto = await prisma.producto.create({
          data: {
            nombre: plato.nombre,
            descripcion: plato.descripcion,
            categoria: plato.categoria,
            estado: "activo",
            idPelicula: pelicula.id,
            ordenMenu: plato.ordenMenu,
            imagenUrl: plato.imagenUrl,
          } as any,
        });
        console.log(`  ➕ Plato creado: "${plato.nombre}" (Orden: ${plato.ordenMenu}) para ${tituloPelicula}`);
      }

      // Asociar restricciones alimentarias del plato
      for (const nombreRestriccion of plato.restricciones) {
        const idRestriccion = restriccionMap.get(nombreRestriccion);
        if (idRestriccion) {
          await prisma.productoRestriccion.upsert({
            where: {
              idProducto_idRestriccion: {
                idProducto: producto.id,
                idRestriccion,
              },
            },
            create: {
              idProducto: producto.id,
              idRestriccion,
            },
            update: {},
          });
        }
      }
    }
  }
}

async function seedFunciones(): Promise<void> {
  console.log("🎥 Configurando Funciones de Cine (Horarios vigentes)...");
  const salas = await prisma.sala.findMany({
    where: {
      nombre: {
        in: [
          "Sala 1 - Premiere Dolby Atmos",
          "Sala 2 - IMAX Laser Sensorial",
          "Sala 3 - 4DX Multisensory VIP",
        ],
      },
    },
    orderBy: { id: "asc" },
  });

  const peliculas = await prisma.pelicula.findMany({
    where: { titulo: { in: PELICULAS_SEED.map(({ titulo }) => titulo) } },
    orderBy: { id: "asc" },
  });

  if (salas.length < 3 || peliculas.length !== PELICULAS_SEED.length) {
    throw new Error("No se encontraron todas las salas o películas necesarias para crear funciones.");
  }

  const fechas = getFechasDinamicas();
  const horasInicio = [11, 15, 19, 21];
  let funcionesCreadas = 0;

  for (let peliculaIndex = 0; peliculaIndex < peliculas.length; peliculaIndex++) {
    const pelicula = peliculas[peliculaIndex];

    for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
      const fecha = fechas[dayIndex % fechas.length];
      const sala = salas[(peliculaIndex + dayIndex) % salas.length];
      const horaInicio = horasInicio[(peliculaIndex * 2 + dayIndex) % horasInicio.length];

      const fechaFuncion = createUtcDate(fecha, 0);
      const inicio = createUtcDate(fecha, horaInicio);
      const fin = new Date(inicio.getTime() + pelicula.duracionMinutos * 60 * 1000);

      const existing = await prisma.funcion.findFirst({
        where: {
          idPelicula: pelicula.id,
          idSala: sala.id,
          fecha: fechaFuncion,
          horaInicio: inicio,
        },
      });

      if (existing) {
        continue;
      }

      await prisma.funcion.create({
        data: {
          idPelicula: pelicula.id,
          idSala: sala.id,
          fecha: fechaFuncion,
          horaInicio: inicio,
          horaFin: fin,
          precioAsientoOficial: pelicula.precioBaseExperiencia,
          estado: "programada",
        },
      });
      funcionesCreadas++;
    }
  }

  console.log(`🎟️ ${funcionesCreadas} funciones vigentes creadas para los próximos días.`);
}

async function seedReservasYAsientosOcupados(): Promise<void> {
  console.log("🎫 Configurando Reservas, Asientos Ocupados y Órdenes de Cocina...");

  const clientes = await prisma.usuario.findMany({
    where: { rol: Rol.cliente },
    orderBy: { id: "asc" },
  });

  if (clientes.length === 0) {
    console.warn("  ⚠️ No hay usuarios clientes para asociar reservas.");
    return;
  }

  const todasRestricciones = await prisma.restriccionAlimentaria.findMany();
  const restriccionLacteos = todasRestricciones.find(r => r.nombre === "Lácteos");
  const restriccionGluten = todasRestricciones.find(r => r.nombre === "Gluten");
  const restriccionMariscos = todasRestricciones.find(r => r.nombre === "Mariscos");
  const restriccionMani = todasRestricciones.find(r => r.nombre === "Maní");

  // Obtener funciones vigentes estrictamente futuras para simular reservas activas
  const todayUtc = getCinemaTodayUtcMidnight();
  const funciones = await prisma.funcion.findMany({
    where: { fecha: { gt: todayUtc } },
    include: {
      sala: {
        include: { asientos: { orderBy: [{ fila: "asc" }, { numero: "asc" }] } },
      },
      pelicula: true,
    },
    take: 3,
    orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
  });

  for (let i = 0; i < funciones.length; i++) {
    const funcion = funciones[i];
    const salaAsientos = funcion.sala.asientos;

    if (salaAsientos.length < 8) continue;

    // Verificar si ya existen reservas para esta función
    const reservasExistentes = await prisma.reserva.count({
      where: { idFuncion: funcion.id },
    });

    if (reservasExistentes > 0) {
      console.log(`  ℹ️ La función #${funcion.id} (${funcion.pelicula.titulo}) ya tiene reservas.`);
      continue;
    }

    const cliente1 = clientes[0];
    const cliente2 = clientes[1 % clientes.length];

    // Asientos para Reserva 1 (ej: A1, A2, A3)
    const asientosReserva1 = salaAsientos.slice(0, 3);
    const monto1 = Number(funcion.precioAsientoOficial) * asientosReserva1.length;

    const reserva1 = await prisma.reserva.create({
      data: {
        idUsuario: cliente1.id,
        idFuncion: funcion.id,
        montoTotal: monto1,
        estado: EstadoReserva.Confirmado,
      },
    });

    const ocupantesReserva1 = [
      { nombre: "Carlos Mendoza", restriccion: null },
      { nombre: "Camila Ortiz", restriccion: restriccionLacteos },
      { nombre: "Santiago Vera", restriccion: restriccionGluten },
    ];

    for (let rIdx = 0; rIdx < asientosReserva1.length; rIdx++) {
      const a = asientosReserva1[rIdx];
      const ocupante = ocupantesReserva1[rIdx];

      const reservaAsiento = await prisma.reservaAsiento.create({
        data: {
          idReserva: reserva1.id,
          idAsiento: a.id,
          nombrePersona: ocupante.nombre,
        } as any,
      });

      if (ocupante.restriccion) {
        await prisma.reservaRestriccion.create({
          data: {
            idReservaAsiento: reservaAsiento.id,
            idRestriccion: ocupante.restriccion.id,
            notas: `Comensal ${ocupante.nombre}: Evitar totalmente en platos de la función`,
          },
        });
      }

      await prisma.ordenCocina.create({
        data: {
          idReservaAsiento: reservaAsiento.id,
          estado: EstadoOrdenCocina.Pendiente,
        },
      });
    }

    await prisma.pago.create({
      data: {
        idReserva: reserva1.id,
        medioPago: "tarjeta_credito",
        monto: monto1,
        estado: "aprobado",
        referenciaTransaccion: `TX-SENSA-${Date.now()}-1`,
      },
    });

    // Asientos para Reserva 2 (ej: B4, B5)
    const asientosReserva2 = salaAsientos.slice(4, 6);
    const monto2 = Number(funcion.precioAsientoOficial) * asientosReserva2.length;

    const reserva2 = await prisma.reserva.create({
      data: {
        idUsuario: cliente2.id,
        idFuncion: funcion.id,
        montoTotal: monto2,
        estado: EstadoReserva.Confirmado,
      },
    });

    const ocupantesReserva2 = [
      { nombre: "María Rodríguez", restriccion: null },
      { nombre: "David Morales", restriccion: restriccionMariscos || restriccionMani },
    ];

    for (let rIdx = 0; rIdx < asientosReserva2.length; rIdx++) {
      const a = asientosReserva2[rIdx];
      const ocupante = ocupantesReserva2[rIdx];

      const reservaAsiento = await prisma.reservaAsiento.create({
        data: {
          idReserva: reserva2.id,
          idAsiento: a.id,
          nombrePersona: ocupante.nombre,
        } as any,
      });

      if (ocupante.restriccion) {
        await prisma.reservaRestriccion.create({
          data: {
            idReservaAsiento: reservaAsiento.id,
            idRestriccion: ocupante.restriccion.id,
            notas: `Alergia severa informada por ${ocupante.nombre}`,
          },
        });
      }

      await prisma.ordenCocina.create({
        data: {
          idReservaAsiento: reservaAsiento.id,
          estado: EstadoOrdenCocina.Pendiente,
        },
      });
    }

    await prisma.pago.create({
      data: {
        idReserva: reserva2.id,
        medioPago: "pse",
        monto: monto2,
        estado: "aprobado",
        referenciaTransaccion: `TX-SENSA-${Date.now()}-2`,
      },
    });

    console.log(`  ➕ 2 Reservas con 5 asientos ocupados generadas para Función #${funcion.id} (${funcion.pelicula.titulo})`);
  }
}

async function main() {
  console.log("🌱 Iniciando proceso de Seed Enriquecido para SensaCine...\n");
  await seedUsuarios();
  await seedRestricciones();
  await seedPeliculas();
  await seedSalas();
  await seedMenu();
  await seedFunciones();
  await seedReservasYAsientosOcupados();
  console.log("\n✨ ¡Seed Enriquecido completado exitosamente con películas, comidas, restricciones y asientos ocupados!");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
