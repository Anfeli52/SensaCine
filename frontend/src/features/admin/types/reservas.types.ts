export interface Reserva {
    id: number;
    fechaReserva: string;
    montoTotal: string | number;
    estado: string;
    usuario: {
        id: number;
        nombre: string;
        email: string;
    };
    funcion: {
        fecha: string;
        horaInicio: string;
        horaFin: string;
        pelicula: {
            id: number;
            titulo: string;
            posterUrl: string | null;
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
    }[];
}