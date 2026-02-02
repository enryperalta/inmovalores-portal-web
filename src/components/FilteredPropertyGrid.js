'use client';

import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import { useMemo } from 'react';

export default function FilteredPropertyGrid({ initialProperties }) {
    const searchParams = useSearchParams();

    // Filtros desde URL
    const l = searchParams.get('l');
    const type = searchParams.get('type');
    const t = searchParams.get('t');

    // Filtrado memoizado (solo se recalcula si cambian params o la lista base)
    const filteredProperties = useMemo(() => {
        return initialProperties.filter(p => {
            const status = (p.status || '').toLowerCase().trim();
            const pType = (p.type || '').toLowerCase().trim();

            // 1. Excluir estados no deseados
            if (status === 'pendiente' ||
                status === 'vendida' ||
                status === 'vendido' ||
                status.includes('requerimiento')) {
                return false;
            }

            // 2. Filtro de Transacción (Comprar/Alquilar)
            if (t) {
                const tLower = t.toLowerCase().trim();
                if (tLower === 'venta') {
                    if (!(status.includes('venta') || status.includes('sale'))) return false;
                } else if (tLower === 'alquiler') {
                    if (!(status.includes('alquiler') || status.includes('rent'))) return false;
                }
            }

            // 3. Filtro de Ubicación (l)
            if (l) {
                const pMunicipality = (p.municipality || '').toLowerCase().trim();
                const searchLoc = l.toLowerCase().trim();
                if (pMunicipality !== searchLoc) return false;
            }

            // 4. Filtro de Tipo (type)
            if (type) {
                const pTypeClean = (p.type || '').toLowerCase().trim();
                const searchType = type.toLowerCase().trim();
                if (pTypeClean !== searchType) return false;
            }

            return true;
        });
    }, [initialProperties, l, type, t]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
            ))}

            {filteredProperties.length === 0 && (
                <div className="col-span-full py-32 text-center bg-white rounded-xl shadow-sm border border-gray-100 italic font-medium text-gray-400 text-xl w-full">
                    No se encontraron propiedades que coincidan con los criterios seleccionados.
                </div>
            )}
        </div>
    );
}
