import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
    try {
        // Read the WebGL index.html file directly from filesystem
        const filePath = join(process.cwd(), 'public', 'webgl', 'index.html');
        const fileContent = readFileSync(filePath, 'utf-8');

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
