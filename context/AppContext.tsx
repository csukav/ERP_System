'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Customer, Employee, Invoice, InventoryMovement, Product, Salary } from '@/lib/types';

// ── State ────────────────────────────────────────────────────────────────────

interface AppState {
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  employees: Employee[];
  salaries: Salary[];
  inventory: InventoryMovement[];
  loading: Record<string, boolean>;
}

const initialState: AppState = {
  customers: [],
  products: [],
  invoices: [],
  employees: [],
  salaries: [],
  inventory: [],
  loading: {},
};

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'SET_SALARIES'; payload: Salary[] }
  | { type: 'SET_INVENTORY'; payload: InventoryMovement[] }
  | { type: 'SET_LOADING'; key: string; value: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CUSTOMERS': return { ...state, customers: action.payload };
    case 'SET_PRODUCTS': return { ...state, products: action.payload };
    case 'SET_INVOICES': return { ...state, invoices: action.payload };
    case 'SET_EMPLOYEES': return { ...state, employees: action.payload };
    case 'SET_SALARIES': return { ...state, salaries: action.payload };
    case 'SET_INVENTORY': return { ...state, inventory: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.value } };
    default: return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  refreshCustomers: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
  refreshSalaries: () => Promise<void>;
  refreshInventory: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = useCallback(
    async <T,>(key: string, url: string, actionType: Action['type']) => {
      dispatch({ type: 'SET_LOADING', key, value: true });
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: T = await res.json();
        dispatch({ type: actionType, payload: data } as Action);
      } finally {
        dispatch({ type: 'SET_LOADING', key, value: false });
      }
    },
    []
  );

  const refreshCustomers = useCallback(
    () => fetchData<Customer[]>('customers', '/api/customers', 'SET_CUSTOMERS'),
    [fetchData]
  );
  const refreshProducts = useCallback(
    () => fetchData<Product[]>('products', '/api/products', 'SET_PRODUCTS'),
    [fetchData]
  );
  const refreshInvoices = useCallback(
    () => fetchData<Invoice[]>('invoices', '/api/invoices', 'SET_INVOICES'),
    [fetchData]
  );
  const refreshEmployees = useCallback(
    () => fetchData<Employee[]>('employees', '/api/employees', 'SET_EMPLOYEES'),
    [fetchData]
  );
  const refreshSalaries = useCallback(
    () => fetchData<Salary[]>('salaries', '/api/salaries', 'SET_SALARIES'),
    [fetchData]
  );
  const refreshInventory = useCallback(
    () => fetchData<InventoryMovement[]>('inventory', '/api/inventory', 'SET_INVENTORY'),
    [fetchData]
  );

  return (
    <AppContext.Provider
      value={{
        state,
        refreshCustomers,
        refreshProducts,
        refreshInvoices,
        refreshEmployees,
        refreshSalaries,
        refreshInventory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
