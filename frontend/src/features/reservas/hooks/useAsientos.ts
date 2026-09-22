import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDisponibilidadByFuncion } from "../api/bookingApi";
import { socket } from "../../../lib/socket";
import { AsientoFuncion, DisponibilidadFuncion } from "../types";

const queryKey = (idFuncion?: number) => ["asientos", "funcion", idFuncion];

interface CambioAsientosPayload {
  idFuncion: number;
  idsAsiento: number[];
}

export function useAsientos(idFuncion?: number, onOcupados?: (ids: number[]) => void) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKey(idFuncion),
    queryFn: () => getDisponibilidadByFuncion(idFuncion as number),
    enabled: !!idFuncion,
  });

  useEffect(() => {
    if (!idFuncion) return;

    const setOcupado = (ids: number[], ocupado: boolean) =>
      queryClient.setQueryData<DisponibilidadFuncion>(queryKey(idFuncion), (old) =>
        old
          ? { ...old, asientos: old.asientos.map((a) => (ids.includes(a.id) ? { ...a, ocupado } : a)) }
          : old
      );

    const handleOcupados = (p: CambioAsientosPayload) => {
      if (p.idFuncion !== idFuncion) return;
      setOcupado(p.idsAsiento, true);
      onOcupados?.(p.idsAsiento);
    };
    const handleLiberados = (p: CambioAsientosPayload) => {
      if (p.idFuncion === idFuncion) setOcupado(p.idsAsiento, false);
    };

    const handleConnect = () => {
      socket.emit("funcion:join", idFuncion);
      queryClient.invalidateQueries({ queryKey: queryKey(idFuncion) });
    };

    socket.on("connect", handleConnect);
    socket.on("asientos:ocupados", handleOcupados);
    socket.on("asientos:liberados", handleLiberados);
    if (socket.connected) socket.emit("funcion:join", idFuncion);
    else socket.connect();

    return () => {
      socket.emit("funcion:leave", idFuncion);
      socket.off("connect", handleConnect);
      socket.off("asientos:ocupados", handleOcupados);
      socket.off("asientos:liberados", handleLiberados);
      socket.disconnect();
    };
  }, [idFuncion, queryClient]);

  const filas = useMemo(() => {
    const map = new Map<string, AsientoFuncion[]>();
    for (const a of query.data?.asientos ?? []) {
      map.set(a.fila, [...(map.get(a.fila) ?? []), a]);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fila, asientos]) => ({
        fila,
        asientos: asientos.sort((x, y) => x.numero - y.numero),
      }));
  }, [query.data]);

  const occupiedIds = useMemo(
    () => (query.data?.asientos ?? []).filter((a) => a.ocupado).map((a) => a.id),
    [query.data]
  );

  return { ...query, filas, occupiedIds };
}
