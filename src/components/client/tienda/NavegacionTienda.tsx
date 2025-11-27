"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface MetaProps {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function NavegacionTienda({ meta }: { meta: MetaProps }) {
  const searchParams = useSearchParams();

  // Clona todos los valores actuales del URL
  const buildUrlWithFilters = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `/tienda?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 select-none mt-4 mb-6">
      {meta.pageCount > 1 &&
        (() => {
          const pages: (number | string)[] = [];
          const total = meta.pageCount;
          const current = meta.page;

          if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
          } else {
            pages.push(1);
            if (current > 4) pages.push("…");

            const start = Math.max(2, current - 1);
            const end = Math.min(total - 1, current + 1);
            for (let i = start; i <= end; i++) pages.push(i);

            if (current < total - 3) pages.push("…");
            pages.push(total);
          }

          return (
            <>
              {/* Flecha Anterior */}
              {current > 1 && (
                <Link
                  href={buildUrlWithFilters(current - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-800 border border-white/60 bg-gray-200/80 backdrop-blur-xl  shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300"
                  aria-label="Página anterior"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              )}

              {/* Números */}
              {pages.map((num, idx) =>
                num === "…" ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-500">
                    …
                  </span>
                ) : (
                  <Link
                    key={num}
                    href={buildUrlWithFilters(num as number)}
                    className={`relative px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-md border border-white/30 transition-all duration-300
                      ${
                        num === current
                          ? " text-white backdrop-blur-xl bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 border border-white/40 shadow-[inset_1px_1px_4px_rgba(255,255,255,0.3),0_2px_10px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-full before:bg-white/30 before:opacity-0 hover:before:opacity-20 transition-all duration-300 hover:scale-105"
                          : " bg-gray-500/20  text-gray-800 w-9 h-9 flex items-center justify-center border border-gray-100/10 backdrop-blur-xl  shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:bg-white/40 transition-all duration-300"
                      }`}
                  >
                    {num}
                  </Link>
                )
              )}

              {/* Flecha Siguiente */}
              {current < total && (
                <Link
                  href={buildUrlWithFilters(current + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-800 border border-white/60 bg-gray-200/80 backdrop-blur-xl  shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300"
                  aria-label="Página siguiente"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </>
          );
        })()}
    </div>
  );
}
