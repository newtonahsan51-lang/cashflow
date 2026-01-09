
/**
 * In a real-world app, we'd use Web Crypto API (SubtleCrypto) 
 * for AES-GCM encryption. For this demo, we simulate the transformation 
 * to demonstrate the flow while maintaining readability.
 */
export const cryptoService = {
  encrypt: async (data: any): Promise<string> => {
    const json = JSON.stringify(data);
    // Simulate encryption overhead
    await new Promise(resolve => setTimeout(resolve, 500));
    return btoa(unescape(encodeURIComponent(json))); // Base64 encoding as "mock encryption"
  },

  decrypt: async (encryptedData: string): Promise<any> => {
    // Simulate decryption overhead
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const decoded = decodeURIComponent(escape(atob(encryptedData)));
      return JSON.parse(decoded);
    } catch (e) {
      throw new Error("Failed to decrypt backup. Key mismatch or corrupted file.");
    }
  }
};
