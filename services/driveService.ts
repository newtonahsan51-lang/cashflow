
import { SyncData } from '../types';
import { cryptoService } from './cryptoService';

const CLOUD_STORAGE_KEY = (email: string) => `FINSYNC_DATABASE_SOURCE_${email}`;

export class SyncError extends Error {
  constructor(public type: 'network' | 'permission' | 'quota' | 'unknown', message: string) {
    super(message);
  }
}

export const driveService = {
  /**
   * Validates the connection to the user's secure cloud storage.
   */
  connect: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; 
  },

  /**
   * Pushes the entire local database state to the cloud.
   */
  uploadBackup: async (data: SyncData, onProgress: (p: number) => void): Promise<void> => {
    const email = data.profile.email;
    onProgress(10);
    
    // Encrypting database content before cloud transfer
    const encryptedDatabase = await cryptoService.encrypt(data);
    onProgress(40);
    
    // Simulating cloud write latency
    for (let i = 50; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(i);
    }

    // Saving to persistent cloud mock (localStorage for this environment)
    localStorage.setItem(CLOUD_STORAGE_KEY(email), encryptedDatabase);
  },

  /**
   * Fetches and decrypts the database state from the cloud.
   */
  downloadBackup: async (email: string, onProgress: (p: number) => void): Promise<SyncData | null> => {
    onProgress(10);
    const encryptedData = localStorage.getItem(CLOUD_STORAGE_KEY(email));
    
    if (!encryptedData) {
      onProgress(100);
      return null;
    }

    // Simulating cloud read latency
    for (let i = 20; i <= 60; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      onProgress(i);
    }

    try {
      const decryptedDatabase = await cryptoService.decrypt(encryptedData);
      onProgress(100);
      return decryptedDatabase;
    } catch (e) {
      throw new SyncError('unknown', 'Database decryption failed. Data might be corrupted.');
    }
  }
};
