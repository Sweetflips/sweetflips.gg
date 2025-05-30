'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Loader from '@/components/common/Loader';

const CallbackPage = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) {
      console.error('[OAuth Callback] ❌ searchParams is null');
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('[OAuth Callback] code:', code);
    console.log('[OAuth Callback] state:', state);

    if (!code || !state) {
      console.error('❌ Missing code or state from URL');
      return;
    }

    // Redirect to API route that does the actual token exchange using DB-stored code_verifier
    const redirectUrl = `/api/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
    window.location.href = redirectUrl;
  }, [searchParams]);

  return <div><Loader /></div>;
};

export default CallbackPage;
