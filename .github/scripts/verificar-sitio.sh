#!/usr/bin/env bash
# Comprueba que cada ruta del sitio devuelve la aplicación (HTML con id="root").
# Uso: verificar-sitio.sh <url-sitio> <ruta> [ruta...]
# Probar una ruta interna como /reservas/historial confirma la regla de reescritura (_redirects).
set -uo pipefail

URL="${1:?Falta la URL del sitio}"; shift
URL="${URL%/}"
[[ $# -gt 0 ]] || { echo "Falta al menos una ruta" >&2; exit 2; }

for ruta in "$@"; do
  ok=0
  for intento in {1..10}; do
    # Se guarda la respuesta en una variable: evita falsos errores de tubería (SIGPIPE) con grep -q
    CUERPO="$(curl --silent --show-error --fail --max-time 20 "$URL$ruta" 2>/dev/null || true)"
    if grep -q 'id="root"' <<<"$CUERPO"; then ok=1; break; fi
    echo "Intento $intento/10: $URL$ruta aún no devuelve la aplicación."
    sleep 6
  done
  if [[ $ok -ne 1 ]]; then
    echo "ERROR: $URL$ruta no devolvió la aplicación." >&2
    exit 1
  fi
  echo "OK: $URL$ruta"
done
