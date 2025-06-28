"use client";
import { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
// import Footer from "@/components/Footer/Footer"; // Removed Footer import

// Countdown Timer component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTargetDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      // Target the last day of the current month at 23:59:59 UTC
      // Note: Month is 0-indexed, so for Date constructor, month + 1 gives next month, day 0 gives last day of current month.
      const targetDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
      return targetDate.getTime();
    };

    let target = calculateTargetDate();

    const updateCountdown = () => {
      const now = new Date().getTime();
      // Recalculate target if current target has passed to aim for next month's end
      if (target - now < 0) {
        const currentDate = new Date();
        // If it's past this month's end, target next month's end.
        // This logic might need adjustment if the raffle should only ever show current month's countdown.
        // For now, it will roll over to the next month's end.
        const nextMonthTarget = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth() + 2, 0, 23, 59, 59));
        target = nextMonthTarget.getTime();
      }

      const distance = target - now;

      if (distance < 0) {
        // This case should ideally not be hit if rollover logic is correct
        setTimeLeft("00d 00h 00m 00s");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
      );
    };

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div className="text-2xl font-mono text-green-400 mb-6">{timeLeft}</div>;
}

export default function RaffleInfo() {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 text-white text-center flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#9925FE] mb-2">$2,000 Monthly Raffle</h2>
        <p className="text-lg sm:text-xl text-purple-200 mb-3">Raffle Ends In:</p>
        <CountdownTimer />

        {/* <div className="mb-8">
          <h3 className="text-xl sm:text-2xl font-semibold text-purple-300">Your Tickets:</h3>
          <p className="text-lg text-green-300">[Show User’s Ticket Count]</p>
        </div> */}

        {/* About the Raffle */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500 rounded-xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-10 w-full flex flex-col items-center text-center">
          <h3 className="text-2xl font-bold text-purple-300 mb-4">About the Raffle</h3>
          <p className="mb-4 max-w-prose">
            Every month, Sweetflips gives away <span className="text-[#9925FE] font-semibold">$2,000</span> to our community! Grab your entry tickets using <b>Sweetflips Points</b> and boost your chances the more tickets, the bigger your shot. Winners are picked live on the last day of each month at 19:00 UTC.
          </p>
          <p className="mb-4 max-w-prose">
            If you win, your prize is paid out instantly to your Sweetflips wallet.
          </p>

          <h4 className="text-xl font-semibold text-purple-200 mt-6 mb-2">How to Enter</h4>
          <p className="mb-2">Buy 1 entry ticket for just <b>10 Sweetflips Points</b></p>
          <p className="mb-4">No ticket limit grab as many as you want!</p>
          <p className="mb-6">Every ticket is a new shot at one of the prizes below.</p>
            <a href="/shop">
          <button className="mt-4 mx-auto inline-block rounded-xl bg-[#9925FE] px-6 py-3 text-white font-semibold hover:opacity-90 transition">
            Buy Tickets Now
          </button>
          </a>
        </div>

        {/* Raffle Prizes */}
        <div className="mb-10 w-full text-center">
          <h3 className="text-2xl font-bold text-purple-300 mb-4">Raffle Prizes</h3>
          <ul className="space-y-2 text-base inline-block text-left">
            <li>🥇 1st Place: <b>$800</b></li>
            <li>🥈 2nd Place: <b>$400</b></li>
            <li>🥉 3rd Place: <b>$250</b></li>
            <li>🏅 4th Place: <b>$150</b></li>
            <li>🎖️ 5th Place: <b>$100</b></li>
            <li>🎁 6th – 10th Place: <b>$50</b> each</li>
            <li>💰 11th – 20th Place: <b>$20</b> each</li>
          </ul>
          <p className="mt-4 text-yellow-300 font-medium">
            That’s 20 winners every month — all picked live!
          </p>
        </div>

        {/* Key Info and Terms */}
        <div className="text-center text-sm text-purple-200 w-full">
          <h4 className="text-lg font-semibold mb-2">Key Info</h4>
          <ul className="mb-4 space-y-1 inline-block text-left">
            <li>📅 Raffle Draw: Last day of each month at 19:00 UTC</li>
            <li>🎟️ Tickets: 10 Sweetflips Points each</li>
            <li>🔁 No Max Entries: Stack as many as you want!</li>
            <li>📧 Winners: Announced by email</li>
          </ul>

          <h4 className="text-lg font-semibold mb-2">Other Terms</h4>
          <ul className="space-y-1 inline-block text-left">
            <li>❗ All points spent on tickets are non-refundable.</li>
            <li>🔄 Winners are drawn randomly from all tickets in the pool.</li>
            <li>💵 Prizes are paid in <b>USDT</b>.</li>
            <li>🚫 Cheating or abusing the system will void your entry.</li>
            <li>📩 For questions, contact support via <b>Telegram</b>.</li>
          </ul>
        </div>
      </div>

      {/* <Footer /> */} {/* Removed Footer component instance */}
    </DefaultLayout>
  );
}
