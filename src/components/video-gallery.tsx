"use client";

import { useRef, useState } from "react";
import type { ChannelVideo } from "@/lib/youtube-feed";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

/** Latest channel videos: one big player, pick any thumbnail to play it there. */
export function VideoGallery({ videos }: { videos: ChannelVideo[] }) {
  const [current, setCurrent] = useState(videos[0]);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  function play(video: ChannelVideo) {
    setCurrent(video);
    setPlaying(true);
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="videoGallery">
      <div className="videoStage" ref={playerRef}>
        <div className="videoFrame">
          {playing ? (
            <iframe
              key={current.id}
              src={`https://www.youtube-nocookie.com/embed/${current.id}?autoplay=1&rel=0`}
              title={current.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            // Thumbnail first: nothing loads from YouTube until someone presses play.
            <button type="button" className="videoPoster" onClick={() => setPlaying(true)} aria-label={`Play ${current.title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.thumbnail} alt="" />
              <span className="videoPlay" aria-hidden="true">▶</span>
            </button>
          )}
        </div>
        <div className="videoStageInfo">
          <p className="eyebrow">{current.isShort ? "Short" : "Latest from SPILL"}</p>
          <h3>{current.title}</h3>
          <p>{formatDate(current.publishedAt)}</p>
          <a className="textLink" href={`https://www.youtube.com/watch?v=${current.id}`} target="_blank" rel="noreferrer">
            Watch on YouTube <span>↗</span>
          </a>
        </div>
      </div>

      {videos.length > 1 && (
        <ul className="videoList">
          {videos.map((video) => (
            <li key={video.id}>
              <button
                type="button"
                className={video.id === current.id ? "active" : undefined}
                aria-current={video.id === current.id ? "true" : undefined}
                onClick={() => play(video)}
              >
                <span className="videoThumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={video.thumbnail} alt="" loading="lazy" />
                  {video.isShort && <i>Short</i>}
                </span>
                <span className="videoMeta">
                  <b>{video.title}</b>
                  <small>{formatDate(video.publishedAt)}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
