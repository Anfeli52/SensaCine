import { z } from "zod";

export const createTarjetaSchema = z.object({
  numeroTarjeta: z.string().min(13, "Número de tarjeta inválido").max(19),
  titular: z.string().min(3, "El titular debe tener al menos 3 caracteres"),
  fechaExpiracion: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato debe ser MM/AA"),
  tipo: z.enum(["Crédito", "Débito"]).optional().default("Crédito"),
  franquicia: z.enum(["Visa", "Mastercard", "Amex"]).optional().default("Visa"),
  saldo: z.number().min(0, "El saldo no puede ser negativo").optional().default(100000),
});

export const updateSaldoSchema = z.object({
  nuevoSaldo: z.number().min(0, "El saldo no puede ser negativo"),
});

export const procesarPagoSchema = z.object({
  monto: z.number().positive("El monto a pagar debe ser mayor a cero"),
  descripcion: z.string().optional(),
});
