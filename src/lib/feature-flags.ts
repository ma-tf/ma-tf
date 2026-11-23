const flag = (name: string): boolean => import.meta.env[name] === "true";

export const previews = {
  graphics: flag("PUBLIC_PREVIEW_GRAPHICS"),
};

export const askEnabled = flag("PUBLIC_ASK_ENABLED");

export const audioPlayerEnabled = flag("PUBLIC_AUDIO_PLAYER_ENABLED");
