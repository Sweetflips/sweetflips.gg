import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Content Not Available | SweetFlips",
  description: "This content is not available in your region.",
};

export default function RestrictedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0a12] px-4">
      <div className="max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <svg
            className="h-10 w-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-3xl font-bold text-white">
          Content Not Available
        </h1>

        {/* Description */}
        <p className="mb-6 text-gray-400">
          We&apos;re sorry, but the content on this website is not available in your
          region due to local regulations regarding online gambling content.
        </p>

        <p className="mb-8 text-sm text-gray-500">
          Sweetflips Holdings Limited complies with all applicable gambling laws
          and regulations. We do not promote, market, or provide gambling-related
          content to residents of jurisdictions where such content is prohibited
          or restricted.
        </p>

        {/* Divider */}
        <div className="mb-8 border-t border-gray-800"></div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link
            href="/terms-of-service"
            className="text-gray-400 transition-colors hover:text-primary"
          >
            Terms of Service
          </Link>
          <span className="text-gray-600">|</span>
          <Link
            href="/privacy-policy"
            className="text-gray-400 transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Company Info */}
        <p className="mt-8 text-xs text-gray-600">
          © {new Date().getFullYear()} Sweetflips Holdings Limited | Malta
        </p>
      </div>
    </div>
  );
}
