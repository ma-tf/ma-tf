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
        "block bg-black w-full aspect-4/3 max-h-full [--controls:none] [--loading-indicator:none] [--dialog:none]",
        className,
      )}
    />
  );
}
