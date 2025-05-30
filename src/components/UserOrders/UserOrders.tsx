'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Order {
  id: number;
  quantity: number;
  total: number;
  createdAt: string;
  product: {
    name: string;
    image: string;
    price: number;
  };
}

export default function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/user/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-purple-300"></p>;
  }

  if (orders.length === 0) {
    return <p className="text-purple-300">You havent placed any orders yet.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-[#1a1120] border border-purple-700 p-4 rounded-lg">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-16 h-16 overflow-hidden">
              <Image
                src={order.product.image}
                alt={order.product.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-semibold">{order.product.name}</h3>
              <p className="text-purple-300 text-sm">
                {order.quantity}x @ {order.product.price} tokens
              </p>
            </div>
          </div>
          <div className="text-sm text-purple-300">
            <p><strong>Total:</strong> <span className="text-green-400 font-semibold">{order.total} tokens</span></p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString('nl-NL')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
