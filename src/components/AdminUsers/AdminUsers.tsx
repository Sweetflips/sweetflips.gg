'use client';

import { useEffect, useState } from 'react';
import { Trash2, Pencil, X } from 'lucide-react';
import { Dialog } from '@headlessui/react';

interface User {
  id: number;
  username: string;
  email: string;
  kickId: string;
  tokens: number;
  role?: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof User>('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filteredData = users.filter(user =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortAsc ? aVal - bVal : bVal - aVal;
      if (typeof aVal === 'string' && typeof bVal === 'string' && sortField === 'createdAt') {
        return sortAsc
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }
      return 0;
    });

    setFiltered(sorted);
    setCurrentPage(1);
  }, [search, sortField, sortAsc, users]);

  const handleSort = (field: keyof User) => {
    if (field === sortField) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    const res = await fetch(`/api/admin/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingUser),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
      closeEditModal();
    } else {
      alert('Failed to update user');
    }
  };

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="p-2 rounded border bg-[#130c1a] border-purple-700 text-white w-full md:max-w-sm"
      />

      <div className="overflow-x-auto rounded border border-purple-800">
        <table className="min-w-full table-auto text-sm md:text-base">
          <thead className="bg-purple-800 text-white">
            <tr>
              <th className="text-left p-3">Username</th>
              <th className="text-left p-3">Tokens</th>
              <th className="hidden md:table-cell text-left p-3 cursor-pointer" onClick={() => handleSort('id')}>
                ID {sortField === 'id' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="hidden md:table-cell text-left p-3 cursor-pointer" onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="hidden md:table-cell text-left p-3 cursor-pointer" onClick={() => handleSort('role')}>
                Role {sortField === 'role' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="hidden md:table-cell text-left p-3 cursor-pointer" onClick={() => handleSort('createdAt')}>
                CreatedAt {sortField === 'createdAt' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#1c1223] text-white">
            {paginated.map(user => (
              <tr key={user.id} className="border-t border-purple-700">
                <td className="p-3">{user.username}</td>
                <td className="p-3 text-green-400">{user.tokens} Tokens</td>
                <td className="hidden md:table-cell p-3">{user.id}</td>
                <td className="hidden md:table-cell p-3">{user.email}</td>
                <td className="hidden md:table-cell p-3">{user.role ?? 'user'}</td>
                <td className="hidden md:table-cell p-3">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEditModal(user)} className="text-blue-400 hover:text-blue-300">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center text-purple-300 py-6">No users found</div>
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

      {/* Edit Modal */}
      {editingUser && (
        <Dialog open={isModalOpen} onClose={closeEditModal} className="relative z-50">
          <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded bg-[#1c1223] border border-purple-800 p-6 text-white space-y-4 relative">
              <button onClick={closeEditModal} className="absolute top-3 right-3 text-white hover:text-purple-300">
                <X size={20} />
              </button>
              <Dialog.Title className="text-lg font-semibold">Edit User</Dialog.Title>
+             <Dialog.Description className="text-sm text-purple-300">
+               Update the selected user's profile information and permissions.
+             </Dialog.Description>

              <div className="space-y-2">
                <label className="block">
                  Username
                  <input
                    name="username"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full p-2 mt-1 bg-[#130c1a] border border-purple-700 rounded text-white"
                  />
                </label>

                <label className="block">
                  Email
                  <input
                    name="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-2 mt-1 bg-[#130c1a] border border-purple-700 rounded text-white"
                  />
                </label>

                <label className="block">
                  Tokens
                  <input
                    name="tokens"
                    type="number"
                    value={editingUser.tokens}
                    onChange={(e) => setEditingUser({ ...editingUser, tokens: parseFloat(e.target.value) })}
                    className="w-full p-2 mt-1 bg-[#130c1a] border border-purple-700 rounded text-white"
                  />
                </label>

                <label className="block">
                  Role
                  <select
                    name="role"
                    value={editingUser.role ?? ''}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full p-2 mt-1 bg-[#130c1a] border border-purple-700 rounded text-white"
                  >
                    <option value="">user</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button onClick={closeEditModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded">Cancel</button>
                <button onClick={handleEditSave} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded">Save</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}
