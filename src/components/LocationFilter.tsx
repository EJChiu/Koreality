'use client';

import React from 'react';

// 地點類型定義
export interface LocationType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// 顏色配置（保留供參考，但現在統一使用白色背景）
export const LOCATION_COLORS: Record<string, { bg: string; hex: string }> = {
  cafe: { bg: 'bg-amber-500', hex: '#f59e0b' },
  movie: { bg: 'bg-indigo-500', hex: '#6366f1' },
  billboard: { bg: 'bg-blue-500', hex: '#3b82f6' },
  popup: { bg: 'bg-pink-500', hex: '#ec4899' },
  photobooth: { bg: 'bg-purple-500', hex: '#a855f7' },
  concert: { bg: 'bg-red-500', hex: '#ef4444' },
  bus_ad: { bg: 'bg-orange-500', hex: '#f97316' },
  dance_challenge: { bg: 'bg-violet-500', hex: '#8b5cf6' },
  fansign: { bg: 'bg-cyan-500', hex: '#06b6d4' },
  checkin: { bg: 'bg-emerald-500', hex: '#10b981' },
  other: { bg: 'bg-gray-500', hex: '#6b7280' },
};

// 地點類型配置 - 確保與資料庫的 categories 值一致
export const LOCATION_TYPES: LocationType[] = [
  {
    id: 'cafe',
    name: '生咖',
    icon: '☕',
    color: 'white',
  },
  {
    id: 'movie',
    name: '電影',
    icon: '🎬',
    color: 'white',
  },
  {
    id: 'popup',
    name: '快閃店',
    icon: '🛍️',
    color: 'white',
  },
  {
    id: 'photobooth',
    name: '拍貼機',
    icon: '📸',
    color: 'white',
  },
  {
    id: 'billboard',
    name: '廣告看板',
    icon: '📢',
    color: 'white',
  },
  {
    id: 'checkin',
    name: '星旅程',
    icon: '🌟',
    color: 'white',
  },
  {
    id: 'concert',
    name: '演唱會',
    icon: '🎤',
    color: 'white',
  },
  {
    id: 'bus_ad',
    name: '公車應援',
    icon: '🚌',
    color: 'white',
  },
  {
    id: 'dance_challenge',
    name: '隨機舞蹈',
    icon: '💃',
    color: 'white',
  },
  {
    id: 'fansign',
    name: '簽售',
    icon: '✍️',
    color: 'white',
  },
  {
    id: 'other',
    name: '其他',
    icon: '📍',
    color: 'white',
  },
];

interface LocationFilterProps {
  selectedTypes: string[];
  onSelectionChange: (selectedTypes: string[]) => void;
  className?: string;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  selectedTypes,
  onSelectionChange,
  className = '',
}) => {
  const handleTypeToggle = (typeId: string) => {
    const isSelected = selectedTypes.includes(typeId);

    if (isSelected) {
      // 取消選擇
      const newSelection = selectedTypes.filter((id) => id !== typeId);
      onSelectionChange(newSelection);
      console.log(`🔽 取消選擇: ${typeId}, 新選擇:`, newSelection);
    } else {
      // 新增選擇
      const newSelection = [...selectedTypes, typeId];
      onSelectionChange(newSelection);
      console.log(`🔼 新增選擇: ${typeId}, 新選擇:`, newSelection);
    }
  };

  console.log('🎛️ LocationFilter render:', {
    selectedTypes,
    availableTypes: LOCATION_TYPES.map((t) => t.id),
  });

  return (
    <div
      className={`absolute left-4 top-44 z-10 space-y-2 max-h-[50vh] overflow-y-auto ${className}`}
    >
      {/* Debug 資訊 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 text-yellow-800 text-xs p-2 rounded mb-2">
          選中: [{selectedTypes.join(', ') || '無'}]
        </div>
      )}

      {LOCATION_TYPES.map((type) => {
        const isSelected = selectedTypes.includes(type.id);

        return (
          <button
            key={type.id}
            onClick={() => handleTypeToggle(type.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium 
              transition-all duration-200 shadow-lg min-w-[90px] border-2
              ${
                isSelected
                  ? 'bg-[#80FFC5] text-gray-900 border-[#60d394] shadow-md transform scale-105'
                  : 'bg-white/95 backdrop-blur-sm text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md'
              }
            `}
          >
            <span className="text-base">{type.icon}</span>
            <span className="whitespace-nowrap">{type.name}</span>
          </button>
        );
      })}

      {/* 清除按鈕 */}
      {selectedTypes.length > 0 && (
        <button
          onClick={() => {
            onSelectionChange([]);
            console.log('🧹 清除所有過濾器');
          }}
          className="w-full px-3 py-2 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors shadow-lg"
        >
          清除全部 ({selectedTypes.length})
        </button>
      )}
    </div>
  );
};

export default LocationFilter;
