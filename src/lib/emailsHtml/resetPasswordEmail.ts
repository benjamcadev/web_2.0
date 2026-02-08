type ResetPasswordEmailProps = {
    nombre: string;
    resetUrl: string;
    logoBase64?: string | null;
};

export function resetPasswordEmail({
    nombre,
    resetUrl,
    logoBase64,
}: ResetPasswordEmailProps): string {
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width"/>
  <title>Recuperar contraseña</title>
</head>

<body style="
  margin:0;
  padding:0;
  background-color:#f4f6fb;
  font-family: Arial, Helvetica, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
  <tr>
    <td align="center">

      <!-- Card -->
      <table width="520" cellpadding="0" cellspacing="0" style="
        background:#ffffff;
        border-radius:18px;
        box-shadow:0 10px 30px rgba(0,0,0,0.12);
      ">

        <!-- Inner padding wrapper -->
        <tr>
          <td style="padding:40px 36px;">

            <table width="100%" cellpadding="0" cellspacing="0">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  ${logoBase64
  ? `<img src="${logoBase64}" alt="Agroplastic" style="max-width:180px;height:auto;display:block;" />`
  : `<strong style="font-size:22px;">Agroplastic</strong>`
}
                </td>
              </tr>

              <!-- Title -->
              <tr>
                <td style="
                  font-size:20px;
                  font-weight:600;
                  color:#111827;
                  padding-bottom:14px;
                ">
                  Recuperar contraseña
                </td>
              </tr>

              <!-- Text -->
              <tr>
                <td style="
                  font-size:14px;
                  line-height:1.7;
                  color:#374151;
                ">
                  Hola <strong>${nombre}</strong>,<br/><br/>
                  Recibimos una solicitud para restablecer tu contraseña.
                  Presiona el botón de abajo para continuar.
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding:32px 0;">
                  <a href="${resetUrl}" style="
                    background:linear-gradient(135deg,#00e5ff,#6a00ff);
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 30px;
                    border-radius:999px;
                    font-weight:600;
                    display:inline-block;
                  ">
                    Restablecer contraseña
                  </a>
                </td>
              </tr>

              <!-- Fallback -->
              <tr>
                <td style="
                  font-size:12px;
                  color:#6b7280;
                  line-height:1.6;
                ">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                  <a href="${resetUrl}" style="color:#4f46e5; word-break:break-all;">
                    ${resetUrl}
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="
                  padding-top:28px;
                  font-size:11px;
                  color:#9ca3af;
                  text-align:center;
                ">
                  Este enlace expira en 30 minutos.<br/>
                  Si no solicitaste este cambio, puedes ignorar este correo.<br/><br/>
                  © ${new Date().getFullYear()} Agroplastic · Soluciones para todo
                   <p style="margin-top: 30px; font-size: 12px; color: #777;">
                  Este es un comprobante generado automáticamente. No respondas a esta casilla.
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;
}