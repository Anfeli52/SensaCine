import { CONTACTO_LEGAL, LegalPage, Seccion } from "../components";

export function PrivacyPolicyPage() {
  return (
    <LegalPage titulo="Política de privacidad">
      <p>
        Esta política explica qué información recopila SensaCine, para qué la usa y cómo puedes ejercer tus derechos.
        Al registrarte y usar la plataforma aceptas este tratamiento.
      </p>

      <Seccion titulo="1. Información que recopilamos">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Datos de cuenta: nombre, correo electrónico y contraseña (almacenada cifrada, nunca en texto plano).</li>
          <li>Datos de tus reservas: función, asientos, nombre de los comensales y restricciones o alergias alimentarias que indiques.</li>
          <li>Datos de pago: los de las tarjetas que registres en la plataforma y el historial de pagos de tus reservas. El saldo de las tarjetas es simulado.</li>
          <li>Reseñas: las calificaciones y comentarios que escribas sobre una película y tu experiencia.</li>
        </ul>
      </Seccion>

      <Seccion titulo="2. Para qué usamos tu información">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Crear y proteger tu cuenta, y gestionar tus reservas y su preparación gastronómica.</li>
          <li>Enviarte por correo la confirmación de tu reserva y, cuando termina la función, una invitación para escribir tu reseña.</li>
          <li>Mejorar el servicio a partir de las reseñas que registras.</li>
        </ul>
        <p>No vendemos tu información ni la usamos para publicidad de terceros.</p>
      </Seccion>

      <Seccion titulo="3. Uso de la API de Gmail">
        <p>
          SensaCine envía los correos transaccionales descritos arriba mediante la API de Gmail, usando únicamente el
          permiso <code className="text-[13px] bg-[#f5f5f7] px-1.5 py-0.5 rounded">gmail.send</code> sobre la cuenta
          de correo de la plataforma. Ese permiso solo sirve para enviar mensajes.
        </p>
        <p>
          SensaCine <strong>no lee, almacena ni comparte</strong> el contenido de ninguna bandeja de entrada, y no
          accede a los correos de los usuarios. El uso de la información recibida de las API de Google se ajusta a la{" "}
          <a
            className="text-[#0071e3] hover:underline"
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
          >
            Política de datos de usuario de los servicios de API de Google
          </a>
          , incluidos los requisitos de uso limitado.
        </p>
      </Seccion>

      <Seccion titulo="4. Con quién compartimos la información">
        <p>
          Solo con los proveedores necesarios para operar el servicio (alojamiento del servidor y de la base de datos, y
          envío de correo), y cuando una autoridad competente lo exija legalmente.
        </p>
      </Seccion>

      <Seccion titulo="5. Conservación y seguridad">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa o sea necesario para el servicio. Las comunicaciones
          viajan cifradas (HTTPS) y las contraseñas se guardan con hash. Ningún sistema es infalible, pero aplicamos
          medidas razonables para protegerlos.
        </p>
      </Seccion>

      <Seccion titulo="6. Tus derechos">
        <p>
          Puedes pedir acceso, corrección o eliminación de tus datos personales escribiéndonos a{" "}
          <a className="text-[#0071e3] hover:underline" href={`mailto:${CONTACTO_LEGAL}`}>
            {CONTACTO_LEGAL}
          </a>
          . Responderemos en un plazo razonable.
        </p>
      </Seccion>

      <Seccion titulo="7. Cambios a esta política">
        <p>Si la modificamos, publicaremos la versión nueva en esta página con su fecha de actualización.</p>
      </Seccion>
    </LegalPage>
  );
}
