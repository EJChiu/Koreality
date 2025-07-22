import { Suspense } from 'react';
import MapPageClient from './MapPageClient';

// Loading 組件
function MapLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">載入地圖中...</p>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<MapLoading />}>
      <MapPageClient />
    </Suspense>
  );
}
