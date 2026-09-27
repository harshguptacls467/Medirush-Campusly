export interface ChemistNode {
  id: string;
  name: string;
  phone: string;
  area: string;
  city: string;
  distance_km: number;
  cold_storage_certified: boolean;
  chronic_stock_rating: number;
  avg_response_time_sec: number;
  score?: number;
  lat: number;
  lng: number;
  address?: string;
}

export const CHEMIST_REGISTRY: ChemistNode[] = [
  {
    id: 'chem-1',
    name: 'Gupta Medicos & Cold Chain Hub',
    phone: '+91 98260 12345',
    area: 'Station Road',
    city: 'Ratlam',
    distance_km: 1.1,
    cold_storage_certified: true,
    chronic_stock_rating: 0.95,
    avg_response_time_sec: 18,
    lat: 23.3325,
    lng: 75.0382,
    address: '14/B, Station Road, Near Railway Station, Ratlam, MP',
  },
  {
    id: 'chem-2',
    name: 'Verma Pharma & Healthcare',
    phone: '+91 98260 67890',
    area: 'Kothi Road',
    city: 'Ratlam',
    distance_km: 1.8,
    cold_storage_certified: false,
    chronic_stock_rating: 0.72,
    avg_response_time_sec: 45,
    lat: 23.3381,
    lng: 75.0456,
    address: '88, Kothi Road, Opp. Collectorate Office, Ratlam, MP',
  },
  {
    id: 'chem-3',
    name: 'Jan Aushadhi Kendra (Govt. Generic)',
    phone: '+91 98930 99887',
    area: 'Civil Hospital Gate',
    city: 'Ratlam',
    distance_km: 0.8,
    cold_storage_certified: true,
    chronic_stock_rating: 0.9,
    avg_response_time_sec: 25,
    lat: 23.3289,
    lng: 75.0345,
    address: 'Gate No. 2, District Civil Hospital Campus, Ratlam, MP',
  },
  {
    id: 'chem-4',
    name: 'Sanjivani 24x7 Medical Store',
    phone: '+91 94250 54321',
    area: 'Do Batti Square',
    city: 'Ratlam',
    distance_km: 2.3,
    cold_storage_certified: true,
    chronic_stock_rating: 0.88,
    avg_response_time_sec: 30,
    lat: 23.3350,
    lng: 75.0410,
    address: 'Shop 4, Do Batti Square, Main Market, Ratlam, MP',
  },
  {
    id: 'chem-5',
    name: 'Maharaj Bada Medical Store',
    phone: '+91 94251 12233',
    area: 'Maharaj Bada',
    city: 'Gwalior',
    distance_km: 4.5,
    cold_storage_certified: false,
    chronic_stock_rating: 0.4,
    avg_response_time_sec: 120,
    lat: 26.2124,
    lng: 78.1772,
    address: 'Central Market, Maharaj Bada, Gwalior, MP',
  },
];
