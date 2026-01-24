const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

type AuditLogInput = {
  event_type: string;
  level: "INFO" | "WARNING" | "SECURITY" | "ERROR" | "CRITICAL";
  message: string;
  ip?: string;
  user_agent?: string;
  rut?: string;
  user_id?: string;
  entity?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
};

export async function logAudit(data: AuditLogInput) {
  if (!STRAPI_URL || !STRAPI_TOKEN) {
    console.warn("Audit log skipped: missing STRAPI config");
    return;
  }

  try {
    const responseAudit = await fetch(`${STRAPI_URL}/api/audit-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`, // API Token
      },
      body: JSON.stringify({
        data: {
          ...data,
        },
      }),
    });

  } catch (err) {
    // MUY IMPORTANTE:
    // Nunca romper el flujo principal por un fallo de logging
    console.error("Audit log failed:", err);
  }
}