import Image from "next/image";

 type ProductCardsProps = {
  name: string;
  url: string;
  image: string;
  price: number;
};



export default function ProductCard({ name, url, image, price }: ProductCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      
        <div
          key={name}
          className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center hover:shadow-lg transition"
        >
          {/* Imagen */}
          <div className="w-28 h-28 relative">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain rounded-lg"
            />
          </div>

          {/* Nombre */}
          <h3 className="mt-2 text-sm text-shadow-2xs font-semibold text-gray-800 text-center">
            {name}
          </h3>

          <p>{price ? '$' + price : 'Sin precio'}</p>

          {/* Link */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-xs font-light text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-800 transition"
          >
            Ver producto
          </a>
        </div>
      
    </div>
  );
}
