import { getPropertyBySlug, getPropertyAssignment } from '@/lib/api';
import PropertyDetailClient from '@/components/PropertyDetailClient';
import Link from 'next/link';

// Configuración ISR (Incremental Static Regeneration)
// Revalidar cada 1 hora (3600 segundos) para mantener buen performance y datos frescos
export const revalidate = 3600;

// Generar Metadata para SEO y Facebook (OpenGraph)
export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    let slug = resolvedParams.slug;
    if (Array.isArray(slug)) slug = slug.join('/');

    try {
        const property = await getPropertyBySlug(slug);
        if (!property) return { title: 'Propiedad no encontrada | Inmovalores' };

        const title = `${property.title} | Inmovalores`;
        const description = property.description ? property.description.substring(0, 160) : 'Propiedad en venta/renta con Inmovalores.';
        const images = property.images && property.images.length > 0
            ? [property.images[0].startsWith('http') ? property.images[0] : `https://inmovalores.com${property.images[0]}`]
            : [];

        return {
            title: title,
            description: description,
            openGraph: {
                title: title,
                description: description,
                images: images,
                url: `https://inmovalores.com/property-${property.unique_id?.toLowerCase() || slug}.html`,
                type: 'website',
            },
        };
    } catch (error) {
        return { title: 'Inmovalores' };
    }
}

export default async function LegacyPropertyPage({ params }) {
    // IMPORTANTE: Next.js 15 params es async
    const resolvedParams = await params;
    let slug = resolvedParams.slug;
    if (Array.isArray(slug)) slug = slug.join('/');

    try {
        // 1. Buscar propiedad por slug (esto llamará al backend que limpia property- y .html)
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
