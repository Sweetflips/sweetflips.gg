"use client";

import { useEffect, useState } from "react";

type ScheduleItem = {
  id: number;
  day: string;
  name: string;
  titel: string;
  time: string;
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ScheduleManager() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [filterDay, setFilterDay] = useState<string>("All");
  const [sortBy, setSortBy] = useState<keyof ScheduleItem>("day");
  const [sortAsc, setSortAsc] = useState(true);

  const [form, setForm] = useState<Partial<ScheduleItem>>({
    day: "Monday",
    name: "",
    titel: "",
    time: "",
  });

  const fetchSchedule = async () => {
    const res = await fetch("/api/admin/schedule");
    const data = await res.json();
    setSchedule(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ day: "Monday", name: "", titel: "", time: "" });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editing ? "PUT" : "POST";
    const endpoint = editing
      ? `/api/admin/schedule/${editing}`
      : `/api/admin/schedule`;

    await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    resetForm();
    fetchSchedule();
  };

  const deleteItem = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this schedule?");
    if (!confirmed) return;

    await fetch(`/api/admin/schedule/${id}`, { method: "DELETE" });
    fetchSchedule();
  };

  const startEdit = (item: ScheduleItem) => {
    setEditing(item.id);
    setForm(item);
  };

  const handleSort = (column: keyof ScheduleItem) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  const filteredSchedule = schedule
    .filter(item => filterDay === "All" || item.day === filterDay)
    .sort((a, b) => {
      const aVal = a[sortBy] ?? "";
      const bVal = b[sortBy] ?? "";
      return aVal < bVal ? (sortAsc ? -1 : 1) : aVal > bVal ? (sortAsc ? 1 : -1) : 0;
    });

  useEffect(() => {
    fetchSchedule();
  }, []);

  if (loading) return <p>Loading schedule...</p>;

  return (
    <div className="space-y-8">
      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-purple-800/30 p-4 rounded-xl border border-purple-500 shadow-md">
        <h3 className="text-lg font-bold">{editing ? "Edit Stream" : "Add New Stream"}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
            className="rounded px-3 py-2 bg-purple-900 text-white border border-purple-600"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Host"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded px-3 py-2 bg-purple-900 text-white border border-purple-600"
            required
          />

          <input
            type="text"
            placeholder="Show Title"
            value={form.titel || ""}
            onChange={(e) => setForm({ ...form, titel: e.target.value })}
            className="rounded px-3 py-2 bg-purple-900 text-white border border-purple-600"
            required
          />

          <input
            type="text"
            placeholder="Time (e.g. 09:00PM UTC+2)"
            value={form.time || ""}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="rounded px-3 py-2 bg-purple-900 text-white border border-purple-600"
            required
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            className="bg-[#9925FE] hover:bg-opacity-90 text-white px-4 py-2 rounded font-semibold"
          >
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-600 hover:bg-opacity-80 text-white px-4 py-2 rounded font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex justify-end">
        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="bg-purple-900 border border-purple-600 text-white px-3 py-1 rounded"
        >
          <option value="All">All Days</option>
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-purple-700 text-white rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-purple-800 text-sm">
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("day")}>
                Day {sortBy === "day" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("name")}>
                Host {sortBy === "name" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("titel")}>
                Show {sortBy === "titel" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("time")}>
                Time {sortBy === "time" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedule.map((item) => (
              <tr key={item.id} className="border-t border-purple-700">
                <td className="px-4 py-2">{item.day}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.titel}</td>
                <td className="px-4 py-2">{item.time}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-sm bg-[#9925FE] hover:opacity-80 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-sm bg-red hover:opacity-80 px-3 py-1 rounded"
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
