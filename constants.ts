
import { Truck, Driver, Load, FleetStatus, LoadStatus, Invoice, InvoiceStatus, Expense, ExpenseCategory, DriverType, MaintenanceRecord, Settlement, DriverDocument, OrientationModule, StatePermit, Reminder, ReminderCategory, ReminderFrequency, IFTAReport, ReportFile } from './types';

export const MOCK_REPORTS: ReportFile[] = [
  { id: 'rep-1', name: '2023_Q4_IFTA_Final.pdf', category: 'IFTA', date: '2024-01-15', size: '2.4 MB', type: 'pdf' },
  { id: 'rep-2', name: 'Fleet_Maintenance_Annual_2023.xlsx', category: 'Fleet', date: '2024-01-02', size: '1.1 MB', type: 'xlsx' },
  { id: 'rep-3', name: 'January_2024_Profit_Loss.pdf', category: 'Accounting', date: '2024-02-05', size: '840 KB', type: 'pdf' },
  { id: 'rep-4', name: 'Driver_Compliance_Audit_Feb.csv', category: 'Drivers', date: '2024-02-18', size: '45 KB', type: 'csv' },
  { id: 'rep-5', name: 'Form_2290_Receipt_2024.pdf', category: 'Accounting', date: '2024-01-20', size: '1.2 MB', type: 'pdf' },
];

export const MOCK_IFTA_REPORT: IFTAReport = {
  quarter: 'Q1',
  year: 2024,
  fleetMpg: 6.24,
  totalMiles: 142500,
  totalGallons: 22836,
  states: [
    { state: 'IL', totalMiles: 45000, taxableMiles: 45000, taxPaidGallons: 8200, taxRate: 0.454 },
    { state: 'IN', totalMiles: 32000, taxableMiles: 32000, taxPaidGallons: 4100, taxRate: 0.55, surcharge: 0.24 },
    { state: 'OH', totalMiles: 28000, taxableMiles: 28000, taxPaidGallons: 4500, taxRate: 0.47 },
    { state: 'PA', totalMiles: 15000, taxableMiles: 15000, taxPaidGallons: 2000, taxRate: 0.741 },
    { state: 'NY', totalMiles: 12500, taxableMiles: 12500, taxPaidGallons: 1500, taxRate: 0.415 },
    { state: 'NJ', totalMiles: 10000, taxableMiles: 10000, taxPaidGallons: 2536, taxRate: 0.505 },
  ]
};

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Q2 IFTA Tax Filing',
    description: 'Quarterly fuel tax report submission for all active fleet units. Required by Apr 30.',
    category: ReminderCategory.TAX,
    frequency: ReminderFrequency.QUARTERLY,
    nextDueDate: '2024-04-30',
    priority: 'High'
  },
  {
    id: 'rem-2',
    title: 'State Permit Audit Cycle',
    description: 'Review NY HUT, KYU, and OR permits. Delete permits for units sold/traded in last 5 weeks.',
    category: ReminderCategory.PERMITS,
    frequency: ReminderFrequency.FIVE_WEEKS,
    nextDueDate: '2024-06-25',
    priority: 'Medium'
  },
  {
    id: 'rem-3',
    title: 'IRS Form 2290 (HVUT)',
    description: 'Annual Heavy Vehicle Use Tax filing for all trucks over 55,000 lbs. Filing window starts July 1.',
    category: ReminderCategory.COMPLIANCE,
    frequency: ReminderFrequency.ANNUAL,
    nextDueDate: '2024-07-01',
    priority: 'High'
  },
  {
    id: 'rem-4',
    title: 'NY HUT Annual Certificate',
    description: 'Renew annual decal stickers and electronic HUT certificates for NY operations.',
    category: ReminderCategory.COMPLIANCE,
    frequency: ReminderFrequency.ANNUAL,
    nextDueDate: '2024-12-31',
    priority: 'Medium'
  },
  {
    id: 'rem-5',
    title: 'Quarterly Safety Audit',
    description: 'Internal review of driver log violations and roadside inspection results.',
    category: ReminderCategory.TAX,
    frequency: ReminderFrequency.QUARTERLY,
    nextDueDate: '2024-07-31',
    priority: 'Low'
  }
];

