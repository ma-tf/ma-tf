import { Wash } from "@components/wash";
import { Sphere } from "@features/home/sphere";

export function HomeGrid() {
  return (
    <>
      <div
        aria-hidden="true"
        data-grid
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mask-depth-fog transition-opacity duration-150 ease-out motion-reduce:transition-none"
      >
        <div className="absolute inset-0 opacity-55">
          <Sphere variant="base" />
        </div>
        <div className="absolute inset-0 grid-spotlight-240 transition-opacity duration-150 ease-out">
          <Sphere variant="spotlight" />
        </div>
      </div>
      <Wash color="gray" />
      <Wash color="taupe" />
      <Wash color="blue" />
      <Wash color="emerald" />
    </>
  );
}
