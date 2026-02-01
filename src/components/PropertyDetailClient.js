'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createLead } from '@/lib/api';

export default function PropertyDetailClient({ property, agent }) {
    const [activeImage, setActiveImage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('descripcion');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState({ loading: false, success: false, error: null });

    // Update message when property changes
    useEffect(() => {
        if (property) {
            setFormData(prev => ({
                ...prev,
                message: `Hola! quisiera mas informacion de la propiedad ${property.title} ID ${property.unique_id}`
            }));
        }
    }, [property]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: null });

        try {
            await createLead({
                ...formData,
                property_id: property.unique_id,
                property_title: property.title
            });
            setStatus({ loading: false, success: true, error: null });
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
        } catch (err) {
            console.error("Error submitting lead:", err);
            setStatus({ loading: false, success: false, error: err.message });
        }
    };

    // Parse images safely
    const images = property.images ? (typeof property.images === 'string' ? JSON.parse(property.images) : property.images) : [];

    // Helper url
    const getImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/800x600?text=Sin+Imagen';
        if (img.startsWith('http')) return img;
        let fileName = img.replace('uploads/images/', '').replace('uploads\\images\\', '');

        // Usar nuestro PROXY local para saltar bloqueo de Ngrok
        return `/api/proxy-image?filename=${encodeURIComponent(fileName)}`;
    };

    const whatsappUrl = `https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola! Me interesa la propiedad: ${property.title} (ID: ${property.unique_id})`)}`;

    const openModal = (index) => {
        setModalIndex(index);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = '';
    };

    // Handle ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div className="bg-[#f6f7f8] pt-24 pb-20 font-display">
            {/* Header section */}
            <section className="bg-white border-b border-gray-100 py-8 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight">{property.title}</h1>
                        <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-gray-400">
                            <span className="bg-[#137fec] text-white px-3 py-1 rounded text-[11px] uppercase">{property.type}</span>
                            <span className="text-gray-300">•</span>
                            <span className="uppercase">{property.status}</span>
                            <span className="text-gray-300">•</span>
                            <span>{property.address}{property.municipality ? `, ${property.municipality}` : ''}</span>
                            <span className="text-gray-300">•</span>
                            <span>ID: {property.unique_id}</span>
                        </div>
                    </div>
                    <div className="lg:text-right">
                        <div className="bg-white text-[#137fec] border-2 border-[#137fec] px-6 py-3 rounded-lg shadow-xl shadow-[#137fec]/10">
                            <span className="text-2xl font-black tracking-tighter">
                                {property.currency} {parseFloat(property.price || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 mt-10">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left Column */}
                    <div className="lg:w-2/3 space-y-8">
                        {/* Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-[16/10] bg-white rounded-xl overflow-hidden shadow-lg relative group border border-gray-100 cursor-zoom-in" onClick={() => openModal(activeImage)}>
                                <img
                                    src={getImageUrl(images[activeImage])}
                                    className="w-full h-full object-cover"
                                    alt={property.title}
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1)); }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0)); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                                        >
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails row */}
                            <div className="relative group">
                                <div className="flex gap-3 overflow-x-auto pb-6 custom-scrollbar scroll-smooth px-1">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-[#137fec] shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        >
                                            <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8 min-h-[400px]">
                            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-2">
                                <button onClick={() => setActiveTab('descripcion')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTab === 'descripcion' ? 'bg-[#137fec] text-white shadow-lg' : 'text-gray-400 hover:text-[#137fec]'}`}>Descripción</button>
                                <button onClick={() => setActiveTab('direccion')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTab === 'direccion' ? 'bg-[#137fec] text-white shadow-lg' : 'text-gray-400 hover:text-[#137fec]'}`}>Ubicación</button>
                                <button onClick={() => setActiveTab('detalles')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTab === 'detalles' ? 'bg-[#137fec] text-white shadow-lg' : 'text-gray-400 hover:text-[#137fec]'}`}>Detalles</button>
                                {property.amenities && (
                                    <button onClick={() => setActiveTab('servicios')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTab === 'servicios' ? 'bg-[#137fec] text-white shadow-lg' : 'text-gray-400 hover:text-[#137fec]'}`}>Servicios</button>
                                )}
                            </div>

                            <div className="py-2">
                                {activeTab === 'descripcion' && (
                                    <div className="text-[#1A1A1A] text-sm leading-relaxed whitespace-pre-line animate-fade-in font-medium">
                                        {property.description || "Esta propiedad ofrece una excelente oportunidad de inversión o vivienda familiar en una ubicación privilegiada. Cuenta con amplios espacios y acabados de primera calidad."}
                                    </div>
                                )}
                                {activeTab === 'detalles' && (
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 animate-fade-in text-sm font-medium">
                                        {[
                                            { label: 'Habitaciones', value: property.bedrooms },
                                            { label: 'Baños', value: property.bathrooms },
                                            { label: 'Construcción', value: `${property.area} m²` },
                                            { label: 'Terreno', value: `${property.land_area} m²` },
                                            { label: 'Niveles', value: property.levels || '2' },
                                            { label: 'Parqueos', value: property.parking || '2' },
                                            { label: 'Tipo', value: property.type },
                                            { label: 'Estado', value: property.status }
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex gap-2">
                                                <strong className="text-[#1A1A1A]">{item.label}:</strong>
                                                <span className="text-gray-500">{item.value || 'N/A'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {activeTab === 'direccion' && (
                                    <div className="animate-fade-in text-sm text-[#1A1A1A] font-medium">
                                        {property.address}, {property.municipality}, {property.department}
                                    </div>
                                )}
                                {activeTab === 'servicios' && (
                                    <div className="animate-fade-in space-y-2 text-sm text-[#1A1A1A] font-medium">
                                        {/* Amenidades de la base de datos exclusivamente */}
                                        {property.amenities && property.amenities.split(/[,\n\r]+/).map((amenity, idx) => {
                                            const trimmed = amenity.trim();
                                            if (!trimmed) return null;
                                            return (
                                                <p key={`am-${idx}`} className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-[#137fec] rounded-full"></span>
                                                    {trimmed}
                                                </p>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <aside className="lg:w-1/3 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-8 pb-4 text-center border-b border-gray-50 bg-[#f8fafc]">
                                <div className="w-full aspect-[4/3] mb-4 overflow-hidden rounded-xl bg-white border border-gray-100 flex items-center justify-center p-4 shadow-inner">
                                    <img src={getImageUrl('logo_inmovalores_header.png')} className="w-full h-full object-contain" alt="Inmovalores Logo" />
                                </div>
                            </div>
                            <div className="p-6 space-y-6 text-sm">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 uppercase tracking-tighter">{agent.name}</h3>
                                    <ul className="space-y-4 font-bold text-gray-500">
                                        <li className="flex items-center gap-3"><i className="fas fa-phone text-[#137fec] text-lg"></i> {agent.phone}</li>
                                        <li>
                                            <a href={whatsappUrl} target="_blank" className="flex items-center gap-3 text-[#25D366]">
                                                <i className="fab fa-whatsapp text-2xl"></i> {agent.phone}
                                            </a>
                                        </li>
                                        <li className="flex items-center gap-3"><i className="fas fa-envelope text-[#137fec] text-lg"></i> {agent.email}</li>
                                        <li className="flex items-center gap-3 overflow-hidden">
                                            <i className="fas fa-globe text-[#137fec] text-lg"></i>
                                            <a href="https://www.inmovalores.com" target="_blank" className="text-[#137fec] hover:underline truncate">www.inmovalores.com</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Contactar</h4>
                            <form className="space-y-4" onSubmit={handleFormSubmit}>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Tu Nombre"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3.5 placeholder:text-gray-400 text-sm focus:bg-white focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] outline-none transition-all"
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Tu correo"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3.5 placeholder:text-gray-400 text-sm focus:bg-white focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] outline-none transition-all"
                                    />
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="Teléfono"
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3.5 placeholder:text-gray-400 text-sm focus:bg-white focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] outline-none transition-all"
                                    />
                                    <textarea
                                        name="message"
                                        rows="4"
                                        placeholder="Tu Mensaje"
                                        value={formData.message}
                                        onChange={handleFormChange}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3.5 placeholder:text-gray-400 text-sm focus:bg-white focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] outline-none resize-none transition-all"
                                    ></textarea>
                                </div>

                                {status.error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 animate-pulse">
                                        {status.error}
                                    </div>
                                )}

                                {status.success && (
                                    <div className="p-3 bg-green-50 text-green-600 text-xs font-bold rounded-lg border border-green-100">
                                        ¡Mensaje enviado correctamente!
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status.loading}
                                    className="w-full py-4.5 bg-[#137fec] text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#137fec]/30 hover:bg-[#137fec]/90 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {status.loading ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
                                </button>
                            </form>
                        </div>
                    </aside>

                </div>
            </main>

            {/* FULLSCREEN GALLERY MODAL */}
            {isModalOpen && (
                <div className="gallery-modal-backdrop animate-fade-in">
                    {/* Header: Counter & Close */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                        <div className="bg-black/30 backdrop-blur-md text-white px-5 py-2 rounded-full font-bold text-sm">
                            {modalIndex + 1} / {images.length}
                        </div>
                        <button
                            onClick={closeModal}
                            className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md"
                        >
                            <span className="material-symbols-outlined !text-3xl">close</span>
                        </button>
                    </div>

                    {/* Main Image Container */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={getImageUrl(images[modalIndex])}
                            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl animate-fade-in"
                            alt={`Full ${modalIndex}`}
                        />

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setModalIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                    className="absolute left-4 lg:left-10 w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md"
                                >
                                    <span className="material-symbols-outlined !text-4xl">chevron_left</span>
                                </button>
                                <button
                                    onClick={() => setModalIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                    className="absolute right-4 lg:right-10 w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md"
                                >
                                    <span className="material-symbols-outlined !text-4xl">chevron_right</span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails Strip at Bottom */}
                    <div className="w-full max-w-5xl mt-8">
                        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar justify-center">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setModalIndex(idx)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${modalIndex === idx ? 'border-[#137fec] scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                >
                                    <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={`Modal Thumb ${idx}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
