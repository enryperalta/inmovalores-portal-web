import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return new NextResponse('Filename required', { status: 400 });
    }

    // Optimización: En desarrollo local, usar localhost directo
    // En producción (Netlify), usar Ngrok
    const isDev = process.env.NODE_ENV === 'development';
    // Obtener la URL base desde las variables de entorno para evitar hardcoding
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

    const targetUrl = `${baseUrl}/api/images/${filename}`;

    try {
        // Fetch a la imagen con el header de skip de ngrok
        const response = await fetch(targetUrl, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
        });

        if (!response.ok) {
            return new NextResponse('Image not found', { status: response.status });
        }

        const blob = await response.blob();

        // 🚀 MEJORA: Añadir headers de CACHÉ AGRESIVA para que las imágenes "permanezcan"
        // incluso si el túnel se cierra después de la primera carga.
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 año de caché
        headers.set('Vary', 'Accept');

        return new NextResponse(blob, { headers });
    } catch (error) {
        console.error('Proxy image error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
