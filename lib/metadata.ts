// lib/metadata.ts
import type { Metadata } from "next";

interface OGOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sweetflips.gg";

export const createMetadata = ({
  title,
  description,
  path,
  image = "/images/logo/sweet_flips.png",
}: OGOptions): Metadata => {
  const fullImageUrl = `${BASE_URL}${image}`;
  const fullPageUrl = `${BASE_URL}${path}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: fullPageUrl,
      siteName: "Sweetflips",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImageUrl],
    },
  };
};
