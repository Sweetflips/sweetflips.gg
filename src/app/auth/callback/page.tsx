'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/contexts/AuthContext';

const CallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { supabaseClient } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!searchParams) {
        console.error('[Auth Callback] ❌ searchParams is null');
        return;
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      // If provider returned an error, surface it and stop
      if (errorParam) {
        console.error(`[OAuth Callback] ❌ error from provider: ${errorParam}, state: ${state ?? 'none'}`);
        router.push('/auth/signin?error=' + encodeURIComponent(errorParam));
        return;
      }

      // Check for Supabase auth tokens (email verification)
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      // Handle Supabase email verification
      if (tokenHash && type) {
        try {
          const supabase = supabaseClient;
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });

          if (error) {
            console.error('Email verification error:', error);
            router.push('/auth/verify-email?error=' + encodeURIComponent(error.message));
          } else if (data.user) {
            console.log('Email verified successfully');
            router.push('/auth/signin?verified=true');
          }
        } catch (error) {
          console.error('Email verification error:', error);
          router.push('/auth/verify-email?error=' + encodeURIComponent('Verification failed'));
        }
        return;
      }

      // Handle OAuth callback (existing Kick login)
      if (code && state) {
        console.log('[OAuth Callback] code:', code);
        console.log('[OAuth Callback] state:', state);

        // Redirect to API route that does the actual token exchange using DB-stored code_verifier
        const redirectUrl = `/api/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
        window.location.href = redirectUrl;
        return;
      }

      console.error('❌ No valid auth parameters found in callback');
      router.push('/auth/signin?error=' + encodeURIComponent('No valid auth parameters in callback'));
    };

    handleAuthCallback();
  }, [searchParams, router, supabaseClient]);

  return <div><Loader /></div>;
};

export default CallbackPage;
