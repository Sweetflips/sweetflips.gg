"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    createUnityInstance?: any;
    unityInstance?: any;
  }
}

export default function AvatarCreatorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, supabaseUser, supabaseClient } = useAuth();
  const router = useRouter();

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
        if (supabaseUser && supabaseClient) {
          setTimeout(async () => {
            try {
              // Get current session
              const { data: { session } } = await supabaseClient.auth.getSession();

              if (session?.access_token) {
                // Send auth data to Unity
                instance.SendMessage('AuthManager', 'SetAuthUserId', supabaseUser.id);
                instance.SendMessage('AuthManager', 'SetAuthToken', session.access_token);

                // Also store in localStorage for Unity WebGL access
                localStorage.setItem('supabase.auth.token', session.access_token);
                localStorage.setItem('supabase.user.id', supabaseUser.id);

                console.log('Auth data sent to Unity for user:', supabaseUser.id);
              } else {
                console.warn('No session available for Unity');
              }
            } catch (error) {
              console.error('Error getting session for Unity:', error);
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
  }, [supabaseUser, supabaseClient]);

  // Handle avatar creation and authentication
  const handleAvatarSaved = useCallback(async (avatarData: any) => {
    console.log('Avatar saved:', avatarData);

    if (!isLoggedIn || !supabaseUser) {
      console.log('User not authenticated, redirecting to login');
      router.push('/auth/signin?redirect=/avatar-creator');
      return;
    }

    try {
      // Get auth token
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session?.access_token) {
        console.error('No auth token available');
        router.push('/auth/signin?redirect=/avatar-creator');
        return;
      }

      // Upload avatar to API
      const response = await fetch('/api/avatar/upload-unity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: null, // Will be determined by auth_user_id
          avatarProperties: avatarData
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Avatar uploaded successfully:', result);

        // Redirect to chat with success parameter
        router.push('/chat?avatar_created=true');
      } else {
        console.error('Failed to upload avatar:', response.statusText);
        setError('Failed to save avatar. Please try again.');
      }
    } catch (error) {
      console.error('Error saving avatar:', error);
      setError('Failed to save avatar. Please try again.');
    }
  }, [isLoggedIn, supabaseUser, supabaseClient, router]);

  // Function to be called from Unity
  useEffect(() => {
    // Add global functions for Unity to call
    (window as any).OnAvatarCreated = (avatarData: string) => {
      console.log('Avatar created:', avatarData);
      handleAvatarSaved(JSON.parse(avatarData));
    };

    (window as any).OnAvatarError = (error: string) => {
      console.error('Avatar error:', error);
      setError(error);
    };

    // Listen for messages from Unity WebGL iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'avatar-saved') {
        handleAvatarSaved(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      delete (window as any).OnAvatarCreated;
      delete (window as any).OnAvatarError;
      window.removeEventListener('message', handleMessage);
    };
  }, [handleAvatarSaved]);

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

          {!isLoggedIn && (
            <div className="mt-8 text-center text-white/70">
              <p>Sign in to save your avatar to your profile</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
