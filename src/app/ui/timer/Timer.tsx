import React, { useEffect, useMemo, useState } from "react";
import { TimerContainer } from "./TimerContainer";
import { DateTime } from "luxon";

interface TimerProps {
  type: string;
  date: string;
}

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const ZERO_COUNTDOWN: CountdownState = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

const getCountdown = (
  targetDateMillis: number,
  nowMillis: number,
): CountdownState => {
  const difference = Math.max(targetDateMillis - nowMillis, 0);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

export const Timer = ({ type, date }: TimerProps) => {
  const [countdown, setCountdown] = useState<CountdownState>(ZERO_COUNTDOWN);
  const countDownDate = useMemo(
    () => DateTime.fromISO(date, { zone: "utc" }).toMillis(),
    [date],
  );

  useEffect(() => {
    if (!Number.isFinite(countDownDate)) {
      setCountdown(ZERO_COUNTDOWN);
      return;
    }
    const updateCountdown = () => {
      setCountdown(getCountdown(countDownDate, DateTime.utc().toMillis()));
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);
    return () => {
      window.clearInterval(timerId);
    };
  }, [countDownDate]);

  return (
    <TimerContainer
      type={type}
      days={countdown.days}
      hours={countdown.hours}
      minutes={countdown.minutes}
      seconds={countdown.seconds}
    />
  );
};
