export const IsLoadingView = () => {
  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden  border-neutral-200 bg-neutral-50">
      <div className="absolute inset-0">
        <div className="loading-shimmer" />
      </div>
      <div className="relative z-10">
        <p className="text-neutral-500">Loading document...</p>
      </div>
    </div>
  );
};
