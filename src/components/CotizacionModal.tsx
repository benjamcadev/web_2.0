import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CartItem } from '@/stores/useCartStore';
import { validateRut } from "@/lib/validateRut";
import { formatRut } from "@/lib/formatRut";
import SuccessToast from "@/components/UI/SuccessToast";
import ErrorToast from "@/components/UI/ErrorToast";
import LoadingToast from "@/components/UI/LoadingToast";

import toast from "react-hot-toast";

interface CotizacionModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    totalPrice: number;
    clearCart: () => void;
}

const provincias = {
    Elqui: [
        "La Serena",
        "Coquimbo",
        "Andacollo",
        "La Higuera",
        "Paihuano",
        "Vicuña",
    ],
    Limarí: [
        "Ovalle",
        "Combarbalá",
        "Monte Patria",
        "Punitaqui",
        "Río Hurtado",
    ],
    Choapa: [
        "Illapel",
        "Canela",
        "Los Vilos",
        "Salamanca",
    ],
    Huasco: [
        "Vallenar",
        "Huasco",
        "Freirina",
        "Alto del Carmen",
    ],
} as const;

type ProvinciaKey = keyof typeof provincias;


export default function CotizacionModal({ isOpen, onClose, items, totalPrice, clearCart }: CotizacionModalProps) {


    const [formData, setFormData] = useState<{
        nombre: string;
        apellidos: string;
        rut: string;
        email: string;
        telefono: string;
        direccion: string;
        provincia: ProvinciaKey | "";
        comuna: string;
        ciudad: string;
        solicitudEspecial: string;
    }>({
        nombre: "",
        apellidos: "",
        rut: "",
        email: "",
        telefono: "",
        direccion: "",
        provincia: "",
        comuna: "",
        ciudad: "",
        solicitudEspecial: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateRut(formData.rut)) {
            toast.custom(
                <ErrorToast subtitle={'El RUT ingresado no es válido.'} title={'Error'} />,
                {
                    duration: 2400,
                    position: "bottom-center",
                    icon: null,
                    style: { background: "transparent", boxShadow: "none", padding: 0 },
                }
            );
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        const loadingToast = toast.custom(
            <LoadingToast
                title="Enviando cotización..."
                subtitle="Por favor espera un momento."
            />,
            {
                duration: Infinity,
                position: "bottom-center",
                icon: null,
                style: { background: "transparent", boxShadow: "none", padding: 0 },
            }
        );

        try {
            const response = await fetch('/api/cotizacion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cliente: formData,
                    items: items,
                    totalPrice: totalPrice
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.dismiss(loadingToast);
                throw new Error(data.error || 'Error al enviar la cotización');
            }


            toast.dismiss(loadingToast);

            console.log("Respuesta desde api/cotizacion ", response)

            toast.custom(
                <SuccessToast subtitle={'Te contactaremos pronto.'} title={`¡Cotización enviada exitosamente!`} />,
                {
                    duration: 2400,
                    position: "bottom-center",
                    icon: null,
                    style: { background: "transparent", boxShadow: "none", padding: 0 },
                }
            );
            setTimeout(() => {
                onClose();
                setFormData({
                    nombre: '',
                    apellidos: '',
                    rut: '',
                    email: '',
                    telefono: '',
                    direccion: '',
                    comuna: '',
                    provincia: '',
                    ciudad: '',
                    solicitudEspecial: ''
                });
                clearCart();
            }, 2000);
        } catch (err) {
            if (err instanceof Error) {
                toast.dismiss(loadingToast);

                toast.custom(
                    <ErrorToast subtitle={err.message} title={'Error'} />,
                    {
                        duration: 2400,
                        position: "bottom-center",
                        icon: null,
                        style: { background: "transparent", boxShadow: "none", padding: 0 },
                    }
                );
            } else {
                toast.dismiss(loadingToast);

                toast.custom(
                    <ErrorToast subtitle={'Ocurrió un error desconocido'} title={'Error'} />,
                    {
                        duration: 2400,
                        position: "bottom-center",
                        icon: null,
                        style: { background: "transparent", boxShadow: "none", padding: 0 },
                    }
                );
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">Cotizar Productos</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Juan"
                            />
                        </div>

                        {/* Apellidos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Apellidos *
                            </label>
                            <input
                                type="text"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Pérez González"
                            />
                        </div>

                        {/* RUT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                RUT *
                            </label>
                            <input
                                type="text"
                                name="rut"
                                value={formData.rut}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/[^0-9kK]/g, "");
                                    const formatted = formatRut(rawValue);

                                    setFormData(prev => ({
                                        ...prev,
                                        rut: formatted
                                    }));
                                }}
                                required
                                className={`
            w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
            ${formData.rut && !validateRut(formData.rut) ? "border-red-500 text-red-600" : "border-gray-300"}
            `}
                                placeholder="12.345.678-9"
                            />
                            {formData.rut && !validateRut(formData.rut) && (
                                <p className="text-red-600 text-sm mt-1">RUT inválido</p>
                            )}
                        </div>

                        {/* Correo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correo Electrónico *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Contacto *
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="+56 9 1234 5678"
                            />
                        </div>

                        {/* Provincia */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Provincia *
                            </label>

                            <select
                                name="provincia"
                                value={formData.provincia}
                                onChange={(e) => {
                                    const provincia = e.target.value as ProvinciaKey;

                                    setFormData(prev => ({
                                        ...prev,
                                        provincia,
                                        comuna: "" // reinicia comuna al cambiar provincia
                                    }));
                                }}
                                required
                                className={`
            w-full px-4 py-2 border border-gray-300 rounded-xl
            focus:ring-2 focus:ring-blue-500 transition-all
            ${formData.provincia === "" ? "text-gray-400" : "text-gray-900"}
            `}
                            >
                                <option value="" disabled>Selecciona una provincia</option>

                                {Object.keys(provincias).map((prov) => (
                                    <option key={prov} value={prov}>
                                        {prov}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* Comuna */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comuna *
                            </label>

                            <select
                                name="comuna"
                                value={formData.comuna}
                                onChange={handleChange}
                                required
                                disabled={!formData.provincia}
                                className={`
                    w-full px-4 py-2 border rounded-xl
                    focus:ring-2 focus:ring-blue-500 transition-all
                    ${formData.comuna === "" ? "text-gray-400" : "text-gray-900"}
                    ${!formData.provincia ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                `}
                            >
                                <option value="" disabled>
                                    {formData.provincia ? "Selecciona una comuna" : "Primero elige provincia"}
                                </option>

                                {formData.provincia &&
                                    provincias[formData.provincia].map((comuna) => (
                                        <option key={comuna} value={comuna}>
                                            {comuna}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>


                        {/* Dirección */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dirección *
                            </label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Av. Francisco de Aguirre 123"
                            />
                        </div>

                    </div>

                    {/* Solicitud Especial */}
                    <div>
                        <label className="block text-sm  font-medium text-gray-700 mb-2">
                            Solicitud Especial
                        </label>
                        <textarea
                            name="solicitudEspecial"
                            value={formData.solicitudEspecial}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            placeholder="Indica cualquier requerimiento especial para tu cotización..."
                        />
                    </div>



                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enviando...' : 'Solicitar Cotización Formal'}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}