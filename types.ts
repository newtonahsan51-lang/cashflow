
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'text' | 'list';
  items?: { id: string; text: string; completed: boolean }[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Budget {
  categoryId: string;
  limit: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  currency: string;
}

export type SyncInterval = '1h' | '6h' | '12h' | '24h';
export type AppLanguage = 'en' | 'bn' | 'hi' | 'es' | 'ar' | 'fr';

export interface SyncData {
  transactions: Transaction[];
  notes: Note[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  settings: {
    theme: string;
    notifications: boolean;
    syncInterval: SyncInterval;
    autoSync: boolean;
    language: AppLanguage;
    darkMode: boolean;
  };
  profile: UserProfile;
  timestamp: number;
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'idle';

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role?: 'admin' | 'user';
}

export interface UserLog {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  lastBackupAt: string | null;
  status: 'active' | 'inactive';
}

export interface SyncState {
  isConnected: boolean;
  lastBackupDate: string | null;
  status: SyncStatus;
  progress: number;
  error: string | null;
  errorType: 'network' | 'permission' | 'quota' | 'unknown' | null;
  user: User | null;
}
