import { Star } from "lucide-react";

interface Props {
    label: string;
    valor: number;
    onChange?: (valor: number) => void; // sin onChange = solo lectura
}

export function EstrellasInput({ label, valor, onChange }: Props) {
    return (
        <div>
            <p className="text-sm font-semibold text-[#1d1d1f] mb-1.5">{label}</p>
            <div className="flex items-center gap-1" role={onChange ? "radiogroup" : "img"} aria-label={`${label}: ${valor} de 5`}>
                {[1, 2, 3, 4, 5].map((n) => {
                    const icono = (
                        <Star
                            className={`w-7 h-7 transition-colors ${
                                n <= valor ? "fill-amber-400 text-amber-400" : "text-[#d2d2d7]"
                            }`}
                        />
                    );
                    return onChange ? (
                        <button
                            key={n}
                            type="button"
                            role="radio"
                            aria-checked={n === valor}
                            aria-label={`${n} de 5`}
                            onClick={() => onChange(n)}
                            className="p-0.5 rounded hover:scale-110 transition-transform"
                        >
                            {icono}
                        </button>
                    ) : (
                        <span key={n}>{icono}</span>
                    );
                })}
                {valor > 0 && <span className="ml-2 text-sm text-[#6e6e73]">{valor}/5</span>}
            </div>
        </div>
    );
}
