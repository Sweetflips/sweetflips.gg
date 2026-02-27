import React from "react";

const HomeBanner = () => {
  const spartansReferralCode = process.env.NEXT_PUBLIC_SPARTANS_REFERRAL_CODE || "SweetFlips";
  const luxdropAffiliateCode = process.env.NEXT_PUBLIC_LUXDROP_AFFILIATE_CODE || "sweetflips";
  // REFLINK (promo codes are not available yet)
  const spartansUrl = process.env.NEXT_PUBLIC_SPARTANS_SIGNUP_URL || "https://go.aff.spartans.com/fqf5mmbm";
  const luxdropUrl = `https://luxdrop.com/?r=${encodeURIComponent(luxdropAffiliateCode)}`;

  return (
    <div
      className="md:w-1/1 mx-auto flex h-1/8 transform items-center justify-center rounded-xl text-center transition-all sm:w-3/4"
    >
      <div className="my-auto flex w-full max-w-180 flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
          Welcome to <span style={{ 
            background: 'linear-gradient(to right, #cf171f, #cf171f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Sweet</span><span style={{ 
            background: 'linear-gradient(to right, #976daf, #7d59a5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Flips</span>
        </h1>
        <p className="mt-6 text-lg font-bold text-white sm:text-xl">
          The premier online casino community.
        </p>
        <p className="mt-4 text-lg font-bold text-white sm:text-xl">
          Earn money by watching our daily streams.
        </p>
        <p className="mt-6 text-sm text-white sm:text-base">
          Unlock and claim <b className="text-blue-400">exclusive bonuses</b> on{" "}
          <a
            href={spartansUrl}
            target="blank"
            className="font-extrabold !text-[#f0ff31] hover:!text-[#f0ff31] hover:underline"
            style={{ color: '#f0ff31' }}
          >
            Spartans
          </a>{" "}
          and{" "}
          <a
            href={luxdropUrl}
            target="blank"
            className="font-extrabold !text-[#1BB2FF] hover:!text-[#1BB2FF] hover:underline"
            style={{ color: '#1BB2FF' }}
          >
            LuxDrop
          </a>{" "}
          using code SweetFlips. From $100,000 monthly leaderboards to VIP perks, wager milestones, events, and much more, we&apos;ve got it all.
        </p>
      </div>
    </div>
  );
};

export default HomeBanner;
