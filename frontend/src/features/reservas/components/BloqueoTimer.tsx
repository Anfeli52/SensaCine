import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { getMiBloqueo } from "../api/bookingApi";
import { useBloqueoStore } from "../bloqueoStore";

const RESYNC_MS = 10_000;

interface BloqueoTimerProps {
  idFuncion: number;
  onExpire?: () => void;
}

const format = (segundos: number) =>
  `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;

export function BloqueoTimer({ idFuncion, onExpire }: Readonly<BloqueoTimerProps>) {
  const bloqueo = useBloqueoStore((s) => s.bloqueo);
  const clear = useBloqueoStore((s) => s.clear);
  const setBloqueo = useBloqueoStore((s) => s.setBloqueo);
  const [now, setNow] = useState(() => Date.now());
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const activo = bloqueo?.idFuncion === idFuncion ? bloqueo : null;
  const restante = activo ? Math.max(0, Math.ceil((activo.expiraEnMs - now) / 1000)) : 0;

  useEffect(() => {
    if (!activo) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activo?.expiraEnMs]);

  const resync = async () => {
    try {
      const real = await getMiBloqueo(idFuncion);
      if (!real || real.segundos_restantes <= 0) {
        clear();
        onExpireRef.current?.();
        console.log("¿¿¿¿¿¿¿Funcionass???????")
      } else {
        setBloqueo(real.id_funcion, real.ids_asiento, real.segundos_restantes);
      }
    } catch { 
      //No le quiero poner un catch, luego lo hago :D
    }
  };
  const resyncRef = useRef(resync);
  resyncRef.current = resync;

  const hayBloqueo = !!activo;
  useEffect(() => {
    if (!hayBloqueo) return;
    const t = setInterval(() => resyncRef.current(), RESYNC_MS);
    return () => clearInterval(t);
  }, [hayBloqueo]);

  useEffect(() => {
    if (hayBloqueo && restante === 0) resyncRef.current();
  }, [hayBloqueo, restante]);

  if (!activo) return null;

  const tone =
    restante <= 60
      ? "bg-red-50 border-red-200 text-red-700"
      : restante <= 180
        ? "bg-amber-50 border-amber-200 text-amber-800"
        : "bg-[#0071e3]/5 border-[#0071e3]/20 text-[#0071e3]";

  return (
    <div
      role="timer"
      aria-live="off"
      className={`flex items-center justify-between gap-3 border rounded-appleLg px-4 py-2.5 text-[12px] ${tone}`}
    >
      <span className="flex items-center gap-2">
        <Timer className="w-4 h-4" />
        Tus asientos están reservados temporalmente. Completa tu reserva antes de que se libere.
      </span>
      <strong className="text-[15px] tabular-nums tracking-tight">{format(restante)}</strong>
    </div>
  );
}
