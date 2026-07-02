export default function SkeletonLoader({ count = 8 }) {
  return (
    <div className="flex flex-col gap-2 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <div className="w-10 h-10 rounded-lg skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 skeleton" />
            <div className="h-2 w-20 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
