import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image"; // Import next/image
import "@/css/YoutubeSlider.css";

interface InstagramMedia {
  id: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string;
}

const InstagramSlider: React.FC = () => {
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const USER_ID = "1385750025756210"; // Your Instagram Business Account ID
  const ACCESS_TOKEN = "7eda632bfa44ba988c261d346c6cf56e"; // Access token generated via Facebook Developer tools
  const MAX_RESULTS = 10;

  const getCachedMedia = () => {
    const cachedMedia = localStorage.getItem("instagram_media");
    const cacheTime = localStorage.getItem("instagram_cache_time");

    if (cachedMedia && cacheTime) {
      const parsedCacheTime = parseInt(cacheTime, 10);
      const currentTime = new Date().getTime();

      // Check if the cache is older than 1 hour (3600000ms)
      if (currentTime - parsedCacheTime < 3600000) {
        return JSON.parse(cachedMedia);
      }
    }
    return null;
  };

  const setCache = (data: InstagramMedia[]) => {
    localStorage.setItem("instagram_media", JSON.stringify(data));
    localStorage.setItem("instagram_cache_time", new Date().getTime().toString());
  };

  // Fetch Instagram media
  useEffect(() => {
    const fetchMedia = async () => {
      const cachedMedia = getCachedMedia();

      if (cachedMedia) {
        setMedia(cachedMedia);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://graph.instagram.com/${USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url&access_token=${ACCESS_TOKEN}&limit=${MAX_RESULTS}`
        );
        const data = await response.json();

        const filteredMedia = data.data.map((item: any) => ({
          id: item.id,
          caption: item.caption || "No caption",
          mediaUrl: item.media_url,
          thumbnailUrl: item.thumbnail_url || item.media_url,
        }));

        setCache(filteredMedia); // Cache the media
        setMedia(filteredMedia);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch media", error);
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 10000,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="media-slider-container">
      <p className="mb-4 mt-10 flex flex-col items-center text-1xl font-bold text-white">
        Latest Instagram Posts
      </p>
      <Slider {...settings}>
        {media.map((item) => (
          <div key={item.id} className="media-slide">
            <a href={`https://www.instagram.com/p/${item.id}`} target="_blank" rel="noopener noreferrer">
              <Image
                src={item.thumbnailUrl}
                alt={item.caption}
                className="thumbnail"
                width={391} // Approximate width for 16:9 aspect ratio at height 220
                height={220}
                objectFit="cover" // Corresponds to the CSS object-fit: cover
              />
              <h4>{item.caption}</h4>
            </a>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default InstagramSlider;