-- CreateTable
CREATE TABLE "tarjeta" (
    "id_tarjeta" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "numero_tarjeta" VARCHAR(19) NOT NULL,
    "titular" VARCHAR(100) NOT NULL,
    "fecha_expiracion" VARCHAR(7) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL DEFAULT 'Crédito',
    "franquicia" VARCHAR(30) NOT NULL DEFAULT 'Visa',
    "saldo" DECIMAL(12,2) NOT NULL DEFAULT 100000.00,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activa',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tarjeta_pkey" PRIMARY KEY ("id_tarjeta")
);
-- AddForeignKey
ALTER TABLE "tarjeta" ADD CONSTRAINT "tarjeta_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
