
export enum FleetStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
  IDLE = 'Idle',
  OFF_DUTY = 'Off Duty',
  TERMINATED = 'Terminated',
  SUSPENDED = 'Suspended'
}

export enum LoadStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export enum ExpenseCategory {
  FUEL = 'Fuel',
  MAINTENANCE = 'Maintenance',
  TOLLS = 'Tolls',
  INSURANCE = 'Insurance',
  SALARY = 'Salary',
  OTHER = 'Other'
}

export enum DriverType {
  COMPANY = 'Company',
  OWNER_OPERATOR = 'Owner-Operator'
}

export enum ReminderFrequency {
  WEEKLY = 'Weekly',
  FIVE_WEEKS = 'Every 5 Weeks',
  QUARTERLY = 'Quarterly',
  ANNUAL = 'Annual'
}

export enum ReminderCategory {
  TAX = 'Tax/IFTA',
  PERMITS = 'Permits Audit',
  COMPLIANCE = 'Filing/HUT',
  MAINTENANCE = 'Maintenance'
}

export interface ReportFile {
  id: string;
  name: string;
  category: 'IFTA' | 'Accounting' | 'Fleet' | 'Drivers';
  date: string;
  size: string;
  type: 'pdf' | 'csv' | 'xlsx';
}

export interface IFTAStateReport {
  state: string;
  totalMiles: number;
  taxableMiles: number;
  taxPaidGallons: number;
  taxRate: number;
  surcharge?: number;
}

export interface IFTAReport {
  quarter: string;
  year: number;
  fleetMpg: number;
  totalMiles: number;
  totalGallons: number;
  states: IFTAStateReport[];
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  category: ReminderCategory;
  frequency: ReminderFrequency;
  nextDueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  lastCompletedDate?: string;
}

export interface DriverDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url: string;
}

export interface OrientationModule {
  id: string;
  title: string;
  category: 'FMCSA' | 'HOS' | 'Safety' | 'Company';
  content: string;
  isCompleted: boolean;
}

export interface StatePermit {
  state: string;
  permitNumber: string;
  expirationDate: string;
  status: 'Active' | 'Expired' | 'Pending';
}

export interface PayRateRecord {
  id: string;
  rate: number;
  effectiveDate: string;
  reason: string;
}

export interface Truck {
  id: string;
  unitNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  status: FleetStatus;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  assignedDriverId?: string;
  totalMiles?: number;
  plateNumber: string;
  irpExpiration: string;
  titleNumber: string;
  leaseAgreementUrl?: string;
  rentalAgreementUrl?: string;
  permits: StatePermit[];
}

export interface Driver {
  id: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  licenseNumber: string;
  cdlExpiration: string;
  medicalCardExpiration: string;
  hireDate: string;
  status: FleetStatus;
  hosRemaining: number;
  driverType: DriverType;
  payRate: number;
  payRateHistory?: PayRateRecord[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  assignedTruckId?: string;
  documents?: DriverDocument[];
  orientationModules?: OrientationModule[];
}

export interface Load {
  id: string;
  loadNumber: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  status: LoadStatus;
  rate: number;
  miles: number;
  deadheadMiles: number;
  assignedTruckId?: string;
  assignedDriverId?: string;
  customer: string;
  tolls?: number;
  fuelCost?: number;
}

export interface MaintenanceRecord {
  id: string;
  truckId: string;
  date: string;
  repairType: string;
  cost: number;
  description: string;
  invoiceUrl?: string;
}

export interface Settlement {
  id: string;
  driverId: string;
  loadId: string;
  date: string;
  grossRevenue: number;
  driverShare: number;
  companyShare: number;
  deadheadMiles: number;
  totalMiles: number;
}

export interface Invoice {
  id: string;
  loadId: string;
  loadNumber: string;
  amount: number;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  truckId: string;
}

export interface DashboardStats {
  totalRevenue: number;
  activeLoads: number;
  idleUnits: number;
  deliveredThisMonth: number;
}
