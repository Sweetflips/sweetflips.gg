'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Loader from '@/components/common/Loader';
import ScheduleManager from '@/components/ScheduleManager/ScheduleManager';
import TokenSettingsManager from '@/components/TokenSettingsManager/TokenSettingsManager';
import ProductManager from '@/components/ProductManager/ProductManager';
import AdminOrders from '@/components/AdminOrders/AdminOrders';
import AdminUsers from '@/components/AdminUsers/AdminUsers';

type AdminTab = 'schedule' | 'orders' | 'users' | 'token settings' | 'products';

const AdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('schedule');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) {
          setRedirecting(true);
          router.push('/');
          return;
        }

        const data = await res.json();

        if (data.user?.role !== 'admin') {
          setRedirecting(true);
          router.push('/');
          return;
        }

        setUser(data);
      } catch (error) {
        setRedirecting(true);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading || redirecting) {
    return (
      <div className="p-6">
        <Loader />
      </div>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-[70vh] text-[#DEE4EE] max-w-7xl mx-auto px-4 py-6">
        {/* Top nav (was sidebar) */}
        <nav className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start border-b border-white pb-4 mb-6">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`text-sm sm:text-base rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#9925FE] transition ${
                activeTab === 'schedule' ? 'bg-[#9925FE] text-white font-semibold' : ''
              }`}
            >
              Stream Schedule
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`text-sm sm:text-base rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#9925FE] transition ${
                activeTab === 'orders' ? 'bg-[#9925FE] text-white font-semibold' : ''
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`text-sm sm:text-base rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#9925FE] transition ${
                activeTab === 'users' ? 'bg-[#9925FE] text-white font-semibold' : ''
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('token settings')}
              className={`text-sm sm:text-base rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#9925FE] transition ${
                activeTab === 'token settings' ? 'bg-[#9925FE] text-white font-semibold' : ''
              }`}
            >
              Token Settings
            </button>
            <button
  onClick={() => setActiveTab('products')}
  className={`text-sm sm:text-base rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#9925FE] transition ${
    activeTab === 'products' ? 'bg-[#9925FE] text-white font-semibold' : ''
  }`}
>
  Products
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
        </nav>

        {/* Main Content */}
        <section>
          <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
          {activeTab === 'schedule' && (
            <>
              <h2 className="text-xl font-semibold mb-4">Manage Stream Schedule</h2>
              <ScheduleManager />
            </>
          )}

{activeTab === 'orders' && (
  <>
    <h2 className="text-xl font-semibold mb-4">Orders</h2>
    <AdminOrders />
  </>
)}

{activeTab === 'users' && (
  <>
    <h2 className="text-xl font-semibold mb-4">Users</h2>
    <AdminUsers />
  </>
)}

{activeTab === 'token settings' && (
  <>
    <h2 className="text-xl font-semibold mb-4">Manage Token Exchange Settings</h2>
    <TokenSettingsManager />
  </>
          )}
          {activeTab === 'products' && (
  <>
    <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
    <ProductManager />
  </>
)}

        </section>
      </div>
    </DefaultLayout>
  );
};

export default AdminPanel;