// src/lib/supabase-helpers.ts

import { supabase } from '../app/lib/supabase';

// 直接定義需要的類型介面
interface Idol {
  id: string;
  name: string;
  stage_name?: string;
  group_name?: string;
  birthday: string;
  debut_date?: string;
  agency?: string;
  nationality?: string;
  position?: string[];
  profile_image?: string;
  banner_image?: string;
  social_media?: unknown;
  fan_color?: string;
  official_fan_club?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Locations {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  opening_hours?: unknown;
  images?: string[];
  amenities?: string[];
  rating?: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: string;
  location_id: string;
  idol_id: string;
  title: string;
  description?: string;
  event_type: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  max_capacity?: number;
  current_attendees?: number;
  entry_fee?: number;
  images?: string[];
  special_items?: string[];
  requirements?: string[];
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 地圖專用的地點資料格式
interface MapLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  markerColor?: string;
  typeName?: string;
  typeIcon?: string;
  location_type?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  opening_hours?: unknown;
  rating?: number;
  upcoming_events?: Array<{
    id?: string;
    title: string;
    idol_name: string;
    start_time: string;
    end_time: string;
  }>;
}

// ==================== 修正後的輔助函數 ====================

// 🔄 新增：將顯示名稱轉換為 id 的映射函數
function getLocationTypeId(displayName: string): string {
  const displayToIdMap: Record<string, string> = {
    生咖: 'cafe',
    電影: 'movie',
    快閃店: 'popup',
    拍貼機: 'photobooth',
    廣告看板: 'billboard',
    星旅程: 'checkin',
    演唱會: 'concert',
    公車應援: 'bus_ad',
    隨機舞蹈: 'dance_challenge',
    簽售: 'fansign',
    其他: 'other',
  };

  return displayToIdMap[displayName] || 'other';
}

// 根據類型獲取圖標 - 使用正確的 categories 值
function getLocationIcon(typeName: string): string {
  const iconMap: Record<string, string> = {
    cafe: '☕',
    movie: '🎬',
    popup: '🛍️',
    photobooth: '📸',
    billboard: '📢',
    checkin: '🌟',
    concert: '🎤',
    bus_ad: '🚌',
    dance_challenge: '💃',
    fansign: '✍️',
    other: '📍',
  };

  return iconMap[typeName] || '📍';
}

// 根據類型獲取標記顏色 - 使用正確的 categories 值
function getMarkerColorByType(typeName: string): string {
  const colorMap: Record<string, string> = {
    cafe: '#f59e0b',
    movie: '#6366f1',
    popup: '#ec4899',
    photobooth: '#a855f7',
    billboard: '#3b82f6',
    checkin: '#10b981',
    concert: '#ef4444',
    bus_ad: '#f97316',
    dance_challenge: '#8b5cf6',
    fansign: '#06b6d4',
    other: '#6b7280',
  };

  return colorMap[typeName] || '#FF69B4';
}

// 修正後的 formatLocationForMap 函數
function formatLocationForMap(
  location: unknown,
  events: unknown[] = [],
  typeName?: string
): MapLocation {
  // 使用傳入的 typeName 或預設為 'other'
  const finalTypeName = typeName || 'other';

  console.log(
    `🎯 格式化地點 "${
      (location as { name: string }).name
    }" 使用類型: ${finalTypeName}`
  );

  return {
    id: (location as { id: string }).id,
    name: (location as { name: string }).name,
    address: (location as { address: string }).address,
    latitude: parseFloat((location as { latitude: string }).latitude),
    longitude: parseFloat((location as { longitude: string }).longitude),
    description: (location as { description?: string }).description || '',
    markerColor: getMarkerColorByType(finalTypeName),
    typeName: finalTypeName,
    typeIcon: getLocationIcon(finalTypeName),
    location_type: finalTypeName,
    phone: (location as { phone?: string }).phone,
    website: (location as { website?: string }).website,
    instagram: (location as { instagram?: string }).instagram,
    opening_hours: (location as { opening_hours?: unknown }).opening_hours,
    rating: (location as { rating?: number }).rating,
    upcoming_events: (
      events as Array<{
        id: string;
        title: string;
        idol?: { stage_name?: string; name?: string };
        start_date?: string;
        start_time?: string;
        end_date?: string;
        end_time?: string;
      }>
    ).map((event) => ({
      id: event.id,
      title: event.title,
      idol_name: event.idol?.stage_name || event.idol?.name || 'TBA',
      start_time:
        event.start_date && event.start_time
          ? new Date(`${event.start_date}T${event.start_time}`).toLocaleString(
              'zh-TW'
            )
          : '時間待定',
      end_time:
        event.end_date && event.end_time
          ? new Date(`${event.end_date}T${event.end_time}`).toLocaleString(
              'zh-TW'
            )
          : '時間待定',
    })),
  };
}

// ==================== 修正後的地圖函數 ====================

// 獲取所有地點（簡化版本 - 直接使用 location_type 欄位）
export async function getLocationsForMap(): Promise<MapLocation[]> {
  try {
    console.log('🗺️ 開始獲取所有地點資料...');

    // 步驟1: 獲取所有地點
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false });

    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
      return [];
    }

    console.log('📍 獲取到的地點資料:', locations);

    if (!locations || locations.length === 0) {
      return [];
    }

    // 步驟2: 直接格式化地點資料（不需要查詢關聯表）
    const formattedLocations = locations.map((location) => {
      // 直接使用 location_type 欄位
      const typeId = getLocationTypeId(location.location_type || '其他');

      console.log(`🏢 地點 "${location.name}" 類型解析:`, {
        locationId: location.id,
        displayType: location.location_type,
        typeId: typeId,
      });

      return formatLocationForMap(location, [], typeId);
    });

    console.log('🎯 格式化後的地點資料:', formattedLocations);
    return formattedLocations;
  } catch (error) {
    console.error('Error in getLocationsForMap:', error);
    return [];
  }
}

