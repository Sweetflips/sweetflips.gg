import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Read the WebGL index.html file using fetch
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const webglUrl = `${baseUrl}/webgl/index.html`;
        const response = await fetch(webglUrl);

        if (!response.ok) {
            throw new Error('WebGL content not found');
        }

        const fileContent = await response.text();

        // Return the HTML content with proper headers
        return new Response(fileContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error serving WebGL content:', error);
        return new Response('WebGL content not found', { status: 404 });
    }
}
