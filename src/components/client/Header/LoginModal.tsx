"use client";

import { useState, useEffect, useRef } from "react";
import { formatRut } from "@/lib/formatRut";
import { validateRut } from "@/lib/validateRut";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import ErrorToast from '@/components/UI/ErrorToast'
import SuccessToast from "@/components/UI/SuccessToast";
import LoadingToast from '@/components/UI/LoadingToast'
import { useAuthStore } from "@/stores/useAuthStore";



interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [rut, setRut] = useState("");
    const [rutValido, setRutValido] = useState(true);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState("");
    const turnstileRef = useRef<HTMLDivElement | null>(null);
    const turnstileForgotRef = useRef<HTMLDivElement | null>(null);
    const turnstileWidgetLoginRef = useRef<string | null>(null);
    const turnstileWidgetForgotRef = useRef<string | null>(null);
    const rutInputRef = useRef<HTMLInputElement | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2FA state
    const [is2FA, setIs2FA] = useState(false);
    const [twoFACode, setTwoFACode] = useState<string[]>(["", "", "", "", "", ""]);
    const twoFAInputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [tempUserId, setTempUserId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutos


    const loginStore = useAuthStore((state) => state.login);

    useEffect(() => {
        if (!isOpen) return;

        const scriptId = "cf-turnstile";
        if (document.getElementById(scriptId)) return;

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                rutInputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    // Limpiar widgets y campos al cerrar modal
    useEffect(() => {
        if (!isOpen) {
            const t = (window as any).turnstile;

            if (t) {
                if (turnstileWidgetLoginRef.current) {
                    t.remove(turnstileWidgetLoginRef.current);
                    turnstileWidgetLoginRef.current = null;
                }

                if (turnstileWidgetForgotRef.current) {
                    t.remove(turnstileWidgetForgotRef.current);
                    turnstileWidgetForgotRef.current = null;
                }
            }

            // Resetear todos los estados
            setRut("");
            setPassword("");
            setEmail("");
            setRutValido(true);
            setShowPassword(false);
            setIsForgotPassword(false);

            // Resetear 2FA
            setIs2FA(false);
            setTwoFACode(["", "", "", "", "", ""]);
            setTempUserId(null);
            setTimeLeft(600);

            // Reset submitting
            setIsSubmitting(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!(window as any).turnstile) return;

        if (isForgotPassword) {
            (window as any).turnstile.reset(turnstileRef.current);
        } else {
            (window as any).turnstile.reset(turnstileForgotRef.current);
        }
    }, [isForgotPassword]);

    // Render/Remove Turnstile widgets de forma segura
    useEffect(() => {
        if (!isOpen) return;
        if (!(window as any).turnstile) return;

        const t = (window as any).turnstile;

        const timeout = setTimeout(() => {
            try {
                // Si estoy en login → remover forgot
                if (!isForgotPassword) {
                    if (turnstileWidgetForgotRef.current) {
                        t.remove(turnstileWidgetForgotRef.current);
                        turnstileWidgetForgotRef.current = null;
                    }

                    if (turnstileRef.current && !turnstileWidgetLoginRef.current) {
                        turnstileWidgetLoginRef.current = t.render(
                            turnstileRef.current,
                            {
                                sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
                            }
                        );
                    }
                }

                // Si estoy en forgot → remover login
                if (isForgotPassword) {
                    if (turnstileWidgetLoginRef.current) {
                        t.remove(turnstileWidgetLoginRef.current);
                        turnstileWidgetLoginRef.current = null;
                    }

                    if (turnstileForgotRef.current && !turnstileWidgetForgotRef.current) {
                        turnstileWidgetForgotRef.current = t.render(
                            turnstileForgotRef.current,
                            {
                                sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
                            }
                        );
                    }
                }
            } catch (e) {
                console.debug("Turnstile render/remove error", e);
            }
        }, 50);

        return () => clearTimeout(timeout);
    }, [isForgotPassword, isOpen]);

    // Contador regresivo 2FA
    useEffect(() => {
        if (!is2FA) return;

        if (timeLeft <= 0) {
            toast.custom(
                <ErrorToast
                    title="Código expirado"
                    subtitle="Debes iniciar sesión nuevamente"
                />,
                { duration: 4000, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 } }
            );

            setIs2FA(false);
            setTwoFACode(["", "", "", "", "", ""]);
            setTempUserId(null);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [is2FA, timeLeft]);

    if (!isOpen) return null;

    const handleLogin = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const loadingToastLogin = toast.custom(
            <LoadingToast title="Ingresando..." subtitle="Por favor espera un momento." />,
            { duration: Infinity, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, });

        const turnstileToken = (window as any).turnstile?.getResponse(turnstileRef.current);

        if (!turnstileToken) {
            toast.dismiss(loadingToastLogin);
            toast.custom(
                <ErrorToast title="Error" subtitle="Verificación antibot fallida" />
            );
            (window as any).turnstile?.reset(turnstileRef.current);
            setIsSubmitting(false);
            return;
        }

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rut,
                password,
                turnstileToken,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.dismiss(loadingToastLogin);
            toast.custom(
                <ErrorToast title="Error" subtitle={data.message || "Credenciales inválidas"} />
            );
            (window as any).turnstile?.reset(turnstileRef.current);
            setIsSubmitting(false);
            return;
        }

        // Si backend indica que requiere 2FA
        if (data.needs2FA) {
            toast.dismiss(loadingToastLogin);
            toast.custom(
                <SuccessToast title="Código enviado" subtitle="Revisa tu correo" />,
                { duration: 2400, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 } }
            );

            setTempUserId(data.tempUserId);
            setIs2FA(true);
            setTimeLeft(600); // reiniciar contador
            setTwoFACode(["", "", "", "", "", ""]);
            setTimeout(() => {
                twoFAInputsRef.current[0]?.focus();
            }, 50);
            setIsSubmitting(false);
            return;
        }

        // Login normal (solo si no hay 2FA)
        toast.dismiss(loadingToastLogin);
        toast.custom(<SuccessToast subtitle={''} title={'Sesión Iniciada'} />, { duration: 2400, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 } });

        loginStore({
            user: data.user,
            cliente: data.cliente,
        });

        (window as any).turnstile?.reset(turnstileRef.current);
        setIsSubmitting(false);
        onClose();
    };

    const handleVerify2FA = async () => {
        if (!tempUserId || twoFACode.join("").length !== 6) return;

        setIsSubmitting(true);

        const loadingToast = toast.custom(
            <LoadingToast title="Verificando código..." subtitle="Por favor espera." />,
            { duration: Infinity, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 } }
        );

        const res = await fetch("/api/auth/login-2fa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tempUserId,
                code: twoFACode.join(""),
            }),
        });

        const data = await res.json();

        toast.dismiss(loadingToast);

        if (!res.ok) {
            toast.custom(
                <ErrorToast title="Error" subtitle={data.message || "Código inválido"} />,
                { duration: 3000, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 } }
            );
            setIsSubmitting(false);
            return;
        }

        loginStore({
            user: data.user,
            cliente: data.cliente,
        });

        toast.custom(
            <SuccessToast title="Sesión iniciada" subtitle="Bienvenido" />,
            { duration: 2000, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 } }
        );

        setIsSubmitting(false);
        setIs2FA(false);
        setTwoFACode(["", "", "", "", "", ""]);
        setTempUserId(null);
        onClose();
    };

    const handleForgotPassword = async () => {
        if (isSubmitting) return;

        // Loading
        setIsSubmitting(true);
        const loadingToastLogin = toast.custom(
            <LoadingToast title="Enviando Correo..." subtitle="Por favor espera un momento." />,
            { duration: Infinity, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, });

        const turnstileToken = (window as any).turnstile?.getResponse(turnstileForgotRef.current);

        if (!turnstileToken) {
            toast.dismiss(loadingToastLogin);
            toast.custom(
                <ErrorToast title="Error" subtitle="Verificación antibot fallida" />
            );
            (window as any).turnstile?.reset(turnstileForgotRef.current);
            setIsSubmitting(false);
            return;
        }

        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, turnstileToken, rut }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.custom(
                <ErrorToast title="Error" subtitle={data.message || "No se pudo enviar el correo"} />
            );
            setIsSubmitting(false);
            toast.dismiss(loadingToastLogin);
            return;
        }

        toast.custom(<SuccessToast subtitle={'Te enviamos un correo para recuperar tu contraseña'} title={'Listo !'} />, { duration: 2400, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, });
        setIsSubmitting(false);
        toast.dismiss(loadingToastLogin);
        (window as any).turnstile?.reset(turnstileForgotRef.current);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Overlay con blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-8 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-black">
                        {!isForgotPassword ? 'Iniciar sesión' : 'Recuperación de contraseña'}
                    </h2>
                    <button onClick={onClose}>
                        <XMarkIcon className="h-6 w-6 text-black" />
                    </button>
                </div>

                {/* Formulario */}
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();

                        // Validar campos
                        const isEmailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                        if (isForgotPassword) {
                            if (!isEmailValid) {
                                toast.custom(
                                    <ErrorToast title="Error" subtitle="Debes ingresar un email valido" />,
                                    { duration: 6000, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, }
                                );
                                return;
                            }
                        } else if (!is2FA) {
                            if (!validateRut(rut) || password.trim().length === 0) {
                                toast.custom(
                                    <ErrorToast title="Error" subtitle="Debes ingresar RUT y Contraseña validas" />,
                                    { duration: 6000, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, }
                                );
                                return;
                            }
                        }

                        // continuar con el backend

                        if (isForgotPassword) {
                            handleForgotPassword();
                        } else if (is2FA) {
                            handleVerify2FA();
                        } else {
                            handleLogin();
                        }
                    }}
                >
                    {!isForgotPassword && !is2FA ? (
                        <>
                            {/* RUT */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    RUT
                                </label>
                                <input
                                    ref={rutInputRef}
                                    type="text"
                                    value={rut}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/[^0-9kK]/g, "");
                                        const formatted = formatRut(rawValue);
                                        setRut(formatted);
                                    }}
                                    onBlur={() => { setRutValido(validateRut(rut)) }}
                                    placeholder="12.345.678-9"
                                    className={`w-full rounded-xl border px-4 py-2  bg-white/80
                                        ${rut && !rutValido ? "border-red-500 text-red-600" : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"} `}
                                />
                                {rut && !rutValido && (
                                    <p className="text-red-600 text-sm mt-1">RUT inválido</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    Contraseña
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black"
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
                            </div>

                            {/* Antibot */}
                            <div
                                id="turnstile-login"
                                ref={turnstileRef}
                                className="cf-turnstile"
                                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                            />

                            {/* Forgot password */}
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(true)}
                                className="text-sm text-black underline hover:opacity-70"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </>
                    ) : is2FA ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    Código de verificación
                                </label>

                                <div className="flex justify-between gap-2">
                                    {twoFACode.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => {
                                                twoFAInputsRef.current[idx] = el;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                const newCode = [...twoFACode];
                                                newCode[idx] = val;
                                                setTwoFACode(newCode);

                                                if (val && idx < 5) {
                                                    twoFAInputsRef.current[idx + 1]?.focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && !twoFACode[idx] && idx > 0) {
                                                    twoFAInputsRef.current[idx - 1]?.focus();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault();

                                                const paste = e.clipboardData
                                                    .getData("text")
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6);

                                                if (!paste) return;

                                                const newCode = ["", "", "", "", "", ""];

                                                paste.split("").forEach((char, i) => {
                                                    newCode[i] = char;
                                                });

                                                setTwoFACode(newCode);

                                                // mover foco a la última casilla pegada
                                                const lastIndex = paste.length - 1;
                                                if (lastIndex >= 0) {
                                                    twoFAInputsRef.current[lastIndex]?.focus();
                                                }
                                            }}
                                            className="w-12 h-12 text-center text-lg rounded-xl border border-gray-300 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    ))}
                                </div>

                                <p className="text-sm text-gray-600 mt-2">
                                    Ingresa el código enviado a tu correo.
                                </p>

                                <p className="text-sm text-black text-center mt-2 font-semibold">
                                    Tiempo restante: {Math.floor(timeLeft / 60)}:
                                    {String(timeLeft % 60).padStart(2, "0")}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Recuperación */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@empresa.cl"
                                    className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />


                            </div>

                            {/* Antibot */}
                            <div
                                id="turnstile-forgot"
                                ref={turnstileForgotRef}
                                className="cf-turnstile"
                                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                            />

                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(false)}
                                className="text-sm text-black underline hover:opacity-70"
                            >
                                Volver a iniciar sesión
                            </button>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-black py-3 text-white font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isForgotPassword ? "Enviar correo" : is2FA ? "Verificar código" : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
}