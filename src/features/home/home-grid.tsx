export function HomeGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mask-t-from-82% mask-b-from-82%"
    >
      <div className="animate-grid-pan opacity-55" />
      <div className="absolute inset-0 grid-spotlight-240 transition-opacity duration-150 ease-out">
        <div className="animate-grid-pan grid-spotlight-lines-10" />
      </div>
    </div>
  );
}
