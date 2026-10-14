export type EstadoAsiento = "disponible" | "pendiente" | "ocupado";

export interface AsientoDisponibilidadDTO {
    id: number;
    id_sala: number;
    fila: string;
    numero: number;
    estado: EstadoAsiento;
}

// Bloqueo temporal ("Pendiente") que el usuario autenticado tiene sobre esta función
export interface MiBloqueoDTO {
    ids_asiento: number[];
    expira_en: string;
    segundos_restantes: number;
}

export interface DisponibilidadFuncionDTO {
    id_funcion: number;
    id_sala: number;
    asientos: AsientoDisponibilidadDTO[];
    mi_bloqueo: MiBloqueoDTO | null;
}
