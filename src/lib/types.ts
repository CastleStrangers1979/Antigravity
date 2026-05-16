export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  sku: string | null;
  weight: number | null;
  packSize: number;
  boxSize: number | null;
  stock: number;
  isActive: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  deliveryLineId: string | null;
  deliveryLine: { id: string; nameAr: string; nameEn: string; nameNl?: string; region?: string } | null;
  isActive: boolean;
  currentLocation: string | null;
  latitude: number | null;
  longitude: number | null;
  orders?: Order[];
}

export interface DeliveryLine {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  region: string;
  isActive: boolean;
  drivers?: Driver[];
  _count?: { orders: number };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  notes: string | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  driverId: string | null;
  driver: Driver | null;
  deliveryLineId: string | null;
  deliveryLine: DeliveryLine | null;
  status: string;
  totalAmount: number;
  deliveryDate: string | null;
  deliveryTime: string | null;
  notes: string | null;
  orderItems: OrderItem[];
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  fuelType: string | null;
  mileage: number;
  capacity: number | null;
  isActive: boolean;
  purchaseDate: string | null;
  currentValue: number | null;
  notes: string | null;
  drivers?: { id: string; name: string }[];
  _count?: {
    maintenances: number;
    fuelRecords: number;
    insurances: number;
    expenses: number;
  };
}

export interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  type: string;
  description: string;
  garage: string | null;
  cost: number;
  mileage: number | null;
  startDate: string;
  endDate: string | null;
  status: string;
  nextMaintenanceDate: string | null;
  nextMaintenanceMileage: number | null;
  notes: string | null;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  driverId: string | null;
  date: string;
  quantity: number;
  pricePerLiter: number;
  totalCost: number;
  mileage: number;
  station: string | null;
  receiptUrl: string | null;
  notes: string | null;
}

export interface VehicleInsurance {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  provider: string;
  policyNumber: string;
  type: string;
  startDate: string;
  endDate: string;
  premium: number;
  coverage: string | null;
  documentUrl: string | null;
  status: string;
  notes: string | null;
}
