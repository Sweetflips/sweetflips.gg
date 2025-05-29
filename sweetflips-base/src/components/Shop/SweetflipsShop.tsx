import React from 'react';
import Image from 'next/image';


const RazedPopup: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="FooterBg text-white p-6 rounded-lg w-11/12 sm:w-1/3 z-50">
      <Image
    src="/images/cover/Coming_Soon_Message.webp"
    alt="Coming Soon Message"
    className="rounded-xl"
    width={800}
    height={400}
  />
      </div>
    </div>
  );
};

export default RazedPopup;
