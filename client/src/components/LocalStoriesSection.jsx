import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

const LOCAL_VIDEOS = [
  { src: "/videos/video1.mp4", label: "Story 1" },
  { src: "/videos/video2.mp4", label: "Story 2" },
  { src: "/videos/video3.mp4", label: "Story 3" },
  { src: "/videos/video4.mp4", label: "Story 4" },
];

export default function LocalStoriesSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  const playVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setIsPlaying(true);
      setHasStarted(true);
    } catch (err) {
      setIsPlaying(false);
      console.warn("Local video playback skipped:", err);
    }
  };

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || hasStarted) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playVideo();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setProgress(0);
    video.load();
    if (hasStarted || isPlaying) {
      window.setTimeout(() => playVideo(), 60);
    }
  }, [currentIndex]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => setIsMuted((value) => !value);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video?.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const handleScrub = (event) => {
    const video = videoRef.current;
    const value = Number(event.target.value);
    setProgress(value);
    if (video?.duration) {
      video.currentTime = (value / 100) * video.duration;
    }
  };

  const playAtIndex = (index) => {
    setCurrentIndex(index);
    setHasStarted(true);
    setIsPlaying(true);
  };

  const playNext = () => {
    setCurrentIndex((index) => (index + 1) % LOCAL_VIDEOS.length);
    setIsPlaying(true);
    setHasStarted(true);
  };

  const currentVideo = LOCAL_VIDEOS[currentIndex];

  return (
    <section ref={sectionRef} className="border-y border-white/5 bg-[#070708] px-6 py-20 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Watch Our Work</span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">Our Stories</h2>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-[8px] border border-brand-gold/20 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
            <div className="relative bg-black">
              <video
                ref={videoRef}
                src={currentVideo.src}
                className="aspect-video w-full bg-black object-contain"
                muted={isMuted}
                playsInline
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onEnded={playNext}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute right-4 top-4 rounded-full border border-brand-gold/35 bg-black/65 px-3 py-1 text-xs font-bold text-brand-gold">
                {currentIndex + 1} / {LOCAL_VIDEOS.length}
              </div>
            </div>

            <div className="grid gap-4 border-t border-white/10 bg-[#0b0b0d] p-4 md:grid-cols-[auto_auto_1fr_auto] md:items-center">
              <button type="button" onClick={togglePlay} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button type="button" onClick={toggleMute} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isMuted ? "Muted" : "Sound On"}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleScrub}
                className="h-2 w-full cursor-pointer accent-brand-gold"
                aria-label="Video progress"
              />
              <span className="text-center text-xs font-bold uppercase tracking-wider text-gray-500 md:text-right">{currentVideo.label}</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {LOCAL_VIDEOS.map((video, index) => (
              <button
                key={video.src}
                type="button"
                onClick={() => playAtIndex(index)}
                className={`group relative overflow-hidden rounded-[8px] border bg-black text-left transition-all duration-300 hover:scale-[1.02] ${
                  currentIndex === index ? "border-brand-gold shadow-[0_0_24px_rgba(201,162,39,0.18)]" : "border-white/10 hover:border-brand-gold/50"
                }`}
              >
                <video src={video.src} className="aspect-video w-full object-cover opacity-75" muted playsInline preload="metadata" />
                <span className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="h-8 w-8 rounded-full bg-brand-gold p-2 text-black" />
                </span>
                <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {index + 1} / {LOCAL_VIDEOS.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
