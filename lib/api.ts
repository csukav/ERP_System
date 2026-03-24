import { Customer, Employee, InventoryMovement, Invoice, Product, Salary } from './types';

const BASE = '/api';

// ── Generic fetch helper ────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Customers ───────────────────────────────────────────────────────────────

export const getCustomers = () => apiFetch<Customer[]>(`${BASE}/customers`);

export const createCustomer = (data: Omit<Customer, 'id' | 'createdAt'>) =>
  apiFetch<Customer>(`${BASE}/customers`, { method: 'POST', body: JSON.stringify(data) });

export const updateCustomer = (id: string, data: Partial<Customer>) =>
  apiFetch<Customer>(`${BASE}/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCustomer = (id: string) =>
  apiFetch<void>(`${BASE}/customers/${id}`, { method: 'DELETE' });

// ── Products ────────────────────────────────────────────────────────────────

export const getProducts = () => apiFetch<Product[]>(`${BASE}/products`);

export const createProduct = (data: Omit<Product, 'id'>) =>
  apiFetch<Product>(`${BASE}/products`, { method: 'POST', body: JSON.stringify(data) });

export const updateProduct = (id: string, data: Partial<Product>) =>
  apiFetch<Product>(`${BASE}/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProduct = (id: string) =>
  apiFetch<void>(`${BASE}/products/${id}`, { method: 'DELETE' });

// ── Invoices ─────────────────────────────────────────────────────────────────

export const getInvoices = () => apiFetch<Invoice[]>(`${BASE}/invoices`);

export const createInvoice = (data: Omit<Invoice, 'id' | 'createdAt'>) =>
  apiFetch<Invoice>(`${BASE}/invoices`, { method: 'POST', body: JSON.stringify(data) });

export const updateInvoice = (id: string, data: Partial<Invoice>) =>
  apiFetch<Invoice>(`${BASE}/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteInvoice = (id: string) =>
  apiFetch<void>(`${BASE}/invoices/${id}`, { method: 'DELETE' });

// ── Employees ────────────────────────────────────────────────────────────────

export const getEmployees = () => apiFetch<Employee[]>(`${BASE}/employees`);

export const createEmployee = (data: Omit<Employee, 'id'>) =>
  apiFetch<Employee>(`${BASE}/employees`, { method: 'POST', body: JSON.stringify(data) });

export const updateEmployee = (id: string, data: Partial<Employee>) =>
  apiFetch<Employee>(`${BASE}/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteEmployee = (id: string) =>
  apiFetch<void>(`${BASE}/employees/${id}`, { method: 'DELETE' });

// ── Salaries ─────────────────────────────────────────────────────────────────

export const getSalaries = () => apiFetch<Salary[]>(`${BASE}/salaries`);

export const createSalary = (data: Omit<Salary, 'id'>) =>
  apiFetch<Salary>(`${BASE}/salaries`, { method: 'POST', body: JSON.stringify(data) });

export const updateSalary = (id: string, data: Partial<Salary>) =>
  apiFetch<Salary>(`${BASE}/salaries/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// ── Inventory ─────────────────────────────────────────────────────────────────

export const getInventory = () => apiFetch<InventoryMovement[]>(`${BASE}/inventory`);

export const createMovement = (data: Omit<InventoryMovement, 'id' | 'createdAt'>) =>
  apiFetch<InventoryMovement>(`${BASE}/inventory`, { method: 'POST', body: JSON.stringify(data) });
