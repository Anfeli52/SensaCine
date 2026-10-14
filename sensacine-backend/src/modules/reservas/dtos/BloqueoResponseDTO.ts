export interface BloqueoResponseDTO {
    id_funcion: number;
    ids_asiento: number[];
    expira_en: string;
    // Segundos que quedan según el reloj del servidor: el cliente no depende de su propio reloj
    segundos_restantes: number;
}
