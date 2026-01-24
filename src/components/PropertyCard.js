'use client';

import Link from 'next/link';

export default function PropertyCard({ property }) {
    const images = property.images ? (typeof property.images === 'string' ? JSON.parse(property.images) : property.images) : [];
    const mainImage = images.length > 0 ? images[0] : null;

    const getImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/800x600?text=Sin+Imagen';
        if (img.startsWith('http')) return img;

        // El backend monta uploads/images en /api/images
        // Si la ruta guardada incluye 'uploads/images/', la limpiamos
        let fileName = img.replace('uploads/images/', '').replace('uploads\\images\\', '');
        return `http://localhost:8000/api/images/${fileName}`;
    };

    let statusText = property.status || 'Disponible';
    const statusLower = statusText.toLowerCase();

    if (statusLower.includes('requerimiento')) {
        statusText = 'REQUERIMIENTO';
    } else if (statusLower.includes('pendiente')) {
        statusText = 'PENDIENTE';
    } else if (statusLower.includes('ven') && (statusLower.includes('dido') || statusLower.includes('dida'))) {
        statusText = 'VENDIDA';
    } else if (statusLower === 'sale' || statusLower === 'venta') {
        statusText = 'EN VENTA';
    } else if (statusLower.includes('rent') || statusLower.includes('alquiler')) {
        statusText = 'EN ALQUILER';
    } else {
        statusText = statusText.toUpperCase();
    }

    return (
        <Link href={`/properties/${property.id}`} className="group cursor-pointer animate-fade-in block">
            <div className="relative overflow-hidden rounded-lg mb-6 shadow-lg aspect-[3/2] bg-gray-200">
                <img
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={getImageUrl(mainImage)}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Error+Imagen';
                    }}
                />
                <div className="absolute top-4 left-4 bg-white/90 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-[#1A1A1A] backdrop-blur uppercase">
                    {statusText}
                </div>
                <div className="absolute bottom-4 right-4 bg-[#137fec] text-white px-5 py-2 rounded-lg text-lg font-bold shadow-lg">
                    {property.currency || 'Q'} {parseFloat(property.price || 0).toLocaleString()}
                </div>
            </div>
            <h3 className="text-2xl font-extrabold mb-2 group-hover:text-[#137fec] transition-colors line-clamp-1 text-[#1A1A1A]">
                {property.title || 'Sin título'}
            </h3>
            <p className="text-gray-500 flex items-center gap-1 mb-4 text-sm font-medium">
                <span className="material-symbols-outlined !text-sm text-[#137fec]">location_on</span>
                {property.address || property.municipality || 'Ubicación no disponible'}
            </p>
            <div className="flex items-center gap-6 py-4 border-t border-gray-100">
                {property.bedrooms > 0 && (
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                        <span className="material-symbols-outlined !text-xl text-[#137fec]">bed</span> {property.bedrooms} <span className="font-medium text-gray-500">Hab.</span>
                    </div>
                )}
                {parseFloat(property.bathrooms || 0) > 0 && (
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                        <span className="material-symbols-outlined !text-xl text-[#137fec]">bathtub</span> {property.bathrooms} <span className="font-medium text-gray-500">Baños</span>
                    </div>
                )}
                {(parseFloat(property.area || 0) > 0 || parseFloat(property.land_area || 0) > 0) && (
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                        <span className="material-symbols-outlined !text-xl text-[#137fec]">square_foot</span> {property.area || property.land_area} <span className="font-medium text-gray-500">m²</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
