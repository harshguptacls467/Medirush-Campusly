export interface HealthcarePlace {
  id: string;
  name: string;
  type: 'Pharmacy' | 'Hospital' | 'Clinic' | 'Medical store' | 'Blood Bank';
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  rating: number;
  isOpen: boolean;
  is24x7: boolean;
  emergencySupport: boolean;
  deliveryAvailable: boolean;
  image: string;
}

export const mockHealthcarePlaces: HealthcarePlace[] = [
  {
    id: "p1",
    name: "Jan Aushadhi Kendra (Govt Approved)",
    type: "Pharmacy",
    latitude: 23.3350,
    longitude: 75.0380,
    address: "Shop 4, Civil Lines Road, Near District Hospital",
    phone: "+91 98260 12345",
    rating: 4.8,
    isOpen: true,
    is24x7: false,
    emergencySupport: true,
    deliveryAvailable: true,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80"
  },
  {
    id: "h1",
    name: "District Civil Hospital & Trauma Center",
    type: "Hospital",
    latitude: 23.3380,
    longitude: 75.0420,
    address: "Hospital Square, Station Road",
    phone: "108 / +91 734 2511200",
    rating: 4.9,
    isOpen: true,
    is24x7: true,
    emergencySupport: true,
    deliveryAvailable: false,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"
  },
  {
    id: "c1",
    name: "Apollo 24/7 MedPlus Pharmacy",
    type: "Pharmacy",
    latitude: 23.3310,
    longitude: 75.0350,
    address: "Opposite Bus Stand Commercial Complex",
    phone: "+91 94250 88990",
    rating: 4.7,
    isOpen: true,
    is24x7: true,
    emergencySupport: true,
    deliveryAvailable: true,
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&q=80"
  },
  {
    id: "ms1",
    name: "Sanjivani 24/7 Emergency Clinic",
    type: "Clinic",
    latitude: 23.3420,
    longitude: 75.0490,
    address: "Main Road, Shanti Nagar",
    phone: "+91 98270 44556",
    rating: 4.5,
    isOpen: true,
    is24x7: true,
    emergencySupport: true,
    deliveryAvailable: false,
    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80"
  },
  {
    id: "h2",
    name: "Red Cross Regional Blood Bank",
    type: "Blood Bank",
    latitude: 23.3360,
    longitude: 75.0450,
    address: "Red Cross Building, Collectorate Road",
    phone: "+91 734 2522300",
    rating: 5.0,
    isOpen: true,
    is24x7: true,
    emergencySupport: true,
    deliveryAvailable: false,
    image: "https://images.unsplash.com/photo-1538108149393-cebb47ac1136?w=800&q=80"
  }
];
