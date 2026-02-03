"use client";

import { useEffect, useState } from "react";
import ComingSoon from "@/components/ComingSoon/ComingSoon";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Homepage from "@/components/Homepage/Homepage";

const targetTimestamp = Date.UTC(2026, 1, 3, 9, 0, 0);

const isLiveNow = (nowMs: number) => nowMs >= targetTimestamp;

export default function HomeGate() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(0);
  const [isLive, setIsLive] = useState<boolean>(isLiveNow(Date.now()));

  useEffect(() => {
    const readState = () => {
      setIsLive(isLiveNow(Date.now() + serverOffsetMs));
      setIsUnlocked(localStorage.getItem("unlock_casino") === "true");
    };

    readState();
    const timer = setInterval(readState, 1000);
    window.addEventListener("storage", readState);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", readState);
    };
  }, [serverOffsetMs]);

  useEffect(() => {
    const syncServerTime = async () => {
      try {
        const response = await fetch("/api/server-time", {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { serverTime: number };
        if (typeof data.serverTime !== "number") {
          return;
        }
        const offset = data.serverTime - Date.now();
        setServerOffsetMs(offset);
        setIsLive(isLiveNow(Date.now() + offset));
      } catch {
        return;
      }
    };

    syncServerTime();
  }, []);

  if (!isLive && !isUnlocked) {
    return <ComingSoon />;
  }

  return (
    <DefaultLayout>
      <Homepage />
    </DefaultLayout>
  );
}
