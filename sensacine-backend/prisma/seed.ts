import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcrypt";

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
    titulo: "Inside Out 2 (Intensamente 2)",
    sinopsis:
      "Las vocecitas dentro de la cabeza de Riley la conocen a la perfección, pero con la llegada de la adolescencia, el cuartel general es renovado repentinamente para dar la bienvenida a nuevas y complejas emociones como Ansiedad, Envidia, Vergüenza y Ennui.",
    duracionMinutos: 96,
    genero: "Animación / Comedia / Familiar",
    clasificacion: "PG",
    posterUrl: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    estado: "activa",
    precioBaseExperiencia: 25000,
  },
  {
    titulo: "El Padrino",
    sinopsis:
      "Don Vito Corleone es el respetado y temido jefe de una de las cinco familias de la mafia de Nueva York. Cuando un capo rival atenta contra su vida, su hijo Michael, que había estado alejado de los negocios familiares, toma el control para proteger a su dinastía.",
    duracionMinutos: 175,
    genero: "Crimen / Drama",
    clasificacion: "R",
    posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    estado: "activa",
    precioBaseExperiencia: 27000,
  },
  {
    titulo: "Avatar: The Way of Water",
    sinopsis:
      "Ambientada más de una década después de los acontecimientos de la primera película, sigue a la familia Sully, los peligros que los persiguen, los esfuerzos que hacen para mantenerse a salvo y las batallas que libran en los océanos de Pandora.",
    duracionMinutos: 192,
    genero: "Ciencia Ficción / Acción / Aventura",
    clasificacion: "PG-13",
    posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    estado: "activa",
    precioBaseExperiencia: 32000,
  },
  {
    titulo: "Your Name (Kimi no Na wa)",
    sinopsis:
      "Mitsuha vive en un pueblo rural y sueña con la vida en Tokio, mientras que Taki es un estudiante de secundaria en Tokio. Sus vidas se entrelazan de forma mágica cuando comienzan a intercambiar cuerpos de manera inexplicable.",
    duracionMinutos: 106,
    genero: "Animación / Romance / Fantasía",
    clasificacion: "PG",
    posterUrl: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6qFsKnWaVeG0.jpg",
    estado: "activa",
    precioBaseExperiencia: 26000,
  },
  {
    titulo: "The Dark Knight",
    sinopsis:
      "Con la ayuda del teniente Jim Gordon y el fiscal de distrito Harvey Dent, Batman se propone desmantelar las organizaciones criminales de Gotham. Sin embargo, la aparición del Guasón sumerge a la ciudad en una ola de caos y anarquía sin precedentes.",
    duracionMinutos: 152,
    genero: "Acción / Crimen / Drama",
    clasificacion: "PG-13",
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    estado: "activa",
    precioBaseExperiencia: 28000,
  },
  {
    titulo: "Coco",
    sinopsis:
      "Miguel es un niño con un gran talento musical que sueña con convertirse en un cantante consagrado como su ídolo Ernesto de la Cruz. Una misteriosa cadena de eventos lo lleva a la deslumbrante y colorida Tierra de los Muertos en el Día de los Muertos.",
    duracionMinutos: 105,
    genero: "Animación / Familiar / Fantasía",
    clasificacion: "PG",
    posterUrl: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
    estado: "activa",
    precioBaseExperiencia: 25000,
  },
  {
    titulo: "Inception (El Origen)",
    sinopsis:
      "Dom Cobb es un ladrón experto en el peligroso arte de la extracción: robar valiosos secretos desde las profundidades del subconsciente durante el estado de sueño. Para redimirse, se le ofrece una última tarea inversa: implantar una idea en lugar de robarla.",
    duracionMinutos: 148,
    genero: "Ciencia Ficción / Acción / Suspenso",
    clasificacion: "PG-13",
    posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    estado: "activa",
    precioBaseExperiencia: 28000,
  },
  {
    titulo: "Super Mario Bros. La Película",
    sinopsis:
      "Mientras trabajan bajo tierra para reparar una tubería de agua, los plomeros de Brooklyn Mario y su hermano Luigi son transportados a través de una tubería misteriosa y terminan en un nuevo mundo mágico dominado por el Rey Bowser.",
    duracionMinutos: 92,
    genero: "Animación / Aventura / Comedia",
    clasificacion: "PG",
    posterUrl: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
    estado: "activa",
    precioBaseExperiencia: 25000,
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
];

