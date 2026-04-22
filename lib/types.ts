export interface Business {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  lat: number;
  lon: number;
}

export interface SearchParams {
  city: string;
  type: string;
}

export interface SearchHistoryEntry {
  city: string;
  type: string;
  timestamp: number;
}
