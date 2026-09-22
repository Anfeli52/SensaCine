import { Asiento, SeatStatus } from "../types";
import { Seat } from "./Seat";

interface SeatMapProps {
    filas: { fila: string; asientos: Asiento[] }[];
    selectedIds: number[];
    occupiedIds?: number[];
    onToggle: (asiento: Asiento) => void;
}

export function SeatMap({ filas, selectedIds, occupiedIds = [], onToggle, }: Readonly<SeatMapProps>) {
    const statusOf = (id: number): SeatStatus => {
        if (occupiedIds.includes(id)) return "occupied";
        return selectedIds.includes(id) ? "selected" : "available";
    };

    return (
        <div className="overflow-x-auto pb-2">
            <div className="min-w-fit mx-auto flex flex-col items-center gap-6">
                {/* Pantalla */}
                <div className="w-full max-w-[520px]">
                    <div className="h-1.5 rounded-applePill bg-gradient-to-r from-transparent via-[#0071e3] to-transparent shadow-[0_8px_24px_rgba(0,113,227,0.35)]" />
                    <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#86868b] mt-2">
                        Pantalla
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    {filas.map(({ fila, asientos }) => (
                        <div key={fila} className="flex items-center gap-3">
                            <span className="w-5 text-[12px] font-semibold text-[#86868b] text-center">
                                {fila}
                            </span>
                            <div className="flex gap-1.5">
                                {asientos.map((a) => (
                                    <Seat
                                        key={a.id}
                                        label={`${a.fila}${a.numero}`}
                                        status={statusOf(a.id)}
                                        onClick={() => onToggle(a)}
                                    />
                                ))}
                            </div>
                            <span className="w-5 text-[12px] font-semibold text-[#86868b] text-center">
                                {fila}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
