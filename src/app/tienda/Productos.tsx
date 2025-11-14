"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "@/components/client/tienda/ProductCard";
import NavegacionTienda from "@/components/client/tienda/NavegacionTienda";
import { useSearchParams } from "next/navigation";

export const revalidate = 60; // ISR

export default function Productos({ page }: { page: number }) {
    const searchParams = useSearchParams();
    const [productos, setProductos] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>({});
    const [sort, setSort] = useState<string>("default");
    const [pageSize, setPageSize] = useState<number>(12);
    


    // Obtener filtros de la URL
    const categoria = searchParams.get("categoria") || "";
    const oferta = searchParams.get("oferta") === "true";

   


    useEffect(() => {
        const fetchProductos = async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                sort: sort,
            });

            if (categoria) params.set("categoria", categoria);
            if (oferta) params.set("oferta", "true");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/productos?${params.toString()}`,
                { next: { revalidate: 60 } }
            );
            const data = await res.json();
            setProductos([...data.productos]);
            setMeta(data.meta);
        };
        fetchProductos();
    }, [page, sort, pageSize, categoria, oferta]);

    // Funciones auxiliares
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSort(e.target.value);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
    };

    return (
        <div className="flex flex-col w-3/4 mt-6 px-6 gap-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 mr-3">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row justify-between items-center w-full mt-4 gap-4">
                {/* Ordenar */}
                <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="font-medium text-gray-800">
                        Ordenar por:
                    </label>
                    <select
                        id="sort"
                        value={sort}
                        onChange={handleSortChange}
                        className="w-32 px-3 py-2 text-gray-800 border border-white/60 bg-gray-200/80 backdrop-blur-xl rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300"
                    >
                        <option value="default">Por defecto</option>
                        <option value="price:asc">Precio más bajo al más alto</option>
                        <option value="price:desc">Precio más alto al más bajo</option>
                        <option value="recent">Productos recientes agregados</option>
                    </select>
                </div>

                {/* Botones de navegación (anterior/siguiente) */}
                <NavegacionTienda meta={meta} />

                {/* Productos por página */}
                <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="font-medium text-gray-800">
                        Productos por página:
                    </label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="px-3 py-2 text-gray-800 border border-white/60 bg-gray-200/80 backdrop-blur-xl rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300"
                    >
                        {[9, 12, 24, 36, 48].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Rango de productos */}
            {meta && meta.total && (
                <div className="flex flex-col md:flex-row w-52 text-start text-gray-700 text-sm font-medium px-3 py-1.5 border border-white/60 bg-gray-200/80 backdrop-blur-xl rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300">
                    {(() => {
                        const start = (meta.page - 1) * meta.pageSize + 1;
                        const end = Math.min(start + meta.pageSize - 1, meta.total);
                        return `${start} - ${end} de ${meta.total} productos`;
                    })()}
                </div>
            )}

            {/* Productos */}
           <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 ">
                {productos.length > 0 ? (
                    productos.map((p: any) => (
                        <ProductCard key={p.id} producto={p} />
                    ))
                ) : (
                    <div className="col-span-4 text-center py-12">
                        <p className="text-gray-600 text-lg">
                            No se encontraron productos con los filtros seleccionados.
                        </p>
                    </div>
                )}
            </section>

            {/* Botones de navegación (anterior/siguiente) */}
            <NavegacionTienda meta={meta} />
        </div>
    );
}