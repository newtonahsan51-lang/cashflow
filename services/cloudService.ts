
import { SyncData } from '../types';
import { driveService } from './driveService';

export const cloudService = {
  /**
   * Actual Google Drive backup upload
   */
  uploadBackup: async (data: SyncData, onProgress: (p: number) => void): Promise<void> => {
    try {
      await driveService.uploadBackup(data, onProgress);
    } catch (error: any) {
      console.error("Google Drive upload failed:", error);
      throw new Error(error.message || "গুগল ড্রাইভে ব্যাকআপ সেভ করা সম্ভব হয়নি।");
    }
  },

  /**
   * Actual Google Drive backup download
   */
  downloadBackup: async (email: string, onProgress: (p: number) => void): Promise<SyncData | null> => {
    try {
      return await driveService.downloadBackup(email, onProgress);
    } catch (error: any) {
      console.error("Google Drive download failed:", error);
      throw new Error(error.message || "গুগল ড্রাইভ থেকে ডাটা আনা সম্ভব হয়নি।");
    }
  }
};
