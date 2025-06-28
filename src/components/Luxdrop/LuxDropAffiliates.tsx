// src/components/Luxdrop/LuxDropAffiliates.tsx
"use client";
import React, { useState } from "react";
import { withAuth } from "@/components/withAuth";

interface AffiliateData {
  // This is an example structure based on the API docs.
  // Adjust it if the actual API response is different.
  code: string;
  wagered: number;
  earnings: number;
  signups: number;
}

const LuxDropAffiliates: React.FC = () => {
  const [codes, setCodes] = useState("sweetflips"); // Default to 'sweetflips' for convenience
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<AffiliateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!codes) {
      setError("Please enter at least one affiliate code.");
      return;
    }
    setLoading(true);
    setError(null);
    setData([]);

    const params = new URLSearchParams();
    params.append("codes", codes);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    try {
      const res = await fetch(`/api/LuxdropProxy?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      const result = await res.json();
      // The API response might be directly an array or nested under a `data` key. Adjust as needed.
      setData(Array.isArray(result) ? result : result.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg bg-[#130C1A] text-white border border-purple-700">
      <h1 className="text-3xl font-bold text-center mb-6 text-purple-300">
        LuxDrop Affiliate Data
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="codes" className="block text-sm font-medium mb-1">Affiliate Codes (comma-separated)</label>
          <input
            id="codes"
            type="text"
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
            placeholder="yourcode1,yourcode2"
            className="w-full p-2 rounded bg-[#1c1223] border border-purple-600 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date (Optional)</label>
                <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 rounded bg-[#1c1223] border border-purple-600 focus:ring-primary focus:border-primary"
                />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date (Optional)</label>
                <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 rounded bg-[#1c1223] border border-purple-600 focus:ring-primary focus:border-primary"
                />
            </div>
        </div>
      </div>

      <button
        onClick={fetchData}
        disabled={loading}
        className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition"
      >
        {loading ? "Loading..." : "Fetch Data"}
      </button>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      <div className="mt-8">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-800">
              <thead className="bg-purple-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Wagered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Signups</th>
                </tr>
              </thead>
              <tbody className="bg-[#1c1223] divide-y divide-purple-800">
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${item.wagered?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-400">${item.earnings?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.signups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && <p className="text-center text-gray-400 mt-4">No data to display. Enter codes and fetch.</p>
        )}
      </div>
    </div>
  );
};

// IMPORTANT: This page likely contains sensitive data.
// Protect it by wrapping it with withAuth and specifying the 'admin' role.
export default withAuth(LuxDropAffiliates, { role: 'admin' });
