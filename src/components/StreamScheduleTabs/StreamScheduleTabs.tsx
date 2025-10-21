import StreamScheduleTabsClient from "@/components/StreamScheduleTabsClient/StreamScheduleTabsClient";
import { getBaseUrl } from "@/lib/getBaseUrl";

// Fallback data in case API fails
const fallbackScheduleData = [
  {
    day: "Monday",
    name: "Dennylo / Mack",
    titel: "Denny vs Monday Curse / Raw Gambling",
    time: "11:00 AM UTC (7:00 AM EST)",
  },
  {
    day: "Tuesday",
    name: "Nick / Mack",
    titel: "Raw Gambling",
    time: "10:00 AM UTC (6:00 AM EST)",
  },
  {
    day: "Wednesday",
    name: "Nick / Ciera",
    titel: "Raw Gambling",
    time: "10:00 AM UTC (6:00 AM EST)",
  },
  {
    day: "Thursday",
    name: "Mack",
    titel: "LuxDrop / Raw Gambling",
    time: "11:00 AM UTC (7:00 AM EST)",
  },
  {
    day: "Friday",
    name: "Nick",
    titel: "VIP Bonus Opening",
    time: "10:00 AM UTC (6:00 AM EST)",
  },
  {
    day: "Saturday",
    name: "Ciera",
    titel: "LuxDrop / Raw Gambling",
    time: "11:00 AM UTC (7:00 AM EST)",
  },
  {
    day: "Sunday",
    name: "Nick / Ciera",
    titel: "VIP Call a Sweet Slot / Raw Gambling",
    time: "10:00 AM UTC (6:00 AM EST)",
  },
];

export default async function StreamScheduleTabs() {
  try {
    // Fetch schedule data from database
    const response = await fetch(`${getBaseUrl()}/api/admin/schedule`, {
      cache: 'no-store' // Always get fresh data
    });

    if (response.ok) {
      const scheduleData = await response.json();
      // If database has data, use it; otherwise fall back to hardcoded data
      const dataToUse = scheduleData.length > 0 ? scheduleData : fallbackScheduleData;
      return <StreamScheduleTabsClient schedule={dataToUse} />;
    }
  } catch (error) {
    console.error('Failed to fetch schedule data:', error);
  }

  // Fallback to hardcoded data if API fails
  return <StreamScheduleTabsClient schedule={fallbackScheduleData} />;
}
