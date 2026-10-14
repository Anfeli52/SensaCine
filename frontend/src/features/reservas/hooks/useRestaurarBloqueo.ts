import { useEffect, useState } from "react";
import { getMiBloqueo } from "../api/bookingApi";
import { useBloqueoStore } from "../bloqueoStore";

export function useRestaurarBloqueo(idFuncion?: number, idsEsperados?: number[]): boolean {
    const setBloqueo = useBloqueoStore((s) => s.setBloqueo);
    const [verificando, setVerificando] = useState(
        () => !!idFuncion && useBloqueoStore.getState().bloqueo?.idFuncion !== idFuncion
    );

    useEffect(() => {
        if (!verificando || !idFuncion) return;
        let cancelado = false;
        getMiBloqueo(idFuncion)
            .then((real) => {
                if (cancelado || !real || real.segundos_restantes <= 0) return;

                const coincide =
                    !idsEsperados ||
                    (idsEsperados.length === real.ids_asiento.length && idsEsperados.every((id) => real.ids_asiento.includes(id)));
                if (coincide) setBloqueo(real.id_funcion, real.ids_asiento, real.segundos_restantes);
            })
            .catch(() => undefined)
            .finally(() => !cancelado && setVerificando(false));
        return () => {
            cancelado = true;
        };
    }, []);

    return verificando;
}
