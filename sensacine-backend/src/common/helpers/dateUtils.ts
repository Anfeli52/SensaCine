/**
 * Utilidades de fecha y hora sincronizadas con la zona horaria del cine ('America/Bogota').
 * Aseguran consistencia entre el cliente, PostgreSQL (@db.Date / @db.Time) y la lógica de negocio.
 */

export const CINEMA_TIMEZONE = "America/Bogota";

/**
 * Retorna la fecha actual o dada en formato 'YYYY-MM-DD' en la zona horaria de Colombia.
 */
export function getCinemaDateStr(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CINEMA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Retorna la hora actual o dada en formato 'HH:mm' (24h) en la zona horaria de Colombia.
 */
export function getCinemaTimeStr(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CINEMA_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Retorna un objeto Date con la medianoche en UTC correspondiente a la fecha de hoy en Colombia.
 * Ideal para comparaciones de columnas Prisma @db.Date donde la fecha se guarda como YYYY-MM-DDT00:00:00.000Z.
 */
export function getCinemaTodayUtcMidnight(date: Date = new Date()): Date {
  const dateStr = getCinemaDateStr(date);
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
