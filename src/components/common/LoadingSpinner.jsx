// src/components/common/LoadingSpinner.jsx — Section 25 shimmer skeletons
import React from 'react';

export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function WeatherCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export function ForecastStripSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="min-w-[72px] h-[100px] rounded-xl" />
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex justify-end"><Skeleton className="h-10 w-3/5 rounded-2xl" /></div>
      <div className="flex justify-start"><Skeleton className="h-14 w-4/5 rounded-2xl" /></div>
      <div className="flex justify-end"><Skeleton className="h-10 w-2/5 rounded-2xl" /></div>
    </div>
  );
}

export function IrrigationSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
}

export default function LoadingSpinner({ size = 32 }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div
        className="border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
