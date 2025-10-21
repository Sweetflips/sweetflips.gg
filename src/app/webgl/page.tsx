'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Unity WebGL types
declare global {
    interface Window {
        createUnityInstance?: any;
        unityInstance?: any;
    }
}

export default function WebGLPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Load Unity WebGL loader script
        const script = document.createElement('script');
        script.src = '/webgl/Build/Build.loader.js';
        script.onload = () => {
            if (window.createUnityInstance && canvasRef.current) {
                const config = {
                    dataUrl: '/webgl/Build/Build.data.gz',
                    frameworkUrl: '/webgl/Build/Build.framework.js.gz',
                    codeUrl: '/webgl/Build/Build.wasm.gz',
                    streamingAssetsUrl: 'StreamingAssets',
                    companyName: 'Sweetflips',
                    productName: 'Avatar Creator',
                    productVersion: '1.0.0',
                };

                window.createUnityInstance(canvasRef.current, config, (progress: number) => {
                    console.log('Unity loading progress:', Math.round(progress * 100) + '%');
                }).then((unityInstance: any) => {
                    window.unityInstance = unityInstance;
                    console.log('Unity WebGL loaded successfully');
                }).catch((error: any) => {
                    console.error('Unity WebGL loading failed:', error);
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return (
        <div className="w-full h-screen bg-[#1b1324] overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                width={960}
                height={600}
                tabIndex={-1}
            />
        </div>
    );
}
