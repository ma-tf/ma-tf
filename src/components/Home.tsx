export function Home() {
  return (
    <body className="flex h-screen flex-col justify-center bg-gray-900">
      <div className="flex flex-col">
        <h1 className="mb-2 text-4xl font-semibold">Under Construction</h1>
        <p className="mb-8 text-lg text-gray-400">Something is on its way.</p>
        <div className="flex flex-col gap-3">
          <span>Matt F</span>
          <a className="text-blue-400 hover:underline" href="https://github.com/ma-tf">
            github.com/ma-tf
          </a>
        </div>
      </div>
    </body>
  );
}
