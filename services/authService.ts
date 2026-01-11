
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
    if (!response.ok) throw new Error(result.error || "ইমেইল বা পাসওয়ার্ড ভুল।");
    
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

  // Added getRegistry method to fetch the list of users for the admin panel
  getRegistry: async (): Promise<UserLog[]> => {
    const response = await fetch(`${API_BASE}/registry.php`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "ব্যবহারকারী তালিকা আনা সম্ভব হয়নি।");
    return result;
  },

  logout: async () => {
    localStorage.removeItem('FINSYNC_CURRENT_USER');
  }
};
