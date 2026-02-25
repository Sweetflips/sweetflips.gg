import Image from 'next/image';

const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-64 w-64 animate-spin rounded-full border-4 border-solid border-sweetflipsbg border-t-transparent"></div>
      <Image
        src="/images/logo/sweet_flips_emblem.png"
        alt="SweetFlips Emblem"
        className="h-24 w-24 md:h-24 md:w-24 animate-bounce absolute"
        width={96}
        height={96}
        priority
        unoptimized
      />
    </div>
  );
};

export default Loader;