const PRODUCTOS_SEED = [
  {
    idPelicula: 1,
    nombre: "Palomitas de caramelo",
    descripcion:
      "Palomitas dulces con cobertura de caramelo, ideales para disfrutar durante la función.",
    categoria: "Snacks",
    estado: "activo",
    ordenMenu: 1,
    imagenUrl:
      "https://www.loleta.es/wp-content/uploads/2020/03/WEB-PALOMITAS-8203-copia-748x1024.jpg",
  },
  {
    idPelicula: 1,
    nombre: "Nachos con queso",
    descripcion:
      "Nachos crujientes acompañados de salsa de queso cheddar.",
    categoria: "Snacks",
    estado: "activo",
    ordenMenu: 2,
    imagenUrl:
      "https://www.kindpng.com/picc/m/132-1322497_nachos-cinepolis-png-download-nachos-con-queso-cinepolis.png",
  },
  {
    idPelicula: 1,
    nombre: "Bebida temática",
    descripcion:
      "Bebida fría inspirada en la temática de la película",
    categoria: "Bebida",
    estado: "activo",
    ordenMenu: 3,
    imagenUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYcN-qgSL-rySzAQSOsGKcHb832ZnIm_TDm8sUB4uszrvBy4SIdvplqkxE&s=10",
  },
  {
    idPelicula: 1,
    nombre: "Postre de la película",
    descripcion:
      "Postre especial inspirado en los elementos y sabores de la película.",
    categoria: "Postres",
    estado: "activo",
    ordenMenu: 4,
    imagenUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8UvEfa0cM2ufZYLX42phhUPf4enNikG0HNYRDtZyHz2S2wueiQNk2aWQ&s=10",
  },
  {
    idPelicula: 1,
    nombre: "Chocolate caliente",
    descripcion:
      "Chocolate caliente cremoso para complementar la experiencia gastronómica.",
    categoria: "Bebida",
    estado: "inactivo",
    ordenMenu: 5,
    imagenUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgBGECjThqKnwCgDJZ233oIijwu04sAcarR8NmKG53asxN9quWk4Y9dXUX&s=10",
  },
  {
    idPelicula: 1,
    nombre: "Hamburguesa Cine",
    descripcion: "Hamburguesa especial de la pelicula",
    categoria: "Plato Principal",
    estado: "inactivo",
    ordenMenu: 6,
    imagenUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW0lTLcChTXS98tuMljmeciK6xpHhITvQ7teo1h7st_iPnTdaezEDOrwix&s=10",
  },
  {
    idPelicula: 11,
    nombre: "Pan de muerto",
    descripcion:
      "Pan de muerto tradicional, suave y ligeramente dulce, inspirado en las tradiciones mexicanas del Día de Muertos.",
    categoria: "Entrada",
    estado: "activo",
    ordenMenu: 1,
    imagenUrl:
      "https://images.getrecipekit.com/20230117012442-25102021-xcd_0029-20-20editado.png?aspect_ratio=16:9&quality=90&",
  },
  {
    idPelicula: 11,
    nombre: "Tacos al pastor",
    descripcion:
      "Tacos al pastor con carne sazonada, cebolla, cilantro y un toque de piña, inspirados en los sabores tradicionales de México.",
    categoria: "Plato principal",
    estado: "activo",
    ordenMenu: 2,
    imagenUrl:
      "https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/C07AE049-11C3-4672-A96A-A547C15F0116/Derivates/FE1D05A4-0A44-4007-9A42-5CAFD9F8F798.jpg",
  },
  {
    idPelicula: 11,
    nombre: "Elote mexicano",
    descripcion:
      "Elote asado acompañado de mayonesa, queso y un toque de limón, inspirado en la comida callejera mexicana.",
    categoria: "Acompañamiento",
    estado: "activo",
    ordenMenu: 3,
    imagenUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYzDDOr92mY5MMMXnA8JFLdwrsqjY-TXFDjhvsOV-hfWrm30bQqG-8x8Iy&s=10",
  },
  {
    idPelicula: 11,
    nombre: "Agua de jamaica",
    descripcion:
      "Bebida refrescante de flor de jamaica con un sabor dulce y ligeramente ácido.",
    categoria: "Bebida",
    estado: "activo",
    ordenMenu: 4,
    imagenUrl:
      "https://cloudfront-us-east-1.images.arcpublishing.com/infobae/IDNEPYYXRJBFHBLLZZ5BO5OJDY.jpg",
  },
  {
    idPelicula: 11,
    nombre: "Chocolate mexicano",
    descripcion:
      "Chocolate caliente de textura cremosa con un toque de canela, inspirado en los sabores tradicionales mexicanos.",
    categoria: "Bebida",
    estado: "activo",
    ordenMenu: 5,
    imagenUrl:
      "https://www.piloncilloyvainilla.com/wp-content/uploads/2025/01/spiced-mexican-chocolate9.webp",
  },
  {
    idPelicula: 11,
    nombre: "Churros con canela",
    descripcion:
      "Churros crujientes por fuera y suaves por dentro, acompañadoscon azúcar y canela.",
    categoria: "Postre",
    estado: "activo",
    ordenMenu: 6,
    imagenUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzzXaAqxJmerLKnE_aMhPiak9Fb8ZgShZJuw2yxgO2w0Z6s4FeoRbwreV1&s=10",
  },
  {
    idPelicula: 15,
    nombre: "Noodles",
    descripcion:
      "Fideos estirados a mano del agreste noroeste de China",
    categoria: "Plato Principal",
    estado: "activo",
    ordenMenu: 1,
    imagenUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTencXo-DV1-f_4kwCU9cdcQ0lrGTl8JQ1HgfmMuIpIw-h9n5r5YqgUlP3K&s=10",
  },
  {
    idPelicula: 15,
    nombre: "Dumplings",
    descripcion: "Dumplings de la pelicula",
    categoria: "Entrada",
    estado: "inactivo",
    ordenMenu: 2,
    imagenUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlPdzgGXlrXUYAO3CbeZ5JqsbxiaepGhVaC_A3k3jEoQ1Wj_qeeEkaDhKk&s=10",
  },
];

