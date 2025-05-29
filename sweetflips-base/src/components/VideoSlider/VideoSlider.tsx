"use client";
import React, { useState } from "react";
import Slider from "react-slick";
import "@/css/youtubeSlider.css";

interface Movie {
  id: string;
  title: string;
  videoUrl: string;
}

const VideoSlider: React.FC = () => {
  const [movies] = useState<Movie[]>([
    {
      id: "1",
      title: "",
      videoUrl: "/videos/maax win.mp4",
    },
    {
      id: "2",
      title: "",
      videoUrl: "/videos/28k DeaDead or Deader slot  2.mp4",
    },
    {
      id: "3",
      title: "",
      videoUrl: "/videos/Rolexxxx.mp4",
    },
    {
      id: "4",
      title: "",
      videoUrl: "/videos/Big win.mp4",
    },
  ]);
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: false,
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
    <div className="video-slider-container">
      <Slider {...settings}>
        {movies.map((movie) => (
          <div key={movie.id} className="video-slide">
            <div>
              <video
              className="rounded-xl"
                width="100%"
                height="auto"
                controls
                preload="auto"
                autoPlay={false}
              >
                <source src={movie.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <h4>{movie.title}</h4>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default VideoSlider;