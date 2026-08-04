import MuxPlayer from "@mux/mux-player-react";

export function VideoPlayer({ playbackId }: { playbackId: string }) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      maxResolution="720p"
      nohotkeys
      autoPlay={true}
      loop={true}
      className="block aspect-4/3 bg-black w-full [--controls:none] [--loading-indicator:none] [--dialog:none]"
    />
  );
}
