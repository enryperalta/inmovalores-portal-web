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
    const baseUrl = isDev
        ? 'http://127.0.0.1:8000'
        : 'https://theodore-unhasted-erlene.ngrok-free.dev';

    const targetUrl = `${baseUrl}/api/images/${filename}`;

    try {
        // Fetch a Ngrok SIN caché interna y con header
        const response = await fetch(targetUrl, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
            },
            cache: 'no-store' // Asegurar que siempre pida la nueva imagen
        });

        if (!response.ok) {
            return new NextResponse('Image not found', { status: response.status });
        }

        const blob = await response.blob();

        // Retornar la imagen SIN CACHÉ para evitar contaminación cruzada
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');

        return new NextResponse(blob, { headers });
    } catch (error) {
        console.error('Proxy image error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
