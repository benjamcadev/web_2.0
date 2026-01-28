"use client";

import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { ShoppingBagIcon, TruckIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Header from "@/components/client/Header/Header";
import { useEffect, useState } from "react";
import CotizacionModal from "@/components/CotizacionModal";
import Paso1Carrito from "@/components/client/Carrito/Paso1Carrito";
import Paso2Envio from "@/components/client/Carrito/Paso2Envio";
import Paso3Pago from "@/components/client/Carrito/Paso3Pago";
import SidebarResumen from "@/components/client/Carrito/SidebarResumen";
import { Sucursal } from '@/types/sucursales'
import { Cliente } from "@/types/cliente";
import { useAuthStore } from "@/stores/useAuthStore";

interface CarritoProps {
  initialSucursales: Sucursal[];
}

type DeliveryType = "retiro" | "envio" | null;

export default function CarritoClient({ initialSucursales }: CarritoProps) {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Estados de envío
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(null);
  const [sucursales] = useState<Sucursal[]>(initialSucursales);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [direccion, setDireccion] = useState("");
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [comunaEncontrada, setComunaEncontrada] = useState<{
    sucursal: Sucursal;
    comuna: string;
    costo: number;
  } | null>(null);

  const [todasLasComunas, setTodasLasComunas] = useState<Array<{
    comuna: string;
    sucursal: Sucursal;
    costo: number;
  }>>([]);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const [metodoPago, setMetodoPago] = useState<"webpay" | "khipu" | "credito" | null>(null);

  // Giftcard state
  const [giftcardCode, setGiftcardCode] = useState("");
  const [giftcardBalance, setGiftcardBalance] = useState<number | null>(null);
  const [giftcardApplied, setGiftcardApplied] = useState<number>(0);
  const [giftcardLoading, setGiftcardLoading] = useState(false);

  const totalConEnvio = totalPrice + costoEnvio;
  const totalFinal = Math.max(totalConEnvio - giftcardApplied, 0);

  const [tipoDTE, setTipoDTE] = useState<"boleta" | "factura">("boleta");


  const clienteSesion = useAuthStore((s) => s.cliente);

  const [cliente, setCliente] = useState<Cliente>({
    nombre: "",
    rut: "",
    email: "",
    telefono: "",
    tipo_cliente: "",
    credito_habilitado: false
  });

  const [direccionesCliente, setDireccionesCliente] = useState<any[]>([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<any | null>(null);

  useEffect(() => {
    if (!clienteSesion) return;

    // Persona
    if (clienteSesion.tipo_cliente === 'persona') {
      setDireccionesCliente([]);
      setDireccionSeleccionada(null);

      setCliente({
        nombre: clienteSesion.nombre ?? '',
        rut: clienteSesion.rut ?? '',
        email: clienteSesion.email ?? '',
        telefono: clienteSesion.telefono ?? '',
        tipo_cliente: clienteSesion.tipo_cliente ?? '',
        credito_habilitado: clienteSesion.credito_habilitado ?? false
      });
    }

    // Empresa
    if (clienteSesion.tipo_cliente === 'empresa') {
      const direcciones = clienteSesion?.direcciones ?? [];

      const direccionPorDefecto =
        direcciones.find((dir: any) => dir.es_principal) ??
        direcciones[0] ??
        null;

      setDireccionesCliente(direcciones);
      setDireccionSeleccionada(direccionPorDefecto);

      setCliente({
        documentId: clienteSesion.documentId ?? '',
        id: clienteSesion.id ?? '',
        nombre: clienteSesion.nombre ?? '',
        rut: clienteSesion.rut ?? '',
        email: clienteSesion.email ?? '',
        telefono: clienteSesion.telefono ?? '',
        tipo_cliente: clienteSesion.tipo_cliente ?? '',
        credito_habilitado: clienteSesion.credito_habilitado ?? false,
        cupo_disponible: clienteSesion.cupo_disponible ?? 0,
        cupo_total: clienteSesion.cupo_total ?? 0,
        cupo_utilizado: clienteSesion.cupo_utilizado ?? 0,
        factura: direccionPorDefecto
          ? {
            razonSocial: clienteSesion.razon_social ?? '',
            giro: clienteSesion.giro ?? '',
            calle: direccionPorDefecto.calle ?? '',
            numero: direccionPorDefecto.numero ?? '',
            comuna: direccionPorDefecto.comuna ?? '',
            ciudad: direccionPorDefecto.ciudad ?? '',
            complemento: direccionPorDefecto.complemento ?? '',
          }
          : undefined,
      });
    }
  }, [clienteSesion]);


  useEffect(() => {
    document.title = "Carrito de Compras";
  }, []);

  // Generar lista completa de comunas disponibles
  useEffect(() => {
    const listaComunas: Array<{
      comuna: string;
      sucursal: Sucursal;
      costo: number;
    }> = [];

    sucursales.forEach(sucursal => {
      sucursal.comunas.forEach(comuna => {
        if (sucursal.costosEnvio[comuna]) {
          listaComunas.push({
            comuna,
            sucursal,
            costo: sucursal.costosEnvio[comuna]
          });
        }
      });
    });

    listaComunas.sort((a, b) => a.comuna.localeCompare(b.comuna));
    setTodasLasComunas(listaComunas);
  }, [sucursales]);

  const handleSelectComuna = (comunaData: {
    comuna: string;
    sucursal: Sucursal;
    costo: number;
  }) => {
    setComunaEncontrada(comunaData);
    setSelectedSucursal(comunaData.sucursal);
    setCostoEnvio(comunaData.costo);
  };

  const handleSelectRetiro = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    setCostoEnvio(0);
  };

  const resetDeliveryOptions = () => {
    setDeliveryType(null);
    setSelectedSucursal(null);
    setDireccion("");
    setCostoEnvio(0);
    setComunaEncontrada(null);
  };

  const canProceedToStep3: boolean = Boolean(
    (deliveryType === "retiro" && selectedSucursal) ||
    (deliveryType === "envio" && comunaEncontrada && direccion.trim().length > 5)
  );

  const steps = [
    { number: 1, name: "Carrito", icon: ShoppingBagIcon },
    { number: 2, name: "Envío", icon: TruckIcon },
    { number: 3, name: "Pago", icon: CreditCardIcon }
  ];

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <ShoppingBagIcon className="h-24 w-24 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">¡Agrega productos para comenzar tu compra!</p>
          <Link
            href="/tienda"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ir a la tienda
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 mr-3 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Carrito de Compras</h1>
            <p className="text-gray-600">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
          </div>

          {/* Indicador de pasos */}
          <div className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}>
                      {currentStep > step.number ? (
                        <CheckCircleIcon className="w-7 h-7" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${currentStep === step.number ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-4 rounded ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal - Contenido dinámico según paso */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <Paso1Carrito
                  items={items}
                  removeItem={removeItem}
                  updateQuantity={updateQuantity}
                  clearCart={clearCart}
                />
              )}

              {currentStep === 2 && (
                <Paso2Envio
                  deliveryType={deliveryType}
                  setDeliveryType={setDeliveryType}
                  sucursales={sucursales}
                  selectedSucursal={selectedSucursal}
                  handleSelectRetiro={handleSelectRetiro}
                  todasLasComunas={todasLasComunas}
                  comunaEncontrada={comunaEncontrada}
                  handleSelectComuna={handleSelectComuna}
                  direccion={direccion}
                  setDireccion={setDireccion}
                  resetDeliveryOptions={resetDeliveryOptions}
                  direccionesCliente={direccionesCliente}
                />
              )}

              {currentStep === 3 && (
                <Paso3Pago
                  deliveryType={deliveryType}
                  selectedSucursal={selectedSucursal}
                  comunaEncontrada={comunaEncontrada}
                  direccion={direccion}
                  metodoPago={metodoPago}
                  setMetodoPago={setMetodoPago}
                  cliente={cliente}
                  setCliente={setCliente}
                  totalFinal={totalFinal}
                  giftcardApplied={giftcardApplied}
                  tipoDTE={tipoDTE}
                  setTipoDTE={setTipoDTE}
                  direccionesCliente={direccionesCliente}
                  direccionSeleccionada={direccionSeleccionada}
                  setDireccionSeleccionada={setDireccionSeleccionada}
                />
              )}
            </div>

            {/* Sidebar - Resumen */}
            <div className="lg:col-span-1">
              <SidebarResumen
                currentStep={currentStep}
                totalItems={totalItems}
                totalPrice={totalPrice}
                deliveryType={deliveryType}
                costoEnvio={costoEnvio}
                totalConEnvio={totalConEnvio}
                canProceedToStep3={canProceedToStep3}
                setCurrentStep={setCurrentStep}
                setIsModalOpen={setIsModalOpen}
                items={items}
                metodoPago={metodoPago}
                cliente={cliente}
                direccion={direccion}
                comuna={comunaEncontrada?.comuna || ""}
                sucursal={selectedSucursal?.nombre || ""}
                giftcardApplied={giftcardApplied}
                giftcardCode={giftcardCode}
                setGiftcardLoading={setGiftcardLoading}
                setGiftcardBalance={setGiftcardBalance}
                setGiftcardApplied={setGiftcardApplied}
                setGiftcardCode={setGiftcardCode}
                giftcardBalance={giftcardBalance ?? 0}
                giftcardLoading={giftcardLoading}
                tipoDTE={tipoDTE}

              />
            </div>
          </div>
        </div>
      </main>

      <CotizacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        items={items}
        totalPrice={totalPrice}
        clearCart={clearCart}
      />
    </>
  );
}