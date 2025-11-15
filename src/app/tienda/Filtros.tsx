"use client";
import Image from "next/image"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Manrope } from "next/font/google";

interface Categoria {
  id: number;
  name: string;
  slug: string;
  imagen?: string; // Añade esta propiedad si tu API la proporciona
}

interface SubCategoria {
  id: number;
  name: string;
  slug: string;
  categoriaId: number | null;
}

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
    params.set("page", "1");

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
    <aside className={`${manrope.className} w-1/4 mt-6 px-4 py-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 h-fit sticky top-6`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Filtros</h2>

      {/* Filtro de Ofertas */}
      <div className="mb-6 pb-6 p-4 text-gray-800 border border-white/60 bg-gray-50/60 rounded-xl">
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

      {/* Filtro de Subcategorías */}
      {subcategorias.length > 0 && (
        <div className="mb-6 p-4 border border-white/60 bg-gray-50/60 rounded-xl transition-all duration-300">
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

      {/* Filtro de Categorías - Grid de 2 columnas */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Categorías</h3>
        
        {/* Grid de categorías */}
        <div className="grid grid-cols-2 gap-3">
          {/* Opción "Todas las categorías" */}
          <button
            onClick={() => handleCategoriaChange("", null)}
            className={`relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1
              ${categoriaSeleccionada === ""
                ? "bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 border border-white/40 shadow-lg"
                : "bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/70"
              }`}
          >
            <div className="p-3 flex flex-col items-center justify-center gap-2 min-h-[120px]">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center
                ${categoriaSeleccionada === ""
                  ? "bg-white/20"
                  : "bg-gray-200/50"
                }`}>
                <svg 
                  className={`w-6 h-6 ${categoriaSeleccionada === "" ? "text-white" : "text-gray-600"}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span className={`text-sm font-medium text-center
                ${categoriaSeleccionada === "" ? "text-white" : "text-gray-700"}`}>
                Todas
              </span>
            </div>
          </button>

          {/* Lista de categorías con imágenes */}
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => handleCategoriaChange(categoria.slug, categoria.id)}
              className={`relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1
                ${categoriaSeleccionada === categoria.slug
                  ? "bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 border border-white/40 shadow-lg"
                  : "bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/70"
                }`}
            >
              <div className="p-3 flex flex-col items-center justify-center gap-2 min-h-[120px]">
                {/* Imagen de la categoría */}
             <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200/50 flex items-center justify-center relative">
                  {categoria.imagen ? (
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${categoria.imagen}`}
                      alt={categoria.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <svg 
                      className={`w-6 h-6 ${categoriaSeleccionada === categoria.slug ? "text-white" : "text-gray-600"}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  )}
                </div>
                
                {/* Nombre de la categoría */}
                <span className={`text-sm font-medium text-center line-clamp-2
                  ${categoriaSeleccionada === categoria.slug ? "text-white" : "text-gray-700"}`}>
                  {categoria.name}
                </span>
              </div>
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