// server/middleware.ts
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage'; // Adjust path if needed
import { ApiKey } from '@shared/schema'; // Adjust path if needed

/**
 * Express middleware to authenticate requests using an API key in the X-API-Key header.
 * Temporarily bypassed for testing.
 */
export async function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKeyFromHeader = req.header("X-API-Key");

    if (!apiKeyFromHeader) {
      console.warn('[AUTH] Missing X-API-Key header');
      return res.status(401).json({ error: "Missing API Key" });
    }

    // --- TEMPORARY BYPASS ---
    // The following verification logic is commented out for testing purposes.
    // In a real implementation, you would uncomment this section.

    /*
    // 1. Split the key into prefix and secret (adjust format if needed)
    const parts = apiKeyFromHeader.split('_');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      console.warn('[AUTH] Invalid API Key format received');
      return res.status(401).json({ error: "Invalid API Key format" });
    }
    const keyPrefix = parts[0];
    const secret = parts[1]; // Or the full key if verifyApiKey expects it

    // 2. Verify the key against storage
    // Assuming verifyApiKey handles finding by prefix and verifying the secret hash
    const apiKeyData = await storage.verifyApiKey(apiKeyFromHeader); // Or pass prefix and secret separately if needed

    if (!apiKeyData) {
      console.warn(`[AUTH] Invalid or inactive API Key provided (Prefix: ${keyPrefix})`);
      return res.status(401).json({ error: "Invalid or inactive API Key" });
    }

    // 3. Attach client info to request for later use
    console.log(`[AUTH] API Key validated for client: ${apiKeyData.clientId}`);
    (req as any).apiKeyClient = apiKeyData; // Use a more specific type if possible

    // 4. Record usage (optional, uncomment if needed)
    // await storage.recordApiKeyUsage(apiKeyData.keyPrefix);
    */

    // --- THIS IS THE BYPASS ---
    console.log("DEBUG: Bypassing API Key verification for testing.");
    // --- END BYPASS ---

    // 5. Proceed to the next middleware or route handler
    next();

  } catch (error) {
    console.error("[AUTH] Error during API Key authentication:", error);
    res.status(500).json({ error: "Internal Server Error during API Key authentication" });
  }
}

// You can add other middleware functions below if needed