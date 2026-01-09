
import { GoogleUser } from '../types';

const MOCK_USERS: GoogleUser[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@example.com', picture: 'https://picsum.photos/seed/alex/100' },
  { id: '2', name: 'Sarah Smith', email: 'sarah.s@example.com', picture: 'https://picsum.photos/seed/sarah/100' },
  { id: '3', name: 'Dev Account', email: 'dev@finsync.io', picture: 'https://picsum.photos/seed/dev/100' },
];

export const authService = {
  // Simulate fetching accounts "already on the device"
  getAvailableAccounts: async (): Promise<GoogleUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const saved = localStorage.getItem('FINSYNC_ON_DEVICE_ACCOUNTS');
    if (saved) return JSON.parse(saved);
    // Default mock accounts for the first time
    localStorage.setItem('FINSYNC_ON_DEVICE_ACCOUNTS', JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  },

  /**
   * Simulates a Google OAuth login flow.
   * If an email is provided, it attempts to recover or switch to that specific account.
   */
  loginWithGoogle: async (email?: string): Promise<GoogleUser> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const saved = localStorage.getItem('FINSYNC_ON_DEVICE_ACCOUNTS');
    const accounts: GoogleUser[] = saved ? JSON.parse(saved) : [...MOCK_USERS];
    
    if (email) {
      const existingUser = accounts.find(a => a.email === email);
      if (existingUser) return existingUser;
    }

    // Fallback or fresh account generation
    const targetEmail = email || `user${Math.floor(Math.random() * 1000)}@gmail.com`;
    const newUser: GoogleUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: targetEmail.split('@')[0].split('.')[0].charAt(0).toUpperCase() + targetEmail.split('@')[0].split('.')[0].slice(1),
      email: targetEmail,
      picture: `https://picsum.photos/seed/${targetEmail}/100`
    };
    
    // Add to device persistence if it's a new mock account
    if (!accounts.find(a => a.email === newUser.email)) {
      accounts.push(newUser);
      localStorage.setItem('FINSYNC_ON_DEVICE_ACCOUNTS', JSON.stringify(accounts));
    }
    
    return newUser;
  },

  loginWithSelected: async (user: GoogleUser): Promise<GoogleUser> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return user;
  },

  loginWithCredentials: async (email: string, password: string): Promise<GoogleUser> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate successful login for any input for demo purposes
    const newUser: GoogleUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
      picture: `https://picsum.photos/seed/${email}/100`
    };
    
    // Add to "on device" accounts
    const saved = localStorage.getItem('FINSYNC_ON_DEVICE_ACCOUNTS');
    const accounts = saved ? JSON.parse(saved) : [];
    if (!accounts.find((a: any) => a.email === email)) {
      accounts.push(newUser);
      localStorage.setItem('FINSYNC_ON_DEVICE_ACCOUNTS', JSON.stringify(accounts));
    }
    
    return newUser;
  },
  
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
