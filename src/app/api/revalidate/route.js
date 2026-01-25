import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Verificar token de seguridad
        const authHeader = request.headers.get('authorization');
        const expectedToken = process.env.REVALIDATE_TOKEN;

        if (!expectedToken) {
            console.error('⚠️ REVALIDATE_TOKEN not configured');
            return NextResponse.json(
                { message: 'Revalidation not configured' },
                { status: 500 }
            );
        }

        if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
            console.error('❌ Unauthorized revalidation attempt');
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { path, type } = body;

        console.log(`🔄 Revalidation request received:`, { path, type });

        // Revalidar según el tipo de acción
        if (type === 'property') {
            // Revalidar lista de propiedades
            revalidateTag('properties');
            revalidatePath('/');
            revalidatePath('/properties');

            console.log('✅ Revalidated tag: properties');

            // Si se proporciona path específico (que contiene el ID implícitamente si extraemos lógica, pero path es más seguro para start)
            // Ideally el backend debería mandar ID para usar tag property-ID
            if (path) {
                revalidatePath(path);
                console.log(`✅ Revalidated path: ${path}`);
            }
        } else if (type === 'all') {
            // Revalidar TODO el sitio usando Tags y Layout
            revalidateTag('properties'); // Borra caché de fetch de todas las propiedades
            revalidatePath('/', 'layout');
            console.log('✅ Revalidated tag: properties & layout');
        } else if (path) {
            // Revalidar path específico
            revalidatePath(path);
            console.log(`✅ Revalidated: ${path}`);
        }

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            path: path || 'multiple paths',
            type: type || 'custom'
        });

    } catch (err) {
        console.error('❌ Error revalidating:', err);
        return NextResponse.json(
            { message: 'Error revalidating', error: err.message },
            { status: 500 }
        );
    }
}

// Manejar método GET (para verificar que el endpoint existe)
export async function GET() {
    return NextResponse.json({
        message: 'Revalidation endpoint is active',
        method: 'POST required'
    });
}
