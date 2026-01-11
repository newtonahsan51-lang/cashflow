
import { SyncData } from '../types';
import { cryptoService } from './cryptoService';

const CLIENT_ID = '351500382438-iqmvl9khg36fr87i55bn9jfgd5q6sdib.apps.googleusercontent.com'; 
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export class SyncError extends Error {
  constructor(public type: 'network' | 'permission' | 'quota' | 'unknown', message: string) {
    super(message);
  }
}

export const driveService = {
  connect: async (): Promise<boolean> => {
    return new Promise((resolve) => {
      // @ts-ignore
      const gapi = window.gapi;
      // @ts-ignore
      const google = window.google;

      if (!gapi || !google) {
        console.warn("Google libraries not loaded yet. Retrying in 1s...");
        setTimeout(() => driveService.connect().then(resolve), 1000);
        return;
      }

      const checkAllInited = () => {
        if (gapiInited && gisInited) {
          console.log("Drive Service fully connected.");
          resolve(true);
        }
      };

      // 1. Init GAPI
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
          });
          gapiInited = true;
          checkAllInited();
        } catch (e) {
          console.error("GAPI initialization failed", e);
        }
      });

      // 2. Init GIS
      try {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '' // Will be set during request
        });
        gisInited = true;
        checkAllInited();
      } catch (e) {
        console.error("GIS initialization failed", e);
      }
    });
  },

  getAccessToken: async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const gapi = window.gapi;
      if (!gapi || !gapi.client) {
        reject(new Error("GAPI not ready"));
        return;
      }

      const token = gapi.client.getToken();
      if (token && token.access_token) {
        resolve(token.access_token);
        return;
      }

      if (!tokenClient) {
        reject(new Error("Token client not initialized."));
        return;
      }

      tokenClient.callback = (response: any) => {
        if (response.error !== undefined) {
          reject(new SyncError('permission', response.error_description || "Access denied"));
          return;
        }
        resolve(response.access_token);
      };

      tokenClient.requestAccessToken({ prompt: '' });
    });
  },

  getOrCreateFolder: async (name: string, parentId: string = 'root'): Promise<string> => {
    // @ts-ignore
    const gapi = window.gapi;
    const q = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
    const response = await gapi.client.drive.files.list({ q, fields: 'files(id, name)' });
    
    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    const folderMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };
    const createResponse = await gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });
    return createResponse.result.id;
  },

  uploadBackup: async (data: SyncData, onProgress: (p: number) => void): Promise<void> => {
    // @ts-ignore
    const gapi = window.gapi;
    await driveService.getAccessToken();
    onProgress(10);

    const email = data.profile.email;
    const rootFolderId = await driveService.getOrCreateFolder('FinSync_Backups');
    onProgress(20);

    const userFolderId = await driveService.getOrCreateFolder(email, rootFolderId);
    onProgress(30);

    const fields = (Object.keys(data) as (keyof SyncData)[]).filter(f => f !== 'timestamp');
    const totalFields = fields.length;

    for (let i = 0; i < totalFields; i++) {
      const field = fields[i];
      const fieldValue = data[field];
      const encryptedData = await cryptoService.encrypt(fieldValue);
      const fileName = `${field}.enc`;

      const q = `name = '${fileName}' and '${userFolderId}' in parents and trashed = false`;
      const listResponse = await gapi.client.drive.files.list({ q, fields: 'files(id)' });
      
      const metadata = {
        name: fileName,
        parents: [userFolderId]
      };

      if (listResponse.result.files && listResponse.result.files.length > 0) {
        const fileId = listResponse.result.files[0].id;
        await gapi.client.request({
          path: `/upload/drive/v3/files/${fileId}`,
          method: 'PATCH',
          params: { uploadType: 'media' },
          body: encryptedData
        });
      } else {
        const res = await gapi.client.drive.files.create({
          resource: metadata,
          fields: 'id'
        });
        const fileId = res.result.id;
        await gapi.client.request({
          path: `/upload/drive/v3/files/${fileId}`,
          method: 'PATCH',
          params: { uploadType: 'media' },
          body: encryptedData
        });
      }

      onProgress(30 + Math.floor(((i + 1) / totalFields) * 70));
    }
    onProgress(100);
  },

  downloadBackup: async (email: string, onProgress: (p: number) => void): Promise<SyncData | null> => {
    // @ts-ignore
    const gapi = window.gapi;
    await driveService.getAccessToken();
    onProgress(10);

    const qRoot = `name = 'FinSync_Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const rootRes = await gapi.client.drive.files.list({ q: qRoot });
    if (!rootRes.result.files || rootRes.result.files.length === 0) return null;

    const qUser = `name = '${email}' and '${rootRes.result.files[0].id}' in parents and trashed = false`;
    const userRes = await gapi.client.drive.files.list({ q: qUser });
    if (!userRes.result.files || userRes.result.files.length === 0) return null;

    const userFolderId = userRes.result.files[0].id;
    const fields: (keyof SyncData)[] = [
      'transactions', 'notes', 'categories', 'budgets', 
      'savingsGoals', 'settings', 'profile'
    ];
    
    const assembledData: Partial<SyncData> = { timestamp: Date.now() };

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const fileName = `${field}.enc`;
      const qFile = `name = '${fileName}' and '${userFolderId}' in parents and trashed = false`;
      const fileRes = await gapi.client.drive.files.list({ q: qFile, fields: 'files(id)' });

      if (fileRes.result.files && fileRes.result.files.length > 0) {
        const fileId = fileRes.result.files[0].id;
        const contentRes = await gapi.client.drive.files.get({
          fileId: fileId,
          alt: 'media'
        });
        assembledData[field] = await cryptoService.decrypt(contentRes.body);
      }
      onProgress(10 + Math.floor(((i + 1) / fields.length) * 90));
    }

    return assembledData as SyncData;
  }
};
