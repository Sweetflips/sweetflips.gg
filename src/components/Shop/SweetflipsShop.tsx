'use client';

import Loader from "@/components/common/Loader";
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { useToken } from '@/contexts/TokenContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  description?: string;
  image: string;
  price: number;
}

export default function ClientShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { refreshTokenBalance } = useToken();

  useEffect(() => {
    const fetchData = async () => {
      const userRes = await fetch('/api/user');
      if (!userRes.ok) return router.push('/auth/signin');
      const userData = await userRes.json();
      setUser(userData.user);

      const productRes = await fetch('/api/products');
      const productList = await productRes.json();
      setProducts(productList);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const handleBuy = async (product: Product) => {
    const qty = quantities[product.id] || 1;
    const res = await fetch('/api/buy-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity: qty }),
    });

    const data = await res.json();

    if (res.ok) {
      await refreshTokenBalance();
      setToastMessage('✅ Purchase successful!');
      setTimeout(() => router.push('/account#orders'), 3000);
    } else {
      setToastMessage(`❌ ${data.error}`);
    }

    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) return <p className="text-white p-6"><Loader /></p>;

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 text-white">
        <h1 className="text-3xl font-bold mb-6">Sweetflips Token Shop</h1>

        {/* Coming Soon Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-center shadow-lg">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl mr-3">🚀</span>
            <h2 className="text-2xl font-bold text-white">COMING SOON</h2>
            <span className="text-4xl ml-3">🚀</span>
          </div>
          <p className="text-lg text-gray-200">
            Exciting new products and features are being prepared for you!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#1b1324] border border-purple-700 rounded-xl p-4 shadow-lg shadow-inner transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(153,37,254,0.4)]"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={200}
                className="rounded mb-3 w-full h-48 object-cover"
              />
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-300 mb-2">{product.description}</p>
              <p className="text-[#53FC18] font-bold mb-2">{product.price} Tokens</p>

              <input
                type="number"
                value={quantities[product.id] || 1}
                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                className="w-full px-3 py-1 rounded-lg bg-[#2a1b3d] text-white mb-3 border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/50"
                min={1}
              />

              <button
                onClick={() => handleBuy(product)}
                className="w-full bg-primary hover:bg-opacity-90 text-white py-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(153,37,254,0.7)] focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white border border-purple-700 px-6 py-3 rounded-lg shadow-lg z-50 backdrop-blur">
            {toastMessage}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
