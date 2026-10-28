#!/usr/bin/env bash
# Espera a que el backend responda /health con el commit esperado.
# Uso: esperar-despliegue.sh <url-backend> <sha-esperado> [intentos] [segundos-entre-intentos]
# Render gratuito tarda en construir y en despertar: se reintenta ~15 min por defecto.
set -uo pipefail

URL="${1:?Falta la URL del backend}"
ESPERADO="${2:?Falta el commit esperado}"
INTENTOS="${3:-90}"
PAUSA="${4:-10}"
URL="${URL%/}"

for ((i = 1; i <= INTENTOS; i++)); do
  # --max-time evita quedarse colgado si el servicio está despertando
  RESPUESTA="$(curl --silent --max-time 15 "$URL/health" || true)"
  COMMIT="$(printf '%s' "$RESPUESTA" | jq -r '.commit // empty' 2>/dev/null || true)"
  if [[ "$COMMIT" == "$ESPERADO" ]]; then
    echo "OK: el backend responde con el commit ${ESPERADO:0:7} (intento $i)."
    exit 0
  fi
  if [[ -n "$COMMIT" ]]; then ACTUAL="commit ${COMMIT:0:7}"; else ACTUAL="sin respuesta válida"; fi
  echo "Intento $i/$INTENTOS: backend aún en $ACTUAL; esperado ${ESPERADO:0:7}."
  sleep "$PAUSA"
done

echo "ERROR: el backend no respondió con el commit ${ESPERADO:0:7} tras $((INTENTOS * PAUSA)) s." >&2
echo "Revisa el log del despliegue en el panel de Render." >&2
exit 1
