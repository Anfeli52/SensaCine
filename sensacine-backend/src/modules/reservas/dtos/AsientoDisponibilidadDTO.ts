export interface AsientoDisponibilidadDTO {
    id: number;
    id_sala: number;
    fila: string;
    numero: number;
    ocupado: boolean;
}

export interface DisponibilidadFuncionDTO {
    id_funcion: number;
    id_sala: number;
    asientos: AsientoDisponibilidadDTO[];
}
