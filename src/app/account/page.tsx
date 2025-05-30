'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import Loader from "@/components/common/Loader";
import TokenExchange from '@/components/TokenExchange/TokenExchange';
import UserOrders from '@/components/UserOrders/UserOrders';

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'details' | 'orders' | 'tokens'>('details');
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      if (!res.ok) {
        router.push('/auth/signin');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setUserData(data.userData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const hash = window.location.hash;
    if (hash === '#orders') {
      setActiveSection('orders');
    } else if (hash === '#tokens') {
      setActiveSection('tokens');
    } else {
      setActiveSection('details');
    }
  }, []);

  const handleTabClick = (section: 'details' | 'orders' | 'tokens') => {
    setActiveSection(section);
    window.location.hash = `#${section}`;
  };

  const [syncing, setSyncing] = useState(false);
const [syncMessage, setSyncMessage] = useState<string | null>(null);

const handleSyncBotrix = async () => {
  setSyncing(true);
  setSyncMessage(null);
  try {
    const res = await fetch('/api/user/sync-botrix', { method: 'POST' });
    const data = await res.json();

    if (res.ok) {
      setSyncMessage('');
      fetchUser(); // refresh token balance and points
    } else {
      setSyncMessage(`❌ ${data.error || 'Failed to sync'}`);
    }
  } catch (err) {
    setSyncMessage('❌ Error syncing data');
  } finally {
    setSyncing(false);
    setTimeout(() => setSyncMessage(null), 3000);
  }
};

  if (loading) return <div className="p-6"><Loader /></div>;

  return (
    <DefaultLayout>
      <div className="min-h-[70vh] text-[#DEE4EE] max-w-7xl mx-auto px-4 py-6">
<nav className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start border-b border-white pb-4 mb-6">
  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
    <button
      onClick={() => handleTabClick('details')}
      className={`text-sm sm:text-base rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#9925FE] transition ${activeSection === 'details' ? 'bg-[#9925FE] text-white font-semibold' : ''}`}
    >
      Account Details
    </button>
    <button
      onClick={() => handleTabClick('orders')}
      className={`text-sm sm:text-base rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#9925FE] transition ${activeSection === 'orders' ? 'bg-[#9925FE] text-white font-semibold' : ''}`}
    >
      Orders
    </button>
    <button
      onClick={() => handleTabClick('tokens')}
      className={`text-sm sm:text-base rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#9925FE] transition ${activeSection === 'tokens' ? 'bg-[#9925FE] text-white font-semibold' : ''}`}
    >
      Tokens
    </button>
    <button
      onClick={handleSyncBotrix}
      disabled={syncing}
      className="text-sm sm:text-base rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 bg-[#130c1a] border border-[#9925FE] hover:bg-[#9925FE] transition disabled:opacity-50 text-white"
    >
      {syncing ? 'Syncing...' : 'Refresh Tokens'}
    </button>
  </div>

  <div className="flex justify-center sm:ml-auto sm:justify-end">
    <button
      onClick={() => window.location.href = '/api/auth/logout'}
      className="text-sm sm:text-base rounded-xl px-4 py-1.5 bg-[#9925FE] text-white font-medium hover:bg-opacity-90 transition"
    >
      Logout
    </button>
  </div>

  {/* ✅ Toast-like sync message */}
  {syncMessage && (
    <div className="w-full text-center text-sm text-white mt-2">{syncMessage}</div>
  )}
</nav>
        {/* Main content */}
        <section>
          {activeSection === 'details' && user && (
            <div>
              <h2 className="text-xl font-bold mb-4">Account Details</h2>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          )}

          {activeSection === 'orders' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Your Orders</h2>
              <UserOrders />
            </div>
          )}

          {activeSection === 'tokens' && user && userData && (
            <div>
              <TokenExchange
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

export default ProfilePage;