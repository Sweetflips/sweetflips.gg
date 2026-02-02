"use client";

import { useEffect, useState } from "react";
import ComingSoon from "@/components/ComingSoon/ComingSoon";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Homepage from "@/components/Homepage/Homepage";

const targetTimestamp = Date.UTC(2026, 1, 3, 9, 0, 0);

const isLiveNow = () => Date.now() >= targetTimestamp;

export default function HomeGate() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(isLiveNow());

  useEffect(() => {
    const readState = () => {
      setIsLive(isLiveNow());
      setIsUnlocked(localStorage.getItem("unlock_casino") === "true");
    };

    readState();
    const timer = setInterval(readState, 1000);
    window.addEventListener("storage", readState);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", readState);
    };
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
