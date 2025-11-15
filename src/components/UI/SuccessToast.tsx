"use client";

export default function SuccessToast({ name }: { name: string }) {
  return (
    <div
      className="
        animate-fade-up
        max-w-sm w-full rounded-2xl shadow-xl border border-white/20
        bg-green-600/80 backdrop-blur-2xl text-white px-4 py-4
        flex items-center gap-4 relative overflow-hidden
      "
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600/40 border border-white/20">
        <span className="text-3xl font-bold">✓</span>
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-lg lg:text-xl leading-tight">
          Producto agregado
        </span>
        <span className="text-sm lg:text-lg opacity-80">{name}</span>
      </div>

    </div>
  );
}
