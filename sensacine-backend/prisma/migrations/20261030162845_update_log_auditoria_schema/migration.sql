/*
  Warnings:

  - The `valor_anterior` column on the `log_auditoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `valor_nuevo` column on the `log_auditoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "log_auditoria" DROP CONSTRAINT "log_auditoria_id_usuario_fkey";

-- AlterTable
ALTER TABLE "log_auditoria" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "usuario_email" VARCHAR(150),
ADD COLUMN     "usuario_rol" VARCHAR(50),
ALTER COLUMN "id_usuario" DROP NOT NULL,
DROP COLUMN "valor_anterior",
ADD COLUMN     "valor_anterior" JSONB,
DROP COLUMN "valor_nuevo",
ADD COLUMN     "valor_nuevo" JSONB;

-- CreateIndex
CREATE INDEX "log_auditoria_fecha_hora_idx" ON "log_auditoria"("fecha_hora" DESC);

-- CreateIndex
CREATE INDEX "log_auditoria_entidad_entidad_id_idx" ON "log_auditoria"("entidad", "entidad_id");

-- CreateIndex
CREATE INDEX "log_auditoria_id_usuario_idx" ON "log_auditoria"("id_usuario");

-- CreateIndex
CREATE INDEX "log_auditoria_accion_idx" ON "log_auditoria"("accion");

-- AddForeignKey
ALTER TABLE "log_auditoria" ADD CONSTRAINT "log_auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
