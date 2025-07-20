'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthProps {
  user: User | null;
  onAuthChange: (user: User | null) => void;
}

const Auth: React.FC<AuthProps> = ({ user, onAuthChange }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('登入錯誤:', error);
        alert('登入失敗，請重試');
      }
    } catch (error) {
      console.error('登入失敗:', error);
      alert('登入失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('登出錯誤:', error);
        alert('登出失敗，請重試');
      } else {
        onAuthChange(null);
      }
    } catch (error) {
      console.error('登出失敗:', error);
      alert('登出失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  // 如果用戶已登入，顯示用戶資訊
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={user.user_metadata.avatar_url || '/api/placeholder/32/32'}
          alt={user.user_metadata.full_name || user.email}
          className="w-8 h-8 rounded-full border border-gray-300"
        />
        <div className="hidden sm:block">
          <div className="text-sm font-medium text-white">
            {user.user_metadata.full_name || user.email}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        >
          {loading ? '登出中...' : '登出'}
        </button>
      </div>
    );
  }

  // 如果用戶未登入，顯示登入按鈕
  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
    >
      <span className="font-medium">G</span>
      {loading ? '登入中...' : 'Google 登入'}
    </button>
  );
};

export default Auth;
