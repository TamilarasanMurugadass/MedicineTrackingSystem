// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}

// Authentication types
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  expiration: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
}

export interface UpdateUserDto {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  isActive: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Medicine types
export interface MedicineDto {
  id: number;
  name: string;
  genericName?: string;
  manufacturer: string;
  description?: string;
  strength?: string;
  unitOfMeasure: string;
  minimumStockLevel: number;
  isActive: boolean;
  createdBy: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  totalCurrentStock: number;
  isLowStock: boolean;
  earliestExpiry?: string;
  activeBatches: number;
}

export interface CreateMedicineDto {
  name: string;
  genericName?: string;
  manufacturer: string;
  description?: string;
  strength?: string;
  unitOfMeasure: string;
  minimumStockLevel: number;
}

export interface UpdateMedicineDto {
  name: string;
  genericName?: string;
  manufacturer: string;
  description?: string;
  strength?: string;
  unitOfMeasure: string;
  minimumStockLevel: number;
  isActive: boolean;
}

// Medicine Batch types
export interface MedicineBatchDto {
  id: number;
  medicineId: number;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  purchaseDate: string;
  purchasePrice?: number;
  supplier?: string;
  initialQuantity: number;
  currentQuantity: number;
  isActive: boolean;
  createdBy: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  isNearingExpiry: boolean;
  daysToExpiry: number;
  isDepleted: boolean;
  usagePercentage: number;
}

export interface CreateMedicineBatchDto {
  medicineId: number;
  batchNumber: string;
  expiryDate: string;
  purchaseDate: string;
  purchasePrice?: number;
  supplier?: string;
  initialQuantity: number;
}

export interface UpdateMedicineBatchDto {
  batchNumber: string;
  expiryDate: string;
  purchaseDate: string;
  purchasePrice?: number;
  supplier?: string;
  isActive: boolean;
}

// Inventory Transaction types
export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED'
}

export interface InventoryTransactionDto {
  id: number;
  medicineBatchId: number;
  batchNumber: string;
  medicineName: string;
  transactionType: TransactionType;
  transactionTypeDisplay: string;
  quantity: number;
  remainingQuantity: number;
  reason?: string;
  patientReference?: string;
  notes?: string;
  createdBy: string;
  creatorName: string;
  createdAt: string;
  isStockReduction: boolean;
  isStockAddition: boolean;
}

export interface CreateInventoryTransactionDto {
  medicineBatchId: number;
  transactionType: TransactionType;
  quantity: number;
  reason?: string;
  patientReference?: string;
  notes?: string;
}

export interface UsageSummaryDto {
  medicineName: string;
  userName: string;
  totalQuantityUsed: number;
  transactionCount: number;
  firstUsage: string;
  lastUsage: string;
}

// Alert types
export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  EXPIRY_WARNING = 'EXPIRY_WARNING',
  EXPIRED = 'EXPIRED',
  BATCH_DEPLETED = 'BATCH_DEPLETED'
}

export interface AlertDto {
  id: number;
  alertType: AlertType;
  alertTypeDisplay: string;
  medicineId: number;
  medicineName: string;
  medicineBatchId?: number;
  batchNumber?: string;
  message: string;
  isRead: boolean;
  isActive: boolean;
  expiryDate?: string;
  currentStock?: number;
  minimumStock?: number;
  createdAt: string;
  readAt?: string;
  readBy?: string;
  readerName?: string;
  severity: string;
}

export interface CreateAlertDto {
  alertType: AlertType;
  medicineId: number;
  medicineBatchId?: number;
  message: string;
  expiryDate?: string;
  currentStock?: number;
  minimumStock?: number;
}

export interface AlertSummaryDto {
  totalAlerts: number;
  unreadAlerts: number;
  highSeverityAlerts: number;
  mediumSeverityAlerts: number;
  lowSeverityAlerts: number;
  lowStockAlerts: number;
  expiryAlerts: number;
  expiredAlerts: number;
}

// Dashboard types
export interface DashboardStatsDto {
  totalMedicines: number;
  activeMedicines: number;
  lowStockMedicines: number;
  totalBatches: number;
  activeBatches: number;
  expiredBatches: number;
  batchesNearingExpiry: number;
  totalTransactionsToday: number;
  totalUsers: number;
  activeUsers: number;
  totalAlerts: number;
  unreadAlerts: number;
}

export interface StockSummaryDto {
  medicineName: string;
  currentStock: number;
  minimumStock: number;
  status: string;
  earliestExpiry?: string;
  activeBatches: number;
}

export interface RecentActivityDto {
  activityType: string;
  description: string;
  userName: string;
  timestamp: string;
  severity: string;
}

export interface ExpiryWarningDto {
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  daysToExpiry: number;
  currentQuantity: number;
  severity: string;
}

// Request types for inventory operations
export interface WithdrawMedicineRequest {
  batchId: number;
  quantity: number;
  reason: string;
  patientReference?: string;
  notes?: string;
}

export interface AdjustStockRequest {
  batchId: number;
  adjustment: number;
  reason: string;
  notes?: string;
}

export interface MarkExpiredRequest {
  batchId: number;
  notes?: string;
}

export interface MarkDamagedRequest {
  batchId: number;
  quantity: number;
  reason: string;
  notes?: string;
}

// Role types
export enum Role {
  ADMIN = 'Admin',
  PHARMACIST = 'Pharmacist',
  STAFF = 'Staff'
}

export interface RoleDto {
  id: number;
  name: string;
  description?: string;
}

// Common utility types
export interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface SearchParams {
  searchTerm?: string;
  filters?: Record<string, any>;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Navigation types
export interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
  requiredRoles?: Role[];
}