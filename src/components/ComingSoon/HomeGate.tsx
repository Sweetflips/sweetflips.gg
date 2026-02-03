"use client";

import { useEffect, useState } from "react";
import ComingSoon from "@/components/ComingSoon/ComingSoon";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Homepage from "@/components/Homepage/Homepage";

const targetTimestamp = Date.UTC(2026, 1, 3, 9, 0, 0);

const isLiveNow = (nowMs: number) => nowMs >= targetTimestamp;

export default function HomeGate() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [serverOffsetMs, setServerOffsetMs] = useState<number | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    const readUnlockFlag = () => {
      setIsUnlocked(localStorage.getItem("unlock_casino") === "true");
    };

    readUnlockFlag();
    window.addEventListener("storage", readUnlockFlag);

    return () => {
      window.removeEventListener("storage", readUnlockFlag);
    };
  }, []);

  useEffect(() => {
    const localIsLive = isLiveNow(Date.now());
    if (!localIsLive) {
      setIsLive(false);
    }

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
    const timer = setInterval(syncServerTime, 30000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (serverOffsetMs === null) {
      return;
    }
    const timer = setInterval(() => {
      setIsLive(isLiveNow(Date.now() + serverOffsetMs));
    }, 1000);

    return () => clearInterval(timer);
  }, [serverOffsetMs]);

  const isGateUnlocked = isUnlocked || (serverOffsetMs !== null && isLive);

  if (!isGateUnlocked) {
    return <ComingSoon />;
  }

  return (
    <DefaultLayout>
      <Homepage />
    </DefaultLayout>
  );
}