// 根據偶像 ID 獲取相關地點和活動（簡化版本）
export async function getLocationsByIdolId(
  idolId: string
): Promise<MapLocation[]> {
  try {
    console.log('🔍 根據偶像 ID 搜尋地點:', idolId);

    // 步驟 1: 根據偶像 ID 查找相關活動
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(
        `
        id,
        title,
        location_id,
        idol_id,
        start_date,
        end_date,
        start_time,
        end_time,
        status,
        description
      `
      )
      .eq('idol_id', idolId);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return [];
    }

    console.log('📅 找到相關活動:', events);

    if (!events || events.length === 0) {
      console.log('❌ 沒有找到相關活動');
      return [];
    }

    // 步驟 2: 根據活動的 location_id 查找地點
    const locationIds = [...new Set(events.map((event) => event.location_id))];
    console.log('📍 地點 IDs:', locationIds);

    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .in('id', locationIds)
      .eq('verified', true);

    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
      return [];
    }

    console.log('🏢 找到地點:', locations);

    if (!locations || locations.length === 0) {
      console.log('❌ 沒有找到相關地點');
      return [];
    }

    // 步驟 3: 獲取偶像資訊
    const { data: idol, error: idolError } = await supabase
      .from('idols')
      .select('id, name, stage_name, display_name')
      .eq('id', idolId)
      .single();

    if (idolError) {
      console.error('Error fetching idol:', idolError);
    }

    console.log('👤 偶像資訊:', idol);

    // 步驟 4: 格式化地點資料 - 🔄 直接使用 location_type 欄位
    const formattedLocations = locations.map((location) => {
      const locationEvents = events.filter(
        (event) => event.location_id === location.id
      );
      const typeId = getLocationTypeId(location.location_type || '其他');

      console.log(`🏢 偶像地點 "${location.name}" 類型解析:`, {
        locationId: location.id,
        displayType: location.location_type,
        typeId: typeId,
      });

      return formatLocationForMap(
        location,
        locationEvents.map((event) => ({
          id: event.id,
          title: event.title,
          idol: idol || { name: 'Unknown' },
          start_date: event.start_date,
          end_date: event.end_date,
          start_time: event.start_time,
          end_time: event.end_time,
          status: event.status,
        })),
        typeId
      );
    });

    console.log('✅ 格式化後的地點:', formattedLocations);
    return formattedLocations;
  } catch (error) {
    console.error('Error in getLocationsByIdolId:', error);
    return [];
  }
}

