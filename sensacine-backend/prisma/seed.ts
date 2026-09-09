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

async function main() {
  console.log("🌱 Iniciando proceso de Seed...");

  // 1. Crear usuario Administrador inicial si no existe
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

  // 2. Insertar las 15 películas
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