export const MOCK_TRUCKS: Truck[] = Array.from({ length: 40 }, (_, i) => ({
  id: `tr-${i + 1}`,
  unitNumber: `U-${1000 + i}`,
  vin: `VIN${Math.random().toString(36).substring(7).toUpperCase()}`,
  make: i % 2 === 0 ? 'Freightliner' : 'Kenworth',
  model: i % 2 === 0 ? 'Cascadia' : 'T680',
  year: 2021 + (i % 3),
  status: i % 8 === 0 ? FleetStatus.MAINTENANCE : (i % 12 === 0 ? FleetStatus.IDLE : FleetStatus.ACTIVE),
  currentLocation: {
    lat: 34.0522 + (Math.random() - 0.5) * 10,
    lng: -118.2437 + (Math.random() - 0.5) * 10,
    address: `${['Chicago', 'Dallas', 'Phoenix', 'Seattle', 'Atlanta'][i % 5]}, USA`
  },
  assignedDriverId: `dr-${i + 1}`,
  totalMiles: Math.floor(Math.random() * 50000) + 100000,
  plateNumber: `P-${Math.floor(100000 + Math.random() * 900000)}`,
  irpExpiration: `2025-${(i % 12 + 1).toString().padStart(2, '0')}-01`,
  titleNumber: `TIT-${Math.random().toString(36).substring(5).toUpperCase()}`,
  leaseAgreementUrl: '#',
  permits: [
    { state: 'NY', permitNumber: `HUT-${Math.floor(10000 + Math.random() * 90000)}`, expirationDate: '2025-12-31', status: 'Active' },
    { state: 'KY', permitNumber: `KYU-${Math.floor(10000 + Math.random() * 90000)}`, expirationDate: '2025-06-30', status: 'Active' },
    { state: 'OR', permitNumber: `ORW-${Math.floor(10000 + Math.random() * 90000)}`, expirationDate: '2025-03-15', status: i % 10 === 0 ? 'Expired' : 'Active' },
    { state: 'NJ', permitNumber: `NJ-${Math.floor(10000 + Math.random() * 90000)}`, expirationDate: '2025-08-12', status: 'Active' },
    { state: 'NM', permitNumber: `NM-${Math.floor(10000 + Math.random() * 90000)}`, expirationDate: '2025-11-20', status: 'Active' },
  ]
}));

const driverNames = [
  "James Wilson", "Robert Taylor", "Michael Anderson", "William Thomas", "David Jackson", 
  "Richard White", "Joseph Harris", "Thomas Martin", "Charles Thompson", "Christopher Garcia",
  "Daniel Martinez", "Matthew Robinson", "Anthony Clark", "Donald Rodriguez", "Mark Lewis",
  "Paul Lee", "Steven Walker", "Andrew Hall", "Kenneth Allen", "Joshua Young",
  "George Hernandez", "Kevin King", "Edward Wright", "Ronald Lopez", "Timothy Hill",
  "Jason Scott", "Jeffrey Green", "Ryan Adams", "Jacob Baker", "Gary Gonzalez",
  "Nicholas Nelson", "Eric Carter", "Stephen Mitchell", "Jonathan Perez", "Larry Roberts",
  "Justin Turner", "Scott Phillips", "Brandon Campbell", "Benjamin Parker", "Samuel Evans"
];

const ORIENTATION_CONTENT = {
  FMCSA: "All commercial motor vehicles (CMVs) weighing over 10,001 lbs must follow FMCSA safety standards.",
  HOS: "The 11-Hour Driving Limit: You may drive a maximum of 11 hours after 10 consecutive hours off duty.",
  ACCIDENTS: "1. STOP IMMEDIATELY. Use hazards and triangles. 2. CALL EMERGENCY SERVICES.",
  COMPANY: "SwiftLink Zero Tolerance Policy: No cell phone use while driving."
};

export const MOCK_DRIVERS: Driver[] = Array.from({ length: 40 }, (_, i) => {
  const isOwnerOp = i % 5 === 0;
  const currentPay = isOwnerOp ? 0.88 : 0.25;
  return {
    id: `dr-${i + 1}`,
    name: driverNames[i] || `Driver ${i + 1}`,
    dob: `19${Math.floor(Math.random() * 20) + 70}-0${Math.floor(Math.random() * 9) + 1}-15`,
    phone: `(555) ${Math.floor(Math.random() * 899) + 100}-${Math.floor(Math.random() * 8999) + 1000}`,
    email: `driver${i + 1}@swiftlink.com`,
    licenseNumber: `CDL-${Math.random().toString(36).substring(5).toUpperCase()}`,
    cdlExpiration: `2026-0${Math.floor(Math.random() * 9) + 1}-20`,
    medicalCardExpiration: `2025-0${Math.floor(Math.random() * 9) + 1}-10`,
    hireDate: `202${Math.floor(Math.random() * 4)}-01-15`,
    status: i % 15 === 0 ? FleetStatus.SUSPENDED : (i % 20 === 0 ? FleetStatus.OFF_DUTY : FleetStatus.ACTIVE),
    hosRemaining: Math.floor(Math.random() * 14),
    driverType: isOwnerOp ? DriverType.OWNER_OPERATOR : DriverType.COMPANY,
    payRate: currentPay,
    payRateHistory: [
      { id: `p-${i}-1`, rate: currentPay - 0.05, effectiveDate: '2023-01-01', reason: 'Initial Hire' },
      { id: `p-${i}-2`, rate: currentPay, effectiveDate: '2024-01-01', reason: 'Annual Review' }
    ],
    emergencyContact: {
      name: "Sarah " + (driverNames[i]?.split(' ')[1] || "Doe"),
      phone: "(555) 999-8888",
      relationship: "Spouse"
    },
    assignedTruckId: `tr-${i + 1}`,
    documents: [
      { id: `doc-${i}-1`, name: 'CDL Scan', type: 'License', uploadDate: '2024-01-10', url: '#' },
      { id: `doc-${i}-2`, name: 'Medical Cert', type: 'Compliance', uploadDate: '2024-02-15', url: '#' },
    ],
    orientationModules: [
      { id: `om-${i}-1`, title: 'FMCSA Safety Standards', category: 'FMCSA', content: ORIENTATION_CONTENT.FMCSA, isCompleted: i % 2 === 0 },
      { id: `om-${i}-2`, title: 'HOS & ELD Compliance', category: 'HOS', content: ORIENTATION_CONTENT.HOS, isCompleted: i % 3 === 0 },
    ]
  };
});

