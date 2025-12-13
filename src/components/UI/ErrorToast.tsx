"use client";

export default function ErrorToast({ title, subtitle }: { title: string, subtitle: React.ReactNode; }) {
  return (
    <div
      className="
        animate-fade-up
        max-w-sm w-full rounded-2xl shadow-xl border border-white/20
        bg-red-600/80 backdrop-blur-2xl text-white px-4 py-4
        flex items-center gap-4 relative overflow-hidden z-250
      "
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600/40 border border-white/20">
        <span className="text-3xl font-bold">X</span>
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
