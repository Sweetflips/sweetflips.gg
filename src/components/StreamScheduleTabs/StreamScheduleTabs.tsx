import { getStreamSchedule } from "@/../lib/getStreamSchedule";
import StreamScheduleTabsClient from "@/components/StreamScheduleTabsClient/StreamScheduleTabsClient";

// Adapt StreamSchedule to the expected ScheduleEntry type for the client
function mapToScheduleEntry(raw: any): any {
  return {
    day: "Monday", // Placeholder, since your model doesn't have this field
    name: raw.title || "",
    titel: raw.title || "",
    time: `${raw.startTime} - ${raw.endTime}`,
  };
}

export default async function StreamScheduleTabs() {
  const rawSchedule = await getStreamSchedule();
  const schedule = rawSchedule.map(mapToScheduleEntry);
  return <StreamScheduleTabsClient schedule={schedule} />;
}