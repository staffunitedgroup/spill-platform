"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { BrandedText } from "@/components/brand-text";
import styles from "./album.module.css";

export type CarouselItem = {
  title: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  alt?: string;
  contain?: boolean;
};

type CategoryCarouselProps = {
  category: string;
  items: CarouselItem[];
};

const imageDimensions: Record<string, readonly [number, number]> = {
  "/assets/spill/home/venue-night.jpg": [1600, 1156],
  "/assets/spill/concept-exterior-day.webp": [1200, 848],
  "/assets/spill/livestream/hero.png": [1122, 1402],
  "/assets/spill/livestream/connected-reach.png": [1024, 426],
  "/assets/spill/livestream/Founder interviews.png": [941, 1672],
  "/assets/spill/livestream/Panel conversations.png": [941, 1672],
  "/assets/spill/livestream/Product introductions.png": [941, 1672],
  "/assets/spill/livestream/Brand storytelling.png": [941, 1672],
  "/assets/spill/podcast/hero.png": [1672, 941],
  "/assets/spill/podcast/brand-formats.jpg": [1024, 682],
  "/assets/spill/podcast/featured-founders.jpg": [853, 1024],
  "/assets/spill/podcast/featured-people.jpg": [1024, 576],
  "/assets/spill/podcast/featured-culture.jpg": [1024, 682],
  "/assets/spill/podcast/batch-production.png": [1145, 1374],
  "/assets/spill/confessional/hero.png": [1448, 1086],
  "/assets/spill/concept-confessional.webp": [850, 1020],
  "/assets/spill/confessional/public-format.png": [1536, 1024],
  "/assets/spill/confessional/private-format.png": [1536, 1024],
  "/assets/spill/confessional/long-form-format.png": [1536, 1024],
  "/assets/spill/confessional/content-engine.png": [1536, 1024],
  "/assets/spill/confessional/fnb-integration.png": [1536, 1024],
  "/assets/spill/confessional/self-contained-relocatable.png": [1024, 1536],
  "/assets/spill/concept-menu.webp": [1100, 825],
  "/assets/spill/home/coffee.jpg": [1400, 1050],
  "/assets/spill/menu/coffee.webp": [940, 1670],
  "/assets/spill/menu/matcha-tea.webp": [940, 1670],
  "/assets/spill/menu/fruit-yogurt.webp": [940, 1670],
  "/assets/spill/menu/bite-sweets.webp": [940, 1670],
  "/assets/spill/menu/beer.webp": [940, 1670],
  "/assets/spill/menu/wine.webp": [940, 1670],
  "/assets/spill/menu/spill-signature.webp": [940, 1670],
  "/assets/spill/menu/extra-page.webp": [940, 1670],
};

const glowPalettes: Record<string, string[]> = {
  "SPILL Overview": ["#ff1838", "#c56b3f", "#ed9864", "#00d9ef", "#ff5069"],
  "SPILL Livestream": ["#ff1838", "#f1a060", "#ff563f", "#00d9ef", "#dc8757", "#b55cff", "#4db6ff", "#ffbe5c"],
  "SPILL Podcast": ["#ff1838", "#d28c67", "#ff7a3d", "#7f69ff", "#d5a158", "#ec5d8c", "#00d9ef", "#8b5cf6"],
  "SPILL Confessional": ["#ff1838", "#9a46ff", "#ef476f", "#e8a847", "#00d9ef", "#8b5cf6", "#f97316", "#ec4899", "#f59e0b", "#22c55e"],
  "SPILL Saigon Menu": ["#ff1838", "#ef8f4a", "#a46a42", "#c48b5b", "#7cab52", "#e06382", "#e1a866", "#f0b84d", "#8f2d56", "#e85d36", "#b58055"],
};

export function CategoryCarousel({ category, items }: CategoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentItem = items[currentIndex];
  const glow = glowPalettes[category]?.[currentIndex] ?? "#ff1838";
  const [mediaWidth, mediaHeight] =
    currentItem.type === "image"
      ? (imageDimensions[currentItem.src] ?? [16, 9])
      : [1280, 720];
  const mediaStyle = {
    "--slide-glow": glow,
  } as CSSProperties;

  useEffect(() => {
    const media = mediaRef.current;
    const video = videoRef.current;

    if (currentItem.type !== "video" || !media || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          video.play().catch(() => setIsPlaying(false));
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.4] },
    );

    observer.observe(media);
    return () => observer.disconnect();
  }, [currentItem.src, currentItem.type]);

  const move = (direction: -1 | 1) => {
    videoRef.current?.pause();
    setIsPlaying(false);
    setDirection(direction);
    setCurrentIndex(
      (index) => (index + direction + items.length) % items.length,
    );
  };

  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className={styles.carousel} aria-label={`${category} gallery`}>
      <div className={styles.mediaRow}>
        <button
          className={`${styles.sideControl} ${styles.backControl}`}
          type="button"
          onClick={() => move(-1)}
          disabled={items.length < 2}
          aria-label={`Previous ${category} item`}
        >
          <span aria-hidden="true">←</span>
        </button>

        <div
          ref={mediaRef}
          className={styles.media}
          style={mediaStyle}
        >
          {currentItem.type === "video" ? (
            <video
              key={currentItem.src}
              ref={videoRef}
              className={`${styles.slideMedia} ${direction === 1 ? styles.slideNext : styles.slidePrevious}`}
              width={mediaWidth}
              height={mediaHeight}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={currentItem.poster}
              aria-label={`${currentItem.title} film`}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            >
              <source src={currentItem.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
              key={currentItem.src}
              className={`${styles.slideMedia} ${direction === 1 ? styles.slideNext : styles.slidePrevious} ${currentItem.contain ? styles.contain : ""}`}
              src={currentItem.src}
              alt={currentItem.alt ?? `SPILL ${currentItem.title}`}
              width={mediaWidth}
              height={mediaHeight}
              sizes="(max-width: 1280px) 100vw, 1200px"
            />
          )}
        </div>

        <button
          className={`${styles.sideControl} ${styles.nextControl}`}
          type="button"
          onClick={() => move(1)}
          disabled={items.length < 2}
          aria-label={`Next ${category} item`}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className={styles.caption}>
        <h3><BrandedText text={currentItem.title} /></h3>
        <div className={styles.captionMeta}>
          <span className={styles.slideCount} aria-live="polite">
            {currentIndex + 1} / {items.length}
          </span>
          {currentItem.type === "video" && (
            <button
              className={styles.videoControl}
              type="button"
              onClick={toggleVideo}
              aria-label={`${isPlaying ? "Stop" : "Play"} ${currentItem.title}`}
              aria-pressed={isPlaying}
            >
              <span aria-hidden="true">{isPlaying ? "■" : "▶"}</span>
              {isPlaying ? "Stop" : "Play"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
