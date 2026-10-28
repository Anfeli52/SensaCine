import { escapeHtml } from "./confirmacionReserva.template";
import { DatosSolicitudResena, MensajeCorreo } from "./notificacion.types";

// fecha (@db.Date) se guarda en UTC: se lee en UTC para no desplazar el día
function formatoFecha(fecha: Date): string {
    const texto = new Intl.DateTimeFormat("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
    }).format(fecha);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function renderSolicitudResena(d: DatosSolicitudResena): MensajeCorreo {
    const primerNombre = d.nombreUsuario.trim().split(/\s+/)[0] || "";
    const fecha = formatoFecha(d.fecha);
    const subject = `¿Qué te pareció ${d.pelicula}? Cuéntanos tu experiencia`;
    const saludo = `¡Gracias por venir${primerNombre ? ", " + primerNombre : ""}!`;

    const text = [
        saludo,
        "",
        `Esperamos que hayas disfrutado "${d.pelicula}" (${fecha}) en SensaCine.`,
        "Tu opinión nos ayuda a mejorar la experiencia. Escribe tu reseña aquí:",
        d.urlResena,
        "",
        "SensaCine",
    ].join("\n");

    const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#0071e3;padding:18px 28px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.01em">SensaCine</td></tr>
        <tr><td style="padding:28px">
          <h1 style="font-size:22px;line-height:1.25;margin:0 0 12px;letter-spacing:-0.01em">${escapeHtml(saludo)}</h1>
          <p style="margin:0 0 6px;color:#6e6e73;font-size:15px;line-height:1.5">Esperamos que hayas disfrutado</p>
          <p style="margin:0 0 6px;font-size:20px;font-weight:700">${escapeHtml(d.pelicula)}</p>
          <p style="margin:0 0 20px;color:#6e6e73;font-size:14px">${escapeHtml(fecha)} · Reserva #${d.idReserva}</p>
          <p style="margin:0 0 24px;color:#1d1d1f;font-size:15px;line-height:1.5">Tu opinión nos ayuda a mejorar la experiencia. Solo te tomará un minuto.</p>
          <a href="${escapeHtml(d.urlResena)}" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 24px;border-radius:999px">Escribir mi reseña</a>
          <p style="margin:24px 0 0;color:#86868b;font-size:12px;line-height:1.5">Si el botón no funciona, copia este enlace en tu navegador:<br>${escapeHtml(d.urlResena)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    return { to: d.emailDestino, subject, text, html };
}
