import { useState } from "react";
import { isAxiosError } from "axios";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { useCrearResena } from "../hooks/useCrearResena";
import { MAX_COMENTARIO_RESENA } from "../types";
import { EstrellasInput } from "./EstrellasInput";

interface Props {
    idReserva: number;
    pelicula: string;
    onClose: () => void;
}

type Paso = "formulario" | "revision" | "guardada";

function mensajeError(error: unknown): string {
    if (isAxiosError(error)) {
        return error.response?.data?.error ?? "No se pudo guardar tu reseña. Inténtalo de nuevo.";
    }
    return "No se pudo guardar tu reseña. Inténtalo de nuevo.";
}

export function ResenaModal({ idReserva, pelicula, onClose }: Props) {
    const [paso, setPaso] = useState<Paso>("formulario");
    const [calificacionPelicula, setCalificacionPelicula] = useState(0);
    const [calificacionExperiencia, setCalificacionExperiencia] = useState(0);
    const [comentario, setComentario] = useState("");
    const [confirmacion, setConfirmacion] = useState("");
    const crear = useCrearResena();

    const completo = calificacionPelicula > 0 && calificacionExperiencia > 0;

    const guardar = () =>
        crear.mutate(
            {
                idReserva,
                calificacionPelicula,
                calificacionExperiencia,
                comentario: comentario.trim() || undefined,
            },
            {
                onSuccess: (r) => {
                    setConfirmacion(r.mensaje);
                    setPaso("guardada");
                },
            }
        );

    return (
        <Modal isOpen onClose={onClose} title={`Tu reseña de ${pelicula}`} maxWidth="lg">
            {paso === "formulario" && (
                <form
                    className="space-y-5"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (completo) setPaso("revision");
                    }}
                >
                    <EstrellasInput label="¿Qué te pareció la película?" valor={calificacionPelicula} onChange={setCalificacionPelicula} />
                    <EstrellasInput
                        label="¿Cómo fue la experiencia sensorial y gastronómica?"
                        valor={calificacionExperiencia}
                        onChange={setCalificacionExperiencia}
                    />

                    <div>
                        <label htmlFor="comentario-resena" className="text-sm font-semibold text-[#1d1d1f] mb-1.5 block">
                            Cuéntanos tu experiencia <span className="font-normal text-[#86868b]">(opcional)</span>
                        </label>
                        <textarea
                            id="comentario-resena"
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            maxLength={MAX_COMENTARIO_RESENA}
                            rows={5}
                            placeholder="¿Qué te gustó de la película, la comida, el ambiente?"
                            className="w-full rounded-xl border border-[#d2d2d7] bg-[#fafafc] px-4 py-3 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 resize-none"
                        />
                        <p className="mt-1 text-right text-xs text-[#86868b]">
                            {comentario.length}/{MAX_COMENTARIO_RESENA}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!completo}>
                            Revisar reseña
                        </Button>
                    </div>
                </form>
            )}

            {paso === "revision" && (
                <div className="space-y-5">
                    <p className="text-sm text-[#6e6e73]">Revisa tu reseña antes de registrarla.</p>
                    <div className="rounded-xl border border-[#e5e5ea] bg-[#fafafc] p-4 space-y-4">
                        <EstrellasInput label="Película" valor={calificacionPelicula} />
                        <EstrellasInput label="Experiencia sensorial y gastronómica" valor={calificacionExperiencia} />
                        <div>
                            <p className="text-sm font-semibold text-[#1d1d1f] mb-1">Comentario</p>
                            <p className="text-sm text-[#1d1d1f] whitespace-pre-wrap break-words">
                                {comentario.trim() || <span className="text-[#86868b]">Sin comentario</span>}
                            </p>
                        </div>
                    </div>

                    {crear.isError && <p className="text-sm text-red-600">{mensajeError(crear.error)}</p>}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setPaso("formulario")} disabled={crear.isPending}>
                            Editar
                        </Button>
                        <Button type="button" onClick={guardar} isLoading={crear.isPending}>
                            Registrar reseña
                        </Button>
                    </div>
                </div>
            )}

            {paso === "guardada" && (
                <div className="text-center py-4 space-y-4">
                    <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                    <p className="text-base font-semibold text-[#1d1d1f]">{confirmacion}</p>
                    <Button type="button" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            )}
        </Modal>
    );
}
