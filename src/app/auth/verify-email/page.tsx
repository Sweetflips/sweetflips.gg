"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { createClientForAuth } from "../../../../lib/supabase";
import Link from "next/link";

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token || !type) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const supabase = createClientForAuth();
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else if (data.user) {
          setStatus('success');
          setMessage('Email verified successfully! You can now sign in.');
          
          // Redirect to signin page after 3 seconds
          setTimeout(() => {
            router.push('/auth/signin');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Invalid verification token');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <DefaultLayout>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="RegisterBlocks-inner w-full rounded-lg border border-graydark p-6 shadow-xl">
            <div className="text-center">
              <h2 className="mb-6 text-2xl font-bold text-white">
                Email Verification
              </h2>
              
              {status === 'loading' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9925FE]"></div>
                  <p className="text-white">Verifying your email...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  <div className="text-green-400 text-5xl mb-4">✓</div>
                  <p className="text-white text-lg">{message}</p>
                  <p className="text-gray-300">Redirecting to sign in...</p>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <div className="text-red-400 text-5xl mb-4">✗</div>
                  <p className="text-white text-lg">{message}</p>
                  <div className="mt-6">
                    <Link
                      href="/auth/signin"
                      className="bg-[#9925FE] hover:bg-purple-700 transition-all duration-200 px-6 py-2 rounded-lg text-white font-semibold shadow-md shadow-[#9925fe]/40"
                    >
                      Go to Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default VerifyEmail;