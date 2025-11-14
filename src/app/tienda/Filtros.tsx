"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Categoria {
  id: number;
  name: string;
  slug: string;
}

interface SubCategoria {
  id: number;
  name: string;
  slug: string;
  categoriaId: number | null;
}

export default function Filtros() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(
    searchParams.get("categoria") || ""
  );
  const [categoriaIdSeleccionada, setCategoriaIdSeleccionada] = useState<number | null>(null);
  const [subcategoriasSeleccionadas, setSubcategoriasSeleccionadas] = useState<string[]>(
    searchParams.get("subcategorias")?.split(",").filter(Boolean) || []
  );
  const [soloOfertas, setSoloOfertas] = useState<boolean>(
    searchParams.get("oferta") === "true"
  );

  // Obtener categorías desde la API interna
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/categorias`
        );
        const data = await res.json();
        setCategorias(data.categorias);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  // Obtener subcategorías cuando cambia la categoría seleccionada
  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!categoriaIdSeleccionada) {
        setSubcategorias([]);
        return;
      }

      try {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/subcategorias?categoria=${categoriaIdSeleccionada}`;
        const res = await fetch(url);
        const data = await res.json();
        setSubcategorias(data.subcategorias || []);
      } catch (error) {
        console.error("Error al cargar subcategorías:", error);
        setSubcategorias([]);
      }
    };
    fetchSubcategorias();
  }, [categoriaIdSeleccionada]);

  // Aplicar filtros
  const aplicarFiltros = (categoria: string, subcats: string[], oferta: boolean) => {
    const params = new URLSearchParams();
    params.set("page", "1"); // Resetear a página 1 al filtrar

    if (categoria) {
      params.set("categoria", categoria);
    }

    if (subcats.length > 0) {
      params.set("subcategorias", subcats.join(","));
    }

    if (oferta) {
      params.set("oferta", "true");
    }

    router.push(`/tienda?${params.toString()}`);
  };

  const handleCategoriaChange = (slug: string, id: number | null) => {
    setCategoriaSeleccionada(slug);
    setCategoriaIdSeleccionada(id);

    // Limpiar subcategorías seleccionadas al cambiar de categoría
    setSubcategoriasSeleccionadas([]);

    aplicarFiltros(slug, [], soloOfertas);
  };

  const handleSubcategoriaToggle = (slug: string) => {
    const nuevasSubcats = subcategoriasSeleccionadas.includes(slug)
      ? subcategoriasSeleccionadas.filter((s) => s !== slug)
      : [...subcategoriasSeleccionadas, slug];

    setSubcategoriasSeleccionadas(nuevasSubcats);
    aplicarFiltros(categoriaSeleccionada, nuevasSubcats, soloOfertas);
  };

  const handleOfertaToggle = () => {
    const nuevoValor = !soloOfertas;
    setSoloOfertas(nuevoValor);
    aplicarFiltros(categoriaSeleccionada, subcategoriasSeleccionadas, nuevoValor);
  };

  const limpiarFiltros = () => {
    setCategoriaSeleccionada("");
    setCategoriaIdSeleccionada(null);
    setSubcategoriasSeleccionadas([]);
    setSoloOfertas(false);
    router.push("/tienda?page=1");
  };

  return (
    <aside className="w-1/4 mt-6 px-4 py-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 h-fit sticky top-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Filtros</h2>

      {/* Filtro de Ofertas */}
      <div className="mb-6 pb-6 p-4 text-gray-800 border border-white/60 bg-gray-50/60  rounded-xl ">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ofertas</h3>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-gray-700 font-medium">Productos en oferta</span>

          {/* Switch Toggle */}
          <div className="relative">
            <input
              type="checkbox"
              checked={soloOfertas}
              onChange={handleOfertaToggle}
              className="sr-only peer"
            />
            <div
              className="w-14 h-7 bg-gray-300/60 rounded-full peer 
              peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-cyan-400
              transition-all duration-300 shadow-inner"
            ></div>
            <div
              className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full 
              peer-checked:translate-x-7 transition-transform duration-300
              shadow-md"
            ></div>
          </div>
        </label>
      </div>

      {/* Filtro de Categorías */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Categorías</h3>
        <div className="space-y-2">

          {/* Filtro de Subcategorías (se muestra solo si hay subcategorías disponibles) */}
          {subcategorias.length > 0 && (
            <div className="mb-6 p-4 border border-white/60 bg-gray-50/60  rounded-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Subcategorías</h3>
              <div className="space-y-3">
                {subcategorias.map((subcategoria) => (
                  <label
                    key={subcategoria.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={subcategoriasSeleccionadas.includes(subcategoria.slug)}
                      onChange={() => handleSubcategoriaToggle(subcategoria.slug)}
                      className="w-5 h-5 rounded border-2 border-gray-400 text-blue-600 
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                  checked:bg-gradient-to-br checked:from-blue-600 checked:to-cyan-400
                  transition-all duration-200 cursor-pointer"
                    />
                    <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                      {subcategoria.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Opción "Todas las categorías" */}
          <button
            onClick={() => handleCategoriaChange("", null)}
            className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-300
              ${categoriaSeleccionada === ""
                ? "bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 text-white border border-white/40 font-semibold"
                : "border border-white/60 bg-gray-50/60 rounded-xl "
              }`}
          >
            Todas las categorías
          </button>



          {/* Lista de categorías */}
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => handleCategoriaChange(categoria.slug, categoria.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-300
                ${categoriaSeleccionada === categoria.slug
                  ? "bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 text-white border border-white/40 shadow-lg font-semibold"
                  : "border border-white/60  bg-gray-50/60 rounded-xl  transition-all duration-300 hover:-translate-y-0.5"
                }`}
            >
              {categoria.name}
            </button>
          ))}
        </div>
      </div>



      {/* Botón Limpiar Filtros */}
      {(categoriaSeleccionada || soloOfertas || subcategoriasSeleccionadas.length > 0) && (
        <button
          onClick={limpiarFiltros}
          className="w-full mt-4 px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-white/30 
          text-gray-800 font-medium rounded-xl hover:bg-white/70 transition-all duration-300 
          shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  );
}