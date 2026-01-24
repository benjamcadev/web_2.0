"use client";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ConfirmToastProps {
  title: string;
  subtitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmToast({
  title,
  subtitle,
  onConfirm,
  onCancel,
}: ConfirmToastProps) {
  return (
    <div
      className="
        animate-fade-up
        max-w-sm w-full rounded-2xl shadow-xl border border-white/20
        bg-cyan-600/80 backdrop-blur-2xl text-white px-4 py-4
        flex flex-col gap-3 relative overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full">
         <ExclamationTriangleIcon className="h-10 w-10 "  />
        </div>

        <div className="flex flex-col">
          <span className="font-semibold text-lg lg:text-xl leading-tight">
            {title}
          </span>
          <span className="text-sm lg:text-lg opacity-80">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm"
        >
          Cancelar
        </button>

        <button
          onClick={onConfirm}
          className="px-3 py-1.5 rounded-lg bg-white text-cyan-700 hover:bg-gray-100 transition text-sm font-semibold"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}