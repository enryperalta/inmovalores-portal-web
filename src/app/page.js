import { getProperties } from '@/lib/api';
import SearchBar from '@/components/SearchBar';
import FilteredPropertyGrid from '@/components/FilteredPropertyGrid';
import { Suspense } from 'react';

// Revalidación: Solo on-demand (cuando el backend notifique cambios)
export const revalidate = false;

export default async function Home() {
  // 1. Obtener todas las propiedades (esto se cachea en Netlify)
  const properties = await getProperties();

  // 2. Extraer opciones para los filtros
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

          <Suspense fallback={<div className="text-center py-20 font-bold text-gray-400">Cargando portafolio...</div>}>
            <FilteredPropertyGrid initialProperties={properties} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
