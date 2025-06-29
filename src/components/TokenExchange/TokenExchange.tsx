'use client';

import { useToken } from '@/contexts/TokenContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TokenExchangeProps {
  user: any; // Add user to props
  available: number;
  onConverted: () => void;
}

const TokenExchange = ({ user, available, onConverted }: TokenExchangeProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [conversionRate, setConversionRate] = useState<number>(100);
  // Removed tokenBalance state, will use user prop or globalBalance
  const { tokenBalance: globalBalance, refreshTokenBalance } = useToken();

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rateRes = await fetch('/api/token-settings');
        const rateData = await rateRes.json();
        setConversionRate(rateData.conversionRate);
      } catch (err) {
        console.error('Failed to load token settings');
      }
    };
    fetchRate();
  }, []); // Only fetch conversion rate now

  // Determine initial token balance from user prop or global context
  const displayTokenBalance = user?.tokens !== undefined ? Number(user.tokens) : globalBalance;

  const handleConvert = async () => {
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/convert-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseInt(amount) }),
    });

    const data = await res.json();

    if (res.ok) {
      const newTokens = parseFloat(data.tokensAdded);
      setMessage(`✅ Converted ${data.converted} points for ${newTokens.toFixed(2)} Sweetflips Tokens!`);
      setAmount('');
      // setTokenBalance((prev) => (prev ?? 0) + newTokens); // Removed: rely on prop/context update via onConverted
      onConverted(); // This should trigger a re-fetch in parent, updating user prop
      await refreshTokenBalance(); // 🟣 Refresh global context
    } else {
      setMessage(`⚠️ ${data.error}`);
    }

    setLoading(false);
  };

  const calculatedTokens =
    conversionRate > 0
      ? (parseInt(amount || '0') / conversionRate).toFixed(2)
      : '0.00';

  return (
    <div className="bg-gradient-to-br from-[#1a1122] via-[#1c0a28] to-[#0e0914] p-6 rounded-2xl shadow-[0_0_25px_rgba(153,37,254,0.4)] w-full max-w-lg mx-auto border border-[#9925FE]/30">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-[#f7f4ff]">
          Convert to Sweetflips Tokens
        </h2>
      </div>

      {displayTokenBalance !== null && typeof displayTokenBalance === 'number' && ( // Check type for toFixed
        <div className="mb-4 p-4 rounded-md bg-[#23162e] border border-purple-700 flex flex-col items-center text-center">
          <Image
            src="/images/logo/sweetflips_coin.png"
            alt="Sweetflips Coin"
            width={40}
            height={40}
            className="mb-2"
          />
          <h2 className="text-base text-purple-300 font-semibold mb-1">
            Your Sweetflips Token Balance:
          </h2>
          <p className="text-xl font-bold text-[#9925FE]">
            {displayTokenBalance.toFixed(2)} Tokens
          </p>
        </div>
      )}

      <div className="mb-4 p-4 rounded-md bg-[#23162e] border border-purple-700 flex flex-col items-center text-center">
        <Image
          src="/images/logo/kick_logo.webp"
          alt="Kick Logo"
          width={35}
          height={35}
          className="mb-2"
        />
        <h2 className="text-base text-purple-300 font-semibold mb-1">
          Your Available Kick Points:
        </h2>
        <p className="text-xl font-bold text-green-400">{available} Points</p>
      </div>

      <p className="text-sm text-pink-300 italic mb-4">
        Conversion Rate: <strong>{conversionRate}</strong> points = 1 Sweetflips Token
      </p>

      <label className="block mb-2 text-sm text-gray-400">Amount of points to convert:</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="100, 200, 500..."
        min={1}
        max={available}
        className="w-full px-4 py-2 mb-3 rounded-md text-white bg-[#1d1628] border border-[#9925FE]/50 focus:outline-none focus:ring-2 focus:ring-[#9925FE]"
      />

      {parseFloat(calculatedTokens) > 0 && (
        <div className="flex items-center gap-2 mb-4 text-purple-300 text-sm">
          <Image
            src="/images/logo/sweetflips_coin.png"
            alt="Sweetflips Coin"
            width={20}
            height={20}
            className="inline"
          />
          You&apos;ll receive{' '}
          <strong>{calculatedTokens}</strong> Sweetflips Token
          {parseFloat(calculatedTokens) !== 1 ? 's' : ''}.
        </div>
      )}

      <button
        disabled={loading}
        onClick={handleConvert}
        className="bg-[#9925FE] hover:bg-purple-700 transition-all duration-200 w-full py-2 rounded-lg text-white font-semibold shadow-md shadow-[#9925fe]/40"
      >
        {loading ? 'Converting...' : 'Convert Now'}
      </button>

      {message && (
        <div className="mt-4 text-sm text-center text-yellow-200 bg-black/20 py-2 px-3 rounded-md border border-yellow-400/20">
          {message}
        </div>
      )}
    </div>
  );
};

export default TokenExchange;