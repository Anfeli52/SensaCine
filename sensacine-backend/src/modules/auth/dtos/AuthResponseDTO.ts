// Lo que la API devuelve al cliente. Nótese que NO incluye passwordHash:
// el mapeo manual en el service es lo que evita que se filtre por accidente.
export interface AuthResponseDTO {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}
