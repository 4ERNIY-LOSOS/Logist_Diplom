export const Role = {
  ADMIN: 'ADMIN',
  LOGISTICIAN: 'LOGISTICIAN',
  CLIENT: 'CLIENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: Role;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  userId: string;
  username: string;
  role: Role;
}

export interface Company {
  id: string;
  name: string;
  taxId: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  country: string;
  city: string;
  street: string;
  houseNumber: string;
  apartment?: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface CargoType {
  id: string;
  name: string;
  description?: string;
}

export interface Cargo {
  id: string;
  name: string;
  description?: string;
  weight: number;
  volume: number;
  cargoType: CargoType;
}

export interface RequestStatus {
  id: string;
  name: string;
  description?: string;
}

export interface LogisticRequest {
  id: string;
  pickupDate: string;
  deliveryDate: string;
  distanceKm: number;
  preliminaryCost?: number;
  finalCost?: number;
  notes?: string;
  status: RequestStatus;
  pickupAddress: Address;
  deliveryAddress: Address;
  cargos: Cargo[];
  company: Company;
  createdByUser: User;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentStatus {
  id: string;
  name: string;
  description?: string;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phone?: string;
  status: 'AVAILABLE' | 'BUSY' | 'ON_LEAVE';
}

export interface VehicleType {
  id: string;
  name: string;
  description?: string;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  payloadCapacity: number;
  volumeCapacity: number;
  status: 'AVAILABLE' | 'BUSY' | 'MAINTENANCE';
  type: VehicleType;
}

export interface Shipment {
  id: string;
  plannedPickupDate: string;
  plannedDeliveryDate: string;
  actualPickupDate?: string;
  actualDeliveryDate?: string;
  request: LogisticRequest;
  driver: Driver;
  vehicle: Vehicle;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
}
