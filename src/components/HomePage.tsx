'use client';

import React, { useState, useEffect } from 'react';
import {
  getUpcomingBirthdays,
  formatBirthday,
  getActiveAdvertisements,
  getSoloArtists,
  getBands,
  getBandMembers,
} from '@/lib/supabase-helpers';
import AdCarousel from './AdCarousel';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  User,
  Heart,
  Star,
  Calendar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// TypeScript interfaces
interface IdolData {
  id: string;
  name: string;
  stage_name: string;
  profile_image: string;
  birthday: string;
  daysUntil?: number;
  isToday?: boolean;
}

interface SoloArtist {
  id: string;
  name: string;
  stage_name: string;
  profile_image: string;
}

interface Band {
  id: string;
  name: string;
  logo?: string;
  group_image?: string;
  description?: string;
  is_active: boolean;
}

interface BandMember {
  id: string;
  name: string;
  stage_name: string;
  profile_image: string;
}

// 日期選擇器組件
const DateSelector = ({
  selectedDate,
  onDateChange,
  showDatePicker,
  setShowDatePicker,
}: {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
}) => {
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateChange(newDate);
  };

  const formatDisplayDate = (date: Date) => {
    return date
      .toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '.');
  };

  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString('zh-TW', { weekday: 'long' });
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onDateChange(newDate);
    setShowDatePicker(false);
  };

  return (
    <div className="flex justify-center items-center mb-4 relative">
      <button
        onClick={goToPreviousDay}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="mx-6 text-center">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 text-lg font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-900"
        >
          <Calendar className="w-4 h-4" />
          {formatDisplayDate(selectedDate)}
        </button>
        <div className="text-sm text-gray-500 mt-1">
          {formatWeekday(selectedDate)}
        </div>

        {/* 日期選擇器 */}
        {showDatePicker && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white rounded-lg shadow-lg border p-4">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={handleDateInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowDatePicker(false)}
                className="w-full mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={goToNextDay}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

const HomePage = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [idols, setIdols] = useState<IdolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'group' | 'individual'>('group');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [soloArtists, setSoloArtists] = useState<SoloArtist[]>([]);
  const [loadingSoloArtists, setLoadingSoloArtists] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  // 新增團體相關的 state
  const [bands, setBands] = useState<Band[]>([]);
  const [loadingBands, setLoadingBands] = useState(true);
  const [bandMembers, setBandMembers] = useState<{
    [bandId: string]: BandMember[];
  }>({});
  const [loadingMembers, setLoadingMembers] = useState<{
    [bandId: string]: boolean;
  }>({});

  // 從 Supabase 獲取資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingSoloArtists(true);
        setLoadingBands(true);

        const [upcomingBirthdays, adsData, soloArtistsData, bandsData] =
          await Promise.all([
            getUpcomingBirthdays(selectedDate),
            getActiveAdvertisements(),
            getSoloArtists(),
            getBands(),
          ]);

        const formattedIdols: IdolData[] = upcomingBirthdays.map((idol) => ({
          id: idol.id,
          name: idol.name,
          stage_name: idol.stage_name || idol.name,
          profile_image: idol.profile_image || '/api/placeholder/60/60',
          birthday: formatBirthday(idol.birthday),
          daysUntil: idol.daysUntil,
          isToday: idol.isToday,
        }));

        setIdols(formattedIdols);
        setAdvertisements(adsData);
        setSoloArtists(soloArtistsData);
        setBands(bandsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setLoadingSoloArtists(false);
        setLoadingBands(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  // 獲取團體成員的函數
  const fetchBandMembers = async (bandId: string) => {
    if (bandMembers[bandId]) return; // 如果已經獲取過，不重複獲取

    setLoadingMembers((prev) => ({ ...prev, [bandId]: true }));

    try {
      const members = await getBandMembers(bandId);
      setBandMembers((prev) => ({ ...prev, [bandId]: members }));
    } catch (error) {
      console.error('Error fetching band members:', error);
    } finally {
      setLoadingMembers((prev) => ({ ...prev, [bandId]: false }));
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().slice(0, 10).replace(/-/g, '.');
  };

  const navigateDate = (direction: number): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const handleImageError = (bandId: string) => {
    setImageErrors((prev) => new Set(prev).add(bandId));
  };

  const handleIdolClick = (idol: IdolData): void => {
    const idolData = {
      id: idol.id,
      name: idol.name,
      stage_name: idol.stage_name,
      profile_image: idol.profile_image,
    };

    const encodedData = encodeURIComponent(JSON.stringify(idolData));
    router.push(`/map?idol=${encodedData}`);
  };

  const handleSoloArtistClick = (artist: SoloArtist): void => {
    const artistData = encodeURIComponent(
      JSON.stringify({
        id: artist.id,
        name: artist.name,
        stage_name: artist.stage_name,
        profile_image: artist.profile_image,
      })
    );
    router.push(`/map?idol=${artistData}`);
  };

  const handleGroupClick = (bandId: string): void => {
    if (expandedGroup === bandId) {
      // 如果已展開，收合
      setExpandedGroup(null);
    } else {
      // 展開並獲取成員資料
      setExpandedGroup(bandId);
      fetchBandMembers(bandId);
    }
  };

  const handleViewAllClick = (band: Band): void => {
    const groupData = encodeURIComponent(
      JSON.stringify({
        type: 'group',
        id: band.id,
        name: band.name,
        logo: band.logo,
        members: bandMembers[band.id] || [],
      })
    );
    router.push(`/map?group=${groupData}`);
  };

  const handleMemberClick = (member: BandMember, band: Band): void => {
    const memberData = encodeURIComponent(
      JSON.stringify({
        type: 'member',
        id: member.id,
        name: member.name,
        image: member.profile_image,
        group: {
          id: band.id,
          name: band.name,
        },
      })
    );
    router.push(`/map?member=${memberData}`);
  };

  // 點擊外部關閉日期選擇器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker) {
        const target = event.target as Element;
        if (!target.closest('.date-selector')) {
          setShowDatePicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">KOREALITY</h1>
          <div className="flex gap-4 text-sm mt-1">
            <span className="border-b border-white">Locations</span>
            <span className="text-gray-400">Events</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Search className="w-5 h-5" />
          <User className="w-5 h-5" />
          <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-xs">?</span>
          </div>
        </div>
      </header>

      {/* Upcoming Birthdays */}
      <div className="bg-white p-4">
        <h2 className="text-lg font-bold text-center mb-4 text-gray-900">
          Upcoming Birthdays
        </h2>

        {/* 新的日期選擇器 */}
        <div className="date-selector">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
          />
        </div>

        {/* Idol Filter Row */}
        {loading ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-2 py-2">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-2"></div>
                <div className="text-xs">
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : idols.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-2 py-4">
            {idols.map((idol: IdolData) => (
              <div
                key={idol.id}
                onClick={() => handleIdolClick(idol)}
                className="flex-shrink-0 text-center cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <div
                  className={`relative mb-2 ${
                    idol.isToday ? 'ring-4 rounded-full' : ''
                  }`}
                  style={
                    idol.isToday
                      ? ({
                          '--tw-ring-color': '#80ffc5',
                        } as React.CSSProperties)
                      : {}
                  }
                >
                  <img
                    src={idol.profile_image}
                    alt={idol.name}
                    className={`w-16 h-16 rounded-full object-cover border-2 ${
                      idol.isToday ? 'border-[#80ffc5]' : 'border-gray-200'
                    }`}
                  />
                  {!idol.isToday &&
                    idol.daysUntil !== undefined &&
                    idol.daysUntil <= 30 && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {idol.daysUntil}
                        </span>
                      </div>
                    )}
                </div>
                <div className="text-xs">
                  <div className="font-medium text-gray-800">{idol.name}</div>
                  <div className="text-gray-500">{idol.birthday}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">目前沒有即將生日的偶像</p>
          </div>
        )}
      </div>

      {/* 廣告區塊 */}
      <div className="bg-gray-100 mx-4 my-4 rounded-lg p-6 text-center">
        <AdCarousel advertisements={advertisements} />
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-green-300 via-green-400 to-green-500 mx-4 rounded-t-lg">
        <div className="flex">
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 py-3 px-4 text-center font-medium rounded-tl-lg transition-colors ${
              activeTab === 'group'
                ? 'bg-green-400 text-gray-900'
                : 'bg-green-300 text-gray-700 hover:bg-green-350'
            }`}
          >
            團體
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-3 px-4 text-center font-medium rounded-tr-lg transition-colors ${
              activeTab === 'individual'
                ? 'bg-green-400 text-gray-900'
                : 'bg-green-300 text-gray-700 hover:bg-green-350'
            }`}
          >
            個人
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gradient-to-br from-green-300 via-green-400 to-green-500 mx-4 rounded-b-lg p-4 mb-20">
        {activeTab === 'group' && (
          <div className="space-y-4">
            {loadingBands ? (
              // Loading skeleton for bands
              <div className="space-y-4">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="bg-white bg-opacity-20 rounded-full p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="h-6 bg-gray-300 rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bands.length > 0 ? (
              bands.map((band) => (
                <div key={band.id} className="space-y-3">
                  {/* 團體按鈕 */}
                  <button
                    onClick={() => handleGroupClick(band.id)}
                    className={`w-full flex items-center gap-3 p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-black hover:bg-opacity-30 transition-all ${
                      expandedGroup === band.id
                        ? 'ring-2 ring-blue-400 bg-opacity-30'
                        : ''
                    }`}
                  >
                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                    <img
                      src={band.logo || '/api/placeholder/60/60'}
                      alt={band.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/60/60';
                      }}
                    />
                    <span className="font-bold text-gray-900">{band.name}</span>
                  </button>

                  {/* 展開的成員區域 */}
                  {expandedGroup === band.id && (
                    <div className="bg-white bg-opacity-90 rounded-lg p-4 border-2 border-gray-300">
                      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                        {/* View All 按鈕 */}
                        <div
                          onClick={() => handleViewAllClick(band)}
                          className="flex-shrink-0 text-center cursor-pointer hover:scale-105 transition-transform"
                        >
                          <div className="w-15 h-15 bg-gray-200 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                            {band.group_image && !imageErrors.has(band.id) ? (
                              <img
                                src={band.group_image}
                                alt={`${band.name} Group`}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(band.id)}
                              />
                            ) : (
                              <Star className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-800">
                            View All
                          </span>
                        </div>

                        {/* 成員頭像 */}
                        {loadingMembers[band.id] ? (
                          // Loading skeleton for members
                          [...Array(4)].map((_, index) => (
                            <div
                              key={index}
                              className="flex-shrink-0 text-center"
                            >
                              <div className="w-15 h-15 bg-gray-300 rounded-full animate-pulse mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded animate-pulse w-12"></div>
                            </div>
                          ))
                        ) : bandMembers[band.id] ? (
                          bandMembers[band.id].map((member) => (
                            <div
                              key={member.id}
                              onClick={() => handleMemberClick(member, band)}
                              className="flex-shrink-0 text-center cursor-pointer hover:scale-105 transition-transform"
                            >
                              <img
                                src={
                                  member.profile_image ||
                                  '/api/placeholder/60/60'
                                }
                                alt={member.name}
                                className="w-15 h-15 rounded-full object-cover border-2 border-gray-300 mb-2"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    '/api/placeholder/60/60';
                                }}
                              />
                              <span className="text-xs font-medium text-gray-800">
                                {member.name}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="flex-shrink-0 text-center">
                            <p className="text-sm text-gray-600">無成員資料</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-700">目前沒有團體資料</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'individual' && (
          <div className="p-2">
            {loadingSoloArtists ? (
              // Loading skeleton
              <div className="grid grid-cols-7 gap-3">
                {[...Array(21)].map((_, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse mb-1 mx-auto"></div>
                    <div className="h-2 bg-gray-300 rounded animate-pulse mx-1"></div>
                  </div>
                ))}
              </div>
            ) : soloArtists.length > 0 ? (
              // Solo artists grid
              <div className="grid grid-cols-7 gap-3">
                {soloArtists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => handleSoloArtistClick(artist)}
                    className="text-center cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mx-auto mb-1 border border-gray-400">
                      <img
                        src={artist.profile_image || '/api/placeholder/60/60'}
                        alt={artist.stage_name || artist.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/60/60';
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate px-1">
                      {artist.stage_name || artist.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="text-center py-8">
                <p className="text-gray-700">目前沒有個人藝人資料</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center py-2 px-4">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-xs text-red-500 mt-1">IDOL</span>
          </Link>
          <Link href="/map" className="flex flex-col items-center py-2 px-4">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">MAP</span>
          </Link>
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

export default HomePage;
