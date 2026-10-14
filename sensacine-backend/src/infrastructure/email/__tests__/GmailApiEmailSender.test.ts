import { GmailApiEmailSender } from "../GmailApiEmailSender";
import { MensajeCorreo } from "../../../modules/notificaciones/notificacion.types";

const mensaje: MensajeCorreo = {
    to: "medinadiaza45@gmail.com",
    subject: "Reserva #7 confirmada - Oppenheimer",
    text: "Tu reserva está confirmada",
    html: "<p>Tu reserva está <b>confirmada</b></p>",
};

const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const TOKEN_OK = () => json(200, { access_token: "ya29.token-1", expires_in: 3600, token_type: "Bearer" });
const ENVIO_OK = () => json(200, { id: "18f3abc", threadId: "t1", labelIds: ["SENT"] });

function setup(respuestas: Array<(url: string, init: RequestInit) => Response | Promise<Response>>) {
    const llamadas: { url: string; init: RequestInit }[] = [];
    const fetchFn = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
        llamadas.push({ url: String(url), init: init ?? {} });
        const siguiente = respuestas.shift();
        if (!siguiente) throw new Error(`llamada inesperada a ${url}`);
        return siguiente(String(url), init ?? {});
    }) as unknown as typeof fetch;
    const sender = new GmailApiEmailSender({
        clientId: "cliente-id",
        clientSecret: "cliente-secreto",
        refreshToken: "1//refresh",
        from: "SensaCine <sensacine@gmail.com>",
        fetchFn,
        tokenUrl: "https://token.test/token",
        sendUrl: "https://gmail.test/send",
    });
    return { sender, llamadas, fetchFn };
}

describe("GmailApiEmailSender", () => {
    it("renueva el access token con el refresh token y envía el mensaje en base64url", async () => {
        const { sender, llamadas } = setup([TOKEN_OK, ENVIO_OK]);
        await sender.send(mensaje);

        // 1) renovación del token
        expect(llamadas[0].url).toBe("https://token.test/token");
        const form = llamadas[0].init.body as URLSearchParams;
        expect(form.get("grant_type")).toBe("refresh_token");
        expect(form.get("client_id")).toBe("cliente-id");
        expect(form.get("client_secret")).toBe("cliente-secreto");
        expect(form.get("refresh_token")).toBe("1//refresh");

        // 2) envío con el token en la cabecera
        expect(llamadas[1].url).toBe("https://gmail.test/send");
        expect((llamadas[1].init.headers as Record<string, string>).Authorization).toBe("Bearer ya29.token-1");
        const { raw } = JSON.parse(llamadas[1].init.body as string);
        expect(raw).toMatch(/^[A-Za-z0-9_-]+$/); // base64url: sin +, / ni =

        const mime = Buffer.from(raw, "base64url").toString("utf8");
        expect(mime).toContain("To: medinadiaza45@gmail.com");
        expect(mime).toContain("From: SensaCine <sensacine@gmail.com>");
        expect(mime).toContain("Subject: Reserva #7 confirmada - Oppenheimer");
        expect(mime).toContain("Content-Type: text/html");
        expect(mime).toContain("Content-Type: text/plain");
    });

    it("reutiliza el access token mientras no vence (una sola renovación para varios envíos)", async () => {
        const { sender, llamadas } = setup([TOKEN_OK, ENVIO_OK, ENVIO_OK]);
        await sender.send(mensaje);
        await sender.send(mensaje);
        expect(llamadas.filter((l) => l.url.includes("token.test"))).toHaveLength(1);
        expect(llamadas.filter((l) => l.url.includes("gmail.test"))).toHaveLength(2);
    });

    it("envíos simultáneos comparten la misma renovación", async () => {
        const { sender, llamadas } = setup([TOKEN_OK, ENVIO_OK, ENVIO_OK]);
        await Promise.all([sender.send(mensaje), sender.send(mensaje)]);
        expect(llamadas.filter((l) => l.url.includes("token.test"))).toHaveLength(1);
    });

    it("si Gmail responde 401 renueva el token y reintenta una vez", async () => {
        const { sender, llamadas } = setup([
            TOKEN_OK,
            () => json(401, { error: { message: "Invalid Credentials" } }),
            () => json(200, { access_token: "ya29.token-2", expires_in: 3600 }),
            ENVIO_OK,
        ]);
        await expect(sender.send(mensaje)).resolves.toBeUndefined();
        expect((llamadas[3].init.headers as Record<string, string>).Authorization).toBe("Bearer ya29.token-2");
    });

    it("no reintenta indefinidamente: un segundo 401 es un error", async () => {
        const { sender } = setup([
            TOKEN_OK,
            () => json(401, { error: { message: "Invalid Credentials" } }),
            TOKEN_OK,
            () => json(401, { error: { message: "Invalid Credentials" } }),
        ]);
        await expect(sender.send(mensaje)).rejects.toThrow(/401/);
    });

    it.each([
        ["invalid_grant", /refresh token venció.*7 días/s],
        ["invalid_client", /GMAIL_CLIENT_ID o GMAIL_CLIENT_SECRET/],
        ["unauthorized_client", /no autoriza este cliente/],
    ])("traduce el error de Google '%s' a un mensaje accionable", async (codigo, esperado) => {
        const { sender } = setup([() => json(400, { error: codigo, error_description: "detalle de google" })]);
        await expect(sender.send(mensaje)).rejects.toThrow(esperado);
    });

    it("explica cuando la Gmail API no está activada en el proyecto", async () => {
        const { sender } = setup([
            TOKEN_OK,
            () => json(403, { error: { message: "Gmail API has not been used in project 123 before or it is disabled.", errors: [{ reason: "accessNotConfigured" }] } }),
        ]);
        await expect(sender.send(mensaje)).rejects.toThrow(/no está activada/);
    });

    it("explica cuando el token no tiene el permiso gmail.send", async () => {
        const { sender } = setup([
            TOKEN_OK,
            () => json(403, { error: { message: "Request had insufficient authentication scopes.", errors: [{ reason: "insufficientPermissions" }] } }),
        ]);
        await expect(sender.send(mensaje)).rejects.toThrow(/gmail\.send/);
    });

    it("error de red: dice que no pudo conectar con Google", async () => {
        const sender = new GmailApiEmailSender({
            clientId: "a", clientSecret: "b", refreshToken: "c", from: "x@gmail.com",
            fetchFn: (async () => { throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ENOTFOUND" } }); }) as unknown as typeof fetch,
        });
        await expect(sender.send(mensaje)).rejects.toThrow(/no se pudo conectar con Google \(ENOTFOUND\)/);
    });

    it("tras un fallo de renovación el siguiente envío vuelve a intentarlo", async () => {
        const { sender } = setup([() => json(400, { error: "invalid_grant" }), TOKEN_OK, ENVIO_OK]);
        await expect(sender.send(mensaje)).rejects.toThrow();
        await expect(sender.send(mensaje)).resolves.toBeUndefined();
    });
});
