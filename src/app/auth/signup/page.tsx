"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { supabaseClient } = useAuth();

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          router.push("/account");
        }
      } catch (error) {
        // Not logged in
      }
    };
    checkIfLoggedIn();
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (username.includes(' ')) {
      setError("Username cannot contain spaces");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const supabase = supabaseClient;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "Registration successful! Please check your email for verification."
        );
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setUsername("");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex min-h-screen flex-col items-center justify-start pt-20">
        <div className="flex w-full flex-grow flex-wrap items-baseline justify-center">
          <div className="w-full max-w-2xl">
            <div className="RegisterBlocks-inner w-full rounded-lg border border-graydark p-6 shadow-xl">
              <div className="mb-6 flex justify-center">
                <Image
                  src="/images/logo/site_logo.png"
                  alt="Site Logo"
                  width={240}
                  height={43}
                  priority={true}
                />
              </div>

              <h2 className="mb-6 text-center text-2xl font-bold text-white">
                Create Account
              </h2>

              <form onSubmit={handleSignUp}>
                <div className="mb-4">
                  <label className="mb-1.5 block font-medium text-white">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 mb-3 rounded-lg text-white bg-[#1d1628] border border-graydark focus:outline-none focus:ring-2 focus:ring-[#9925FE]"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block font-medium text-white">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 mb-3 rounded-lg text-white bg-[#1d1628] border border-graydark focus:outline-none focus:ring-2 focus:ring-[#9925FE]"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block font-medium text-white">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 mb-3 rounded-lg text-white bg-[#1d1628] border border-graydark focus:outline-none focus:ring-2 focus:ring-[#9925FE]"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-1.5 block font-medium text-white">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 mb-3 rounded-lg text-white bg-[#1d1628] border border-graydark focus:outline-none focus:ring-2 focus:ring-[#9925FE]"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#9925FE] hover:bg-purple-700 transition-all duration-200 w-full py-2 rounded-lg text-white font-semibold shadow-md shadow-[#9925fe]/40 disabled:opacity-50"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-[#9925FE] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>

              {message && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {message}
                </div>
              )}
              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SignUp;
