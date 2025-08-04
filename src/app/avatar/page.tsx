"use client";

import { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AvatarCreator from "@/components/Avatar/AvatarCreator";
import PixelAvatar from "@/components/Avatar/PixelAvatar";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function AvatarPage() {
  const [showCreator, setShowCreator] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      fetchAvatar();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const fetchAvatar = async () => {
    try {
      const response = await fetch("/api/avatar");
      if (response.ok) {
        const data = await response.json();
        setCurrentAvatar(data.avatar);
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DefaultLayout>
    );
  }

  if (!isLoggedIn) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Please sign in to create an avatar
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be logged in to access the avatar creator.
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Avatar Creator
          </h1>
          <p className="mt-2 text-gray-400">
            Design your unique pixel art character
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Preview Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl" />
            
            <div className="relative bg-[#1b1324] border border-purple-700/50 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none rounded-2xl" />
              
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8 relative z-10">
                Your Avatar
              </h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-64 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping bg-purple-500 rounded-full opacity-20"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  </div>
                </div>
              ) : currentAvatar ? (
                <div className="flex flex-col items-center relative z-10">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                    <div className="relative bg-[#2a1b3d] rounded-2xl p-8 border border-purple-700/50">
                      <PixelAvatar
                        skin={currentAvatar.skin}
                        hair={currentAvatar.hair}
                        hairColor={currentAvatar.hairColor}
                        facialHair={currentAvatar.facialHair}
                        top={currentAvatar.top}
                        jacket={currentAvatar.jacket}
                        bottom={currentAvatar.bottom}
                        shoes={currentAvatar.shoes}
                        hat={currentAvatar.hat}
                        glasses={currentAvatar.glasses}
                        size={160}
                        className="pixelated"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreator(true)}
                    className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
                  >
                    Customize Avatar
                  </motion.button>
                </div>
              ) : (
                <div className="text-center relative z-10">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-6">
                    No avatar created yet
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreator(true)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
                  >
                    Create Your Avatar
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Stats and Info Section */}
          <div className="space-y-6">
            {/* Avatar Stats Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 blur-xl" />
              
              <div className="relative bg-[#1b1324] border border-purple-700/50 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none rounded-2xl" />
                
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 relative z-10">
                  Avatar Details
                </h2>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center py-3 border-b border-purple-700/30">
                    <span className="text-gray-400 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created
                    </span>
                    <span className="font-medium text-white">
                      {currentAvatar ? new Date(currentAvatar.createdAt).toLocaleDateString() : "Not yet"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-purple-700/30">
                    <span className="text-gray-400 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Last Updated
                    </span>
                    <span className="font-medium text-white">
                      {currentAvatar ? new Date(currentAvatar.updatedAt).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-purple-700/30">
                    <span className="text-gray-400 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Style
                    </span>
                    <span className="font-medium text-[#53FC18]">Pixel Art</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 blur-xl" />
              
              <div className="relative bg-[#1b1324] border border-purple-700/50 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none rounded-2xl" />
                
                <h3 className="text-xl font-bold text-white mb-4 relative z-10">Avatar Features</h3>
                
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-[#53FC18] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-300 text-sm">
                      Used in all chat rooms and messages
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-[#53FC18] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-300 text-sm">
                      Visible in upcoming game features
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-[#53FC18] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-300 text-sm">
                      Fully customizable with multiple options
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-[#53FC18] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-300 text-sm">
                      Unique retro pixel art style
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
                  <p className="text-sm text-purple-200">
                    <strong className="text-purple-400">Pro Tip:</strong> Your avatar represents you across the entire Sweetflips platform!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCreator && (
          <div className="fixed inset-0 z-50">
            <AvatarCreator 
              onClose={() => {
                setShowCreator(false);
                fetchAvatar(); // Refresh avatar after editing
              }}
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}