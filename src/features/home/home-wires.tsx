const WIRE_PAIRS = 6;
const WIRES_PER_PAIR = 2;

export function HomeWires() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-home-wires
      stroke="currentColor"
      strokeWidth={1.25}
      className="pointer-events-none fixed inset-0 h-full w-full fill-none text-border opacity-70"
    >
      {Array.from({ length: WIRE_PAIRS * WIRES_PER_PAIR }, (_, index) => (
        <path key={index} data-home-wire={index} d="" />
      ))}
    </svg>
  );
}
