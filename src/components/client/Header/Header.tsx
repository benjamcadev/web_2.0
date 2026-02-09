"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeIcon, Bars3Icon, XMarkIcon, ShoppingCartIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import SearchBar from "./SearchBar";
import { useCart } from "@/hooks/useCart";
import { useHydration } from "@/hooks/useHydration";
import CarritoModal from "./CarritoModal";
import LoginModal from "./LoginModal";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import ErrorToast from '@/components/UI/ErrorToast';
import SuccessToast from "@/components/UI/SuccessToast";

export default function Header() {
  const [active, setActive] = useState("Inicio");
  const [open, setOpen] = useState(false);
  const links2 = [{ nombre: "Inicio", href: "/" }, { nombre: "Tienda", href: "/tienda" }, { nombre: "Empresas", href: "/empresas" }]
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalItems } = useCart();
  const [animar, setAnimar] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRehydrating, setIsRehydrating] = useState(true);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cliente = useAuthStore((s) => s.cliente);
  const setAuthFromBackend = useAuthStore((s) => s.setAuthFromBackend);
  const logout = useAuthStore((s) => s.logout);

  // hidratacion para el inicio de sesion
  const rehydrateAttemptsRef = useRef(0);

  // Evitar error de hidratación
  const isHydrated = useHydration();

  //  Solo ejecutar getTotalItems() después de hidratar
  const totalItems = isHydrated ? getTotalItems() : 0;

  const router = useRouter();

  useEffect(() => {
    setAnimar(true);
    setTimeout(() => setAnimar(false), 5000);
  }, [totalItems])

  useEffect(() => {
    const handleClickOutside = () => setIsUserMenuOpen(false);
    if (isUserMenuOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isUserMenuOpen]);

  // useefect para la hidratacion del inicio de sesion
  useEffect(() => {
    // Allow at most 2 attempts (initial + 1 retry) to avoid infinite loops
    if (rehydrateAttemptsRef.current >= 2) return;
    rehydrateAttemptsRef.current += 1;

    const rehydrate = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          logout();
          return;
        }

        const data = await res.json();

        if (data?.user) {
          setAuthFromBackend({
            user: data.user,
            cliente: data.cliente ?? null,
          });

          // If we have a valid session but cliente is still null, retry once shortly
          if (!data.cliente && rehydrateAttemptsRef.current < 2) {
            setTimeout(() => {
              // trigger another attempt by forcing a re-render via state
              setIsRehydrating(true);
            }, 150);
          }
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setIsRehydrating(false);
      }
    };

    rehydrate();
    // Re-run only when we explicitly toggle rehydration (retry) or auth setters change
  }, [setAuthFromBackend, logout, isRehydrating]);


  return (
    <>

   <header 
  className={`
    sticky top-0 z-50 m-3 
    
    /* Agregamos transform para habilitar el escalado */
    ${isAuthenticated 
      ? 'bg-gradient-to-r from-blue-800/80 via-cyan-600/40 to-indigo-800/80 border-white/20 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-blue-500/10 scale-[1.01]' 
      : 'bg-white/60 text-slate-800 border-white/30 shadow-lg scale-100'} 
    
    backdrop-blur-2xl rounded-2xl px-6 py-4 border
    
    /* Transición suave para el scale y el borde, el fondo será más rápido */
    transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)
  `}
>
        <div className="flex items-center justify-between gap-4">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isAuthenticated ? (
              <Image
                src="/logo-empresa.webp"
                alt="Logo Agroplastic"
                width={250}
                height={80}
                className="drop-shadow-lg hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300"
              />
            ) :
              (
                <Image
                  src="/logo.webp"
                  alt="Logo Agroplastic"
                  width={250}
                  height={80}
                  className="drop-shadow-lg hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-300"
                />
              )
            }

          </div>

          {/* Buscador en el centro (solo desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {/* Botón hamburguesa en móvil */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
          >
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>

          {/* Menú desktop + iconos */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">


            <nav className="flex space-x-8">
              {links2.map((link) => (
                <Link key={link.nombre} href={link.href}>
                  <span
                    onClick={() => setActive(link.nombre)}
                    className={`cursor-pointer  ${isAuthenticated ? 'text-white  hover:border-gray-200' : 'text-black  hover:border-gray-400'}  text-lg pb-1 transition-all ${active === link.nombre
                      ? "font-bold border-b-2 border-black"
                      : "font-normal  hover:border-b "
                      }`}
                  >
                    {link.nombre === "Inicio" ? (
                      <HomeIcon className={`h-6 w-6  ${isAuthenticated ? 'text-white' : 'text-black'} cursor-pointer  transition-transform hover:scale-110 `} />
                    ) : (
                      link.nombre
                    )}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Separador */}
            <div className={`h-6 w-px ${isAuthenticated ? 'bg-white' : 'bg-black'} `}></div>


            {/* Carrito - ACTUALIZADO */}
            <div
              className="relative cursor-pointer group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCartIcon className={`h-7 w-7 ${isAuthenticated ? 'text-white' : 'text-black'} transition-transform group-hover:scale-110`} />

              {isHydrated && totalItems > 0 && (
                <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold ${animar ? 'animate-pulse' : ''}`}>
                  {totalItems}
                </span>
              )}
            </div>

            {/* Separador */}
            <div className={`h-6 w-px ${isAuthenticated ? 'bg-white' : 'bg-black'} `}></div>

            {/* Login / Usuario */}
            <div
              className="relative cursor-pointer group flex flex-col items-center"
              onClick={(e) => {
                e.stopPropagation();
                if (!isAuthenticated) {
                  setIsLoginOpen(true);
                } else {
                  setIsUserMenuOpen((prev) => !prev);
                }
              }}
            >
              <UserCircleIcon
                className={`h-7 w-7 transition-transform group-hover:scale-110 ${isAuthenticated ? "text-white" : "text-black"
                  }`}
              />

              {isRehydrating ? (
                <>
                  <span className={`text-[8px] text-white mt-1`}>Hola!</span>
                  <div className="h-3 w-20 bg-gray-300/60 rounded animate-pulse mt-1" />
                </>
              ) : isAuthenticated ? (
                <>
                  <span className="text-[8px] text-white mt-1">Hola!</span>
                  <span className="text-[12px]">
                    {cliente
                      ? (cliente.nombre || cliente.razon_social || "Cliente")
                      : "Cargando..."}
                  </span>

                  {isUserMenuOpen && (
                    <div className="absolute top-full mt-2 right-0 w-44 bg-white backdrop-blur-lg border border-white/30 rounded-xl shadow-lg z-50 overflow-hidden">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-white/50 transition-colors"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/mi-cuenta");
                        }}
                      >
                        Mi Cuenta
                      </button>

                      <div className="h-px bg-gray-200" />

                      <button
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        onClick={async () => {
                          const resLogout = await fetch("/api/auth/logout", { method: "POST" });
                          if (!resLogout.ok) {
                            toast.custom(
                              <ErrorToast title="Error" subtitle="Error al cerrar sesion" />
                            );
                            return;
                          }
                          logout();
                          toast.custom(<SuccessToast subtitle={''} title={'Sesión Cerrada'} />, { duration: 2400, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, });
                          setIsUserMenuOpen(false);
                          router.push("/");

                        }}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <span className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 p-2 whitespace-nowrap bg-gray-800 text-white text-sm rounded shadow-lg z-20 hidden group-hover:block">
                  Iniciar sesión
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Menú móvil */}
        {open && (
          <div className="md:hidden mt-4 space-y-4">
            {/* Buscador móvil */}
            <div className="px-2">
              <SearchBar />
            </div>

            {/* Links de navegación */}
            <nav className="flex flex-col items-center space-y-4 py-4">
              {links2.map((link) => (
                <Link key={link.nombre} href={link.href}>
                  <span
                    onClick={() => {
                      setActive(link.nombre);
                      setOpen(false);
                    }}
                    className={`cursor-pointer text-black text-lg pb-1 transition-all ${active === link.nombre
                      ? "font-bold border-b-2 border-black"
                      : "font-normal hover:font-semibold hover:border-b hover:border-gray-400"
                      }`}
                  >
                    {link.nombre === "Inicio" ? (
                      <HomeIcon className="h-6 w-6 text-black" />
                    ) : (
                      link.nombre
                    )}
                  </span>
                </Link>
              ))}

              {/* Carrito móvil - ACTUALIZADO */}
              <Link href="/carrito" className="relative mt-4">
                <ShoppingCartIcon className="h-7 w-7 text-black" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Modal de Carrito */}
      <CarritoModal isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />

      {/* Modal Login */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

    </>
  );
}