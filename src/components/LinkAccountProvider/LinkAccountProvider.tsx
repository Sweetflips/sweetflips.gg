"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LinkKickAccountModal from "../LinkKickAccountModal/LinkKickAccountModal";

interface LinkAccountContextType {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  isLinked: boolean;
  checkLinkStatus: () => Promise<void>;
}

const LinkAccountContext = createContext<LinkAccountContextType | undefined>(undefined);

export const useLinkAccount = () => {
  const context = useContext(LinkAccountContext);
  if (!context) {
    throw new Error("useLinkAccount must be used within a LinkAccountProvider");
  }
  return context;
};

interface LinkAccountProviderProps {
  children: React.ReactNode;
}

export const LinkAccountProvider: React.FC<LinkAccountProviderProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const { supabaseUser, isLoggedIn, loading, supabaseClient } = useAuth();

  const checkLinkStatus = async () => {
    // Prevent multiple simultaneous checks
    if (hasChecked) return;
    
    try {
      if (supabaseUser?.id) {
        const response = await fetch(`/api/user/check-link-status?auth_user_id=${supabaseUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsLinked(data.isLinked);
          
          // Only show modal if user is not linked
          if (!data.isLinked) {
            setShowModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Error checking link status:", error);
    } finally {
      setHasChecked(true);
    }
  };

  useEffect(() => {
    // Check for successful linking from URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("linked") === "success") {
      setIsLinked(true);
      setShowModal(false);
      setHasChecked(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Only check link status once when we have a Supabase user (email-based) and auth is loaded
    // Don't check for users who are already logged in via Kick (they don't have supabaseUser)
    if (!loading && supabaseUser && isLoggedIn && !hasChecked) {
      checkLinkStatus();
    }
  }, [loading, supabaseUser, isLoggedIn, hasChecked]);

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleLinkSuccess = () => {
    setIsLinked(true);
    setShowModal(false);
  };

  const contextValue: LinkAccountContextType = {
    showModal,
    setShowModal,
    isLinked,
    checkLinkStatus,
  };

  return (
    <LinkAccountContext.Provider value={contextValue}>
      {children}
      {/* Only show modal for Supabase-authenticated users */}
      {supabaseUser && (
        <LinkKickAccountModal
          isOpen={showModal}
          onClose={handleModalClose}
          onSuccess={handleLinkSuccess}
        />
      )}
    </LinkAccountContext.Provider>
  );
};