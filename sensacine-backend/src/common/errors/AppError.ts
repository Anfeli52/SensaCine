// Error de negocio con su código de estado HTTP asociado.
// Los services lanzan esto (no un Error genérico) para que el
// errorHandler sepa qué status devolver al cliente.
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}
