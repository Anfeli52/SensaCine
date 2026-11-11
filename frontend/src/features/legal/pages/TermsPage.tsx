import { CONTACTO_LEGAL, LegalPage, Seccion } from "../components";

export function TermsPage() {
  return (
    <LegalPage titulo="Condiciones del servicio">
      <p>Al crear una cuenta o usar SensaCine aceptas estas condiciones. Si no estás de acuerdo, no uses la plataforma.</p>

      <Seccion titulo="1. El servicio">
        <p>
          SensaCine permite consultar la cartelera, reservar asientos para funciones con experiencia sensorial y
          gastronómica, indicar restricciones alimentarias, y escribir reseñas de las funciones a las que asististe.
        </p>
      </Seccion>

      <Seccion titulo="2. Tu cuenta">
        <p>
          Debes dar información veraz y mantener la confidencialidad de tu contraseña. Eres responsable de la actividad
          realizada desde tu cuenta.
        </p>
      </Seccion>

      <Seccion titulo="3. Reservas y pagos">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Los asientos se retienen por un tiempo limitado mientras completas la reserva; vencido ese tiempo se liberan.</li>
          <li>La reserva queda confirmada cuando el pago se procesa correctamente.</li>
          <li>Eres responsable de indicar con exactitud las alergias y restricciones alimentarias de cada comensal.</li>
        </ul>
      </Seccion>

      <Seccion titulo="4. Reseñas">
        <p>
          Solo puedes reseñar funciones de reservas propias, cuando la función haya terminado, y una vez por reserva.
          Tu reseña debe ser honesta y respetuosa. Podemos retirar contenido ofensivo, falso o ilegal.
        </p>
      </Seccion>

      <Seccion titulo="5. Uso adecuado">
        <p>
          No puedes usar la plataforma para actividades ilegales, intentar acceder a cuentas ajenas, o afectar su
          funcionamiento.
        </p>
      </Seccion>

      <Seccion titulo="6. Responsabilidad">
        <p>
          Hacemos lo posible por mantener el servicio disponible, pero no garantizamos que funcione sin interrupciones
          ni errores.
        </p>
      </Seccion>

      <Seccion titulo="7. Cambios y contacto">
        <p>
          Podemos actualizar estas condiciones y publicaremos la versión vigente en esta página. Para cualquier duda
          escríbenos a{" "}
          <a className="text-[#0071e3] hover:underline" href={`mailto:${CONTACTO_LEGAL}`}>
            {CONTACTO_LEGAL}
          </a>
          . Consulta también nuestra{" "}
          <a className="text-[#0071e3] hover:underline" href="/privacy-policy">
            política de privacidad
          </a>
          .
        </p>
      </Seccion>
    </LegalPage>
  );
}
