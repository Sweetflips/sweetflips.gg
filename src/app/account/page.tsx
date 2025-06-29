"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // We still need this to update the URL
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import Loader from "@/components/common/Loader";
import TokenExchange from "@/components/TokenExchange/TokenExchange";
import UserOrders from "@/components/UserOrders/UserOrders";
import { withAuth } from "@/components/withAuth";

const ProfilePage = () => {
  const router = useRouter(); // Initialize router to manage URL history
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "details" | "orders" | "tokens"
  >("details");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user");
      if (!res.ok) {
        setUser(null);
        setUserData(null);
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setUserData(data.userData);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Handles browser back/forward and direct URL loads
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#orders") setActiveSection("orders");
      else if (hash === "#tokens") setActiveSection("tokens");
      else setActiveSection("details");
    };

    // ✅ Handles the custom event from the '+' button
    const handleTokensTabEvent = () => {
      setActiveSection("tokens");
    };

    // Run on initial component mount to set the correct tab
    handleHashChange();

    // Listen for hash changes (e.g., from browser back/forward or the '+' button)
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("navigate-to-tokens-tab", handleTokensTabEvent);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener(
        "navigate-to-tokens-tab",
        handleTokensTabEvent,
      );
    };
  }, []); // Empty dependency array ensures this runs only once to set up the listener

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // This function now reliably updates state AND the URL
  const handleTabClick = (section: "details" | "orders" | "tokens") => {
    // 1. Update the state directly for an immediate UI change.
    setActiveSection(section);
    // 2. Use the router to update the URL hash without a full page reload.
    router.push(`/account#${section}`, { scroll: false });
  };

  const handleSyncBotrix = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/user/sync-botrix", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage("");
        fetchUser(); // refresh token balance and points
      } else {
        setSyncMessage(`❌ ${data.error || "Failed to sync"}`);
      }
    } catch (err) {
      setSyncMessage("❌ Error syncing data");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  if (loading)
    return (
      <div className="p-6">
        <Loader />
      </div>
    );

  return (
    <DefaultLayout>
      <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-6 text-[#DEE4EE]">
        <nav className="mb-6 flex flex-col gap-2 border-b border-white pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              onClick={() => handleTabClick("details")}
              className={`rounded-xl px-3 py-1.5 text-sm transition hover:bg-[#9925FE] sm:px-4 sm:py-2 sm:text-base ${activeSection === "details" ? "bg-[#9925FE] font-semibold text-white shadow-md" : "border border-purple-500 bg-purple-800/40 text-white"}`}
            >
              Account Details
            </button>
            <button
              onClick={() => handleTabClick("orders")}
              className={`rounded-xl px-3 py-1.5 text-sm transition hover:bg-[#9925FE] sm:px-4 sm:py-2 sm:text-base ${activeSection === "orders" ? "bg-[#9925FE] font-semibold text-white shadow-md" : "border border-purple-500 bg-purple-800/40 text-white"}`}
            >
              Orders
            </button>
            <button
              onClick={() => handleTabClick("tokens")}
              className={`rounded-xl px-3 py-1.5 text-sm transition hover:bg-[#9925FE] sm:px-4 sm:py-2 sm:text-base ${activeSection === "tokens" ? "bg-[#9925FE] font-semibold text-white shadow-md" : "border border-purple-500 bg-purple-800/40 text-white"}`}
            >
              Tokens
            </button>
            <button
              onClick={handleSyncBotrix}
              disabled={syncing}
              className="rounded-xl border border-[#9925FE] bg-[#130c1a] px-3 py-1.5 text-sm text-white transition hover:bg-[#9925FE] disabled:opacity-50 sm:px-4 sm:py-2 sm:text-base"
            >
              {syncing ? "Syncing..." : "Refresh Tokens"}
            </button>
          </div>

          <div className="flex justify-center sm:ml-auto sm:justify-end">
            <button
              onClick={() => (window.location.href = "/api/auth/logout")}
              className="rounded-xl bg-[#9925FE] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-opacity-90 sm:text-base"
            >
              Logout
            </button>
          </div>

          {syncMessage && (
            <div className="mt-2 w-full text-center text-sm text-white">
              {syncMessage}
            </div>
          )}
        </nav>

        <section>
          {activeSection === "details" && user && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Account Details</h2>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          )}

          {activeSection === "orders" && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Your Orders</h2>
              <UserOrders />
            </div>
          )}

          {activeSection === "tokens" && user && userData && (
            <div>
              <TokenExchange
                user={user}
                available={userData.points - userData.converted_tokens}
                onConverted={fetchUser}
              />
            </div>
          )}
        </section>
      </div>
    </DefaultLayout>
  );
};

export default withAuth(ProfilePage);
