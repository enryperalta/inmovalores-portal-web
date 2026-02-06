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

    // 🕵️ DEBUG: Capturar qué ve Netlify del navegador
    const incomingHeaders = Array.from(request.headers.keys()).join(', ');

    // 1. Capturar el sello del navegador (Headers estándar y el secreto de blindaje)
    const browserEtag = request.headers.get('if-none-match') ||
        request.headers.get('If-None-Match') ||
        request.headers.get('x-inmo-version') ||
        request.headers.get('x-inmo-cache');

    try {
        const fetchHeaders = {
            'ngrok-skip-browser-warning': 'true',
            'Accept': 'image/*, */*',
        };

        // 2. Pasar el sello al Backend usando el canal de blindaje
        if (browserEtag) {
            const cleanTag = browserEtag.replace(/"/g, '').replace('W/', '').trim();
            fetchHeaders['If-None-Match'] = `"${cleanTag}"`;
            fetchHeaders['X-Inmo-Version'] = cleanTag;
        }

        const response = await fetch(targetUrl, {
            headers: fetchHeaders,
            cache: 'no-store'
        });

        // 3. Manejar 304 (Cache Match)
        if (response.status === 304) {
            return new NextResponse(null, {
                status: 304,
                headers: {
                    'Cache-Control': 'public, max-age=2592000, immutable',
                    'ETag': browserEtag,
                    'X-Inmo-Version': browserEtag,
                    'X-Proxy-Debug': `Recibido: ${incomingHeaders}`
                }
            });
        }

        if (!response.ok) {
            return new NextResponse('Image not found', { status: response.status });
        }

        const blob = await response.blob();

        // Determinar el MIME type correcto
        let contentType = response.headers.get('Content-Type');
        if (!contentType || contentType === 'application/octet-stream' || contentType === 'image/jpeg') {
            if (filename.endsWith('.webp')) contentType = 'image/webp';
            else if (filename.endsWith('.png')) contentType = 'image/png';
            else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';
        }

        // 4. Retornar con ambos sellos para asegurar el próximo ciclo
        const finalHeaders = new Headers();
        finalHeaders.set('Content-Type', contentType || 'image/jpeg');
        finalHeaders.set('Cache-Control', 'public, max-age=2592000, immutable');
        finalHeaders.set('X-Proxy-Debug', `Recibido: ${incomingHeaders}`);

        const backendEtag = response.headers.get('ETag') || response.headers.get('x-inmo-version');
        if (backendEtag) {
            const cleanBackendTag = backendEtag.replace(/"/g, '').replace('W/', '').trim();
            finalHeaders.set('ETag', `"${cleanBackendTag}"`);
            finalHeaders.set('X-Inmo-Version', cleanBackendTag);
        }

        return new NextResponse(blob, { headers: finalHeaders });
    } catch (error) {
        console.error('Proxy image error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
