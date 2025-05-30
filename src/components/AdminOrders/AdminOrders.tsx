'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface Order {
  id: number;
  quantity: number;
  total: number;
  createdAt: string;
  status: string;
  user: { username: string };
  product: { name: string };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data);
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const filteredData = orders
      .filter(order =>
        (order.user?.username ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (order.product?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (order.status ?? '').toLowerCase().includes(search.toLowerCase())
      )
      .filter(order =>
        userFilter ? order.user.username === userFilter : true
      )
      .filter(order =>
        productFilter ? order.product.name === productFilter : true
      )
      .filter(order =>
        statusFilter ? order.status === statusFilter : true
      );

    setFiltered(filteredData);
    setCurrentPage(1); // reset to page 1 on any filter/search change
  }, [search, userFilter, productFilter, statusFilter, orders]);

  const deleteOrder = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const uniqueUsers = Array.from(new Set(orders.map(o => o.user.username)));
  const uniqueProducts = Array.from(new Set(orders.map(o => o.product.name)));
  const uniqueStatuses = Array.from(new Set(orders.map(o => o.status)));

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 rounded border bg-[#130c1a] border-purple-700 text-white w-full md:max-w-xs"
        />
        <div className="flex flex-wrap gap-3">
          <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="p-2 bg-[#130c1a] text-white border border-purple-700 rounded">
            <option value="">All Users</option>
            {uniqueUsers.map(user => <option key={user} value={user}>{user}</option>)}
          </select>
          <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="p-2 bg-[#130c1a] text-white border border-purple-700 rounded">
            <option value="">All Products</option>
            {uniqueProducts.map(product => <option key={product} value={product}>{product}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 bg-[#130c1a] text-white border border-purple-700 rounded">
            <option value="">All Statuses</option>
            {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-purple-800">
        <table className="min-w-full table-auto text-sm md:text-base">
          <thead className="bg-purple-800 text-white">
            <tr>
              <th className="hidden md:table-cell text-left p-3">ID</th>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Qty</th>
              <th className="text-left p-3">Total</th>
              <th className="hidden md:table-cell text-left p-3">Status</th>
              <th className="hidden md:table-cell text-left p-3">Date</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#1c1223] text-white">
            {paginated.map(order => (
              <tr key={order.id} className="border-t border-purple-700">
                <td className="hidden md:table-cell p-3">{order.id}</td>
                <td className="p-3">{order.user.username}</td>
                <td className="p-3">{order.product.name}</td>
                <td className="p-3">{order.quantity}</td>
                <td className="p-3 text-green-400">{order.total} Tokens</td>
                <td className="hidden md:table-cell p-3 capitalize">{order.status}</td>
                <td className="hidden md:table-cell p-3">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  <button onClick={() => deleteOrder(order.id)} className="text-red-500 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center text-purple-300 py-6">No orders found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-purple-700 text-white' : 'bg-[#130c1a] text-purple-300 border border-purple-700'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
