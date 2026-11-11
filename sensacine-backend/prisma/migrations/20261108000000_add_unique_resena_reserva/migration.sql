-- Una sola reseña por reserva
-- CreateIndex
CREATE UNIQUE INDEX "resena_id_reserva_key" ON "resena"("id_reserva");
