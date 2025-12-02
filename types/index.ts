export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
}

export type ProductCategory = 
  | 'prescription' 
  | 'over-the-counter' 
  | 'wellness' 
  | 'vitamins' 
  | 'supplements';

export interface Product {
  id: string;
  pharmacyId: string;
  name: string;
  category: ProductCategory;
  price: number;
  dosage?: string;
  expiryDate: Date;
  quantity: number;
  description: string;
  healthInfo?: string;
  usage?: string;
  sideEffects?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  pharmacyId: string;
  pharmacyName: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  productName: string;
  pharmacyId: string;
  pharmacyName: string;
  quantity: number;
  price: number;
  availableQuantity: number;
}

