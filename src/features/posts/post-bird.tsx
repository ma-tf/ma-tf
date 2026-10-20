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
        "absolute top-1/2 right-full mr-6 hidden w-20 -translate-y-1/2 cursor-pointer md:block",
        className,
      )}
    >
      <img ref={imageRef} src={src} alt="" width={80} height={51} className="w-full" />
    </button>
  );
}
