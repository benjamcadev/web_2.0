import { TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { formatCLP } from "@/lib/formatCLP";
import toast from "react-hot-toast";
import ErrorToast from '@/components/UI/ErrorToast'

interface CartItem {
  id: number;
  documentId: string;
  name: string;
  price: number;
  images: Array<{ url: string }>;
  slug: string;
  cantidad: number;
  oferta?: boolean;
}

interface Props {
  items: CartItem[];
  removeItem: (id: number) => void;
  updateQuantity: (id: number, cantidad: number) => Promise<{ success: boolean; message?: string }>;
  clearCart: () => void;
}

export default function Paso1Carrito({ items, removeItem, updateQuantity, clearCart }: Props) {

  const handleUpdateQuantity = async (id: number, cantidad: number) => {

    const resultado = await updateQuantity(id, cantidad);

    if (!resultado.success) {
      toast.custom(
        <ErrorToast subtitle={resultado.message || "Hubo un error al modificar cantidad del producto"} title={'Error'} />,
        {
          duration: 2400,
          position: "bottom-center",
          icon: null,
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }
      );
    }
  };

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Productos en tu carrito</h2>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition-colors"
        >
          <TrashIcon className="h-5 w-5" />
          Vaciar carrito
        </button>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
              <Image
                src={process.env.NEXT_PUBLIC_STRAPI_URL + item.images[0].url}
                alt={item.name}
                fill
                className="object-cover"
              />
              {item.oferta && (
                <div className="absolute top-0 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded-br-lg font-bold">
                  OFERTA
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <Link href={`/tienda/${item.slug}`}>
                  <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-blue-600 font-bold mt-1">
                  {formatCLP(item.price)}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-gray-900 w-8 text-center">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 border border-white/40 hover:scale-105 transition-all"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <p className="font-bold text-gray-900">
                    {formatCLP(item.price * item.cantidad)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}