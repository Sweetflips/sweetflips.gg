import React, { useEffect, useState } from "react";
import { NumberBox } from "./NumberBox";
import { TimerContainer } from "./TimerContainer";
import { DateTime } from "luxon";

interface timerProps {
  type: string;
  date: string;
}

export const Timer = ({ type, date }: timerProps) => {
  const [time, setTime] = useState<number>(7);
  const [newTime, setNewTime] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  const timeToDays = time * 60 * 60 * 24 * 1000;

  // Use Luxon to convert to Amsterdam timezone
  const countDownDate = DateTime.fromISO(date)
    .setZone("Europe/Amsterdam")
    .toJSDate()
    .getTime();

  useEffect(() => {
    const updateTime = setInterval(() => {
      const now = DateTime.now().setZone("Europe/Amsterdam").toJSDate().getTime();

      const difference = countDownDate - now;

      const newDays = Math.floor(difference / (1000 * 60 * 60 * 24));
      const newHours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const newMinutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const newSeconds = Math.floor((difference % (1000 * 60)) / 1000);

      setDays(newDays);
      setHours(newHours);
      setMinutes(newMinutes);
      setSeconds(newSeconds);

      if (difference <= 0) {
        clearInterval(updateTime);
        setMessage("The Launch Has Started");
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
      }
    });

    return () => {
      clearInterval(updateTime);
    };
  }, [time]);

  const handleClick = () => {
    setTime(newTime);
    // console.log(time);
    setNewTime(0);
  };

  const handleChange = (e: any) => {
    let inputTime = e.target.value;
    setNewTime(inputTime);
  };

  return (
    <TimerContainer
      type={type}
      days={days}
      hours={hours}
      minutes={minutes}
      seconds={seconds}
    />
  );
};