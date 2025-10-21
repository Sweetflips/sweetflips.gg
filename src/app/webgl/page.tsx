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

    // Define Unity variables that the loader script expects
    const container = document.querySelector("#unity-container");
    const canvas = document.querySelector("#unity-canvas");
    const loadingBar = document.querySelector("#unity-loading-bar");
    const progressBarFull = document.querySelector("#unity-progress-bar-full");
    const fullscreenButton = document.querySelector("#unity-fullscreen-button");
    const warningBanner = document.querySelector("#unity-warning");

    // Shows a temporary message banner/ribbon for a few seconds, or
    // a permanent error message on top of the canvas if type=='error'.
    // If type=='warning', a yellow highlight color is used.
    function unityShowBanner(msg: string, type: string) {
      function updateBannerVisibility() {
        if (warningBanner) {
          (warningBanner as HTMLElement).style.display = warningBanner.children.length ? 'block' : 'none';
        }
      }
      const div = document.createElement('div');
      div.innerHTML = msg;
      if (warningBanner) {
        warningBanner.appendChild(div);
      }
      if (type == 'error') div.style.cssText = 'background: red; padding: 10px;';
      else {
        if (type == 'warning') div.style.cssText = 'background: yellow; padding: 10px;';
        setTimeout(function () {
          if (warningBanner && warningBanner.contains(div)) {
            warningBanner.removeChild(div);
          }
          updateBannerVisibility();
        }, 5000);
      }
      updateBannerVisibility();
    }

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
          showBanner: unityShowBanner,
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

  // Handle mobile responsive canvas sizing like original HTML
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const canvas = document.querySelector("#unity-canvas") as HTMLCanvasElement;
      const container = document.querySelector("#unity-container") as HTMLElement;

      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    // Handle mobile device detection and responsive setup
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
      document.getElementsByTagName('head')[0].appendChild(meta);

      const container = document.querySelector("#unity-container");
      const canvas = document.querySelector("#unity-canvas");
      if (container) (container as HTMLElement).className = "unity-mobile";
      if (canvas) (canvas as HTMLElement).className = "unity-mobile";
    } else {
      // Desktop style: Make canvas responsive
      const canvas = document.querySelector("#unity-canvas") as HTMLElement;
      if (canvas) {
        canvas.style.width = "100%";
        canvas.style.height = "100%";
      }
    }

    // Initial resize after a short delay
    setTimeout(handleResize, 100);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Add Unity callback functions that the build expects
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Function to be called when avatar is saved (from Unity)
    (window as any).onAvatarSaved = function (avatarData: any) {
      console.log('Avatar saved:', avatarData);
      // Send message to parent window
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'avatar-saved',
          data: avatarData
        }, '*');
      }
    };

    // Functions to provide auth data to Unity
    (window as any).GetAuthTokenFromJS = function () {
      // Try to get token from localStorage or parent window
      const token = localStorage.getItem('supabase.auth.token') ||
        localStorage.getItem('sb-qzdxgtegacnkmeninxww-auth-token');
      return token || '';
    };

    (window as any).GetUserIdFromJS = function () {
      // Try to get user ID from localStorage or parent window
      const userId = localStorage.getItem('supabase.user.id') ||
        localStorage.getItem('sb-qzdxgtegacnkmeninxww-user-id');
      return userId || '';
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#1b1324] overflow-hidden">
      <div id="unity-container" className="unity-desktop">
        <canvas
          ref={canvasRef}
          id="unity-canvas"
          className="w-full h-full"
          width={960}
          height={600}
          tabIndex={-1}
        />
        <div id="unity-loading-bar">
          <div id="unity-logo"></div>
          <div id="unity-progress-bar-empty">
            <div id="unity-progress-bar-full"></div>
          </div>
        </div>
        <div id="unity-warning"></div>
        <div id="unity-footer">
          <div id="unity-webgl-logo"></div>
          <div id="unity-fullscreen-button"></div>
          <div id="unity-build-title">Sweetflips</div>
        </div>
      </div>
    </div>
  );
}