export const MOCK_LOADS: Load[] = Array.from({ length: 15 }, (_, i) => {
  const miles = 800 + (Math.random() * 1200);
  return {
    id: `ld-${i + 1}`,
    loadNumber: `L-${5000 + i}`,
    origin: ['Chicago, IL', 'Houston, TX', 'Atlanta, GA', 'Seattle, WA'][i % 4],
    destination: ['Los Angeles, CA', 'Miami, FL', 'New York, NY', 'Phoenix, AZ'][i % 4],
    pickupDate: `2024-05-${10 + (i % 10)}`,
    deliveryDate: `2024-05-${12 + (i % 10)}`,
    status: i % 3 === 0 ? LoadStatus.DELIVERED : (i % 2 === 0 ? LoadStatus.IN_TRANSIT : LoadStatus.PENDING),
    rate: 2500 + (Math.random() * 3000),
    miles: miles,
    deadheadMiles: 20 + (Math.random() * 150),
    assignedTruckId: `tr-${i + 1}`,
    assignedDriverId: `dr-${i + 1}`,
    customer: ['Global Logistics', 'Speedy Parts', 'Build-It Co', 'Fresh Foods'][i % 4],
    tolls: 50 + (Math.random() * 150),
    fuelCost: (miles / 6) * 4.25
  };
});

export const MOCK_MAINTENANCE: MaintenanceRecord[] = Array.from({ length: 10 }, (_, i) => ({
  id: `maint-${i + 1}`,
  truckId: `tr-${(i % 5) + 1}`,
  date: `2024-05-${(i % 20) + 1}`,
  repairType: ['Oil Change', 'Brake Pads', 'Tire Rotation', 'Engine Diagnostic'][i % 4],
  cost: 150 + (Math.random() * 2000),
  description: `Regular scheduled maintenance for unit U-${1000 + (i % 5)}`,
  invoiceUrl: 'mock-invoice.pdf'
}));

export const MOCK_SETTLEMENTS: Settlement[] = MOCK_LOADS.filter(l => l.status === LoadStatus.DELIVERED).map((load, i) => {
  const driver = MOCK_DRIVERS.find(d => d.id === load.assignedDriverId)!;
  const driverShare = load.rate * driver.payRate;
  return {
    id: `set-${i + 1}`,
    driverId: driver.id,
    loadId: load.id,
    date: load.deliveryDate,
    grossRevenue: load.rate,
    driverShare: driverShare,
    companyShare: load.rate - driverShare,
    deadheadMiles: load.deadheadMiles,
    totalMiles: load.miles + load.deadheadMiles
  };
});

export const MOCK_INVOICES: Invoice[] = MOCK_SETTLEMENTS.map((set, i) => ({
  id: `inv-${i + 1}`,
  loadId: set.loadId,
  loadNumber: `L-${5000 + i}`,
  amount: set.grossRevenue,
  status: i % 2 === 0 ? InvoiceStatus.PAID : InvoiceStatus.SENT,
  issuedDate: set.date,
  dueDate: '2024-06-20'
}));

export const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-1', category: ExpenseCategory.FUEL, amount: 850.25, date: '2024-05-18', description: 'Diesel fillup', truckId: 'tr-1' },
  { id: 'exp-2', category: ExpenseCategory.MAINTENANCE, amount: 1200.00, date: '2024-05-15', description: 'Tire replacement', truckId: 'tr-5' },
];
