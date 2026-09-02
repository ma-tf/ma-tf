import { useParallax } from "@hooks/use-parallax";

const PARALLAX = { bg1: 0.1, bg2: 0.2, bg3: 0.3, bg4: 0.4, bg5: 0.5 } as const;
const BG_SIZE = "1440px auto ";

function bgStyle(image: string, factor: number, offset: { x: number; y: number }) {
  return {
    backgroundImage: `url('${image}')`,
    backgroundSize: BG_SIZE,
    transform: `translate(${offset.x * factor}px, ${offset.y * factor}px)`,
  };
}

export function ParallaxBackgrounds() {
  const offset = useParallax();

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -inset-2.5 bg-top-left bg-no-repeat"
        style={bgStyle("/tags%20bg1.webp", PARALLAX.bg1, offset)}
      />
      <div
        className="absolute -inset-2.5 bg-top-left bg-no-repeat"
        style={bgStyle("/tags%20bg2.webp", PARALLAX.bg2, offset)}
      />
      <div
        className="absolute -inset-2.5 bg-top-left bg-no-repeat dark:invert"
        style={bgStyle("/tags%20bg3.webp", PARALLAX.bg3, offset)}
      />
      <div
        className="absolute -inset-2.5 bg-top-left bg-no-repeat dark:invert"
        style={bgStyle("/tags%20bg4.webp", PARALLAX.bg4, offset)}
      />
      <div
        className="absolute -inset-5 bg-top-left bg-no-repeat dark:invert"
        style={bgStyle("/tags%20bg5.webp", PARALLAX.bg5, offset)}
      />
    </div>
  );
}
