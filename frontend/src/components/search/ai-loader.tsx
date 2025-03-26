export default function AiLoader({ response }: { response?: string }) {
  return (
    <div className="flex flex-col px-4 w-full gap-4 min-h-[300px]">
      <div className="w-full pl-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="font-medium">Searching...</span>
          <span className="text-neutral-500">
            - Looking through documents and posts
          </span>
        </div>
      </div>
      <div className="loading-bar" style={{ animationDelay: "0ms" }}></div>
      <div
        className="loading-bar max-w-sm"
        style={{ animationDelay: "100ms" }}
      ></div>
      <div className="flex gap-2">
        <div
          className="loading-bar max-w-sm"
          style={{ animationDelay: "200ms" }}
        ></div>
        <div
          className="loading-bar max-w-sm"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
      <div className="loading-bar" style={{ animationDelay: "400ms" }}></div>
      <div
        className="loading-bar max-w-sm"
        style={{ animationDelay: "500ms" }}
      ></div>
      <div className="loading-bar" style={{ animationDelay: "600ms" }}></div>
      <div
        className="loading-bar max-w-sm"
        style={{ animationDelay: "700ms" }}
      ></div>
    </div>
  );
}
