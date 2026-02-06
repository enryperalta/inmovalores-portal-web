import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return new NextResponse('Filename required', { status: 400 });
    }

    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1);

    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    const targetUrl = `${baseUrl}/api/images/${filename}`;

    try {
        const response = await fetch(targetUrl, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
            cache: 'no-store'
        });

        if (response.status === 304) {
            return new NextResponse(null, { status: 304 });
        }

        if (!response.ok) {
            return new NextResponse('Not found', { status: 404 });
        }

        const buffer = await response.arrayBuffer();

        // Detección ultra-simplificada para evitar errores
        const name = filename.toLowerCase();
        let type = 'image/jpeg';
        if (name.endsWith('.webp')) type = 'image/webp';
        else if (name.endsWith('.png')) type = 'image/png';
        else if (name.endsWith('.gif')) type = 'image/gif';

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': type,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Proxy-Version': '3.0', // CAMBIO CRÍTICO: Para verificar si el código se actualizó
                'X-Original-Backend-Type': response.headers.get('Content-Type') || 'unknown'
            }
        });
    } catch (error) {
        return new NextResponse('Proxy error', { status: 500 });
    }
}
