'use client';

import { useEffect, useState } from 'react';

export default function TokenSettingsManager() {
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [newRate, setNewRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/token-settings');
        const data = await res.json();
        setConversionRate(data.conversionRate);
      } catch (err) {
        setMessage('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
  }, []);

  const updateRate = async () => {
    const parsed = parseInt(newRate);
    if (!parsed || parsed < 1) {
      setMessage('Please enter a valid number');
      return;
    }
    try {
      const res = await fetch('/api/token-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversionRate: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setConversionRate(parsed);
        setNewRate('');
        setMessage('✅ Conversion rate updated!');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Failed to update');
    }
  };

  return (
    <div className="w-full max-w-md text-white">
      <h3 className="text-lg font-bold mb-4">Conversion Rate Settings</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p className="mb-3">
            Current conversion rate: <strong>{conversionRate}</strong> points = 1 SweetflipsToken
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min={1}
              placeholder="New rate"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="w-full px-4 py-2 mb-3 rounded-lg text-white bg-[#1d1628] border border-graydark focus:outline-none focus:ring-2 focus:ring-[#9925FE]"
            />
            <button
              onClick={updateRate}
              className="bg-[#9925FE] hover:bg-purple-700 transition-all duration-200 w-full py-2 rounded-lg text-white font-semibold shadow-md shadow-[#9925fe]/40"
            >
              Update
            </button>
          </div>
          {message && <p className="text-sm mt-1">{message}</p>}
        </>
      )}
    </div>
  );
}