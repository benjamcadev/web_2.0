import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payment_id = searchParams.get("payment_id");

    if (!payment_id) {
      return NextResponse.json(
        { ok: false, message: "payment_id requerido" },
        { status: 400 }
      );
    }

    // Llamar a los servidores de Khipu
    const khipuRes = await fetch(
      `https://payment-api.khipu.com/v3/payments/${payment_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.KHIPU_API_KEY!,
        },
      }
    );

    const khipuData = await khipuRes.json();

    if (!khipuRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "Error al consultar Khipu",
          detalle: khipuData,
        },
        { status: 500 }
      );
    }

    // Validación final según Khipu
    const pagado =
      khipuData.result === "done" ||
      khipuData.status === "done" ||
      khipuData.result === "OK";

    return NextResponse.json({
      ok: true,
      pagado,
      detalle: khipuData,
    });

  } catch (error) {
    console.error("Error validación Khipu:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno en validación" },
      { status: 500 }
    );
  }
}