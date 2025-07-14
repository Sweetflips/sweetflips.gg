import StreamScheduleTabsClient from "@/components/StreamScheduleTabsClient/StreamScheduleTabsClient";

const scheduleData = [
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
    name: "Boston / Mack",
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
    name: "Boston / Ciera",
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

export default function StreamScheduleTabs() {
  return <StreamScheduleTabsClient schedule={scheduleData} />;
}