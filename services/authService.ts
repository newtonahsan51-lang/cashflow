
import { User, UserLog } from '../types';

const API_BASE = '/api'; 

export const authService = {
  login: async (email: string, password?: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "লগইন ব্যর্থ হয়েছে।");
      
      return result;
    } catch (err: any) {
      throw new Error(err.message || "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।");
    }
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "নিবন্ধন ব্যর্থ হয়েছে।");
      
      return result;
    } catch (err: any) {
      throw new Error(err.message || "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।");
    }
  },

  // Fix: Added missing getRegistry method to fetch user logs for the AdminPanel
  getRegistry: async (): Promise<UserLog[]> => {
    try {
      const response = await fetch(`${API_BASE}/registry.php`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ব্যবহারকারী তালিকা আনতে ব্যর্থ হয়েছে।");
      return result;
    } catch (err: any) {
      throw new Error(err.message || "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।");
    }
  },

  logout: async () => {
    localStorage.removeItem('FINSYNC_CURRENT_USER');
  }
};