// 根據團體 ID 獲取相關地點（簡化版本）
export async function getLocationsByBandId(
  bandId: string
): Promise<MapLocation[]> {
  try {
    console.log('🔍 根據團體 ID 搜尋地點:', bandId);

    // 步驟 1: 根據 band_id 查找所有成員
    const { data: bandMembers, error: membersError } = await supabase
      .from('idols')
      .select('id, name, stage_name, display_name')
      .eq('band_id', bandId);

    if (membersError) {
      console.error('Error fetching band members:', membersError);
      return [];
    }

    console.log('👥 找到團體成員:', bandMembers);

    if (!bandMembers || bandMembers.length === 0) {
      console.log('❌ 沒有找到團體成員');
      return [];
    }

    // 步驟 2: 根據所有成員的 ID 查找相關活動
    const memberIds = bandMembers.map((member) => member.id);
    console.log('🎯 成員 IDs:', memberIds);

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(
        `
        id,
        title,
        location_id,
        idol_id,
        start_date,
        end_date,
        start_time,
        end_time,
        status,
        description
      `
      )
      .in('idol_id', memberIds);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return [];
    }

    console.log('📅 找到所有成員的活動:', events);

    if (!events || events.length === 0) {
      console.log('❌ 沒有找到相關活動');
      return [];
    }

    // 步驟 3: 根據活動的 location_id 查找地點
    const locationIds = [...new Set(events.map((event) => event.location_id))];
    console.log('📍 地點 IDs:', locationIds);

    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .in('id', locationIds)
      .eq('verified', true);

    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
      return [];
    }

    console.log('🏢 找到地點:', locations);

    if (!locations || locations.length === 0) {
      console.log('❌ 沒有找到相關地點');
      return [];
    }

    // 步驟 4: 獲取團體資訊
    const { data: band, error: bandError } = await supabase
      .from('bands')
      .select('id, name, display_name')
      .eq('id', bandId)
      .single();

    if (bandError) {
      console.error('Error fetching band:', bandError);
    }

    console.log('🎵 團體資訊:', band);

    // 步驟 5: 格式化地點資料 - 🔄 直接使用 location_type 欄位
    const formattedLocations = locations.map((location) => {
      const locationEvents = events.filter(
        (event) => event.location_id === location.id
      );
      const typeId = getLocationTypeId(location.location_type || '其他');

      console.log(`🏢 團體地點 "${location.name}" 類型解析:`, {
        locationId: location.id,
        displayType: location.location_type,
        typeId: typeId,
      });

      return formatLocationForMap(
        location,
        locationEvents.map((event) => {
          // 找到對應的成員資訊
          const eventIdol = bandMembers.find(
            (member) => member.id === event.idol_id
          );

          return {
            id: event.id,
            title: event.title,
            idol: eventIdol || {
              name: band?.display_name || band?.name || 'Unknown',
            },
            start_date: event.start_date,
            end_date: event.end_date,
            start_time: event.start_time,
            end_time: event.end_time,
            status: event.status,
          };
        }),
        typeId
      );
    });

    console.log('✅ 格式化後的地點:', formattedLocations);
    return formattedLocations;
  } catch (error) {
    console.error('Error in getLocationsByBandId:', error);
    return [];
  }
}

// ==================== 保留所有原有函數 ====================

