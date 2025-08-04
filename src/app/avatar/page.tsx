"use client";

import { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AvatarCreator from "@/components/Avatar/AvatarCreator";
import PixelAvatar from "@/components/Avatar/PixelAvatar";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function AvatarPage() {
  const [showCreator, setShowCreator] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(null);
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Avatar</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and customize your pixel art avatar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
              Current Avatar
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : currentAvatar ? (
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8">
                  <PixelAvatar
                    {...currentAvatar}
                    size={128}
                    className="pixelated"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreator(true)}
                  className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Edit Avatar
                </motion.button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You haven't created an avatar yet
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreator(true)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Create Avatar
                </motion.button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
              Avatar Stats
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Created</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {currentAvatar ? new Date(currentAvatar.createdAt).toLocaleDateString() : "Not yet"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {currentAvatar ? new Date(currentAvatar.updatedAt).toLocaleDateString() : "Never"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Style</span>
                <span className="font-medium text-gray-800 dark:text-white">Pixel Art</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> Your avatar will be used in the upcoming game feature and chat rooms!
              </p>
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