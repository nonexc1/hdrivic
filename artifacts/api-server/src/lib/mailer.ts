// Gmail integration — Replit connector: google-mail
import { google } from "googleapis";

let connectionSettings: any;

async function getAccessToken() {
  if (
    connectionSettings &&
    connectionSettings.settings.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found for repl/depl");
  }

  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=google-mail",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("Gmail not connected");
  }

  return accessToken;
}

async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

function encodeSubject(subject: string): string {
  return `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;
}

function makeEmailMessage(to: string, subject: string, htmlBody: string, fromName: string): string {
  const message = [
    `From: ${fromName}`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(htmlBody, "utf-8").toString("base64"),
  ].join("\r\n");

  return Buffer.from(message).toString("base64url");
}

export async function sendLeadNotificationEmail(
  to: string,
  ownerName: string,
  lead: { name: string; phone: string; email: string; message: string; type: string },
  property: { id: number; title: string },
) {
  try {
    const gmail = await getUncachableGmailClient();
    const subject = `Nuevo interesado en tu propiedad: ${property.title}`;
    const typeLabel: Record<string, string> = {
      comprar: "Comprar",
      alquilar: "Alquilar",
      vender: "Vender",
      agendar_visita: "Agendar Visita",
      informacion: "Información General",
    };
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F0F4FA; border-radius: 8px; overflow: hidden;">
        <div style="background: #1C3A6E; padding: 32px 40px; text-align: center;">
          <div style="color: white; font-size: 22px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;">
            <span style="color: #2B7FD4;">HD</span> RIVIC
            <span style="font-size: 11px; font-weight: 400; opacity: 0.6; margin-left: 8px;">GLOBAL S.A.C.</span>
          </div>
        </div>
        <div style="background: white; padding: 40px;">
          <h2 style="color: #1C3A6E; font-size: 20px; font-weight: 700; margin-bottom: 8px;">¡Hola, ${ownerName}!</h2>
          <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
            Una persona está interesada en tu propiedad <strong style="color: #1C3A6E;">${property.title}</strong>.
          </p>
          <div style="background: #F0F4FA; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #718096; font-size: 13px; width: 110px;">Nombre</td><td style="padding: 6px 0; color: #1a202c; font-size: 14px; font-weight: 600;">${lead.name}</td></tr>
              <tr><td style="padding: 6px 0; color: #718096; font-size: 13px;">Teléfono</td><td style="padding: 6px 0; color: #1a202c; font-size: 14px; font-weight: 600;">${lead.phone}</td></tr>
              <tr><td style="padding: 6px 0; color: #718096; font-size: 13px;">Correo</td><td style="padding: 6px 0; color: #1a202c; font-size: 14px; font-weight: 600;">${lead.email}</td></tr>
              <tr><td style="padding: 6px 0; color: #718096; font-size: 13px;">Interés</td><td style="padding: 6px 0; color: #2B7FD4; font-size: 14px; font-weight: 600;">${typeLabel[lead.type] ?? lead.type}</td></tr>
              <tr><td style="padding: 6px 0; color: #718096; font-size: 13px; vertical-align: top;">Mensaje</td><td style="padding: 6px 0; color: #4a5568; font-size: 14px; font-style: italic;">"${lead.message}"</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://hd-rivic-global-inmobiliaria.replit.app/admin"
               style="display: inline-block; background: #2B7FD4; color: white; padding: 14px 36px; border-radius: 6px; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-decoration: none;">
              Ver en el Panel Admin
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
          <p style="color: #a0aec0; font-size: 12px; line-height: 1.6; margin: 0;">
            Este es un aviso automático de HD RIVIC GLOBAL S.A.C. — no respondas a este mensaje.
          </p>
        </div>
        <div style="background: #1C3A6E; padding: 20px 40px; text-align: center;">
          <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 0; letter-spacing: 0.5px;">
            &copy; ${new Date().getFullYear()} HD RIVIC GLOBAL S.A.C. &mdash; Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;
    const raw = makeEmailMessage(to, subject, html, "HD RIVIC GLOBAL <me>");
    const result = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    console.log("[mailer] Lead notification sent, id:", result.data.id);
  } catch (err) {
    console.error("[mailer] Failed to send lead notification email:", err);
  }
}

export async function sendApprovalEmail(to: string, name: string) {
  try {
    const gmail = await getUncachableGmailClient();

    const subject = "¡Tu cuenta en HD RIVIC GLOBAL ha sido aprobada!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F0F4FA; border-radius: 8px; overflow: hidden;">
        <div style="background: #1C3A6E; padding: 32px 40px; text-align: center;">
          <div style="color: white; font-size: 22px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;">
            <span style="color: #2B7FD4;">HD</span> RIVIC
            <span style="font-size: 11px; font-weight: 400; opacity: 0.6; margin-left: 8px;">GLOBAL S.A.C.</span>
          </div>
        </div>

        <div style="background: white; padding: 40px;">
          <h2 style="color: #1C3A6E; font-size: 22px; font-weight: 700; margin-bottom: 16px;">
            ¡Bienvenido al equipo, ${name}!
          </h2>
          <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
            Tu cuenta en el <strong>Portal Administrativo de HD RIVIC GLOBAL S.A.C.</strong> ha sido
            <span style="color: #2B7FD4; font-weight: 600;">aprobada exitosamente</span>.
          </p>
          <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 28px;">
            Ya puedes ingresar al sistema con tus credenciales registradas y comenzar a gestionar propiedades y leads.
          </p>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://hd-rivic-global-inmobiliaria.replit.app/login"
               style="display: inline-block; background: #1C3A6E; color: white; padding: 14px 36px; border-radius: 6px; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-decoration: none;">
              Ir al Portal Admin
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
          <p style="color: #a0aec0; font-size: 12px; line-height: 1.6; margin: 0;">
            Si tienes alguna consulta, contáctanos en
            <a href="mailto:admin@hdrivic.com" style="color: #2B7FD4;">admin@hdrivic.com</a>.
            Este correo fue enviado automáticamente — no respondas a este mensaje.
          </p>
        </div>

        <div style="background: #1C3A6E; padding: 20px 40px; text-align: center;">
          <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 0; letter-spacing: 0.5px;">
            &copy; ${new Date().getFullYear()} HD RIVIC GLOBAL S.A.C. &mdash; Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;

    const raw = makeEmailMessage(to, subject, html, "HD RIVIC GLOBAL <me>");

    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log("[mailer] Email sent via Gmail, message id:", result.data.id);
  } catch (err) {
    console.error("[mailer] Failed to send approval email:", err);
  }
}

export async function sendAvailabilityNotificationEmail(
  to: string,
  property: { id: number; title: string; newStatus: string },
) {
  try {
    const gmail = await getUncachableGmailClient();
    const statusLabel = property.newStatus === "alquiler" ? "disponible para alquilar" : "disponible para la venta";
    const subject = `¡La propiedad que seguías ya está ${statusLabel}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F0F4FA; border-radius: 8px; overflow: hidden;">
        <div style="background: #1C3A6E; padding: 32px 40px; text-align: center;">
          <div style="color: white; font-size: 22px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;">
            <span style="color: #2B7FD4;">HD</span> RIVIC
            <span style="font-size: 11px; font-weight: 400; opacity: 0.6; margin-left: 8px;">GLOBAL S.A.C.</span>
          </div>
        </div>
        <div style="background: white; padding: 40px;">
          <h2 style="color: #1C3A6E; font-size: 20px; font-weight: 700; margin-bottom: 12px;">¡Buenas noticias!</h2>
          <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
            La propiedad <strong style="color: #1C3A6E;">${property.title}</strong> que marcaste para seguir
            ahora está <strong style="color: #2B7FD4;">${statusLabel}</strong>.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://hd-rivic-global-inmobiliaria.replit.app/propiedades/${property.id}"
               style="display: inline-block; background: #2B7FD4; color: white; padding: 14px 36px; border-radius: 6px; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-decoration: none;">
              Ver Propiedad
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
          <p style="color: #a0aec0; font-size: 12px; line-height: 1.6; margin: 0;">
            Este es un aviso automático de HD RIVIC GLOBAL S.A.C. — no respondas a este mensaje.
          </p>
        </div>
        <div style="background: #1C3A6E; padding: 20px 40px; text-align: center;">
          <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 0; letter-spacing: 0.5px;">
            &copy; ${new Date().getFullYear()} HD RIVIC GLOBAL S.A.C. &mdash; Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;
    const raw = makeEmailMessage(to, subject, html, "HD RIVIC GLOBAL <me>");
    const result = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    console.log("[mailer] Availability notification sent to", to, "id:", result.data.id);
  } catch (err) {
    console.error("[mailer] Failed to send availability notification:", err);
  }
}
