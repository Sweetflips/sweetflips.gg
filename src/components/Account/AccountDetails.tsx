"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarDisplay from "../Avatar/AvatarDisplay";

interface AccountDetailsProps {
  user: any;
  userData: any;
  onOpenAvatarCreator: () => void;
}

export default function AccountDetails({ user, userData, onOpenAvatarCreator }: AccountDetailsProps) {
  const [activeTab, setActiveTab] = useState<"info" | "stats" | "achievements">("info");

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
            onEditAvatar={onOpenAvatarCreator}
          />
          
          {/* Quick Stats */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/20">
              <span className="text-gray-400 text-sm">Tokens</span>
              <span className="text-purple-300 font-bold">{formatNumber(parseFloat(user.tokens))}</span>
            </div>
            
            {userData && (
              <>
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/20">
                  <span className="text-gray-400 text-sm">Points</span>
                  <span className="text-pink-300 font-bold">{formatNumber(userData.points)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/20">
                  <span className="text-gray-400 text-sm">Level</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-300 font-bold">{userData.level}</span>
                    <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                        style={{ width: `${(userData.xp % 1000) / 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Detailed Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-2"
      >
        <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-pink-900/20 rounded-2xl border border-purple-500/30 overflow-hidden backdrop-blur-sm">
          {/* Tab Navigation */}
          <div className="flex border-b border-purple-500/30 bg-black/20">
            {["info", "stats", "achievements"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border-b-2 border-purple-400"
                    : "text-gray-400 hover:text-white hover:bg-purple-600/10"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
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
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' 
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
                </motion.div>
              )}

              {activeTab === "stats" && userData && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-purple-300 mb-4">Statistics</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-2xl font-bold text-purple-300">{formatNumber(userData.watchtime)}</div>
                      <div className="text-xs text-gray-400 mt-1">Watch Time (minutes)</div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-2xl font-bold text-pink-300">{formatNumber(userData.xp)}</div>
                      <div className="text-xs text-gray-400 mt-1">Total XP</div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-2xl font-bold text-yellow-300">Level {userData.level}</div>
                      <div className="text-xs text-gray-400 mt-1">Current Level</div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-2xl font-bold text-green-300">{formatNumber(userData.points)}</div>
                      <div className="text-xs text-gray-400 mt-1">Total Points</div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-2xl font-bold text-blue-300">{formatNumber(userData.converted_tokens)}</div>
                      <div className="text-xs text-gray-400 mt-1">Converted Tokens</div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-2xl font-bold text-orange-300">{userData.followage}</div>
                      <div className="text-xs text-gray-400 mt-1">Follow Age</div>
                    </div>
                  </div>

                  {/* Progress Bar to Next Level */}
                  <div className="mt-6 p-4 bg-black/30 rounded-lg border border-purple-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Progress to Level {userData.level + 1}</span>
                      <span className="text-sm text-purple-300">{userData.xp % 1000}/1000 XP</span>
                    </div>
                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(userData.xp % 1000) / 10}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "achievements" && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-purple-300 mb-4">Achievements</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {userData && userData.level >= 10 && (
                      <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/30 text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="text-sm font-medium text-yellow-300">Level 10+</div>
                        <div className="text-xs text-gray-400 mt-1">Dedicated Viewer</div>
                      </div>
                    )}
                    
                    {userData && userData.watchtime >= 1000 && (
                      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30 text-center">
                        <div className="text-3xl mb-2">⏰</div>
                        <div className="text-sm font-medium text-purple-300">1000+ Minutes</div>
                        <div className="text-xs text-gray-400 mt-1">Time Investor</div>
                      </div>
                    )}
                    
                    {user.kickId && (
                      <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-lg p-4 border border-green-500/30 text-center">
                        <div className="text-3xl mb-2">🔗</div>
                        <div className="text-sm font-medium text-green-300">Kick Connected</div>
                        <div className="text-xs text-gray-400 mt-1">Platform Linked</div>
                      </div>
                    )}
                    
                    {userData && userData.points >= 10000 && (
                      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30 text-center">
                        <div className="text-3xl mb-2">💎</div>
                        <div className="text-sm font-medium text-blue-300">10K+ Points</div>
                        <div className="text-xs text-gray-400 mt-1">Point Master</div>
                      </div>
                    )}
                  </div>
                  
                  {(!userData || (userData.level < 10 && userData.watchtime < 1000 && userData.points < 10000)) && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-4">🎮</div>
                      <p className="text-sm">Keep playing to unlock achievements!</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}