
import { User, UserLog } from '../types';

// সিপ্যানেলে হোস্ট করার সময় আপনার ডোমেইন অনুযায়ী পাথ ঠিক করে নিন
const API_BASE = '/api'; 

export const authService = {
  login: async (email: string, password?: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "লগইন ব্যর্থ হয়েছে");
    }
    
    return await response.json();
  },

  sendVerificationCode: async (email: string, name: string, password: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    });
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "ওটিপি পাঠানো যায়নি");
    }
  },

  register: async (name: string, email: string, password: string, otp: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/verify_otp.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, otp })
    });
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "নিবন্ধন সম্পন্ন করা যায়নি");
    }
    
    return await response.json();
  },

  logout: async () => {
    localStorage.removeItem('FINSYNC_CURRENT_USER');
  },

  getRegistry: async (): Promise<UserLog[]> => {
    try {
      const response = await fetch(`${API_BASE}/admin_registry.php`);
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      return [];
    }
  }
};
