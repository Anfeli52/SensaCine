import { DatosConfirmacionReserva, MensajeCorreo } from "./notificacion.types";

// Los nombres de comensales los escribe el usuario: se escapan antes de entrar al HTML del correo
export function escapeHtml(valor: string): string {
    return valor
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

const formatoCOP = (monto: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(monto);

// fecha (@db.Date) y horas (@db.Time) se guardan en UTC: se leen en UTC para no desplazar el día ni la hora
function formatoFecha(fecha: Date): string {
    const texto = new Intl.DateTimeFormat("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(fecha);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const formatoHora = (hora: Date) =>
    `${String(hora.getUTCHours()).padStart(2, "0")}:${String(hora.getUTCMinutes()).padStart(2, "0")}`;

export function renderConfirmacionReserva(d: DatosConfirmacionReserva): MensajeCorreo {
    const sillas = [...d.asientos]
        .sort((a, b) => a.fila.localeCompare(b.fila) || a.numero - b.numero)
        .map((a) => ({ etiqueta: `${a.fila}${a.numero}`, persona: a.nombrePersona }));

    const fecha = formatoFecha(d.fecha);
    const horario = `${formatoHora(d.horaInicio)} - ${formatoHora(d.horaFin)}`;
    const monto = formatoCOP(d.montoPagado);
    const primerNombre = d.nombreUsuario.trim().split(/\s+/)[0] || "";

    const subject = `Reserva #${d.idReserva} confirmada - ${d.pelicula}`;

    const text = [
        `¡Tu reserva está confirmada${primerNombre ? ", " + primerNombre : ""}!`,
        `Reserva #${d.idReserva}`,
        "",
        `Película: ${d.pelicula}`,
        `Fecha: ${fecha}`,
        `Hora: ${horario}`,
        `Sala: ${d.sala}`,
        `Sillas: ${sillas.map((s) => (s.persona ? `${s.etiqueta} (${s.persona})` : s.etiqueta)).join(", ")}`,
        "",
        `Monto pagado: ${monto}`,
        ...(d.referenciaTransaccion ? [`Referencia de pago: ${d.referenciaTransaccion}`] : []),
        "",
        "Conserva este correo como respaldo de tu compra.",
        "Si no realizaste esta reserva, responde a este correo o contáctanos.",
        "SensaCine",
    ].join("\n");

    const fila = (etiqueta: string, valor: string) => `
            <tr>
              <td style="padding:8px 0;color:#6e6e73;font-size:14px;width:110px;vertical-align:top">${etiqueta}</td>
              <td style="padding:8px 0;color:#1d1d1f;font-size:14px;font-weight:600">${valor}</td>
            </tr>`;

    const sillasHtml = sillas
        .map(
            (s) =>
                `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border-radius:8px;background:#e8f1fd;color:#0058b0;font-weight:700">${escapeHtml(s.etiqueta)}</span>` +
                (s.persona ? `<span style="color:#6e6e73;font-weight:400">${escapeHtml(s.persona)}</span><br>` : "<br>")
        )
        .join("");

    const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#0071e3;padding:18px 28px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.01em">SensaCine</td></tr>
        <tr><td style="padding:28px 28px 8px">
          <span style="display:inline-block;background:#e3f6ea;color:#0f7a3d;border-radius:999px;padding:6px 14px;font-size:13px;font-weight:700">&#10003; Reserva confirmada</span>
          <h1 style="font-size:22px;line-height:1.25;margin:16px 0 6px;letter-spacing:-0.01em">¡Tu reserva está confirmada${primerNombre ? ", " + escapeHtml(primerNombre) : ""}!</h1>
          <p style="margin:0;color:#6e6e73;font-size:14px">Reserva <strong style="color:#1d1d1f">#${d.idReserva}</strong>. Conserva este correo como respaldo de tu compra.</p>
        </td></tr>
        <tr><td style="padding:12px 28px 4px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #ececf0;border-bottom:1px solid #ececf0">${fila("Película", escapeHtml(d.pelicula))}${fila("Fecha", escapeHtml(fecha))}${fila("Hora", horario)}${fila("Sala", escapeHtml(d.sala))}${fila("Sillas", sillasHtml)}
          </table>
        </td></tr>
        <tr><td style="padding:16px 28px 28px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafc;border:1px solid #ececf0;border-radius:12px">
            <tr>
              <td style="padding:16px 18px;color:#6e6e73;font-size:14px">Monto pagado</td>
              <td align="right" style="padding:16px 18px;color:#0071e3;font-size:22px;font-weight:700">${escapeHtml(monto)}</td>
            </tr>${
                d.referenciaTransaccion
                    ? `
            <tr><td colspan="2" style="padding:0 18px 14px;color:#86868b;font-size:12px">Referencia de pago: ${escapeHtml(d.referenciaTransaccion)}</td></tr>`
                    : ""
            }
          </table>
        </td></tr>
        <tr><td style="padding:0 28px 28px;color:#86868b;font-size:12px;line-height:1.5">
          Si no realizaste esta reserva, responde a este correo o contáctanos.<br>SensaCine · Experiencia sensorial y gastronómica
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    return { to: d.emailDestino, subject, text, html };
}
