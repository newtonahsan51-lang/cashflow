import { User, UserLog } from '../types';

const API_BASE = '/api'; 

export const authService = {
  login: async (email: string, password?: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "লগইন ব্যর্থ হয়েছে।");
    
    return result;
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "নিবন্ধন ব্যর্থ হয়েছে।");
    
    return result;
  },

  // Fix: Added getRegistry method to fetch UserLog records from the API for AdminPanel usage
  getRegistry: async (): Promise<UserLog[]> => {
    const response = await fetch(`${API_BASE}/users.php`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "ইউজার তালিকা আনতে ব্যর্থ হয়েছে।");
    
    return result;
  },

  logout: async () => {
    localStorage.removeItem('FINSYNC_CURRENT_USER');
  }
};