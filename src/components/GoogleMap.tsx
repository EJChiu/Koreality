'use client';

import React, { useEffect, useRef } from 'react';

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
  upcoming_events?: Array<{
    title: string;
    idol_name: string;
    start_time: string;
    end_time: string;
  }>;
}

interface GoogleMapProps {
  locations: Location[];
  selectedIdol?: string | null;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  locations = [],
  selectedIdol = null,
  className = 'w-full h-80',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const currentInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Initialize map once
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
        return;
      }

      // Check if script is already loading/loaded
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        // Script already exists, wait for it to load
        if (window.google) {
          initMap();
        } else {
          existingScript.addEventListener('load', initMap);
        }
        return;
      }

      // Only create script if it doesn't exist
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.onload = initMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };
      document.head.appendChild(script);
    };

    /*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Initialize the Google Map instance.
     *
     * @remarks
     * If the map element is available and the Google Maps script has loaded,
     * this function will create a new Google Map instance with the specified
     * options and assign it to the `mapInstanceRef` ref.
     */
    /*******  6ee87176-785f-4661-a861-4dfdce7fb1aa  *******/
    const initMap = () => {
      if (mapRef.current && window.google) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 25.033, lng: 121.5654 }, // Taipei
          zoom: 13,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // 確保 map 實例存在才加入監聽器
        if (mapInstanceRef.current) {
          mapInstanceRef.current.addListener('click', () => {
            if (currentInfoWindowRef.current) {
              currentInfoWindowRef.current.close();
              currentInfoWindowRef.current = null;
            }
          });
        }

        console.log('✅ Map initialized successfully!');
      }
    };

    loadGoogleMaps();
  }, []);

  // Update markers when locations or selectedIdol changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Filter locations based on selected idol
    const filteredLocations = selectedIdol
      ? locations.filter((location) => {
          if (
            !location.upcoming_events ||
            location.upcoming_events.length === 0
          ) {
            console.log('❌ 沒有 upcoming_events');
            return false;
          }

          return location.upcoming_events?.some((event) =>
            event.idol_name.toLowerCase().includes(selectedIdol.toLowerCase())
          );
        })
      : locations;

    // Create new markers
    filteredLocations.forEach(
      (location) => {
        console.log('🎯 開始處理地點:', location.name);
        const markerColor = location.markerColor || '#FF69B4'; // 使用傳入的顏色或預設粉紅色
        const icon = location.typeIcon || '📍';

        const marker = new window.google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: mapInstanceRef.current,
          title: location.name,
          icon: {
            url:
              'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(`
            <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" fill="${markerColor}"/>
              <circle cx="16" cy="16" r="8" fill="white"/>
              <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#333">${icon}</text>
            </svg>
          `),
            scaledSize: new window.google.maps.Size(32, 40),
            anchor: new window.google.maps.Point(16, 40),
          },
        });

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: createInfoWindowContent(location),
        });

        // Add click listener
        marker.addListener('click', () => {
          // 關閉目前打開的 InfoWindow
          if (currentInfoWindowRef.current) {
            currentInfoWindowRef.current.close();
          }

          // 打開新的 InfoWindow
          infoWindow.open(mapInstanceRef.current, marker);

          // 更新目前的 InfoWindow 參考
          currentInfoWindowRef.current = infoWindow;
        });

        markersRef.current.push(marker);
        console.log('📌 Marker 已加入陣列，總數:', markersRef.current.length);
      },
      [locations, selectedIdol]
    );

    // Adjust map bounds if we have markers
    if (filteredLocations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredLocations.forEach((location) => {
        bounds.extend({ lat: location.latitude, lng: location.longitude });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [locations, selectedIdol]);

  const createInfoWindowContent = (location: Location): string => {
    console.log(`🔍 InfoWindow 地點 "${location.name}":`, {
      typeName: location.typeName,
      markerColor: location.markerColor,
      typeIcon: location.typeIcon,
    });

    // 取得地點類型名稱，如果沒有就使用預設的 "VENUE"
    const locationTypeLabel = location.typeName
      ? location.typeName.charAt(0).toUpperCase() + location.typeName.slice(1)
      : 'VENUE';

    console.log(`🔍 locationTypeLabel: ${locationTypeLabel}`);

    // 根據類型設定不同的背景顏色
    const getLabelColor = (typeName: string | undefined): string => {
      const colorMap: Record<string, string> = {
        cafe: '#f59e0b', // 黃色
        cinema: '#a855f7', // 紫色
        popup: '#3b82f6', // 藍色
        photobooth: '#ec4899', // 粉紅色
      };
      return typeName ? colorMap[typeName] || '#dc2626' : '#dc2626';
    };

    const eventsHtml =
      location.upcoming_events && location.upcoming_events.length > 0
        ? location.upcoming_events
            .map((event: any) => {
              // 檢查 event.id 是否存在，如果沒有就用 demo
              const eventId = event.id || 'demo';
              return `
        <div style="margin-bottom: 8px; padding: 8px; background-color: #fef2f2; border-radius: 6px; cursor: pointer;" 
             onclick="window.open('/events/${eventId}', '_self')">
          <div style="font-weight: 600; color: #b91c1c; font-size: 14px;">${
            event.title || '活動名稱'
          }</div>
          <div style="font-size: 12px; color: #374151; margin-top: 2px;">${
            event.start_time || ''
          } - ${event.end_time || ''}</div>
          <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">點擊查看詳情 →</div>
        </div>
      `;
            })
            .join('')
        : '<div style="color: #6b7280; font-size: 13px;">No upcoming events</div>';

    return `
  <div style="max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <div style="padding: 4px 8px; background-color: ${getLabelColor(
        location.typeName
      )}; color: white; font-size: 11px; font-weight: bold; border-radius: 4px;">${locationTypeLabel}</div>
      <h3 style="margin: 0; font-weight: 600; color: #111827; font-size: 16px;">${
        location.name
      }</h3>
    </div>
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #374151; line-height: 1.4;">${
      location.address
    }</p>
    ${
      location.description
        ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: #4b5563; line-height: 1.4;">${location.description}</p>`
        : ''
    }
    <div style="margin-bottom: 8px;">
      <h4 style="margin: 0 0 6px 0; font-weight: 600; font-size: 14px; color: #111827;">Upcoming Events:</h4>
      ${eventsHtml}
    </div>
  </div>
`;
  };

  return (
    <div>
      <div ref={mapRef} className={className} />
    </div>
  );
};

declare global {
  interface Window {
    google: any;
  }
}

export default GoogleMap;
