"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AvatarDisplay from "../Avatar/AvatarDisplay";

interface AccountDetailsProps {
  user: any;
  userData: any;
  onOpenAvatarCreator: () => void;
}

export default function AccountDetails({ user, userData, onOpenAvatarCreator }: AccountDetailsProps) {
  const router = useRouter();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const handleAvatarClick = () => {
    // Navigate to the webgl avatar creator
    window.location.href = '/webgl';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Avatar Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-1"
      >
        <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-pink-900/20 rounded-2xl border border-purple-500/30 p-6 backdrop-blur-sm">
          <AvatarDisplay
            userId={user.id}
            username={user.username}
            onEditAvatar={handleAvatarClick}
          />

          {/* Quick Stats */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/20">
              <span className="text-gray-400 text-sm">Tokens</span>
              <span className="text-purple-300 font-bold">{formatNumber(parseFloat(user.tokens))}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Account Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-2"
      >
        <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-pink-900/20 rounded-2xl border border-purple-500/30 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-purple-300 mb-4">Account Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Username</label>
                <p className="text-white font-medium mt-1">{user.username}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-white font-medium mt-1">{user.email}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Account Type</label>
                <p className="text-white font-medium mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${user.role === 'admin'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : user.kickId
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                    {user.role === 'admin' ? 'Administrator' : user.kickId ? 'Kick Linked' : 'Standard'}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Member Since</label>
                <p className="text-white font-medium mt-1">{formatDate(user.createdAt)}</p>
              </div>

              {user.kickId && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Kick ID</label>
                  <p className="text-purple-300 font-medium mt-1">{user.kickId}</p>
                </div>
              )}

              {user.kick_linked_at && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Kick Linked</label>
                  <p className="text-white font-medium mt-1">{formatDate(user.kick_linked_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
