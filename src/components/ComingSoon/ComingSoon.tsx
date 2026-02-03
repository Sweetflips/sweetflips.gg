"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
};

const targetTimestamp = Date.UTC(2026, 1, 3, 9, 0, 0);

const getTimeLeft = (nowMs: number): TimeLeft => {
  const diffMs = Math.max(targetTimestamp - nowMs, 0);
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isLive: diffMs === 0,
  };
};

const pad = (value: number) => String(value).padStart(2, "0");

export default function ComingSoon() {
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    getTimeLeft(Date.now()),
  );
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

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
        setTimeLeft(getTimeLeft(Date.now() + offset));
      } catch {
        return;
      }
    };

    syncServerTime();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(Date.now() + serverOffsetMs));
    }, 1000);

    return () => clearInterval(timer);
  }, [serverOffsetMs]);

  useEffect(() => {
    const readUnlockFlag = () => {
      const stored = localStorage.getItem("unlock_casino");
      setIsUnlocked(stored === "true");
    };

    readUnlockFlag();
    window.addEventListener("storage", readUnlockFlag);

    return () => window.removeEventListener("storage", readUnlockFlag);
  }, []);

  const showCountdown = !timeLeft.isLive && !isUnlocked;

  return (
    <main className="min-h-screen text-white">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-45">
          <div className="bg-animation">
            <div id="stars" />
            <div id="stars2" />
            <div id="stars3" />
            <div id="stars4" />
          </div>
          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Site Update
          </span>

          <h1 className="max-w-3xl font-satoshi text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Get Ready for Tomorrow
          </h1>

          <p className="max-w-2xl text-base text-white/80 md:text-lg">
            We are preparing the new SweetFlips experience.
          </p>

          {showCountdown ? (
            <>
              <div className="mt-6 grid w-full max-w-3xl gap-4 sm:grid-cols-4">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 shadow-6 backdrop-blur-sm"
                  >
                    <div className="text-3xl font-semibold text-white md:text-4xl">
                      {pad(item.value)}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm text-white/70">
                Countdown is based on UTC time.
              </div>
            </>
          ) : (
            <div className="mt-6 text-sm text-white/70">
              We are live now.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
