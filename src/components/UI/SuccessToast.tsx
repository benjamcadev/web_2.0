"use client";

export default function SuccessToast({ name }: { name: string }) {
  return (
    <div
      className="
        flex items-center gap-4 px-5 py-4 rounded-2xl shadow-xl
        bg-green-500/90 backdrop-blur-xl border border-white/20 text-white
        animate-fade-slide-up
        max-w-md w-full
      "
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600/40 border border-white/20">
        <span className="text-3xl font-bold">✓</span>
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-base lg:text-xl">
          Producto agregado
        </span>
        <span className="text-sm lg:text-lg opacity-90">
          {name}
        </span>
      </div>
    </div>
  );
}
