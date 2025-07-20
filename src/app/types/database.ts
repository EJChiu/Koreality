// src/types/database.ts

export interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  opening_hours?: {
    [key: string]: string; // e.g., "monday": "9:00-22:00"
  };
  images?: string[]; // Array of image URLs
  amenities?: string[]; // e.g., ["wifi", "parking", "photo_booth"]
  rating?: number; // Average rating from users
  verified: boolean; // Admin verified cafe
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  cafe_id: string; // Foreign key to Cafe
  idol_id: string; // Foreign key to Idol
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  start_time?: string; // e.g., "14:00"
  end_time?: string; // e.g., "18:00"
  max_capacity?: number;
  current_attendees?: number;
  entry_fee?: number;
  images?: string[];
  special_items?: string[]; // e.g., ["photocard", "freebies", "poster"]
  requirements?: string[]; // e.g., ["reservation_required", "idol_merch"]
  status: EventStatus;
  created_by: string; // User ID who created the event
  created_at: string;
  updated_at: string;
}

export interface Idol {
  id: string;
  name: string;
  stage_name?: string;
  group_name?: string;
  birthday: string; // ISO date string
  debut_date?: string;
  agency?: string;
  nationality?: string;
  position?: string[]; // e.g., ["main_vocalist", "leader"]
  profile_image?: string;
  banner_image?: string;
  social_media?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  fan_color?: string; // Hex color code
  official_fan_club?: string;
  is_active: boolean; // Still active in the industry
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  favorite_idols?: string[]; // Array of Idol IDs
  favorite_cafes?: string[]; // Array of Cafe IDs
  attended_events?: string[]; // Array of Event IDs
  role: UserRole;
  preferences?: {
    notifications: boolean;
    email_updates: boolean;
    location_sharing: boolean;
  };
  social_links?: {
    instagram?: string;
    twitter?: string;
  };
  joined_at: string;
  last_active: string;
}

// Enums for better type safety
export type EventType =
  | 'birthday'
  | 'comeback'
  | 'debut_anniversary'
  | 'group_anniversary'
  | 'fan_meeting'
  | 'album_release'
  | 'concert_viewing'
  | 'general_meetup'
  | 'other';

export type EventStatus =
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export type UserRole =
  | 'user'
  | 'cafe_owner'
  | 'event_organizer'
  | 'moderator'
  | 'admin';

// Utility types for API responses
export interface DatabaseResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Joined data types for complex queries
export interface CafeWithEvents extends Cafe {
  events: Event[];
}

export interface EventWithDetails extends Event {
  cafe: Cafe;
  idol: Idol;
  attendees_count?: number;
}

export interface UpcomingBirthday {
  idol: Idol;
  days_until: number;
  events: EventWithDetails[];
}

// Map-related types
export interface MapMarker {
  id: string;
  type: 'cafe';
  position: {
    lat: number;
    lng: number;
  };
  cafe: Cafe;
  upcoming_events: Event[];
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Filter types for the map
export interface EventFilters {
  idol_ids?: string[];
  event_types?: EventType[];
  date_range?: {
    start: string;
    end: string;
  };
  location?: {
    lat: number;
    lng: number;
    radius: number; // in kilometers
  };
}

// Form types for creating/editing
export type CreateCafeForm = Omit<
  Cafe,
  'id' | 'created_at' | 'updated_at' | 'verified'
>;
export type CreateEventForm = Omit<
  Event,
  'id' | 'created_at' | 'updated_at' | 'current_attendees'
>;
export type CreateIdolForm = Omit<Idol, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUserProfile = Partial<
  Pick<
    User,
    | 'username'
    | 'display_name'
    | 'bio'
    | 'location'
    | 'avatar_url'
    | 'preferences'
    | 'social_links'
  >
>;

// Search and query types
export interface SearchFilters {
  query?: string;
  location?: string;
  idol_ids?: string[];
  event_types?: EventType[];
  date_from?: string;
  date_to?: string;
}

export interface SearchResults {
  cafes: Cafe[];
  events: EventWithDetails[];
  idols: Idol[];
}
