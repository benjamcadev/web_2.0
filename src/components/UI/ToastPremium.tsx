"use client";

export default function ToastPremium({
  name,
  image
}: {
  name: string;
  image: string;
}) {
  return (
    <div
      className="
        animate-fade-up
        max-w-sm w-full rounded-2xl shadow-xl border border-white/20
        bg-green-600/80 backdrop-blur-2xl text-white px-4 py-4
        flex items-center gap-4 relative overflow-hidden
      "
    >
      {/* Imagen */}
      <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 shadow-md">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Texto */}
      <div className="flex flex-col">
        <span className="font-semibold text-lg lg:text-xl leading-tight">
          Producto agregado
        </span>
        <span className="text-sm lg:text-lg opacity-80">{name}</span>
      </div>

      {/* Barra de progreso */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-white/40">
        <div
          className="h-full bg-white/80 animate-[progress_2.4s_linear]"
        ></div>
      </div>
    </div>
  );
}
