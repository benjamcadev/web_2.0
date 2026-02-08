import nodemailer from "nodemailer";

interface sendEmailProps  {
    email: string;
    subject: string;
    html: string;
}

export async function sendEmail({email: to, subject, html}: sendEmailProps) {
 try {
    
 
     if (!to || !subject || !html) {
       return { success: false, error: "Faltan campos obligatorios (to, subject, html)" }
     }
 
     const transporter = nodemailer.createTransport({
       host: process.env.SMTP_HOST,
       port: Number(process.env.SMTP_PORT),
       secure: false,//secure: process.env.SMTP_SECURE === "true",
       auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS,
       },
     });
 
     await transporter.sendMail({
       from: `"Agroplastic" <${process.env.SMTP_FROM}>`,
       to,
       subject,
       html,
     });
 
      return { success: true };
   } catch (error) {
     console.error("Email send error:", error);
     return { success: false, error: "No se pudo enviar el correo" };
   }
}
