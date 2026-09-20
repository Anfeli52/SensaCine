import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSeatsByHall } from "../api/bookingApi";
import { Asiento } from "../types";

export function useAsientos(idSala?: number) {
    const query = useQuery({
        queryKey: ["asientos", "sala", idSala],
        queryFn: () => getSeatsByHall(idSala as number),
        enabled: !!idSala,
    });

    const filas = useMemo(() => {
        const map = new Map<string, Asiento[]>();

        for (const a of query.data ?? []) {
            map.set(a.fila, [...(map.get(a.fila) ?? []), a]);
        }

        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([fila, asientos]) => ({
                fila,
                asientos: asientos.sort((x, y) => x.numero - y.numero),
            }));
    }, [query.data]);

    return { ...query, filas };
}
