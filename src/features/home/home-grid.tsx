import { Wash } from "@components/wash";

export function HomeGrid() {
  return (
    <>
      <div
        aria-hidden="true"
        data-grid
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mask-t-from-82% mask-b-from-82% transition-opacity duration-150 ease-out motion-reduce:transition-none"
      >
        <div className="animate-grid-pan opacity-55" />
        <div className="absolute inset-0 grid-spotlight-240 transition-opacity duration-150 ease-out">
          <div className="animate-grid-pan grid-spotlight-lines-10" />
        </div>
      </div>
      <Wash color="gray" />
      <Wash color="taupe" />
      <Wash color="blue" />
      <Wash color="emerald" />
    </>
  );
}
