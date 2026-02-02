import { Metadata } from "next";
import HomeGate from "@/components/ComingSoon/HomeGate";

export const metadata: Metadata = {
  title: "SweetFlips | Relaunch Countdown",
  description: "SweetFlips relaunches tomorrow. Countdown to 3 Feb 2026 10:00 CET.",
};

export default function Home() {
  return (
    <HomeGate />
  );
}
