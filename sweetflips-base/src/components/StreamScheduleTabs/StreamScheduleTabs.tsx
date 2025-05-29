import { getStreamSchedule } from "@/../lib/getStreamSchedule";
import StreamScheduleTabsClient from "@/components/StreamScheduleTabsClient/StreamScheduleTabsClient";

const validDays = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
] as const;

type Day = typeof validDays[number];

function isValidDay(day: string | null): day is Day {
  return !!day && validDays.includes(day as Day);
}

export default async function StreamScheduleTabs() {
  const rawSchedule = await getStreamSchedule();

  const schedule = rawSchedule
    .filter(entry =>
      isValidDay(entry.day) &&
      entry.name !== null &&
      entry.titel !== null &&
      entry.time !== null
    )
    .map(entry => ({
      day: entry.day as Day,
      name: entry.name!,
      titel: entry.titel!,
      time: entry.time!
    }));

  return <StreamScheduleTabsClient schedule={schedule} />;
}