async function seedAdmin(): Promise<void> {
  const adminEmail = "admin@sensacine.com";
  const existingAdmin = await prisma.usuario.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Admin1234!", 10);
    const admin = await prisma.usuario.create({
      data: {
        nombre: "Administrador SensaCine",
        email: adminEmail,
        passwordHash,
        rol: Rol.admin,
        estado: "activo",
      },
    });
    console.log(`✅ Usuario Administrador creado: ${admin.email} (Password: Admin1234!)`);
  } else {
    console.log(`ℹ️ Usuario Administrador ya existe: ${adminEmail}`);
  }
}

async function seedPeliculas(): Promise<void> {
  console.log(`🎬 Insertando ${PELICULAS_SEED.length} películas...`);
  for (const pelicula of PELICULAS_SEED) {
    const existing = await prisma.pelicula.findFirst({
      where: { titulo: pelicula.titulo },
    });

    if (!existing) {
      await prisma.pelicula.create({
        data: pelicula,
      });
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

function createUtcDate(date: string, hours: number, minutes = 0): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}

async function seedFunciones(): Promise<void> {
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

  const fechas = ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25"];
  const horasInicio = [9, 14, 19];
  let funcionesCreadas = 0;

  console.log("🎥 Configurando funciones...");

  for (let peliculaIndex = 0; peliculaIndex < peliculas.length; peliculaIndex++) {
    const pelicula = peliculas[peliculaIndex];

    for (let funcionIndex = 0; funcionIndex < 2; funcionIndex++) {
      const slotIndex = peliculaIndex * 2 + funcionIndex;
      const fecha = fechas[Math.floor(slotIndex / (salas.length * horasInicio.length)) % fechas.length];
      const sala = salas[Math.floor(slotIndex / horasInicio.length) % salas.length];
      const horaInicio = horasInicio[slotIndex % horasInicio.length];
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
        console.log(`  ℹ️ Función ya existía: "${pelicula.titulo}" ${fecha} ${String(horaInicio).padStart(2, "0")}:00`);
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
      console.log(`  ➕ Función agregada: "${pelicula.titulo}" ${fecha} ${String(horaInicio).padStart(2, "0")}:00 - ${sala.nombre}`);
    }
  }

  console.log(`🎟️ ${funcionesCreadas} funciones nuevas creadas.`);
}

async function seedProductos(): Promise<void> {
  console.log(`🍿 Insertando ${PRODUCTOS_SEED.length} productos gastronómicos...`);

  for (const producto of PRODUCTOS_SEED) {
    const existente = await prisma.producto.findFirst({
      where: {
        idPelicula: producto.idPelicula,
        ordenMenu: producto.ordenMenu,
      },
    });

    if (existente) {
      console.log(
        `ℹ️ Producto ya existente: ${producto.nombre} (película ${producto.idPelicula}, orden ${producto.ordenMenu})`
      );
      continue;
    }

    await prisma.producto.create({
      data: producto,
    });

    console.log(`✅ Producto creado: ${producto.nombre}`);
  }
}

async function main() {
  console.log("🌱 Iniciando proceso de Seed...");
  await seedAdmin();
  await seedPeliculas();
  await seedProductos();
  await seedSalas();
  await seedFunciones();
  console.log("✨ Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
