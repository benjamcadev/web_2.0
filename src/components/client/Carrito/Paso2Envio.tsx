import { BuildingStorefrontIcon, TruckIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { formatCLP } from "@/lib/formatCLP";
import { Sucursal } from '@/types/sucursales'

type DeliveryType = "retiro" | "envio" | null;

interface ComunaEncontrada {
  sucursal: Sucursal;
  comuna: string;
  costo: number;
}

interface Props {
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  sucursales: Sucursal[];
  selectedSucursal: Sucursal | null;
  handleSelectRetiro: (sucursal: Sucursal) => void;
  todasLasComunas: Array<{
    comuna: string;
    sucursal: Sucursal;
    costo: number;
  }>;
  comunaEncontrada: ComunaEncontrada | null;
  handleSelectComuna: (comunaData: {
    comuna: string;
    sucursal: Sucursal;
    costo: number;
  }) => void;
  direccion: string;
  setDireccion: (direccion: string) => void;
  resetDeliveryOptions: () => void;
}

export default function Paso2Envio({
  deliveryType,
  setDeliveryType,
  sucursales,
  selectedSucursal,
  handleSelectRetiro,
  todasLasComunas,
  comunaEncontrada,
  handleSelectComuna,
  direccion,
  setDireccion,
  resetDeliveryOptions
}: Props) {

  
  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Cómo recibirás tu pedido?</h2>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <TruckIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-blue-900">¡Recuerda! </h4>
            <p className="text-sm text-blue-700 mt-1">
              Solo despachamos en comunas de la <span className="font-bold">III y IV Región</span>
            </p>
          </div>
        </div>
      </div>

      {/* Selección de tipo de entrega */}
      {!deliveryType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setDeliveryType("retiro")}
            className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
          >
            <BuildingStorefrontIcon className="w-16 h-16 text-gray-400 group-hover:text-blue-600 mx-auto mb-3 transition-colors" />
            <h3 className="font-bold text-lg text-gray-900 mb-2">Retiro en Tienda</h3>
            <p className="text-gray-600 text-sm mb-2">Retira tu pedido en cualquiera de nuestras sucursales</p>
            <p className="text-green-600 font-bold text-lg">GRATIS</p>
          </button>

          <button
            onClick={() => setDeliveryType("envio")}
            className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
          >
            <TruckIcon className="w-16 h-16 text-gray-400 group-hover:text-blue-600 mx-auto mb-3 transition-colors" />
            <h3 className="font-bold text-lg text-gray-900 mb-2">Envío a Domicilio</h3>
            <p className="text-gray-600 text-sm mb-2">Recibe tu pedido en la puerta de tu casa</p>
            <p className="text-blue-600 font-bold text-lg">Según comuna</p>
          </button>
        </div>
      )}

      {/* OPCIÓN: RETIRO EN TIENDA */}
      {deliveryType === "retiro" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Selecciona tu sucursal</h3>
            <button
              onClick={resetDeliveryOptions}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Cambiar método
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sucursales.map((sucursal) => (
              <button
                key={sucursal.id}
                onClick={() => handleSelectRetiro(sucursal)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedSucursal?.id === sucursal.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BuildingStorefrontIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-gray-900">{sucursal.nombre}</span>
                    </div>
                    {sucursal.direccion && (
                      <p className="text-sm text-gray-600 mb-2">{sucursal.direccion}</p>
                    )}
                     <p className="text-xs text-gray-500">
                      Dirección: {sucursal.direccion}
                    </p>
                    <p className="text-xs text-gray-500">
                      Cobertura: {sucursal.comunas.length} comunas
                    </p>
                  </div>
                  {selectedSucursal?.id === sucursal.id && (
                    <CheckCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedSucursal && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-green-900">¡Listo! Retiro confirmado</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Retirarás tu pedido en <span className="font-bold">{selectedSucursal.nombre}</span>
                  </p>
                   <p className="text-sm text-green-700 mt-1">
                    Horarios:  <span className="font-bold">{selectedSucursal.horarios}</span>
                  </p>
                  <p className="text-lg font-bold text-green-900 mt-2">
                    Costo: {formatCLP(0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OPCIÓN: ENVÍO A DOMICILIO */}
      {deliveryType === "envio" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Datos de envío</h3>
            <button
              onClick={resetDeliveryOptions}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Cambiar método
            </button>
          </div>

          {/* Selección de comuna desde lista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona tu comuna
            </label>
            <select
              value={comunaEncontrada ? `${comunaEncontrada.comuna}-${comunaEncontrada.sucursal.id}` : ""}
              onChange={(e) => {
                if (e.target.value) {
                  const [comuna, sucursalId] = e.target.value.split('-');
                  const comunaData = todasLasComunas.find(
                    c => c.comuna === comuna && c.sucursal.id === parseInt(sucursalId)
                  );
                  if (comunaData) {
                    handleSelectComuna(comunaData);
                  }
                }
              }}
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white"
            >
              <option value="">-- Selecciona tu comuna --</option>
              {todasLasComunas.map((item, index) => (
                <option
                  key={`${item.comuna}-${item.sucursal.id}-${index}`}
                  value={`${item.comuna}-${item.sucursal.id}`}
                >
                  {item.comuna} - {formatCLP(item.costo)} (desde {item.sucursal.nombre})
                </option>
              ))}
            </select>

            {todasLasComunas.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Cargando comunas disponibles...
              </p>
            )}
          </div>

          {/* Resultado de búsqueda */}
          {comunaEncontrada && (
            <>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <TruckIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900">¡Hacemos envíos a tu comuna!</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Tu pedido será despachado desde <span className="font-bold">{comunaEncontrada.sucursal.nombre}</span>
                    </p>
                    <p className="text-lg font-bold text-blue-900 mt-2">
                      Costo de envío: {formatCLP(comunaEncontrada.costo)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección completa *
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle, número, depto/casa, referencias..."
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                />
                {direccion.length > 0 && direccion.length < 6 && (
                  <p className="text-sm text-orange-600 mt-1">
                    Por favor ingresa una dirección más detallada
                  </p>
                )}
              </div>

              {direccion.length > 5 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-green-900">Envío confirmado</h4>
                      <p className="text-sm text-green-700 mt-1">
                        <span className="font-bold">{comunaEncontrada.comuna}</span> - {direccion}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}