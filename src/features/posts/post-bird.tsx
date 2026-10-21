import { cn } from "cn";
import { useRef } from "react";

export function PostBird({
  src,
  audioSrc,
  className,
}: {
  src: string;
  audioSrc: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  function handleClick() {
    if (!audioRef.current) audioRef.current = new Audio(audioSrc);
    audioRef.current.currentTime = 0;
    void audioRef.current.play();

    const image = imageRef.current;
    if (!image) return;
    image.classList.remove("animate-bird-shake");
    void image.offsetWidth;
    image.classList.add("animate-bird-shake");
  }

  return (
    <button
      type="button"
      aria-label="Play the pigeon sound"
      onClick={handleClick}
      className={cn(
        "mx-auto block w-20 cursor-pointer md:absolute md:top-1/2 md:right-full md:mr-6 md:-translate-y-1/2",
        className,
      )}
    >
      <img ref={imageRef} src={src} alt="" width={80} height={51} className="w-full" />
    </button>
  );
}
