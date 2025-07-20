'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { recordAdView, recordAdClick } from '@/lib/supabase-helpers';

interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  group_name?: string;
  priority: number;
}

interface AdCarouselProps {
  advertisements: Advertisement[];
}

const AdCarousel: React.FC<AdCarouselProps> = ({ advertisements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自動輪播
  useEffect(() => {
    if (advertisements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
    }, 5000); // 每 5 秒切換

    return () => clearInterval(interval);
  }, [advertisements.length]);

  // 記錄廣告曝光
  useEffect(() => {
    if (advertisements.length > 0 && advertisements[currentIndex]) {
      recordAdView(advertisements[currentIndex].id);
    }
  }, [currentIndex, advertisements]);

  if (advertisements.length === 0) {
    return (
      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">暫無廣告內容</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? advertisements.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
  };

  const handleAdClick = (ad: Advertisement) => {
    recordAdClick(ad.id);
    if (ad.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  const currentAd = advertisements[currentIndex];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* 廣告圖片 */}
      <div
        className="relative h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => handleAdClick(currentAd)}
      >
        <img
          src={currentAd.image_url}
          alt={currentAd.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            console.error('廣告圖片載入失敗:', currentAd.image_url);
            e.currentTarget.src =
              'https://via.placeholder.com/400x120/e5e7eb/6b7280?text=Advertisement';
          }}
        />

        {/* 漸層遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* 廣告標題 */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-sm font-medium drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {currentAd.title}
          </p>
        </div>

        {/* 如果有多張廣告，顯示左右箭頭 */}
        {advertisements.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* 指示器 */}
      {advertisements.length > 1 && (
        <div className="flex justify-center mt-2 space-x-1">
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdCarousel;
