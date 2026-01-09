
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
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

export interface SyncData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  settings: {
    theme: string;
    notifications: boolean;
    syncInterval: SyncInterval;
    autoSync: boolean;
  };
  profile: UserProfile;
  timestamp: number;
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'idle';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface SyncState {
  isConnected: boolean;
  lastBackupDate: string | null;
  status: SyncStatus;
  progress: number;
  error: string | null;
  errorType: 'network' | 'permission' | 'quota' | 'unknown' | null;
  googleUser: GoogleUser | null;
}

export interface AppState {
  accounts: Record<string, SyncData>; // email as key
  activeAccountEmail: string | null;
}
