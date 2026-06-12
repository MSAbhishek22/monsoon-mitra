export function WeatherSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white shadow-card">
      <div className="skeleton h-4 w-32 mb-3" />
      <div className="skeleton h-12 w-24 mb-2" />
      <div className="skeleton h-4 w-48" />
    </div>
  );
}

export function ForecastSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="skeleton rounded-xl flex-shrink-0" style={{ width: '72px', height: '100px' }} />
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="skeleton h-12 w-48 rounded-2xl self-end" />
      <div className="skeleton h-20 w-64 rounded-2xl self-start" />
      <div className="skeleton h-12 w-40 rounded-2xl self-end" />
      <div className="skeleton h-16 w-56 rounded-2xl self-start" />
    </div>
  );
}
