"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // 1. IMPORT useRouter
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import Loader from "@/components/common/Loader";
import TokenExchange from "@/components/TokenExchange/TokenExchange";
import UserOrders from "@/components/UserOrders/UserOrders";
import { withAuth } from "@/components/withAuth";

const ProfilePage = () => {
  const router = useRouter(); // 2. INITIALIZE the router
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

  // 3. FIX: This useEffect now properly listens for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "orders" || hash === "tokens") {
        setActiveSection(hash);
      } else {
        setActiveSection("details");
      }
    };

    // Set initial state from the URL hash when the page loads
    handleHashChange();

    // Add a listener for when the hash changes (e.g., via back/forward buttons)
    window.addEventListener("hashchange", handleHashChange);

    // Clean up the listener when the component unmounts
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []); // This empty array ensures the effect runs only once to set up the listener

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 4. FIX: Use the Next.js router for navigation
  const handleTabClick = (section: "details" | "orders" | "tokens") => {
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
        fetchUser();
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
