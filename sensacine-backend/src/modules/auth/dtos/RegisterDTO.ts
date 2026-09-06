// Lo que el cliente envía en el body del POST /api/auth/register
export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
}
