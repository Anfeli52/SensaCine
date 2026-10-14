-- CreateTable
CREATE TABLE "bloqueo_asiento" (
    "id_bloqueo" SERIAL NOT NULL,
    "id_funcion" INTEGER NOT NULL,
    "id_asiento" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloqueo_asiento_pkey" PRIMARY KEY ("id_bloqueo")
);

-- CreateIndex
CREATE INDEX "bloqueo_asiento_expira_en_idx" ON "bloqueo_asiento"("expira_en");

-- CreateIndex
CREATE INDEX "bloqueo_asiento_id_usuario_id_funcion_idx" ON "bloqueo_asiento"("id_usuario", "id_funcion");

-- CreateIndex
CREATE UNIQUE INDEX "bloqueo_asiento_id_funcion_id_asiento_key" ON "bloqueo_asiento"("id_funcion", "id_asiento");

-- AddForeignKey
ALTER TABLE "bloqueo_asiento" ADD CONSTRAINT "bloqueo_asiento_id_funcion_fkey" FOREIGN KEY ("id_funcion") REFERENCES "funcion"("id_funcion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueo_asiento" ADD CONSTRAINT "bloqueo_asiento_id_asiento_fkey" FOREIGN KEY ("id_asiento") REFERENCES "asiento"("id_asiento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueo_asiento" ADD CONSTRAINT "bloqueo_asiento_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
