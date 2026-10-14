import { useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDisponibilidadByFuncion } from "../api/bookingApi";
import { socket } from "../../../lib/socket";
import { useAuthStore } from "../../auth/authStore";
import { AsientoFuncion, DisponibilidadFuncion, EstadoAsiento } from "../types";

export const asientosQueryKey = (idFuncion?: number) => ["asientos", "funcion", idFuncion];

interface CambioAsientosPayload {
  idFuncion: number;
  idsAsiento: number[];
  idUsuario?: number;
}

export function useAsientos(idFuncion?: number, onNoDisponibles?: (ids: number[]) => void) {
  const queryClient = useQueryClient();
  const callbackRef = useRef(onNoDisponibles);
  callbackRef.current = onNoDisponibles;

  const query = useQuery({
    queryKey: asientosQueryKey(idFuncion),
    queryFn: () => getDisponibilidadByFuncion(idFuncion as number),
    enabled: !!idFuncion,
  });

  useEffect(() => {
    if (!idFuncion) return;

    const setEstado = (ids: number[], estado: EstadoAsiento) =>
      queryClient.setQueryData<DisponibilidadFuncion>(asientosQueryKey(idFuncion), (old) =>
        old
          ? {
              ...old,
              asientos: old.asientos.map((a) => {
                if (!ids.includes(a.id)) return a;
                // Un asiento ya reservado solo cambia por una recarga completa
                if (a.estado === "ocupado" && estado === "disponible") return a;
                return { ...a, estado };
              }),
            }
          : old
      );

    const handlePendientes = (p: CambioAsientosPayload) => {
      if (p.idFuncion !== idFuncion) return;
      setEstado(p.idsAsiento, "pendiente");
      if (p.idUsuario !== useAuthStore.getState().usuario?.id) callbackRef.current?.(p.idsAsiento);
    };

    const handleOcupados = (p: CambioAsientosPayload) => {
      if (p.idFuncion !== idFuncion) return;
      setEstado(p.idsAsiento, "ocupado");
      callbackRef.current?.(p.idsAsiento);
    };

    const handleLiberados = (p: CambioAsientosPayload) => {
      if (p.idFuncion === idFuncion) setEstado(p.idsAsiento, "disponible");
    };

    const handleConnect = () => {
      socket.emit("funcion:join", idFuncion);
      queryClient.invalidateQueries({ queryKey: asientosQueryKey(idFuncion) });
    };

    socket.on("connect", handleConnect);
    socket.on("asientos:pendientes", handlePendientes);
    socket.on("asientos:ocupados", handleOcupados);
    socket.on("asientos:liberados", handleLiberados);
    if (socket.connected) socket.emit("funcion:join", idFuncion);
    else socket.connect();

    return () => {
      socket.emit("funcion:leave", idFuncion);
      socket.off("connect", handleConnect);
      socket.off("asientos:pendientes", handlePendientes);
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

  const idsPorEstado = (estado: EstadoAsiento) =>
    (query.data?.asientos ?? []).filter((a) => a.estado === estado).map((a) => a.id);

  const occupiedIds = useMemo(() => idsPorEstado("ocupado"), [query.data]);
  const pendingIds = useMemo(() => idsPorEstado("pendiente"), [query.data]);

  return { ...query, filas, occupiedIds, pendingIds, miBloqueo: query.data?.mi_bloqueo ?? null };
}
