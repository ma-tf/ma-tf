import { AspectRatio } from "@components/ui/aspect-ratio";

export function PhotographyPreview() {
  return (
    <div className="w-lg md:w-2xl">
      <div className="flex justify-between">
        <h2>Photography</h2>
        <a href="/photography">View all photographs</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="col-span-3">
          <AspectRatio ratio={1 / 1} className="bg-gray-300" />
          <span>Blah blah blah</span>
        </div>
        <div className="col-span-2">
          <AspectRatio ratio={1 / 1} className="bg-gray-300" />
          <span>Blah blah blah</span>
        </div>
        <div className="col-span-3">
          <AspectRatio ratio={16 / 9} className="bg-gray-300" />
          <span>Blah blah blah</span>
        </div>
        <div className="col-span-2">
          <AspectRatio ratio={9 / 16} className="bg-gray-300" />
          <span>Blah blah blah</span>
        </div>
      </div>
    </div>
  );
}
