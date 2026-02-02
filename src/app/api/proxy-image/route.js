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

    // 1. Capturar el sello del navegador (If-None-Match)
    const browserEtag = request.headers.get('if-none-match') || request.headers.get('If-None-Match');

    try {
        const fetchHeaders = {
            'ngrok-skip-browser-warning': 'true',
            'Accept': 'image/*, */*',
        };

        // 2. Re-inyectar el sello para el Backend
        if (browserEtag) {
            fetchHeaders['If-None-Match'] = browserEtag;
        }

        // IMPORTANTE: 'cache: no-store' aquí le dice a Netlify que NO guarde nada él mismo,
        // lo que obliga a que pase la petición al backend para validar el ETag.
        const response = await fetch(targetUrl, {
            headers: fetchHeaders,
            cache: 'no-store'
        });

        // 3. Manejar la validación exitosa (304)
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

        // 4. Retornar con sello fuerte para la próxima vez
        const finalHeaders = new Headers();
        finalHeaders.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        finalHeaders.set('Cache-Control', 'public, max-age=2592000, immutable');

        const backendEtag = response.headers.get('ETag');
        if (backendEtag) {
            finalHeaders.set('ETag', backendEtag);
        }

        return new NextResponse(blob, { headers: finalHeaders });
    } catch (error) {
        console.error('Proxy image error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
