import { getProperties } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';

// Revalidación: Solo on-demand (cuando el backend notifique cambios)
// El backend llamará a /api/revalidate cuando se cree/edite/elimine una propiedad
export const revalidate = false; // Desactivar revalidación automática

export default async function Home({ searchParams }) {
  const properties = await getProperties();

  // Destructure search params (await for Next.js 15 consistency)
  const params = await searchParams;
  const { l, type, t } = params;

  console.log('Search Params Received:', { l, type, t });
  console.log('Total Properties before filter:', properties.length);

  // Filtering logic
  let filteredProperties = properties.filter(p => {
    const status = (p.status || '').toLowerCase().trim();
    const pType = (p.type || '').toLowerCase().trim();
    const pLoc = (p.municipality || '').toLowerCase().trim();

    // 1. EXCLUDE specific statuses
    if (status === 'pendiente' ||
      status === 'vendida' ||
      status === 'vendido' ||
      status.includes('requerimiento')) {
      return false;
    }

    // 2. Transaction Filter (t)
    if (t) {
      const tLower = t.toLowerCase().trim();
      if (tLower === 'venta') {
        if (!(status.includes('venta') || status.includes('sale'))) return false;
      } else if (tLower === 'alquiler') {
        if (!(status.includes('alquiler') || status.includes('rent'))) return false;
      }
    }

    // 3. Location Filter (l)
    if (l) {
      const pMunicipality = (p.municipality || '').toLowerCase().trim();
      const searchLoc = decodeURIComponent(l).toLowerCase().trim();
      if (pMunicipality !== searchLoc) return false;
    }

    // 4. Type Filter (type)
    if (type) {
      const pTypeClean = (p.type || '').toLowerCase().trim();
      const searchType = decodeURIComponent(type).toLowerCase().trim();
      if (pTypeClean !== searchType) return false;
    }

    return true;
  });

  console.log('Total Properties after filter:', filteredProperties.length);

  // Extract unique locations and types for the filter bar
  const locations = [...new Set(properties.map(p => p.municipality).filter(Boolean))].sort();
  const types = [...new Set(properties.map(p => p.type).filter(Boolean))].sort();

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[750px] w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img
            alt="Hero Background"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjx1tsqlW9JY6f6V4hBAn14yCymsxX8BAJz4zpaP1_i5elQPvlfYZ6PSPULjAxbdrE3nqFYERcuTIhNt8p3rumZYe-uUGK_YuozU8EkxhTfCs8f99DkURP70u02fswXwhb5nuTh9VlaI71tEfZ4dnWJ0SK7qsyC6AcEIS4A_O8kfCqizpsBwVB0u6bFQPmhhvn1FCPDX5E3UjxtrH6pskdNpNE1otMm4m6NhnfjtVAOWoGV8JemlT-rhYo2HhEcFrME3lPXH3EgSU"
          />
        </div>

        <div className="relative z-20 max-w-5xl animate-fade-in w-full px-6">
          <h1 className="text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
            Encuentra tu Hogar <br />
            <span className="text-[#137fec] italic">Soñado</span>
          </h1>
          <p className="text-base lg:text-xl text-white/90 max-w-3xl mx-auto mb-14 font-medium leading-relaxed">
            Tu aliado experto para comprar, vender o alquilar. Encontramos la opción perfecta para ti, desde lo más accesible hasta lo más exclusivo.
          </p>

          <SearchBar locations={locations} types={types} />
        </div>
      </section>

      {/* Featured Properties */}
      <section id="properties-grid" className="py-24 bg-[#f6f7f8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h4 className="text-[#137fec] font-bold text-sm uppercase tracking-[0.2em] mb-4">DESCUBRE NUESTRO PORTAFOLIO</h4>
            <h2 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] leading-tight">
              Propiedades <span className="text-[#137fec] italic">Destacadas</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="py-32 text-center bg-white rounded-xl shadow-sm border border-gray-100 italic font-medium text-gray-400 text-xl">
              No se encontraron propiedades que coincidan con los criterios seleccionados.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
