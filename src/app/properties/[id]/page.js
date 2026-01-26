import { getProperty, getPropertyAssignment } from '@/lib/api';
import PropertyDetailClient from '@/components/PropertyDetailClient';
import Link from 'next/link';

// Configuración ISR (Incremental Static Regeneration)
// Revalidar cada 1 hora (3600 segundos)
export const revalidate = 3600;

// Generar Metadata para SEO y Facebook/WhatsApp (OpenGraph)
export async function generateMetadata({ params }) {
    const { id } = await params;

    try {
        const property = await getProperty(id);
        if (!property) return { title: 'Propiedad no encontrada | Inmovalores' };

        const title = `${property.title} | Inmovalores`;
        const description = property.description ? property.description.substring(0, 160) : 'Propiedad en venta/renta con Inmovalores.';

        // Construir URL absoluta para la imagen
        // WhatsApp requiere URL completa (https://...)
        const imageUrl = property.images && property.images.length > 0
            ? (property.images[0].startsWith('http') ? property.images[0] : `https://inmovalores.com${property.images[0]}`)
            : 'https://inmovalores.com/default-property.jpg'; // Imagen por defecto si no hay

        // Determinar URL canónica de la propiedad
        // Preferimos el formato legacy si tiene unique_id, o el nuevo si no
        const propertyUrl = property.unique_id
            ? `https://inmovalores.com/property-${property.unique_id.toLowerCase()}.html`
            : `https://inmovalores.com/properties/${id}`;

        return {
            title: title,
            description: description,
            openGraph: {
                title: title,
                description: description,
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: title,
                    }
                ],
                url: propertyUrl,
                type: 'website',
                siteName: 'Inmovalores',
            },
            twitter: {
                card: 'summary_large_image',
                title: title,
                description: description,
                images: [imageUrl],
            },
        };
    } catch (error) {
        return {
            title: 'Inmovalores',
            description: 'Bienes raíces en Guatemala.'
        };
    }
}

export default async function PropertyDetailPage({ params }) {
    // Next.js 15: params es una promesa que debe esperarse
    const { id } = await params;

    try {
        // Ejecutar fetches en paralelo en el servidor
        const [property, assignment] = await Promise.all([
            getProperty(id),
            getPropertyAssignment(id)
        ]);

        if (!property) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center text-[#1A1A1A]">
                    <h1 className="text-4xl font-black mb-4">404</h1>
                    <p className="text-xl text-gray-500 mb-8">Esta propiedad no existe o no está disponible.</p>
                    <Link href="/" className="px-8 py-3 bg-[#137fec] text-white font-bold rounded-lg shadow-lg">
                        Volver al inicio
                    </Link>
                </div>
            );
        }

        // Preparar datos del agente (si no hay asignación, usar default)
        const agent = {
            name: assignment?.assigned ? assignment.assignments[0]?.agent_name : "Roselia Figueroa",
            phone: assignment?.assigned ? assignment.assignments[0]?.agent_phone : "+502 34117103",
            email: assignment?.assigned ? assignment.assignments[0]?.agent_email : "zaraross78@gmail.com",
        };

        // Renderizar componente cliente
        return <PropertyDetailClient property={property} agent={agent} />;

    } catch (error) {
        console.error("❌ Error loading property (Server Side):", error);

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center text-[#1A1A1A]">
                <h1 className="text-4xl font-black mb-4 text-red-600">Error</h1>
                <p className="text-xl text-gray-500 mb-4">No se pudo cargar la propiedad.</p>
                <div className="bg-gray-100 p-4 rounded-lg text-left text-sm font-mono max-w-lg overflow-auto mb-8">
                    <p><strong>Detalle:</strong> {error.message}</p>
                </div>
                <Link href="/" className="px-8 py-3 bg-[#137fec] text-white font-bold rounded-lg shadow-lg">
                    Volver al inicio
                </Link>
            </div>
        );
    }
}
