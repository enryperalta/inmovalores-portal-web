'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchBar({ locations, types }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState({
        l: '',
        type: '',
        t: ''
    });

    useEffect(() => {
        setFilters({
            l: searchParams.get('l') || '',
            type: searchParams.get('type') || '',
            t: searchParams.get('t') || ''
        });
    }, [searchParams]);

    const updateSearch = (newFilters) => {
        const params = new URLSearchParams();
        if (newFilters.l) params.set('l', newFilters.l);
        if (newFilters.type) params.set('type', newFilters.type);
        if (newFilters.t) params.set('t', newFilters.t);

        router.push(`/?${params.toString()}`, { scroll: false });

        // Optional: Scroll to grid on change
        setTimeout(() => {
            document.getElementById('properties-grid')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...filters, [name]: value };
        setFilters(updated);
        updateSearch(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSearch(filters);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-2 rounded-xl shadow-2xl flex flex-col lg:flex-row items-center border border-white/20">
            <div className="flex flex-col lg:flex-row w-full divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                {/* Localización */}
                <div className="flex-1 flex items-center gap-4 px-8 py-5 group cursor-pointer">
                    <span className="material-symbols-outlined text-[#137fec] !text-3xl">location_on</span>
                    <div className="text-left flex-1 font-display">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Localización</label>
                        <select
                            name="l"
                            value={filters.l}
                            onChange={handleSelectChange}
                            className="w-full bg-transparent border-none p-0 text-[#1A1A1A] font-extrabold focus:ring-0 text-lg appearance-none cursor-pointer outline-none"
                        >
                            <option value="">Todas</option>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>
                </div>

                {/* Tipo de Propiedad */}
                <div className="flex-1 flex items-center gap-4 px-8 py-5 group cursor-pointer">
                    <span className="material-symbols-outlined text-[#137fec] !text-3xl">home</span>
                    <div className="text-left flex-1 font-display">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Tipo de Propiedad</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleSelectChange}
                            className="w-full bg-transparent border-none p-0 text-[#1A1A1A] font-extrabold focus:ring-0 text-lg appearance-none cursor-pointer outline-none"
                        >
                            <option value="">Todos</option>
                            {types.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>

                {/* Transacción */}
                <div className="flex-1 flex items-center gap-4 px-8 py-5 group cursor-pointer">
                    <span className="material-symbols-outlined text-[#137fec] !text-3xl">sell</span>
                    <div className="text-left flex-1 font-display">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Transacción</label>
                        <select
                            name="t"
                            value={filters.t}
                            onChange={handleSelectChange}
                            className="w-full bg-transparent border-none p-0 text-[#1A1A1A] font-extrabold focus:ring-0 text-lg appearance-none cursor-pointer outline-none"
                        >
                            <option value="">Cualquiera</option>
                            <option value="venta">Comprar</option>
                            <option value="alquiler">Alquilar</option>
                        </select>
                    </div>
                </div>

                {/* Botón Buscar */}
                <div className="p-2 min-w-[200px]">
                    <button
                        type="submit"
                        className="w-full h-full px-8 py-5 bg-[#137fec] text-white font-black rounded-lg flex items-center justify-center gap-3 hover:bg-[#137fec]/90 transition-all shadow-xl shadow-[#137fec]/20"
                    >
                        <span className="material-symbols-outlined !text-2xl">search</span>
                        <span className="text-lg uppercase">Search</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
