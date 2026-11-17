const homeFragmentCopy = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
];

export function HomeFragments() {
  return (
    <div
      aria-hidden="true"
      data-home-fragments
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-clip md:block"
    >
      {homeFragmentCopy.map((copy) => (
        <p
          key={copy}
          data-home-fragment
          hidden
          className="invisible absolute w-56 font-mono text-xs leading-relaxed text-muted-foreground opacity-0 transition-opacity ease-in-out motion-reduce:transition-none"
        >
          {copy}
        </p>
      ))}
    </div>
  );
}
