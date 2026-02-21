export const RoleName = {
  ADMIN: 'ADMIN',
  LOGISTICIAN: 'LOGISTICIAN',
  CLIENT: 'CLIENT',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: {
    id: string;
    name: RoleName;
  };
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface AuthUser {
  userId: string;
  username: string;
  role: RoleName;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  taxId: string;
  phone?: string;
  email?: string;
  address?: string;
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
  isAvailable: boolean;
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
  isAvailable: boolean;
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
  ltlShipment?: LtlShipment;
  createdAt: string;
  updatedAt: string;
}

export interface LtlShipment {
  id: string;
  voyageCode: string;
  departureDate: string;
  arrivalDate: string;
  status: string;
  consolidatedWeight: number;
  consolidatedVolume: number;
  shipments: Shipment[];
}
