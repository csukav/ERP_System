// Customer
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  notes: string;
}

// Product
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stockQuantity: number;
  minStockLevel: number;
}

// Invoice
export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  customerId: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
}

// Employee
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  email: string;
  phone: string;
}

// Salary
export type SalaryStatus = 'pending' | 'paid';

export interface Salary {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  amount: number;
  status: SalaryStatus;
  paidAt: string | null;
}

// Inventory Movement
export type MovementType = 'in' | 'out';

export interface InventoryMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  note: string;
  createdAt: string;
}

// Dashboard stats
export interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  lowStockProducts: number;
  totalProducts: number;
  totalEmployees: number;
  pendingSalaries: number;
}
