import { CheckIcon } from "@heroicons/react/24/solid";
import { Cliente } from '@/types/cliente'

interface MetodoPagoProps {
    emailIsInvalid: boolean;
    cliente: Cliente;
    tipoDTE: string;
    giftcardApplied: number;
    totalFinal: number;
    metodoPago: "webpay" | "khipu" | "credito" | null;
    setMetodoPago: (metodo: "webpay" | "khipu" | "credito" | null) => void;
}

export default function MetodoPago({
    emailIsInvalid,
    cliente,
    tipoDTE,
    giftcardApplied,
    totalFinal,
    metodoPago,
    setMetodoPago,
}: MetodoPagoProps) {


    const customerDataIsValid =
        
        (
            !emailIsInvalid &&
            cliente.email.trim().length > 0 &&
            cliente.rut.trim().length > 0 &&
            (cliente.telefono ?? "").trim().length > 0 &&
            (
                // BOLETA
                (tipoDTE === "boleta" &&
                    cliente.nombre.trim().length > 0
                ) ||

                // FACTURA
                (tipoDTE === "factura" &&
                    cliente.factura &&
                    cliente.factura.razonSocial.trim().length > 0 &&
                    cliente.factura.giro.trim().length > 0 &&
                    cliente.factura.calle.trim().length > 0 &&
                    cliente.factura.numero.trim().length > 0 &&
                    cliente.factura.comuna.trim().length > 0 &&
                    cliente.factura.ciudad.trim().length > 0
                )
            )
        );

    const giftcardCubreTodo = giftcardApplied > 0 && totalFinal === 0;

    const creditoDisponible = cliente.credito_habilitado && (cliente.cupo_disponible ?? 0) >= totalFinal;

    const porcentajeUsoCredito =
      cliente.cupo_total && cliente.cupo_total > 0
        ? Math.min(
            100,
            Math.round(((cliente.cupo_utilizado ?? 0) / cliente.cupo_total) * 100)
          )
        : 0;

    return (
        <div className="flex bg-gray-50 p-4 flex-col gap-4">

            <h3 className="font-bold text-gray-900 mb-3">Método de pago:</h3>

            {/* WEBPAY */}
            <button
                type="button"
                onClick={() => setMetodoPago("webpay")}
                disabled={!customerDataIsValid || giftcardCubreTodo}
                className={`group w-full bg-white/60 backdrop-blur-lg border rounded-xl p-4 shadow-md transition-all flex items-center gap-4
            ${(!customerDataIsValid || giftcardCubreTodo)
                        ? "opacity-50 cursor-not-allowed"
                        : metodoPago === "webpay"
                            ? "border-blue-600 shadow-blue-200"
                            : "border-white/30 hover:border-blue-400 hover:shadow-lg"
                    }`}
            >
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#FF8A00]/10">
                    <img
                        src="/img/webpay.png"
                        alt="Webpay"
                        className="w-15 h-15 object-contain"
                    />
                </div>

                <div className="text-left flex-1">
                    <p className={`font-semibold transition
              ${metodoPago === "webpay" ? "text-blue-600" : "text-gray-900"}`}>
                        Transbank Webpay
                    </p>
                    <p className="text-sm text-gray-600">
                        Crédito, débito y prepago
                    </p>
                </div>

                {metodoPago === "webpay" && (
                    <CheckIcon className="w-6 h-6 text-blue-600" />
                )}
            </button>

            {/* KIPHU */}
            <button
                type="button"
                onClick={() => setMetodoPago("khipu")}
                disabled={!customerDataIsValid || giftcardCubreTodo}
                className={`group w-full bg-white/60 backdrop-blur-lg border rounded-xl p-4 shadow-md transition-all flex items-center gap-4
            ${(!customerDataIsValid || giftcardCubreTodo)
                        ? "opacity-50 cursor-not-allowed"
                        : metodoPago === "khipu"
                            ? "border-green-600 shadow-green-200"
                            : "border-white/30 hover:border-green-500 hover:shadow-lg"
                    }`}
            >
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#00A884]/10">
                    <img
                        src="/img/khipu.jpg"
                        alt="Khipu"
                        className="w-15 h-15 object-contain"
                    />
                </div>

                <div className="text-left flex-1">
                    <p className={`font-semibold transition
              ${metodoPago === "khipu" ? "text-green-600" : "text-gray-900"}`}>
                        Khipu Transferencias
                    </p>
                    <p className="text-sm text-gray-600">
                        Transferencia bancaria
                    </p>
                </div>

                {metodoPago === "khipu" && (
                    <CheckIcon className="w-6 h-6 text-green-600" />
                )}
            </button>

             {/* Credito */}

            {tipoDTE === "factura" && cliente.credito_habilitado && cliente.factura?.condicionPago !== 'contado' && (
              <button
                type="button"
                onClick={() => setMetodoPago("credito")}
                disabled={!customerDataIsValid || giftcardCubreTodo || !creditoDisponible}
                className={`group w-full bg-white/60 backdrop-blur-lg border rounded-xl p-4 shadow-md transition-all flex items-center gap-4
                  ${(!customerDataIsValid || giftcardCubreTodo || !creditoDisponible)
                    ? "opacity-50 cursor-not-allowed"
                    : metodoPago === "credito"
                      ? "border-purple-600 shadow-purple-200"
                      : "border-white/30 hover:border-purple-500 hover:shadow-lg"
                  }`}
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-100">
                  <span className="text-purple-700 font-bold text-lg">CR</span>
                </div>

                <div className="text-left flex-1">
                  <p className={`font-semibold transition
                    ${metodoPago === "credito" ? "text-purple-600" : "text-gray-900"}`}>
                    Crédito Interno
                  </p>
                  <p className="text-sm text-gray-600">
                    Cupo disponible: ${cliente.cupo_disponible?.toLocaleString("es-CL")}
                  </p>
                  <div className="mt-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          porcentajeUsoCredito < 70
                            ? "bg-green-500"
                            : porcentajeUsoCredito < 90
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${porcentajeUsoCredito}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Usado: ${(cliente.cupo_utilizado ?? 0).toLocaleString("es-CL")} de ${cliente.cupo_total?.toLocaleString("es-CL")}
                    </p>
                  </div>
                </div>

                <div className="w-6 h-6 flex items-center justify-center">
                  {metodoPago === "credito" ? (
                    <CheckIcon className="w-6 h-6 text-purple-600" />
                  ) : (
                    <span className="w-6 h-6 opacity-0" />
                  )}
                </div>
              </button>
            )}

        </div>
    )
}
