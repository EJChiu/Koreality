'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);

  // 臨時的假資料，之後會從 Supabase 抓取
  const mockEvent = {
    id: params.id,
    title: "WONWOO'S WORLD",
    description: '元宇宙咖啡廳主題活動',
    backgroundImage:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    profileImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    socialHandle: '@ww_world717',
    startDate: '2025.07.17',
    endDate: '2025.07.19',
    location: '카페꼬모 마포구',
    fullLocation: '서울특별시 마포구 XXX로 123',
    organizer: 'WONWOO Official',
    contact: '@ww_world717',
    rating: 4.8,
    reviewCount: 127,
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockEvent.title,
        text: mockEvent.description,
        url: window.location.href,
      });
    } else {
      // 복사 폴백
      navigator.clipboard.writeText(window.location.href);
      alert('連結已複製到剪貼簿');
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Image Header */}
      <div
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${mockEvent.backgroundImage})` }}
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
            src={mockEvent.profileImage}
            alt="Profile"
            className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
          />
        </div>
      </div>

      {/* Event Details Card */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-10 p-6">
        {/* Event Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {mockEvent.title}
        </h1>

        {/* Social Handle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-blue-600 font-medium">
            {mockEvent.socialHandle}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="text-gray-800 font-medium">
            {mockEvent.startDate} ~ {mockEvent.endDate}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-gray-600" />
          <div>
            <div className="text-gray-800 font-medium">
              {mockEvent.location}
            </div>
            <div className="text-gray-600 text-sm">
              {mockEvent.fullLocation}
            </div>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">主辦方資訊</h3>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-gray-600">主辦：</span>
              <span className="text-gray-800">{mockEvent.organizer}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">聯絡：</span>
              <span className="text-blue-600">{mockEvent.contact}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold text-gray-900">
            {mockEvent.rating}
          </span>
          <span className="text-gray-600">({mockEvent.reviewCount}則評價)</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center justify-center py-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <ImageIcon className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-800">詳細圖片</span>
          </button>

          <button className="flex flex-col items-center justify-center py-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Star className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-800">評價</span>
          </button>

          <button className="flex flex-col items-center justify-center py-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <MapPin className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-800">位置</span>
          </button>
        </div>
      </div>

      {/* Padding for safe area */}
      <div className="pb-6"></div>
    </div>
  );
}
