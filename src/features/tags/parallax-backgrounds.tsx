import { useParallax } from "@hooks/use-parallax";

const PARALLAX = { bg1: 0.1, bg2: 0.2, bg3: 0.3, bg4: 0.4, bg5: 0.5 } as const;

export function ParallaxBackgrounds() {
  const offset = useParallax();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -inset-2.5 bg-contain bg-top-left bg-no-repeat"
        style={{
          backgroundImage: "url('/tags%20bg1.webp')",
          transform: `translate(${offset.x * PARALLAX.bg1}px, ${offset.y * PARALLAX.bg1}px)`,
        }}
      />
      <div
        className="absolute -inset-2.5 bg-contain bg-top-left bg-no-repeat"
        style={{
          backgroundImage: "url('/tags%20bg2.webp')",
          transform: `translate(${offset.x * PARALLAX.bg2}px, ${offset.y * PARALLAX.bg2}px)`,
        }}
      />
      <div
        className="absolute -inset-2.5 bg-contain bg-top-left bg-no-repeat"
        style={{
          backgroundImage: "url('/tags%20bg3.webp')",
          transform: `translate(${offset.x * PARALLAX.bg3}px, ${offset.y * PARALLAX.bg3}px)`,
        }}
      />
      <div
        className="absolute -inset-2.5 bg-contain bg-top-left bg-no-repeat"
        style={{
          backgroundImage: "url('/tags%20bg4.webp')",
          transform: `translate(${offset.x * PARALLAX.bg4}px, ${offset.y * PARALLAX.bg4}px)`,
        }}
      />
      <div
        className="absolute -inset-5 bg-contain bg-top-left bg-no-repeat"
        style={{
          backgroundImage: "url('/tags%20bg5.webp')",
          transform: `translate(${offset.x * PARALLAX.bg5}px, ${offset.y * PARALLAX.bg5}px)`,
        }}
      />
    </div>
  );
}
