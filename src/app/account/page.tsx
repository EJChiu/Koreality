'use client';

import { useState, useEffect } from 'react';
import { Calendar, Map, MapPin, Heart, User } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Auth from '@/components/Auth';

export default function AccountPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 獲取初始用戶狀態
    const getInitialUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getInitialUser();

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">KOREALITY</h1>
          <div className="flex gap-4 text-sm mt-1">
            <span className="text-gray-400">Locations</span>
            <span className="border-b border-white">Account</span>
          </div>
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        ) : user ? (
          // 已登入 - 顯示用戶資訊
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={
                    user.user_metadata.avatar_url || '/api/placeholder/64/64'
                  }
                  alt={user.user_metadata.full_name || user.email}
                  className="w-16 h-16 rounded-full border border-gray-300"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user.user_metadata.full_name || '用戶'}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg text-left hover:bg-gray-200 transition-colors">
                  我的收藏
                </button>
                <button className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg text-left hover:bg-gray-200 transition-colors">
                  設定
                </button>
                <Auth user={user} onAuthChange={setUser} />
              </div>
            </div>
          </div>
        ) : (
          // 未登入 - 顯示登入頁面
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
                歡迎使用 KOREALITY
              </h2>
              <p className="text-gray-600 text-center mb-6">
                請登入以享受完整功能
              </p>
              <div className="flex justify-center">
                <Auth user={user} onAuthChange={setUser} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center py-2 px-4">
            <Heart className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">IDOL</span>
          </Link>
          <Link href="/map" className="flex flex-col items-center py-2 px-4">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">MAP</span>
          </Link>
          <Link href="/events" className="flex flex-col items-center py-2 px-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">EVENTS</span>
          </Link>
          <Link
            href="/account"
            className="flex flex-col items-center py-2 px-4"
          >
            <User className="w-5 h-5 text-red-500" />
            <span className="text-xs text-red-500 mt-1">ACCOUNT</span>
          </Link>
        </div>
      </nav>

      <div className="pb-20"></div>
    </div>
  );
}
