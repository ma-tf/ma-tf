import { isSfxMuted, playSfx, setSfxMuted } from "@lib/sfx";
import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export function SfxToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => setMuted(isSfxMuted()), []);

  const toggle = () => {
    const next = !muted;
    setSfxMuted(next);
    setMuted(next);
    if (!next) playSfx();
  };

  const label = muted ? "Unmute sound effects" : "Mute sound effects";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid h-full cursor-pointer place-items-center px-1.5 text-muted-foreground transition-colors duration-150 hover:text-foreground dark:text-background/80 dark:hover:text-background"
    >
      {muted ? (
        <SpeakerSlashIcon size={12} weight="bold" aria-hidden="true" />
      ) : (
        <SpeakerHighIcon size={12} weight="bold" aria-hidden="true" />
      )}
    </button>
  );
}
