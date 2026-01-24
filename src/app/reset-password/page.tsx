"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import ErrorToast from '@/components/UI/ErrorToast'
import SuccessToast from "@/components/UI/SuccessToast";
import LoadingToast from '@/components/UI/LoadingToast'
import { Manrope } from "next/font/google";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Header from '@/components/client/Header/Header'

function getPasswordStrength(password: string) {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Débil", color: "bg-red-500", percent: "25%" };
    if (score === 3) return { label: "Media", color: "bg-yellow-500", percent: "50%" };
    if (score === 4) return { label: "Buena", color: "bg-blue-500", percent: "75%" };
    return { label: "Fuerte", color: "bg-green-600", percent: "100%" };
}

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const turnstileRef = useRef<HTMLDivElement | null>(null);

    const strength = getPasswordStrength(password);

    useEffect(() => {

        const scriptId = "cf-turnstile";
        if (document.getElementById(scriptId)) return;

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }, []);

    if (!token) {
        return (
            <>
                <Header />

                <div className={manrope.className + ` min-h-screen w-full flex items-center justify-center  px-4`} >
                    <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <svg
                                    className="h-10 w-10 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3m0 4h.01M21.21 15.89A10 10 0 1112 2a10 10 0 019.21 13.89z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Token inválido o inexistente</h1>

                            <button
                                onClick={() => router.push("/")}
                                className="w-full py-3 px-4 mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl hover:scale-105 transition-all duration-300"

                            >
                                Volver al inicio
                            </button>
                        </div>

                    </div>
                </div>
            </>



        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const turnstileToken = (window as any).turnstile?.getResponse();

        if (!turnstileToken) {
            toast.custom(<ErrorToast title="Error" subtitle="Verificación antibot fallida" />);
            (window as any).turnstile?.reset();
            return;
        }

        if (password.length < 8) {
            toast.custom(<ErrorToast title="Error" subtitle="La contraseña debe tener al menos 8 caracteres" />);
            // resetear antibot
            (window as any).turnstile?.reset();
            return;
        }

        if (password !== confirm) {
            toast.custom(<ErrorToast title="Error" subtitle="Las contraseñas no coinciden" />);
             // resetear antibot
            (window as any).turnstile?.reset();
            return;
        }

        const loadingToast = toast.custom(
            <LoadingToast title="Verificando..." subtitle="Por favor espera un momento." />,
            { duration: Infinity, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, });


        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token,
                password,
            }),
        });

        const data = await res.json();
        toast.dismiss(loadingToast)

        if (!res.ok) {
            toast.custom(<ErrorToast title="Error" subtitle={data.error || "No se pudo cambiar la contraseña"} />);
             // resetear antibot
            (window as any).turnstile?.reset();
            return;
        }

        toast.custom(<SuccessToast subtitle={'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'} title={'Listo !'} />, { duration: 2400, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, });

         // resetear antibot
            (window as any).turnstile?.reset();
            
        setTimeout(() => {
            router.push("/");
        }, 3000);
    }

    return (
        <>
            <Header />
            <div className={manrope.className + `flex flex-col md:items-center md:flex-row  mt-6 px-6 gap-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30  ml-3 mr-3`}>
                <div className="min-h-screen w-full flex items-center justify-center  px-4">

                    <form
                        onSubmit={handleSubmit}
                        className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-200"
                    >
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">
                            Restablecer contraseña
                        </h1>

                        <div className="relative ">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nueva contraseña"
                                className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-600 hover:text-black"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>

                        </div>

                        <div className="mt-2 mb-2">
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${strength.color}`}
                                    style={{ width: strength.percent }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-600">
                                Fuerza de la contraseña: <span className="font-semibold">{strength.label}</span>
                            </p>
                        </div>

                        <div className="mb-3 text-xs text-gray-600 space-y-1">
                            <p className="font-semibold text-gray-700">Requisitos de la contraseña:</p>
                            <ul className="space-y-0.5">
                                <li className={`flex items-center gap-1 ${password.length >= 8 ? "text-green-600" : ""}`}>
                                    {password.length >= 8 && <span>✔</span>}
                                    <span>Mínimo 8 caracteres</span>
                                </li>

                                <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
                                    {/[A-Z]/.test(password) && <span>✔</span>}
                                    <span>Al menos una mayúscula</span>
                                </li>

                                <li className={`flex items-center gap-1 ${/[a-z]/.test(password) ? "text-green-600" : ""}`}>
                                    {/[a-z]/.test(password) && <span>✔</span>}
                                    <span>Al menos una minúscula</span>
                                </li>

                                <li className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
                                    {/[0-9]/.test(password) && <span>✔</span>}
                                    <span>Al menos un número</span>
                                </li>

                                <li className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}`}>
                                    {/[^A-Za-z0-9]/.test(password) && <span>✔</span>}
                                    <span>Al menos un carácter especial</span>
                                </li>
                            </ul>
                        </div>

                      

                        <div className="relative mb-3 mt-3">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirmar contraseña"
                                className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirm((prev) => !prev)}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-600 hover:text-black"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>

                        </div>

                        <div className="relative">
                            <div
                                ref={turnstileRef}
                                className="cf-turnstile"
                                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            {loading ? "Guardando..." : "Cambiar contraseña"}
                        </button>
                    </form>
                </div>
            </div>
        </>


    );
}