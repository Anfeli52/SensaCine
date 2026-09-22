-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('cliente', 'admin', 'cocina');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('Confirmado', 'Cancelado', 'Finalizado');

-- CreateEnum
CREATE TYPE "TipoRestriccion" AS ENUM ('alergia', 'intolerancia', 'preferencia');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('confirmacion', 'solicitud_resena');

-- CreateEnum
CREATE TYPE "EstadoOrdenCocina" AS ENUM ('Pendiente', 'En_preparacion', 'Lista');

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'cliente',
    "estado" VARCHAR(30) NOT NULL DEFAULT 'activo',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "log_auditoria" (
    "id_log" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "accion" VARCHAR(100) NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "entidad_id" INTEGER NOT NULL,
    "valor_anterior" TEXT,
    "valor_nuevo" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_auditoria_pkey" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "pelicula" (
    "id_pelicula" SERIAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "sinopsis" TEXT,
    "duracion_minutos" INTEGER NOT NULL,
    "genero" VARCHAR(80),
    "clasificacion" VARCHAR(20),
    "poster_url" VARCHAR(500),
    "estado" VARCHAR(30) NOT NULL DEFAULT 'activa',
    "precio_base_experiencia" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pelicula_pkey" PRIMARY KEY ("id_pelicula")
);

-- CreateTable
CREATE TABLE "sala" (
    "id_sala" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'activa',

    CONSTRAINT "sala_pkey" PRIMARY KEY ("id_sala")
);

-- CreateTable
CREATE TABLE "asiento" (
    "id_asiento" SERIAL NOT NULL,
    "id_sala" INTEGER NOT NULL,
    "fila" VARCHAR(5) NOT NULL,
    "numero" INTEGER NOT NULL,

    CONSTRAINT "asiento_pkey" PRIMARY KEY ("id_asiento")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(50),
    "estado" VARCHAR(30) NOT NULL DEFAULT 'activo',
    "id_pelicula" INTEGER,
    "orden_menu" INTEGER,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "restriccion_alimentaria" (
    "id_restriccion" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" "TipoRestriccion" NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "restriccion_alimentaria_pkey" PRIMARY KEY ("id_restriccion")
);

-- CreateTable
CREATE TABLE "producto_restriccion" (
    "id_producto_restriccion" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_restriccion" INTEGER NOT NULL,

    CONSTRAINT "producto_restriccion_pkey" PRIMARY KEY ("id_producto_restriccion")
);

-- CreateTable
CREATE TABLE "funcion" (
    "id_funcion" SERIAL NOT NULL,
    "id_pelicula" INTEGER NOT NULL,
    "id_sala" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "precio_asiento_oficial" DECIMAL(10,2) NOT NULL,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'programada',

    CONSTRAINT "funcion_pkey" PRIMARY KEY ("id_funcion")
);

-- CreateTable
CREATE TABLE "reserva" (
    "id_reserva" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_funcion" INTEGER NOT NULL,
    "fecha_reserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_total" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'Confirmado',

    CONSTRAINT "reserva_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateTable
CREATE TABLE "reserva_asiento" (
    "id_reserva_asiento" SERIAL NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "id_asiento" INTEGER NOT NULL,

    CONSTRAINT "reserva_asiento_pkey" PRIMARY KEY ("id_reserva_asiento")
);

-- CreateTable
CREATE TABLE "reserva_restriccion" (
    "id_reserva_asiento_restriccion" SERIAL NOT NULL,
    "id_reserva_asiento" INTEGER NOT NULL,
    "id_restriccion" INTEGER NOT NULL,
    "notas" VARCHAR(255),
    "id_producto" INTEGER,

    CONSTRAINT "reserva_restriccion_pkey" PRIMARY KEY ("id_reserva_asiento_restriccion")
);

-- CreateTable
CREATE TABLE "pago" (
    "id_pago" SERIAL NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "medio_pago" VARCHAR(50) NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia_transaccion" VARCHAR(150),

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "resena" (
    "id_resena" SERIAL NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "calificacion_pelicula" INTEGER NOT NULL,
    "calificacion_experiencia" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resena_pkey" PRIMARY KEY ("id_resena")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id_notificacion" SERIAL NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "fecha_envio" TIMESTAMP(3),
    "estado" VARCHAR(30) NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateTable
CREATE TABLE "orden_cocina" (
    "id_orden" SERIAL NOT NULL,
    "id_reserva_asiento" INTEGER NOT NULL,
    "estado" "EstadoOrdenCocina" NOT NULL DEFAULT 'Pendiente',
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orden_cocina_pkey" PRIMARY KEY ("id_orden")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "asiento_id_sala_fila_numero_key" ON "asiento"("id_sala", "fila", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "producto_restriccion_id_producto_id_restriccion_key" ON "producto_restriccion"("id_producto", "id_restriccion");

-- CreateIndex
CREATE UNIQUE INDEX "reserva_asiento_id_reserva_id_asiento_key" ON "reserva_asiento"("id_reserva", "id_asiento");

-- AddForeignKey
ALTER TABLE "log_auditoria" ADD CONSTRAINT "log_auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asiento" ADD CONSTRAINT "asiento_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "sala"("id_sala") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_pelicula_fkey" FOREIGN KEY ("id_pelicula") REFERENCES "pelicula"("id_pelicula") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_restriccion" ADD CONSTRAINT "producto_restriccion_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_restriccion" ADD CONSTRAINT "producto_restriccion_id_restriccion_fkey" FOREIGN KEY ("id_restriccion") REFERENCES "restriccion_alimentaria"("id_restriccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcion" ADD CONSTRAINT "funcion_id_pelicula_fkey" FOREIGN KEY ("id_pelicula") REFERENCES "pelicula"("id_pelicula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcion" ADD CONSTRAINT "funcion_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "sala"("id_sala") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_funcion_fkey" FOREIGN KEY ("id_funcion") REFERENCES "funcion"("id_funcion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_asiento" ADD CONSTRAINT "reserva_asiento_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reserva"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_asiento" ADD CONSTRAINT "reserva_asiento_id_asiento_fkey" FOREIGN KEY ("id_asiento") REFERENCES "asiento"("id_asiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_restriccion" ADD CONSTRAINT "reserva_restriccion_id_reserva_asiento_fkey" FOREIGN KEY ("id_reserva_asiento") REFERENCES "reserva_asiento"("id_reserva_asiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_restriccion" ADD CONSTRAINT "reserva_restriccion_id_restriccion_fkey" FOREIGN KEY ("id_restriccion") REFERENCES "restriccion_alimentaria"("id_restriccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_restriccion" ADD CONSTRAINT "reserva_restriccion_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reserva"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resena" ADD CONSTRAINT "resena_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reserva"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reserva"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_cocina" ADD CONSTRAINT "orden_cocina_id_reserva_asiento_fkey" FOREIGN KEY ("id_reserva_asiento") REFERENCES "reserva_asiento"("id_reserva_asiento") ON DELETE RESTRICT ON UPDATE CASCADE;