// 獲取所有偶像資料
export async function getIdols() {
  try {
    const { data, error } = await supabase
      .from('idols')
      .select('*')
      .eq('is_active', true)
      .order('birthday', { ascending: true });

    if (error) {
      console.error('Error fetching idols:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getIdols:', error);
    return [];
  }
}

export async function getSoloArtists() {
  try {
    const { data, error } = await supabase
      .from('idols')
      .select('id, name, stage_name, profile_image, group_name')
      .eq('group_name', 'Solo Artist')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching solo artists:', error);
    return [];
  }
}

export async function getUpcomingBirthdays(selectedDate: Date) {
  try {
    const { data, error } = await supabase
      .from('idols')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching upcoming birthdays:', error);
      return [];
    }

    if (!data) return [];

    const today = selectedDate;
    const currentYear = today.getFullYear();

    const upcomingBirthdays = data
      .map((idol) => {
        const birthday = new Date(idol.birthday);
        const thisYearBirthday = new Date(
          currentYear,
          birthday.getMonth(),
          birthday.getDate()
        );
        const nextYearBirthday = new Date(
          currentYear + 1,
          birthday.getMonth(),
          birthday.getDate()
        );

        const nextBirthday =
          thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
        const daysUntil = Math.ceil(
          (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const isToday =
          thisYearBirthday.toDateString() === today.toDateString();

        return {
          ...idol,
          daysUntil,
          nextBirthday: nextBirthday.toISOString().split('T')[0],
          isToday,
        };
      })
      .filter((idol) => idol.daysUntil >= 0)
      .sort((a, b) => {
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        return a.daysUntil - b.daysUntil;
      });

    return upcomingBirthdays;
  } catch (error) {
    console.error('Error in getUpcomingBirthdays:', error);
    return [];
  }
}

export async function getBands() {
  try {
    const { data, error } = await supabase
      .from('bands')
      .select(
        'id, name, display_name, logo, group_image, description, is_active'
      )
      .eq('is_active', true)
      .neq('name', 'Solo Artist')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching bands:', error);
    return [];
  }
}

export async function getBandMembers(bandId: string) {
  try {
    const { data, error } = await supabase
      .from('idols')
      .select('id, name, display_name, stage_name, profile_image')
      .eq('band_id', bandId)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching band members:', error);
    return [];
  }
}

export async function getLocations() {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getLocations:', error);
    return [];
  }
}

export async function getEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        location:locations(*),
        idol:idols(*)
      `
      )
      .eq('status', 'upcoming')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEvents:', error);
    return [];
  }
}

export async function getEventsByIdol(idolId: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        location:locations(*)
      `
      )
      .eq('idol_id', idolId)
      .eq('status', 'upcoming')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events by idol:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEventsByIdol:', error);
    return [];
  }
}

// 🔄 修正 getLocationsWithEvents - 移除 location_type_join 查詢
export async function getLocationsWithEvents() {
  try {
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select(
        `
        *,
        events(
          *,
          idol:idols(name, stage_name)
        )
      `
      )
      .eq('verified', true)
      .eq('events.status', 'upcoming');

    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
      return [];
    }

    // 🔄 不再查詢 location_type_join，直接使用 location_type 欄位
    const locationsWithTypes = locations?.map((location) => {
      return {
        ...location,
        location_type_join: [{ category_id: '1' }], // 保持相容性的假資料
      };
    });

    return locationsWithTypes || [];
  } catch (error) {
    console.error('Error in getLocationsWithEvents:', error);
    return [];
  }
}

export function formatBirthday(birthday: string): string {
  const date = new Date(birthday);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}月 ${day}日`;
}

export function getDaysUntilBirthday(birthday: string): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const birthdayDate = new Date(birthday);

  let nextBirthday = new Date(
    currentYear,
    birthdayDate.getMonth(),
    birthdayDate.getDate()
  );

  if (nextBirthday < today) {
    nextBirthday = new Date(
      currentYear + 1,
      birthdayDate.getMonth(),
      birthdayDate.getDate()
    );
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export async function getActiveAdvertisements() {
  try {
    const { data, error } = await supabase.from('advertisements').select('*');

    if (error) {
      console.error('查詢錯誤:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('函數錯誤:', error);
    return [];
  }
}

export async function recordAdView(adId: string) {
  try {
    await supabase.rpc('increment_ad_view', { ad_id: adId });
  } catch (error) {
    console.error('Error recording ad view:', error);
  }
}

export async function recordAdClick(adId: string) {
  try {
    await supabase.rpc('increment_ad_click', { ad_id: adId });
  } catch (error) {
    console.error('Error recording ad click:', error);
  }
}
