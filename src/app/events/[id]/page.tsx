'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Share,
  Heart,
  MapPin,
  Calendar,
  Star,
  Image as ImageIcon,
  User,
} from 'lucide-react';

interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  fullLocation: string;
  profileImage: string;
  backgroundImage: string;
  socialHandle: string;
  organizer: string;
  contact: string;
  eventType: string;
  status: string;
  maxCapacity: number | null;
  currentAttendees: string;
  entryFee: number | null;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);

  // 替換掉整個 mockEvent 部分為：
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(
            `
          *,
          location:locations(name, address),
          idol:idols(name, stage_name, profile_image)
        `
          )
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('載入活動失敗:', error);
          return;
        }

        // 創建映射
        const mappedEvent = {
          // ✅ 現有欄位直接對應
          id: data.id,
          title: data.title,
          description: data.description || '暫無描述',

          // ✅ 日期欄位組合
          startDate: data.start_date,
          endDate: data.end_date,
          startTime: data.start_time,
          endTime: data.end_time,

          // ✅ 地點資訊 (來自關聯表)
          location: data.location?.name || '未知地點',
          fullLocation: data.location?.address || '地址待更新',

          // ✅ 偶像資訊 (來自關聯表)
          profileImage:
            data.idol?.profile_image ||
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',

          // ✅ 活動圖片
          backgroundImage:
            data.images ||
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',

          // ❌ 需要新增到 Supabase 的欄位 (暫時用預設值)
          socialHandle: data.social_handle || '@官方帳號', // 需要新增 social_handle 欄位
          organizer: data.organizer || '主辦方', // 需要新增 organizer 欄位
          contact: data.contact_info || '@聯絡方式', // 需要新增 contact_info 欄位

          // ✅ 其他現有欄位
          eventType: data.event_type,
          status: data.status,
          maxCapacity: data.max_capacity,
          currentAttendees: data.current_attendees,
          entryFee: data.entry_fee,
        };

        setEventData(mappedEvent);
      } catch (error) {
        console.error('載入活動失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    if (navigator.share && eventData) {
      navigator.share({
        title: eventData.title,
        text: eventData.description,
        url: window.location.href,
      });
    } else if (eventData) {
      navigator.clipboard.writeText(window.location.href);
      alert('連結已複製到剪貼簿');
    }
  };

  const toggleFavorite = () => {
    if (!eventData) return;
    setIsFavorited(!isFavorited);
  };

  // 👈 loading 處理放這裡！
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">找不到此活動</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Image Header */}
      <div
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${eventData.backgroundImage})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-md"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-md"
            >
              <Share className="w-5 h-5 text-gray-800" />
            </button>

            <button
              onClick={toggleFavorite}
              className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-md"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-800'
                }`}
              />
            </button>

            <div className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-gray-800" />
            </div>
          </div>
        </div>

        {/* Profile Image */}
        <div className="absolute bottom-4 right-4">
          <img
            src={eventData.profileImage}
            alt="Profile"
            className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
          />
        </div>
      </div>
      {/* Event Details Card */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-10 p-6">
        {/* Event Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {eventData.title}
        </h1>

        {/* Social Handle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-blue-600 font-medium">
            {eventData.socialHandle}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="text-gray-800 font-medium">
            {eventData.startDate} ~ {eventData.endDate}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-gray-600" />
          <div>
            <div className="text-gray-800 font-medium">
              {eventData.location}
            </div>
            <div className="text-gray-600 text-sm">
              {eventData.fullLocation}
            </div>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">主辦方資訊</h3>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-gray-600">主辦：</span>
              <span className="text-gray-800">{eventData.organizer}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">聯絡：</span>
              <span className="text-blue-600">{eventData.contact}</span>
            </div>
          </div>
        </div>

        {/* Padding for safe area */}
        <div className="pb-6"></div>
      </div>
      ;
    </div>
  );
}
