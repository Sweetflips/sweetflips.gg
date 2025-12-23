import Image from 'next/image';

const Loader = () => {
  return (
    <div className="relative flex h-screen items-center justify-center">
      <div className="h-64 w-64 animate-spin rounded-full border-4 border-solid border-sweetflipsbg border-t-transparent"></div>
      <Image
        src="/images/logo/sweet_flips_emblem.png"
        alt="SweetFlips Emblem"
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-bounce"
        width={96}
        height={96}
        priority
      />
    </div>
  );
};

export default Loader;
