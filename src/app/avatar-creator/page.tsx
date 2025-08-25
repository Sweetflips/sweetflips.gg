"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Script from 'next/script';

declare global {
  interface Window {
    createUnityInstance: any;
    unityInstance: any;
  }
}

export default function AvatarCreatorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize Unity when the loader script is ready
    const initUnity = async () => {
      if (!window.createUnityInstance || !canvasRef.current) {
        console.log('Waiting for Unity loader or canvas...');
        return;
      }

      const buildUrl = '/webgl/Build';
      const config = {
        dataUrl: `${buildUrl}/Build.data.gz`,
        frameworkUrl: `${buildUrl}/Build.framework.js.gz`,
        codeUrl: `${buildUrl}/Build.wasm.gz`,
        streamingAssetsUrl: 'StreamingAssets',
        companyName: 'Sweetflips',
        productName: 'Avatar Creator',
        productVersion: '1.0.0',
      };

      try {
        setLoading(true);
        
        const instance = await window.createUnityInstance(
          canvasRef.current,
          config,
          (progress: number) => {
            setProgress(Math.round(progress * 100));
          }
        );
        
        window.unityInstance = instance;
        
        // Pass user info to Unity if authenticated
        if (user) {
          setTimeout(() => {
            // Send user ID to Unity
            instance.SendMessage('AuthManager', 'SetUserId', user.id.toString());
            
            // If you have an auth token, send it too
            const token = localStorage.getItem('supabase.auth.token');
            if (token) {
              instance.SendMessage('AuthManager', 'SetAuthToken', token);
            }
          }, 2000); // Wait for Unity to initialize
        }
        
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Failed to load Unity:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Unity WebGL content');
        setLoading(false);
      }
    };

    // Try to initialize Unity when component mounts
    const checkAndInit = setInterval(() => {
      if (window.createUnityInstance) {
        clearInterval(checkAndInit);
        initUnity();
      }
    }, 100);

    return () => {
      clearInterval(checkAndInit);
      if (window.unityInstance) {
        window.unityInstance.Quit().then(() => {
          window.unityInstance = null;
        });
      }
    };
  }, [user]);

  // Function to be called from Unity
  useEffect(() => {
    // Add global functions for Unity to call
    (window as any).OnAvatarCreated = (avatarData: string) => {
      console.log('Avatar created:', avatarData);
      // Handle avatar creation
    };

    (window as any).OnAvatarError = (error: string) => {
      console.error('Avatar error:', error);
      setError(error);
    };

    return () => {
      delete (window as any).OnAvatarCreated;
      delete (window as any).OnAvatarError;
    };
  }, []);

  return (
    <>
      <Script 
        src="/webgl/Build/Build.loader.js"
        strategy="afterInteractive"
        onLoad={() => console.log('Unity loader script loaded')}
        onError={(e) => {
          console.error('Failed to load Unity loader:', e);
          setError('Failed to load Unity loader script');
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Avatar Creator
          </h1>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-4 max-w-2xl mx-auto">
              <h3 className="font-bold mb-2">Error Loading Avatar Creator</h3>
              <p>{error}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Troubleshooting</summary>
                <ul className="mt-2 text-sm list-disc list-inside">
                  <li>Check that Unity WebGL files are in /public/webgl/Build/</li>
                  <li>Ensure files are named: Build.data.gz, Build.framework.js.gz, Build.loader.js, Build.wasm.gz</li>
                  <li>Check browser console for detailed errors</li>
                  <li>Try refreshing the page</li>
                </ul>
              </details>
            </div>
          )}
          
          <div className="relative max-w-6xl mx-auto">
            {loading && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                  <p className="text-white text-xl mb-2">Loading Avatar Creator...</p>
                  <div className="w-64 bg-gray-700 rounded-full h-3 mx-auto">
                    <div 
                      className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-white/70 mt-2">{progress}%</p>
                </div>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              className="w-full rounded-lg shadow-2xl"
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '16/9',
                maxWidth: '1200px',
                backgroundColor: '#000'
              }}
            />
          </div>
          
          {!user && (
            <div className="mt-8 text-center text-white/70">
              <p>Sign in to save your avatar to your profile</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}