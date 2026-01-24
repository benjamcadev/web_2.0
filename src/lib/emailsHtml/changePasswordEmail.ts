type ChangePasswordEmailProps = {
    nombre: string;
    logoBase64?: string | null;
};

export function changePasswordEmail({
    nombre,
    logoBase64,
}: ChangePasswordEmailProps): string {
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width"/>
  <title>Cambio de Contraseña</title>
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
                  Cambio de Contraseña
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
                  Hemos cambiado tu contraseña con exito.
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
                  © ${new Date().getFullYear()} Agroplastic · Soluciones para todo
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