import { cn } from "@lib/cn";
import MuxPlayer, { type MuxPlayerProps } from "@mux/mux-player-react";

export function VideoPlayer({
  playbackId,
  className,
  ...props
}: { playbackId: string; className?: string } & Omit<MuxPlayerProps, "playbackId">) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      maxResolution="720p"
      nohotkeys
      autoPlay={true}
      loop={true}
      {...props}
      className={cn(
        "block aspect-4/3 max-h-full w-full bg-black [--controls:none] [--dialog:none] [--loading-indicator:none]",
        className,
      )}
    />
  );
}
