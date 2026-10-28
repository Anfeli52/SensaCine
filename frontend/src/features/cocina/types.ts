export type EstadoOrden = "Pendiente" | "En_preparacion" | "Lista";

export interface OrdenCocina {
    id: number;
    idReservaAsiento: number;
    estado: EstadoOrden;
    fechaActualizacion?: string;
}

export interface ProductoCocina {
    id: number;
    nombre: string;
    descripcion: string | null;
    categoria: string | null;
    estado: string;
    idPelicula: number | null;
    ordenMenu: number | null;
    imagenUrl: string | null;
}

export interface PeliculaCocina {
    id: number;
    titulo: string;
    sinopsis: string | null;
    duracionMinutos: number;
    genero: string;
    clasificacion: string;
    posterUrl: string | null;
    productos: ProductoCocina[];
}

export interface SalaCocina {
    id: number;
    nombre: string;
    capacidad: number;
    estado: string;
}

export interface RestriccionAlimentariaCocina {
    id: number;
    nombre: string;
    tipo?: string;
    descripcion?: string | null;
}

export interface RestriccionAsistenteCocina {
    id: number;
    notas: string | null;
    restriccion: RestriccionAlimentariaCocina;
    producto: ProductoCocina | null;
}

export interface AsientoCocina {
    id: number;
    fila?: string;
    numero?: number;
}

export interface AsistenteCocina {
    id: number;
    nombrePersona: string | null;
    asiento: AsientoCocina;
    restricciones: RestriccionAsistenteCocina[];
    ordenesCocina?: OrdenCocina[];
}

export interface ReservaCocina {
    id: number;
    idFuncion: number;
    estado: string;
    usuario: {
        id: number;
        nombre: string;
        email: string;
    };
    asientos: AsistenteCocina[];
}

export interface FuncionCocina {
    id: number;
    idPelicula: number;
    idSala: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    precioAsientoOficial: string;
    estado: string;
    pelicula: PeliculaCocina;
    sala: SalaCocina;
    totalReservas: number;
    reservas: ReservaCocina[];
}

export interface ListadoFuncionesCocinaResponse {
    mensaje?: string;
    total: number;
    funciones: FuncionCocina[];
}

export function obtenerEstadoOrden(asistente: AsistenteCocina): EstadoOrden {
    if (asistente.ordenesCocina && asistente.ordenesCocina.length > 0) {
        return asistente.ordenesCocina[0].estado;
    }
    return "Pendiente";
}

export function obtenerIdOrden(asistente: AsistenteCocina): number | null {
    if (asistente.ordenesCocina && asistente.ordenesCocina.length > 0) {
        return asistente.ordenesCocina[0].id;
    }
    return null;
}
