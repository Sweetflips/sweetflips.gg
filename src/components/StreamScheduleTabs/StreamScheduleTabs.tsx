import StreamScheduleTabsClient from "@/components/StreamScheduleTabsClient/StreamScheduleTabsClient";

const scheduleData = [
  {
    day: "Monday",
    name: "Nick / Cierra",
    titel: "LuxDrop & Razed / Raw Gambling",
    time: "09:00 AM UTC / 07:00 PM UTC",
  },
  {
    day: "Tuesday",
    name: "Nick / Mack",
    titel: "LuxDrop & Razed / Raw Gambling",
    time: "09:00 AM UTC / 01:00 PM UTC",
  },
  {
    day: "Wednesday",
    name: "Nick / Ciera",
    titel: "LuxDrop & Razed / Raw Gambling",
    time: "09:00 AM UTC / 07:00 PM UTC",
  },
  {
    day: "Thursday",
    name: "Nick / Mack",
    titel: "LuxDrop & Razed / Raw Gambling",
    time: "09:00 AM UTC / 01:00 PM UTC",
  },
  {
    day: "Friday",
    name: "Nick / Nick",
    titel: "LuxDrop & Razed / VIP Bonus Opening",
    time: "09:00 AM UTC / 01:00 PM UTC",
  },
  {
    day: "Saturday",
    name: "Nick / Ciera",
    titel: "LuxDrop & Razed / Raw Gambling",
    time: "09:00 AM UTC / 07:00 PM UTC",
  },
  {
    day: "Sunday",
    name: "Nick / Ciera",
    titel: "LuxDrop & Razed / Raw Gambling",
    time: "09:00 AM UTC / 07:00 PM UTC",
  },
];

export default function StreamScheduleTabs() {
  return <StreamScheduleTabsClient schedule={scheduleData} />;
}
