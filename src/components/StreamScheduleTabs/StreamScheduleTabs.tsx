"use client";

import { useEffect, useState } from "react";
import StreamScheduleTabsClient from "@/components/StreamScheduleTabsClient/StreamScheduleTabsClient";

const validDays = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

type Day = typeof validDays[number];

type RawEntry = {
  day: string;
  name: string;
  titel: string;
  time: string;
};

function isValidDay(day: string | null): day is Day {
  return !!day && validDays.includes(day as Day);
}

export default function StreamScheduleTabs() {
  const [schedule, setSchedule] = useState<RawEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/admin/schedule", { cache: "no-store" });
        const data: RawEntry[] = await res.json();
        const filtered = data
          .filter(
            (entry) =>
              isValidDay(entry.day) &&
              entry.name !== null &&
              entry.titel !== null &&
              entry.time !== null
          )
          .map((entry) => ({
            day: entry.day,
            name: entry.name!,
            titel: entry.titel!,
            time: entry.time!,
          }));
        setSchedule(filtered);
      } catch (err) {
        console.error("Failed to fetch stream schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return <p></p>;
  }

  return <StreamScheduleTabsClient schedule={schedule} />;
}