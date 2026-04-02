import { Resend } from "resend";

let connectionSettings: any;

async function getCredentials() {
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
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("Resend not connected");
  }

  return {
    apiKey: connectionSettings.settings.api_key as string,
    fromEmail: (connectionSettings.settings.from_email as string) || "HD RIVIC GLOBAL <noreply@hdrivic.com>",
  };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return { client: new Resend(apiKey), fromEmail };
}

export async function sendApprovalEmail(to: string, name: string) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    await client.emails.send({
      from: fromEmail,
      to,
      subject: "¡Tu cuenta en HD RIVIC GLOBAL ha sido aprobada!",
      html: `
        <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F0F4FA; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <div style="background: #1C3A6E; padding: 32px 40px; text-align: center;">
            <div style="color: white; font-size: 22px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;">
              <span style="color: #2B7FD4;">HD</span> RIVIC
              <span style="font-size: 11px; font-weight: 400; opacity: 0.6; margin-left: 8px;">GLOBAL S.A.C.</span>
            </div>
          </div>

          <!-- Body -->
          <div style="background: white; padding: 40px;">
            <h2 style="color: #1C3A6E; font-size: 22px; font-weight: 700; margin-bottom: 16px;">
              ¡Bienvenido al equipo, ${name}!
            </h2>
            <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
              Tu cuenta en el <strong>Portal Administrativo de HD RIVIC GLOBAL S.A.C.</strong> ha sido <span style="color: #2B7FD4; font-weight: 600;">aprobada exitosamente</span>.
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

          <!-- Footer -->
          <div style="background: #1C3A6E; padding: 20px 40px; text-align: center;">
            <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 0; letter-spacing: 0.5px;">
              &copy; ${new Date().getFullYear()} HD RIVIC GLOBAL S.A.C. &mdash; Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send approval email:", err);
  }
}
