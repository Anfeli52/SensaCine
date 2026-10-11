export interface ProductoMenuHistorial {
    id: number;
    nombre: string;
    descripcion: string | null;
    categoria: string | null;
    ordenMenu: number | null;
    imagenUrl: string | null;
}

export interface RestriccionAlimentariaHistorial {
    id: number;
    nombre: string;
    tipo: string;
    descripcion: string | null;
}

export interface RestriccionReservaHistorial {
    id: number;
    notas: string | null;
    restriccion: RestriccionAlimentariaHistorial;
    producto: {
        id: number;
        nombre: string;
    } | null;
}

export interface ReservaHistorial {
    id: number;
    fechaReserva: string;
    montoTotal: string | number;
    estado: string;
    funcion: {
        fecha: string;
        horaInicio: string;
        horaFin: string;
        pelicula: {
            id: number;
            titulo: string;
            posterUrl: string | null;
            productos: ProductoMenuHistorial[];
        };
        sala: {
            id: number;
            nombre: string;
        };
    };
    asientos: {
        id: number;
        asiento: {
            id: number;
            fila: string;
            numero: number;
        };
        restricciones: RestriccionReservaHistorial[];
    }[];
}