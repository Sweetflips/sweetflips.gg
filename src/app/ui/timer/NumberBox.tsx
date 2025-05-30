import React from 'react'

interface numProp {
    num: string | number,
    unit: string,
    flip: boolean,
};

export const NumberBox = ({ num, unit, flip }: numProp) => {
    return (
        <div className="flex flex-col items-center px-1 sm:px-2">
            <div className=" relative bg-transparent flex flex-col items-center justify-center rounded-lg w-14 h-13 xs:w-8 xs:h-7 sm:w-12 sm:h-11  md:w-16 md:h-15  text-2xl md:text-4xl mt-4 ">
                <div className="rounded-t-lg rounded-b-lg  bg-[#7B39CA] w-full h-full"></div>

                <div className=" absolute text-white z-10 font-bold font-redhat text-xl xs:text-2xl md:text-3xl font-mono ">
                    {num}
                </div>

                <div className=" rounded-b-lg rounded-t-lg bg-[#7B39CA] w-full h-full"></div>

                <div className={`absolute  w-full h-1/2 top-0  rounded-t-lg z-5 ${flip ? 'animate-flip bg-accent-1' : 'bg-transparent'}`}></div>
            </div>
            <p className="mt-1 font-semibold text-white  text-xs xs:text-lg  md:text-l ">
                {unit}
            </p>
        </div>
    )
}
