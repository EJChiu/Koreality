import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Koreality - 為喜歡韓流的你打造的生活風格指南 💖',
  description:
    '花路狂奔，應援不停！🌸 Koreality 是一款為韓流迷打造的生活風格 App，集結全台應援活動、KPOP 咖啡廳、拍貼打卡點與粉絲聚會，讓你不只在線追星，更能與同好們一起線下享受韓流生活。無論是偶像生日、週末聚會、還是想找個地方聊推，都能在 Koreality 找到你的追星日常！',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
