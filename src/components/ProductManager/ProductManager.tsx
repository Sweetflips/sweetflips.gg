// Updated ProductManager.tsx

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Pencil, Trash2, EyeOff, Eye, Check, X } from 'lucide-react';
import Image from 'next/image';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  active: boolean;
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{ [key: number]: Partial<Product> }>({});
  const [editImageFile, setEditImageFile] = useState<{ [key: number]: File | null }>({});
  const [previewUrl, setPreviewUrl] = useState<{ [key: number]: string }>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpload = async (uploadFile: File) => {
    const filename = `${Date.now()}-${uploadFile.name}`;
    const { error } = await supabase.storage.from('products').upload(filename, uploadFile);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
  };

  const handleAdd = async () => {
    if (!name || price < 1 || !file) return;
    setUploading(true);
    const imageUrl = await handleUpload(file);
    if (!imageUrl) return setUploading(false);

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price, image: imageUrl })
    });

    if (res.ok) {
      setName('');
      setDescription('');
      setPrice(0);
      setFile(null);
      fileRef.current!.value = '';
      fetchProducts();
    }
    setUploading(false);
  };

  const toggleActive = async (id: number, current: boolean) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !current })
    });
    fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleEditChange = (id: number, field: keyof Product, value: any) => {
    setEditFields(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const saveEdit = async (id: number) => {
    const changes = editFields[id] || {};
    if (editImageFile[id]) {
      const newUrl = await handleUpload(editImageFile[id]!);
      if (newUrl) {
        changes.image = newUrl;
      }
    }

    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });

    setEditingId(null);
    setEditFields(prev => ({ ...prev, [id]: {} }));
    setEditImageFile(prev => ({ ...prev, [id]: null }));
    setPreviewUrl(prev => ({ ...prev, [id]: '' }));
    fetchProducts();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleImageEditChange = (id: number, file: File) => {
    setEditImageFile(prev => ({ ...prev, [id]: file }));
    setPreviewUrl(prev => ({ ...prev, [id]: URL.createObjectURL(file) }));
  };

  return (
    <div className="space-y-8 px-4 max-w-5xl mx-auto">
      <div className="p-6 rounded-xl bg-[#1c1223] border border-purple-700">
        <h3 className="text-lg font-semibold mb-4 text-purple-300">Add New Product</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col col-span-2 sm:col-span-1">
            <label className="text-sm text-purple-300 mb-1">Name</label>
            <input
              className="bg-[#130c1a] border border-gray-600 text-white p-2 rounded w-50 sm:w-full"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col col-span-2 sm:col-span-1">
            <label className="text-sm text-purple-300 mb-1">Price</label>
            <input
              type="text"
              pattern="\d*"
              inputMode="numeric"
              className="bg-[#130c1a] border border-gray-600 text-white p-2 rounded w-50 sm:w-full"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-sm text-purple-300 mb-1">Description</label>
            <textarea
              className="bg-[#130c1a] border border-gray-600 text-white p-2 rounded w-50 sm:w-full"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-sm text-purple-300 mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="text-white"
            />
          </div>
        </div>
        <button
          className="mt-4 bg-[#9925FE] px-4 py-2 rounded text-white hover:bg-opacity-90 disabled:opacity-50"
          onClick={handleAdd}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Add Product'}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-purple-300">Existing Products</h3>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="bg-[#1a1120] border border-purple-800 p-4 rounded-xl text-center flex flex-col items-center w-[75%] sm:w-full">
              <div className="relative w-28 h-28 mb-4 rounded overflow-hidden border border-purple-700 bg-[#23162e]">
                <Image
                  src={previewUrl[p.id] || p.image}
                  alt={p.name}
                  layout="fill"
                  objectFit="contain"
                  className="rounded"
                />
              </div>
              {editingId === p.id ? (
                <>
                  <input
                    className="mb-2 w-50 sm:w-full bg-[#130c1a] border border-gray-600 text-white p-1 rounded"
                    value={editFields[p.id]?.name || p.name}
                    onChange={(e) => handleEditChange(p.id, 'name', e.target.value)}
                  />
                  <textarea
                    className="mb-2 w-50 sm:w-full bg-[#130c1a] border border-gray-600 text-white p-1 rounded"
                    value={editFields[p.id]?.description || p.description}
                    onChange={(e) => handleEditChange(p.id, 'description', e.target.value)}
                  />
                  <input
                    className="mb-2 w-50 sm:w-full bg-[#130c1a] border border-gray-600 text-white p-1 rounded"
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={editFields[p.id]?.price || p.price}
                    onChange={(e) => handleEditChange(p.id, 'price', Number(e.target.value))}
                  />
                  <div className="mb-2">
                    <label className="block text-sm text-purple-300 mb-1">Change Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageEditChange(p.id, e.target.files[0])}
                      className="text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-white text-lg font-semibold mb-1">{p.name}</h4>
                  <p className="text-sm text-purple-300 mb-1">{p.description}</p>
                  <p className="text-green-400 font-bold mb-3">{p.price} Tokens</p>
                </>
              )}
              <div className="flex gap-3">
                {editingId === p.id ? (
                  <>
                    <button className="text-green-400 hover:text-green-300" onClick={() => saveEdit(p.id)} title="Save">
                      <Check size={18} />
                    </button>
                    <button className="text-red-400 hover:text-red-300" onClick={cancelEdit} title="Cancel">
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => toggleActive(p.id, p.active)} className="text-white hover:text-purple-400" title={p.active ? 'Disable product' : 'Enable product'}>
                      {p.active ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-300" title="Delete product">
                      <Trash2 size={18} />
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-300" onClick={() => setEditingId(p.id)} title="Edit product">
                      <Pencil size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}