import React from 'react'
import { NumberBox } from './NumberBox'

interface timeProps{
  type: string,
  days: number | string,
  hours:number | string ,
  minutes:number | string,
  seconds:number | string,
}

export const TimerContainer = ({type, days, hours, minutes ,seconds }: timeProps) => {

  let daysFlip = false;
  let hoursFlip = false;
  let minutesFlip = false;
  let secondsFlip = true;

if (Number(seconds) <= 0 && Number(minutes) <= 0 && Number(hours) <= 0 && Number(days) <= 0){
  daysFlip =  false;
  hoursFlip =  false;
  minutesFlip = false;
  secondsFlip = false;
}

if(Number(seconds) === 0){
  if( Number(minutes) !== 0){
    seconds = 59;
  }
  
  secondsFlip = false;
  minutesFlip = true;
}
if (Number(minutes) === 0 ){
  if( Number(hours) !== 0){
    minutes = 59;
  }
  
  minutesFlip = false;
  hoursFlip = true;
}

if( Number(hours) === 0){
  hoursFlip = false;
  if(Number(days) !== 0){
    daysFlip = true;
  }
  
}

 

  if(Number(days) < 10){
    days = "0" + days;
  }
  
  if(Number(hours) < 10){
    hours = "0" + hours;
  }
  
  if(Number(minutes) < 10){
    minutes = "0" + minutes;
  }
  
  if(Number(seconds) < 10){
    seconds = "0" + seconds;
  }
  
    return (
      <div className="rounded-xl">
      <div className="px-10 flex items-center justify-between mt-2  rounded-xl md:px-6  text-accent ">
        {type === "simple" ? (
        <>
        <span className="text-4xl font-bold text-white mr-2">{days}d {" "}</span>
        <span className="text-4xl font-bold text-white mr-2">{hours}h{" "}</span>
        <span className="text-4xl font-bold text-white mr-2">{minutes}m{" "}</span>
        <span className="text-4xl font-bold text-white ">{seconds}s</span>
        </>
        ) : 
        <>
        <NumberBox num={days} unit="Days" flip={daysFlip} />
        <span className="md:inline-block font-normal text-white   -mt-2 xs:-mt-6 md:-mt-4   text-xl xs:text-4xl md:text-3xl  ">:</span>
        <NumberBox num={hours} unit="Hours" flip={hoursFlip} />
        <span className="md:inline-block font-normal text-white   -mt-2 xs:-mt-6 md:-mt-4   text-xl xs:text-4xl md:text-3xl  ">:</span>
        <NumberBox num={minutes} unit="Minutes" flip={minutesFlip} />
        <span className="md:inline-block font-normal text-white   -mt-2 xs:-mt-6 md:-mt-4   text-xl xs:text-4xl md:text-3xl  ">:</span>
        <NumberBox num={seconds} unit="Seconds" flip={secondsFlip} />
        </>
       }
      </div>
      </div>
    );
}
