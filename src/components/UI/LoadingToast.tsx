"use client";

export default function LoadingToast({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      className="
        animate-fade-up
        max-w-sm w-full rounded-2xl shadow-xl border border-white/20
        bg-cyan-600/80 backdrop-blur-2xl text-white px-4 py-4
        flex items-center gap-4 relative overflow-hidden
      "
    >
      {/* Loader circular */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-600/40 border border-white/20">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-lg lg:text-xl leading-tight">
          {title}
        </span>
        <span className="text-sm lg:text-lg opacity-80">{subtitle}</span>
      </div>
    </div>
  );
}
