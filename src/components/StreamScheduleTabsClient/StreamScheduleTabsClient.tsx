"use client";

import { useState } from "react";

type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

interface ScheduleEntry {
  day: string;
  name: string;
  titel: string;
  time: string;
}

interface Props {
  schedule: ScheduleEntry[];
}

export default function StreamScheduleTabsClient({ schedule }: Props) {
  const [activeDay, setActiveDay] = useState<Day>("Monday");

  const groupedSchedule = schedule.reduce<Record<Day, ScheduleEntry[]>>((acc, entry) => {
    const day = entry.day as Day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  return (
    <div className="bg-[radial-gradient(at_top_center,_#350c4a_0%,_#130C1A_60%)] rounded-xl border border-graydark p-4 shadow-card">
      {/* <h2 className="mb-6 text-center text-2xl font-bold text-white sm:text-3xl">
        Weekly Stream Schedule
      </h2> */} {/* Header moved to page.tsx */}

      <div className="mb-6 flex flex-wrap justify-center gap-1 sm:gap-2">
        {(Object.keys(groupedSchedule) as Day[]).map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold transition
              ${
                activeDay === day
                  ? "bg-[#9925FE] text-white shadow-md"
                  : "bg-purple-800/40 text-white border border-purple-500"
              }`}
          >
            {day}
          </button>
        ))}
      </div>

      {groupedSchedule[activeDay].length === 0 ? (
  <div className="flex items-center justify-between rounded-2xl border border-purple-500 bg-purple-800/40 px-6 py-4 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
    <span className="text-white font-semibold text-lg">No Stream</span>
    <div className="w-24 h-2 rounded-full bg-purple-900 overflow-hidden">
      <div className="h-full w-1/2 bg-[#9925FE] animate-pulse"></div>
    </div>
  </div>
) : (
  groupedSchedule[activeDay].map((entry, i) => (
    <div
      key={i}
      className="mb-4 flex flex-col rounded-2xl border border-purple-500 bg-purple-800/40 px-4 py-3 shadow-[0_0_10px_rgba(168,85,247,0.4)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <span className="text-center text-xl font-medium text-white sm:w-1/4 sm:text-left sm:text-base">
        {entry.name || "Unknown Host"}
      </span>
      <span className="text-center text-sm font-semibold text-white sm:w-1/2 sm:text-center sm:text-base">
        {entry.titel || "Untitled Show"}
      </span>
      {entry.time && (
        <span className="mt-2 rounded-2xl bg-[#9925FE] px-4 py-1 text-center text-xs font-semibold text-white shadow-md sm:mt-0 sm:w-1/4 sm:text-right">
          {entry.time}
        </span>
      )}
    </div>
  ))
)}
    </div>
  );
}
