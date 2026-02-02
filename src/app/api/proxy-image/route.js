import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return new NextResponse('Filename required', { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    const targetUrl = `${baseUrl}/api/images/${filename}`;

    // 1. Obtener el ETag que el navegador YA tiene guardado
    const browserEtag = request.headers.get('if-none-match');
    console.log(`[PROXY DEBUG] Filename: ${filename} | Browser ETag: ${browserEtag}`);

    try {
        const fetchHeaders = {
            'ngrok-skip-browser-warning': 'true',
        };

        // 2. Preguntarle al backend: "¿Ha cambiado esta foto desde mi versión?"
        if (browserEtag) {
            fetchHeaders['if-none-match'] = browserEtag;
        }

        const response = await fetch(targetUrl, {
            headers: fetchHeaders,
            // Permitir que Next.js cachee esta petición en su propia red (Edge Cache)
            next: { revalidate: 3600 }
        });

        // 3. Si el backend responde 304 (No ha cambiado), le decimos lo mismo al navegador
        if (response.status === 304) {
            return new NextResponse(null, {
                status: 304,
                headers: {
                    'Cache-Control': 'public, max-age=2592000, immutable',
                    'ETag': browserEtag
                }
            });
        }

        if (!response.ok) {
            return new NextResponse('Image not found', { status: response.status });
        }

        const blob = await response.blob();

        // 4. Si la foto es nueva o cambió, enviarla con cacheo agresivo
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Cache-Control', 'public, max-age=2592000, immutable');

        const backendEtag = response.headers.get('ETag');
        if (backendEtag) {
            headers.set('ETag', backendEtag);
        }

        return new NextResponse(blob, { headers });
    } catch (error) {
        console.error('Proxy image error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
