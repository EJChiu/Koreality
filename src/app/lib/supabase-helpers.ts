// src/lib/supabase-helpers.ts

import { supabase } from './supabase';

// 直接定義需要的類型介面（臨時解決方案）
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
  social_media?: any;
  fan_color?: string;
  official_fan_club?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  opening_hours?: any;
  images?: string[];
  amenities?: string[];
  rating?: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: string;
  cafe_id: string;
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

// 根據特定日期獲取當天及之後生日的偶像
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

    // 計算當天及之後生日的偶像
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

        // 如果今年生日已過（相對於選擇的日期），使用明年的日期
        const nextBirthday =
          thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
        const daysUntil = Math.ceil(
          (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // 判斷是否為當天生日
        const isToday =
          thisYearBirthday.toDateString() === today.toDateString();

        return {
          ...idol,
          daysUntil,
          nextBirthday: nextBirthday.toISOString().split('T')[0],
          isToday,
        };
      })
      .filter((idol) => idol.daysUntil >= 0) // 顯示當天及之後的生日
      .sort((a, b) => {
        // 當天生日的排在前面，其他按時間順序
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        return a.daysUntil - b.daysUntil;
      });

    console.log(
      `🎂 ${selectedDate.toISOString().split('T')[0]} 當天及之後生日的偶像:`,
      upcomingBirthdays
    );

    return upcomingBirthdays;
  } catch (error) {
    console.error('Error in getUpcomingBirthdays:', error);
    return [];
  }
}

// 獲取所有咖啡廳資料
export async function getCafes() {
  try {
    const { data, error } = await supabase
      .from('cafes')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cafes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCafes:', error);
    return [];
  }
}

// 獲取活動資料（包含咖啡廳和偶像資訊）
export async function getEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        cafe:cafes(*),
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

// 根據偶像ID獲取相關活動
export async function getEventsByIdol(idolId: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        cafe:cafes(*)
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

// 獲取咖啡廳及其相關活動
export async function getCafesWithEvents() {
  try {
    const { data, error } = await supabase
      .from('cafes')
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

    if (error) {
      console.error('Error fetching cafes with events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCafesWithEvents:', error);
    return [];
  }
}

// 格式化生日顯示
export function formatBirthday(birthday: string): string {
  const date = new Date(birthday);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}月 ${day}日`;
}

// 計算生日倒數天數
export function getDaysUntilBirthday(birthday: string): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const birthdayDate = new Date(birthday);

  let nextBirthday = new Date(
    currentYear,
    birthdayDate.getMonth(),
    birthdayDate.getDate()
  );

  // 如果今年生日已過，計算到明年生日
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

// 獲取當前有效的廣告
export async function getActiveAdvertisements() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching advertisements:', error);
      return [];
    }

    console.log('📢 獲取的廣告資料:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getActiveAdvertisements:', error);
    return [];
  }
}

// 記錄廣告曝光
export async function recordAdView(adId: string) {
  try {
    await supabase.rpc('increment_ad_view', { ad_id: adId });
  } catch (error) {
    console.error('Error recording ad view:', error);
  }
}

// 記錄廣告點擊
export async function recordAdClick(adId: string) {
  try {
    await supabase.rpc('increment_ad_click', { ad_id: adId });
  } catch (error) {
    console.error('Error recording ad click:', error);
  }
}
