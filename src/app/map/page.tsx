'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GoogleMap from '@/components/GoogleMap';
import LocationFilter from '@/components/LocationFilter';
import {
  getLocationsForMap,
  getLocationsByBandId,
  getLocationsByIdolId,
} from '@/lib/supabase-helpers';
import {
  ChevronLeft,
  Share,
  Heart,
  User,
  ChevronUp,
  MapPin,
  Search,
} from 'lucide-react';

// 定義介面
interface IdolData {
  id: string;
  name: string;
  stage_name: string;
  profile_image: string;
}

interface GroupData {
  type: 'group';
  id: string;
  name: string;
  logo: string;
  members: any[];
}

interface MemberData {
  type: 'member';
  id: string;
  name: string;
  image: string;
  group: {
    id: string;
    name: string;
  };
}

// 🔄 統一使用一個地點介面，移除重複定義
interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  markerColor?: string;
  typeName?: string;
  typeIcon?: string;
  location_type?: number;
  phone?: string;
  website?: string;
  instagram?: string;
  opening_hours?: any;
  rating?: number;
  upcoming_events?: Array<{
    id?: string;
    title: string;
    idol_name: string;
    start_time: string;
    end_time: string;
  }>;
}

const MapPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 參數狀態
  const [selectedIdol, setSelectedIdol] = useState<IdolData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  // 地點和過濾器狀態 - 🔄 使用統一的 Location 類型
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [displayedLocations, setDisplayedLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // UI 狀態
  const [isListExpanded, setIsListExpanded] = useState(false);

  // 🔄 輔助函數：確保類型一致的轉換函數
  const convertToLocation = (data: any): Location => {
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      markerColor: data.markerColor,
      typeName: data.typeName,
      typeIcon: data.typeIcon,
      location_type:
        typeof data.location_type === 'string'
          ? getLocationTypeNumber(data.typeName)
          : data.location_type,
      phone: data.phone,
      website: data.website,
      instagram: data.instagram,
      opening_hours: data.opening_hours,
      rating: data.rating,
      upcoming_events: data.upcoming_events,
    };
  };

  // 🔄 輔助函數：將 typeName 轉換為數字
  const getLocationTypeNumber = (typeName?: string): number => {
    const typeMap: Record<string, number> = {
      cafe: 1,
      movie: 2,
      popup: 3,
      photobooth: 4,
      billboard: 5,
      checkin: 6,
      concert: 7,
      bus_ad: 8,
      dance_challenge: 9,
      fansign: 10,
      other: 0,
    };
    return typeName ? typeMap[typeName] || 0 : 0;
  };

  // 解析 URL 參數
  useEffect(() => {
    try {
      const idolData = searchParams.get('idol');
      if (idolData) {
        const parsedIdol = JSON.parse(decodeURIComponent(idolData));
        setSelectedIdol(parsedIdol);
        console.log('🎯 Loaded idol:', parsedIdol);
      }

      const groupData = searchParams.get('group');
      if (groupData) {
        const parsedGroup = JSON.parse(decodeURIComponent(groupData));
        setSelectedGroup(parsedGroup);
        console.log('🎯 Loaded group:', parsedGroup);
      }

      const memberData = searchParams.get('member');
      if (memberData) {
        const parsedMember = JSON.parse(decodeURIComponent(memberData));
        setSelectedMember(parsedMember);
        console.log('🎯 Loaded member:', parsedMember);
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // 獲取地點資料
  useEffect(() => {
    const fetchLocations = async () => {
      if (loading) return; // 等待 URL 參數解析完成

      setLoadingLocations(true);
      try {
        let rawLocationData: any[] = [];

        if (selectedIdol) {
          console.log('🔍 Fetching locations for idol ID:', selectedIdol.id);
          rawLocationData = await getLocationsByIdolId(selectedIdol.id);
        } else if (selectedMember) {
          console.log(
            '🔍 Fetching locations for member ID:',
            selectedMember.id
          );
          rawLocationData = await getLocationsByIdolId(selectedMember.id);
        } else if (selectedGroup) {
          console.log('🔍 Fetching locations for group ID:', selectedGroup.id);
          rawLocationData = await getLocationsByBandId(selectedGroup.id);
        } else {
          console.log('🔍 Fetching all locations');
          rawLocationData = await getLocationsForMap();
        }

        console.log('📍 獲取到的原始地點資料:', rawLocationData);

        // 🔄 轉換為統一的 Location 類型
        const convertedLocations = rawLocationData.map(convertToLocation);

        console.log('🔄 轉換後的地點資料:', convertedLocations);

        // 設置所有地點
        setAllLocations(convertedLocations);

        // 如果是從偶像/團體進入，自動設置過濾器
        if (
          (selectedIdol || selectedMember || selectedGroup) &&
          convertedLocations.length > 0
        ) {
          const uniqueTypes = [
            ...new Set(
              convertedLocations
                .map((location) => location.typeName)
                .filter((typeName): typeName is string => Boolean(typeName))
            ),
          ];
          console.log('🎯 自動設置過濾器:', uniqueTypes);
          setSelectedFilters(uniqueTypes);
        } else if (!selectedIdol && !selectedMember && !selectedGroup) {
          // 直接進入地圖，不自動選擇過濾器
          setSelectedFilters([]);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setAllLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [selectedIdol, selectedGroup, selectedMember, loading]);

  // 根據過濾器更新顯示的地點
  useEffect(() => {
    if (selectedFilters.length === 0) {
      // 沒有選擇過濾器，顯示所有地點
      setDisplayedLocations(allLocations);
    } else {
      // 根據過濾器篩選地點
      const filtered = allLocations.filter((location) =>
        selectedFilters.includes(location.typeName || 'other')
      );
      setDisplayedLocations(filtered);
    }

    console.log(
      '🔄 過濾後顯示地點數量:',
      selectedFilters.length === 0
        ? allLocations.length
        : allLocations.filter((location) =>
            selectedFilters.includes(location.typeName || 'other')
          ).length
    );
  }, [allLocations, selectedFilters]);

  // 其他處理函數
  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    console.log('Share functionality');
  };

  const toggleList = () => {
    setIsListExpanded(!isListExpanded);
  };

  const getDisplayInfo = () => {
    if (selectedGroup) {
      return {
        image: selectedGroup.logo,
        title: selectedGroup.name,
        subtitle: `團體活動地圖 (${selectedGroup.members.length} 位成員)`,
      };
    }

    if (selectedMember) {
      return {
        image: selectedMember.image,
        title: selectedMember.name,
        subtitle: `${selectedMember.group.name} 成員活動地圖`,
      };
    }

    if (selectedIdol) {
      return {
        image: selectedIdol.profile_image,
        title: selectedIdol.stage_name || selectedIdol.name,
        subtitle: '個人活動地圖',
      };
    }

    return {
      image: '/api/placeholder/60/60',
      title: '地圖',
      subtitle: '探索地點',
    };
  };

  const getSelectedIdolName = () => {
    if (selectedIdol) {
      return selectedIdol.stage_name || selectedIdol.name;
    }
    if (selectedMember) {
      return selectedMember.name;
    }
    if (selectedGroup) {
      return selectedGroup.name;
    }
    return null;
  };

  const displayInfo = getDisplayInfo();

  // 調試資訊
  const debugInfo = {
    allLocations: allLocations.length,
    displayedLocations: displayedLocations.length,
    selectedFilters: selectedFilters,
    types: [...new Set(allLocations.map((l) => l.typeName).filter(Boolean))],
  };

  console.log('🐛 Debug Info:', debugInfo);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden pb-16">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Share className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Heart className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <User className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* 資訊卡片 */}
      <div className="absolute top-20 left-4 z-10 bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
        <img
          src={displayInfo.image || '/api/placeholder/60/60'}
          alt={displayInfo.title}
          className="w-15 h-15 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            e.currentTarget.src = '/api/placeholder/60/60';
          }}
        />
        <div>
          <h2 className="font-bold text-gray-900">{displayInfo.title}</h2>
          <p className="text-sm text-gray-600">{displayInfo.subtitle}</p>
        </div>
      </div>

      {/* 過濾按鈕 */}
      <LocationFilter
        selectedTypes={selectedFilters}
        onSelectionChange={setSelectedFilters}
      />

      {/* 地圖區域 */}
      <div className="w-full h-full min-h-screen relative">
        {loadingLocations ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500 text-lg">載入地點資料中...</p>
              <p className="text-gray-400 text-sm mt-2">
                從 Supabase 獲取最新資訊
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Debug 資訊 */}
            <div className="absolute top-32 left-4 z-10 bg-green-100 text-green-800 text-xs p-2 rounded max-w-sm">
              <div>✅ 地點載入完成！</div>
              <div>總地點: {allLocations.length}</div>
              <div>顯示地點: {displayedLocations.length}</div>
              <div>過濾器: [{selectedFilters.join(', ') || '無'}]</div>
              <div>類型: [{debugInfo.types.join(', ') || '無'}]</div>
            </div>

            <GoogleMap
              locations={displayedLocations}
              selectedIdol={getSelectedIdolName()}
              className="w-full h-full min-h-screen"
            />
          </>
        )}
      </div>

      {/* 可拉起的列表容器 */}
      <div
        className={`absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          isListExpanded
            ? 'transform translate-y-0 z-30'
            : 'transform translate-y-[calc(100%-120px)] z-20'
        }`}
        style={{ height: 'calc(70vh - 4rem)' }}
      >
        {/* 拉把 */}
        <button
          onClick={toggleList}
          className="w-full py-4 flex justify-center items-center border-b border-gray-200"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mb-2"></div>
        </button>

        {/* 列表內容區域 */}
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {displayInfo.title} 相關地點
            </h3>
            <ChevronUp
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isListExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* 地點列表 */}
          <div className="space-y-4">
            {loadingLocations ? (
              <div className="text-center py-8 text-gray-500">
                <p>載入地點中...</p>
              </div>
            ) : displayedLocations.length > 0 ? (
              displayedLocations.map((location) => (
                <div key={location.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{location.typeIcon || '📍'}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {location.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {location.address}
                      </p>
                      {location.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {location.description}
                        </p>
                      )}

                      {/* 顯示類型 */}
                      <div className="mt-1">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {location.typeName || 'other'}
                        </span>
                      </div>

                      {/* 顯示額外資訊 */}
                      <div className="mt-2 space-y-1">
                        {location.phone && (
                          <p className="text-xs text-gray-600">
                            📞 {location.phone}
                          </p>
                        )}
                        {location.opening_hours && (
                          <p className="text-xs text-gray-600">
                            🕒{' '}
                            {typeof location.opening_hours === 'string'
                              ? location.opening_hours
                              : JSON.stringify(location.opening_hours)}
                          </p>
                        )}
                        {location.rating && (
                          <p className="text-xs text-gray-600">
                            ⭐ {location.rating}/5
                          </p>
                        )}
                      </div>

                      {location.upcoming_events &&
                        location.upcoming_events.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-gray-700">
                              相關活動:
                            </p>
                            {location.upcoming_events.map((event, index) => (
                              <div
                                key={index}
                                className="text-xs text-gray-600 mt-1"
                              >
                                {event.title} - {event.start_time}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>目前沒有符合條件的地點</p>
                <p className="text-sm mt-2">
                  {selectedFilters.length > 0
                    ? '請嘗試調整過濾條件或選擇其他偶像/團體'
                    : '請選擇偶像或團體查看相關地點'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center py-2 px-4">
            <Heart className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">IDOL</span>
          </Link>
          <div className="flex flex-col items-center py-2 px-4">
            <MapPin className="w-5 h-5 text-red-500" />
            <span className="text-xs text-red-500 mt-1">MAP</span>
          </div>
          <Link href="/events" className="flex flex-col items-center py-2 px-4">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">EVENTS</span>
          </Link>
          <Link
            href="/account"
            className="flex flex-col items-center py-2 px-4"
          >
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MapPage;
