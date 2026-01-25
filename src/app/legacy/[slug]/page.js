import { getPropertyBySlug, getPropertyAssignment } from '@/lib/api';
import PropertyDetailClient from '@/components/PropertyDetailClient';
import Link from 'next/link';

// Server Component para URLs Legacy (property-xxxx.html)
export const dynamic = 'force-dynamic';

export default async function LegacyPropertyPage({ params }) {
    // El slug viene del rewrite en next.config.mjs (ej: "property-pro-2026-043")
    // Pero como el rewrite captura todo antes de .html, puede ser "pro-2026-043" si el rewrite lo limpia
    // En nuestro caso, el rewrite es destination: '/legacy/:slug*'
    // Y el source es `/:slug*.html`.
    // Si la URL es `/property-pro-123.html`, slug será `['property-pro-123']` (array) o string?
    // En [...slug] sería array. En [slug] simple, el rewrite puede ser tricky con paths complejos.
    // Asumiremos que nos llega la parte antes de .html

    // IMPORTANTE: Next.js 15 params es async
    const resolvedParams = await params;
    // Si capture es wildcard :slug*, esto devuelve un array. Vamos a unirlo.
    // Si definimos la carpeta como [slug] simple, solo captura un segmento.
    // Si definimos [...slug], captura varios. Mejor usar [...slug] por seguridad si hay slashes,
    // pero las URLs legacy suelen ser planas.
    // Dado que crearemos la carpeta como [slug], asumimos string simple.

    let slug = resolvedParams.slug;
    if (Array.isArray(slug)) slug = slug.join('/');

    try {
        // 1. Buscar propiedad por slug
        const property = await getPropertyBySlug(slug);

        if (!property) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center text-[#1A1A1A]">
                    <h1 className="text-4xl font-black mb-4">404</h1>
                    <p className="text-xl text-gray-500 mb-8">Propiedad no encontrada (Enlace antiguo roto).</p>
                    <Link href="/" className="px-8 py-3 bg-[#137fec] text-white font-bold rounded-lg shadow-lg">
                        Ver propiedades disponibles
                    </Link>
                </div>
            );
        }

        // 2. Buscar asignación usando el ID de la propiedad encontrada
        const assignment = await getPropertyAssignment(property.id);

        // Preparar datos del agente
        const agent = {
            name: assignment?.assigned ? assignment.assignments[0]?.agent_name : "Roselia Figueroa",
            phone: assignment?.assigned ? assignment.assignments[0]?.agent_phone : "+502 34117103",
            email: assignment?.assigned ? assignment.assignments[0]?.agent_email : "zaraross78@gmail.com",
        };

        // Renderizar componente cliente (reutilizado)
        return <PropertyDetailClient property={property} agent={agent} />;

    } catch (error) {
        console.error("❌ Error loading legacy property:", error);
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center text-[#1A1A1A]">
                <h1 className="text-4xl font-black mb-4 text-red-600">Error</h1>
                <Link href="/" className="px-8 py-3 bg-[#137fec] text-white font-bold rounded-lg shadow-lg">
                    Volver al inicio
                </Link>
            </div>
        );
    }
}
