import { Redis } from '@upstash/redis';
import { getAuditEntryById, saveAuditEntry, type AuditEntry } from './data';

// Export getAuditEntryById for use in API route
export { getAuditEntryById };

export interface AuditResult {
  id: string;
  email: string;
  hotelName: string;
  hotelPlaceId: string | null;
  trustScore: number;
  aiVisibility: {
    chatgpt: { visible: boolean; position: number | null };
    gemini: { visible: boolean; position: number | null };
    bing: { visible: boolean; position: number | null };
  };
  unansweredReviews: number | string;
  totalReviews?: number;
  answeredReviews?: number;
  sampleReply: string;
  criticalIssues: string[];
  recommendations: string[];
  revenueLoss: string;
  createdAt: string;
  locale: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  hotelName: string;
  createdAt: string;
  locale: string;
}

// In-memory cache for waitlist, audit entries, and analytics (for admin dashboard)
// This ensures data is available even if Redis/KV is not working
const waitlistCache = new Map<string, WaitlistEntry>();
const auditEntriesCache = new Map<string, AuditEntry>();
const analyticsCache = new Map<string, AnalyticsEntry>();

// Export cache clearing functions
export function clearWaitlistCache(): void {
  waitlistCache.clear();
  console.log('✅ Waitlist cache cleared');
}

export function clearAuditEntriesCache(): void {
  auditEntriesCache.clear();
  console.log('✅ Audit entries cache cleared');
}

export function clearAnalyticsCache(): void {
  analyticsCache.clear();
  console.log('✅ Analytics cache cleared');
}

export function clearAllCaches(): void {
  waitlistCache.clear();
  auditEntriesCache.clear();
  analyticsCache.clear();
  console.log('✅ All in-memory caches cleared');
}

// Analytics entry interface (from lib/analytics.ts)
export interface AnalyticsEntry {
  id: string;
  sessionId: string;
  country: string;
  countryCode: string;
  page: string;
  duration: number; // másodpercben
  timestamp: string;
  userAgent?: string;
  referrer?: string;
  device: string;
  browser: string;
  os: string;
  clicks: Array<{
    element: string;
    page: string;
    timestamp: string;
  }>;
  pagesViewed: Array<{
    page: string;
    timestamp: string;
    duration: number; // másodpercben
  }>;
}

// Helper to sync cache with Redis when possible
function syncCacheToRedis() {
  // This will be called after successful Redis operations
}

// Initialize Redis client (works with both Vercel KV and Upstash Redis)
// Note: In serverless environments, this may be re-initialized on each invocation
let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  console.log('[KV] getRedisClient called');
  
  // Always try to re-initialize if not available (for serverless environments)
  if (redis) {
    try {
      // Test if the client is still valid by trying a simple operation
      // If it fails, we'll re-initialize
      console.log('[KV] Redis client already initialized, reusing');
      return redis;
    } catch (error) {
      console.warn('[KV] Redis client test failed, re-initializing:', error);
      redis = null;
    }
  }

  // Try Vercel KV first (if configured)
  // IMPORTANT: Trim whitespace and newlines from environment variables
  const kvUrl = process.env.KV_REST_API_URL?.trim();
  const kvToken = process.env.KV_REST_API_TOKEN?.trim();
  
  console.log('[KV] Checking Vercel KV env vars:', { 
    kvUrl: kvUrl ? `${kvUrl.substring(0, 20)}...` : 'not set',
    kvToken: kvToken ? `${kvToken.substring(0, 10)}...` : 'not set'
  });
  
  if (kvUrl && kvToken) {
    try {
      console.log('[KV] Attempting to initialize Vercel KV client...');
      redis = new Redis({
        url: kvUrl,
        token: kvToken,
      });
      console.log('✅ Using Vercel KV');
      return redis;
    } catch (error) {
      console.warn('❌ Failed to initialize Vercel KV:', error);
      if (error instanceof Error) {
        console.warn(`Error details: ${error.message}`);
        console.warn(`Stack: ${error.stack}`);
      }
    }
  } else {
    console.warn('⚠️ KV_REST_API_URL or KV_REST_API_TOKEN not configured');
  }

  // Try Upstash Redis directly (if configured)
  // IMPORTANT: Trim whitespace and newlines from environment variables
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  
  console.log('[KV] Checking Upstash Redis env vars:', { 
    upstashUrl: upstashUrl ? `${upstashUrl.substring(0, 20)}...` : 'not set',
    upstashToken: upstashToken ? `${upstashToken.substring(0, 10)}...` : 'not set'
  });
  
  if (upstashUrl && upstashToken) {
    try {
      console.log('[KV] Attempting to initialize Upstash Redis client...');
      redis = new Redis({
        url: upstashUrl,
        token: upstashToken,
      });
      console.log('✅ Using Upstash Redis');
      return redis;
    } catch (error) {
      console.warn('❌ Failed to initialize Upstash Redis:', error);
      if (error instanceof Error) {
        console.warn(`Error details: ${error.message}`);
        console.warn(`Stack: ${error.stack}`);
      }
    }
  } else {
    console.warn('⚠️ UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured');
  }

  console.error('❌ No Redis client available. Check environment variables.');
  return null;
}

// ===== AUDIT RESULT STORAGE =====

// Use Redis (Vercel KV or Upstash) for audit storage
// Falls back to file storage if Redis is not available
export async function saveAuditResult(auditResult: AuditResult): Promise<void> {
  // Try Redis with retry logic (up to 3 attempts)
  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    if (client) {
      try {
        console.log(`Attempting to save audit to Redis (attempt ${attempts + 1}/${maxAttempts}): ${auditResult.id}`);
        await client.set(`audit:${auditResult.id}`, JSON.stringify(auditResult), { ex: 2592000 }); // 30 days TTL
        console.log(`✅ Audit result saved to Redis: ${auditResult.id}`);
        return; // Success, exit function
      } catch (error) {
        attempts++;
        console.error(`❌ Error saving audit result to Redis (attempt ${attempts}/${maxAttempts}): ${error}`);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
        }
        
        // If it's the last attempt, fall through to file storage
        if (attempts >= maxAttempts) {
          console.error(`❌ Failed to save to Redis after ${maxAttempts} attempts, falling back to file storage`);
          break;
        }
        
        // Reset client and try again
        redis = null;
        client = getRedisClient();
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      console.warn('❌ Redis client not available. KV_REST_API_URL or UPSTASH_REDIS_REST_URL not configured.');
      break; // Exit loop, fall through to file storage
    }
  }
  
  // Fallback to file storage
  try {
    console.log(`Attempting to save audit to file storage: ${auditResult.id}`);
    const auditEntry: AuditEntry = {
      id: auditResult.id,
      email: auditResult.email,
      hotelName: auditResult.hotelName,
      hotelPlaceId: auditResult.hotelPlaceId,
      trustScore: auditResult.trustScore,
      aiVisibility: auditResult.aiVisibility,
      unansweredReviews: auditResult.unansweredReviews,
      totalReviews: auditResult.totalReviews,
      answeredReviews: auditResult.answeredReviews,
      sampleReply: auditResult.sampleReply,
      criticalIssues: auditResult.criticalIssues,
      recommendations: auditResult.recommendations,
      revenueLoss: auditResult.revenueLoss,
      createdAt: auditResult.createdAt,
      locale: auditResult.locale,
    };
    
    saveAuditEntry(auditEntry);
    console.log(`✅ Audit result saved to file: ${auditResult.id}`);
  } catch (error) {
    console.error(`❌ Error saving audit result to file: ${error}`);
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
    }
  }
}

export async function getAuditResult(id: string): Promise<AuditResult | null> {
  // Try Redis with retry logic (up to 3 attempts)
  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    if (client) {
      try {
        console.log(`[KV] Attempting to get audit from Redis (attempt ${attempts + 1}/${maxAttempts}): ${id}`);
        const key = `audit:${id}`;
        console.log(`[KV] Looking for key: ${key}`);
        const result = await client.get<string | AuditResult>(key);
        
        if (result) {
          // Check if result is already an object (Upstash Redis sometimes returns objects directly)
          if (typeof result === 'object' && !Array.isArray(result) && result !== null) {
            console.log(`[KV] ✅ Audit result retrieved from Redis as object: ${id}`);
            return result as AuditResult;
          }
          // Otherwise, try to parse as JSON string
          try {
            const auditResult = typeof result === 'string' 
              ? JSON.parse(result) as AuditResult
              : result as AuditResult;
            console.log(`[KV] ✅ Audit result retrieved from Redis: ${id}`);
            return auditResult;
          } catch (parseError) {
            console.error(`[KV] ❌ Error parsing audit result from Redis: ${parseError}`);
            if (parseError instanceof Error) {
              console.error(`[KV] Error details: ${parseError.message}`);
            }
            // If parsing fails, break and try file storage
            break;
          }
        } else {
          console.log(`[KV] ❌ Audit not found in Redis (key: ${key}, result is null/undefined)`);
          // Try to list keys to see what's available
          try {
            const keys = await client.keys('audit:*');
            console.log(`[KV] Total audit keys in Redis: ${keys.length}`);
            if (keys.length > 0 && keys.length <= 20) {
              console.log(`[KV] Available audit keys:`, keys);
            } else if (keys.length > 20) {
              console.log(`[KV] First 20 audit keys:`, keys.slice(0, 20));
            }
          } catch (keysError) {
            console.warn(`[KV] Could not list keys:`, keysError);
          }
          break; // Not found, exit loop and try file storage
        }
      } catch (error) {
        attempts++;
        console.error(`[KV] ❌ Error getting audit result from Redis (attempt ${attempts}/${maxAttempts}): ${error}`);
        if (error instanceof Error) {
          console.error(`[KV] Error details: ${error.message}`);
          console.error(`[KV] Stack: ${error.stack}`);
        }
        
        // If it's the last attempt, fall through to file storage
        if (attempts >= maxAttempts) {
          console.error(`[KV] ❌ Failed to get from Redis after ${maxAttempts} attempts, falling back to file storage`);
          break;
        }
        
        // Reset client and try again
        redis = null;
        client = getRedisClient();
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      console.warn('[KV] ❌ Redis client not available. KV_REST_API_URL or UPSTASH_REDIS_REST_URL not configured.');
      break; // Exit loop, fall through to file storage
    }
  }
  
  // Fallback to file storage - ALWAYS try this, even if Redis seems to work
  try {
    console.log(`[KV] Attempting to get audit from file storage: ${id}`);
    const { getAuditEntryById, getAuditEntries } = await import('./data');
    let auditEntry: AuditEntry | null = getAuditEntryById(id);
    
    // If not found by ID, try searching all entries (in case of ID mismatch)
    if (!auditEntry) {
      console.log(`[KV] Audit not found by ID, searching all entries...`);
      const allEntries = getAuditEntries();
      console.log(`[KV] Total entries in file storage: ${allEntries.length}`);
      const foundEntry = allEntries.find(e => e.id === id);
      if (foundEntry) {
        auditEntry = foundEntry;
        console.log(`[KV] ✅ Found audit entry by searching all entries: ${id}`);
      } else {
        console.warn(`[KV] ❌ Audit not found in file storage: ${id}`);
        if (allEntries.length > 0) {
          console.log(`[KV] Available IDs (first 10):`, allEntries.slice(0, 10).map(e => e.id));
        }
        return null;
      }
    }
    
    const auditResult: AuditResult = {
      id: auditEntry.id,
      email: auditEntry.email,
      hotelName: auditEntry.hotelName,
      hotelPlaceId: auditEntry.hotelPlaceId,
      trustScore: auditEntry.trustScore,
      aiVisibility: auditEntry.aiVisibility,
      unansweredReviews: auditEntry.unansweredReviews,
      totalReviews: auditEntry.totalReviews,
      answeredReviews: auditEntry.answeredReviews,
      sampleReply: auditEntry.sampleReply || '',
      criticalIssues: auditEntry.criticalIssues,
      recommendations: auditEntry.recommendations,
      revenueLoss: auditEntry.revenueLoss,
      createdAt: auditEntry.createdAt,
      locale: auditEntry.locale,
    };
    
    console.log(`[KV] ✅ Audit result retrieved from file: ${id}`);
    return auditResult;
  } catch (error) {
    console.error(`[KV] ❌ Error getting audit result from file: ${error}`);
    if (error instanceof Error) {
      console.error(`[KV] Error details: ${error.message}`);
      console.error(`[KV] Stack: ${error.stack}`);
    }
    return null;
  }
}

// ===== WAITLIST STORAGE =====

export async function saveWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'createdAt'>): Promise<WaitlistEntry> {
  const newEntry: WaitlistEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };

  // Try Redis with retry logic (up to 3 attempts)
  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    if (client) {
      try {
        console.log(`[KV] Attempting to save waitlist entry to Redis (attempt ${attempts + 1}/${maxAttempts}): ${newEntry.id}`);
        
        // Get existing entries
        const existingEntriesData = await client.get('waitlist:entries');
        console.log(`[KV] Existing entries from Redis:`, existingEntriesData ? `Found ${typeof existingEntriesData === 'string' ? existingEntriesData.length : 'object'}` : 'null');
        let existingEntries: WaitlistEntry[];
        if (existingEntriesData) {
          if (typeof existingEntriesData === 'string') {
            try {
              existingEntries = JSON.parse(existingEntriesData);
            } catch (parseError) {
              console.error(`[KV] JSON parse error when reading existing waitlist entries:`, parseError);
              console.error(`[KV] Raw data:`, existingEntriesData);
              existingEntries = []; // Start fresh if parse fails
            }
          } else {
            existingEntries = existingEntriesData as WaitlistEntry[];
          }
        } else {
          existingEntries = [];
        }
        console.log(`[KV] Parsed existing entries: ${existingEntries.length} entries`);
        
        // Check if entry already exists (by email)
        const existingIndex = existingEntries.findIndex(e => e.email.toLowerCase() === newEntry.email.toLowerCase());
        if (existingIndex >= 0) {
          console.log(`[KV] Entry already exists at index ${existingIndex}, updating...`);
          existingEntries[existingIndex] = newEntry;
        } else {
          // Add new entry
          existingEntries.push(newEntry);
        }
        console.log(`[KV] Total entries after adding/updating: ${existingEntries.length}`);
        
        // Save back to Redis (no TTL, keep forever for admin dashboard)
        // IMPORTANT: Always stringify to ensure JSON format
        const entriesJson = JSON.stringify(existingEntries);
        console.log(`[KV] Saving ${entriesJson.length} chars to Redis key 'waitlist:entries'`);
        await client.set('waitlist:entries', entriesJson);
        console.log(`[KV] ✅ Successfully saved to Redis key 'waitlist:entries'`);
        
        // Also cache in memory for immediate access
        waitlistCache.set(newEntry.id, newEntry);
        
        console.log(`✅ Waitlist entry saved to Redis: ${newEntry.id}`);
        return newEntry; // Success, exit function
      } catch (error) {
        attempts++;
        console.error(`❌ Error saving waitlist entry to Redis (attempt ${attempts}/${maxAttempts}): ${error}`);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
        }
        
        // If it's the last attempt, fall through to file storage
        if (attempts >= maxAttempts) {
          console.error(`❌ Failed to save to Redis after ${maxAttempts} attempts, falling back to file storage`);
          break;
        }
        
        // Reset client and try again
        redis = null;
        client = getRedisClient();
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      console.warn('❌ Redis client not available. KV_REST_API_URL or UPSTASH_REDIS_REST_URL not configured.');
      break; // Exit loop, fall through to file storage
    }
  }
  
  // Fallback to file storage
  try {
    console.log(`Attempting to save waitlist entry to file storage: ${newEntry.id}`);
    const { saveWaitlistEntry: saveToFile } = await import('./data');
    const savedEntry = saveToFile(entry);
    // Also cache in memory
    waitlistCache.set(savedEntry.id, savedEntry);
    return savedEntry;
  } catch (error) {
    console.error(`❌ Error saving waitlist entry to file: ${error}`);
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
    }
    // Still cache in memory even if file save fails
    waitlistCache.set(newEntry.id, newEntry);
    return newEntry; // Return entry even if save fails
  }
}

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  console.log('[KV] getWaitlistEntries called');
  
  // Try Redis with retry logic (up to 3 attempts)
  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    if (client) {
      try {
        console.log(`[KV] Attempting to get waitlist entries from Redis (attempt ${attempts + 1}/${maxAttempts})`);
        const entriesData = await client.get('waitlist:entries');
        console.log(`[KV] Redis response type:`, typeof entriesData, entriesData ? `Found ${typeof entriesData === 'string' ? entriesData.length : 'object'} chars` : 'null');
        
        if (entriesData) {
          // Handle both string and already parsed object
          let entries: WaitlistEntry[];
          if (typeof entriesData === 'string') {
            entries = JSON.parse(entriesData) as WaitlistEntry[];
          } else {
            // Already parsed by Redis client
            entries = entriesData as WaitlistEntry[];
          }
          console.log(`✅ Waitlist entries retrieved from Redis: ${entries.length} entries`);
          // Update in-memory cache
          entries.forEach(entry => waitlistCache.set(entry.id, entry));
          return entries;
        } else {
          console.log(`❌ No waitlist entries found in Redis (key exists but is null/empty), trying file storage`);
          break; // Not found, exit loop and try file storage
        }
      } catch (error) {
        attempts++;
        console.error(`❌ Error getting waitlist entries from Redis (attempt ${attempts}/${maxAttempts}): ${error}`);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
        }
        
        // If it's the last attempt, fall through to file storage
        if (attempts >= maxAttempts) {
          console.error(`❌ Failed to get from Redis after ${maxAttempts} attempts, falling back to file storage`);
          break;
        }
        
        // Reset client and try again
        redis = null;
        client = getRedisClient();
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      console.warn('❌ Redis client not available. KV_REST_API_URL or UPSTASH_REDIS_REST_URL not configured.');
      break; // Exit loop, fall through to file storage
    }
  }
  
  // Don't fallback to file storage - it's read-only on Vercel and causes confusion
  // If Redis is empty, return empty array
  console.log(`⚠️ No waitlist entries found in Redis, returning empty array (file storage fallback disabled)`);
  
  // Return in-memory cache as last resort (if any)
  const cachedEntries = Array.from(waitlistCache.values());
  if (cachedEntries.length > 0) {
    console.log(`⚠️ Returning ${cachedEntries.length} entries from in-memory cache`);
    return cachedEntries;
  }
  
  return [];
}

// ===== AUDIT ENTRIES STORAGE (for admin dashboard) =====

export async function saveAuditEntryToKV(entry: AuditEntry): Promise<void> {
  console.log('[KV] saveAuditEntryToKV called with entry ID:', entry.id);
  
  // Try Redis with retry logic (up to 3 attempts)
  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    if (client) {
      try {
        console.log(`[KV] Attempting to save audit entry to Redis (attempt ${attempts + 1}/${maxAttempts}): ${entry.id}`);
        
        // Get existing entries
        const existingEntriesData = await client.get('audit:entries');
        console.log(`[KV] Existing entries from Redis:`, existingEntriesData ? `Found ${typeof existingEntriesData === 'string' ? existingEntriesData.length : 'object'}` : 'null');
        let existingEntries: AuditEntry[];
        if (existingEntriesData) {
          if (typeof existingEntriesData === 'string') {
            try {
              existingEntries = JSON.parse(existingEntriesData);
            } catch (parseError) {
              console.error(`[KV] JSON parse error when reading existing entries:`, parseError);
              console.error(`[KV] Raw data:`, existingEntriesData);
              existingEntries = []; // Start fresh if parse fails
            }
          } else {
            existingEntries = existingEntriesData as AuditEntry[];
          }
        } else {
          existingEntries = [];
        }
        console.log(`[KV] Parsed existing entries: ${existingEntries.length} entries`);
        
        // Check if entry already exists, update or add
        const existingIndex = existingEntries.findIndex(e => e.id === entry.id);
        if (existingIndex >= 0) {
          console.log(`[KV] Updating existing entry at index ${existingIndex}`);
          existingEntries[existingIndex] = entry;
        } else {
          console.log(`[KV] Adding new entry (total will be ${existingEntries.length + 1})`);
          existingEntries.push(entry);
        }
        
        // Save back to Redis (no TTL, keep forever for admin dashboard)
        const entriesJson = JSON.stringify(existingEntries);
        console.log(`[KV] Saving ${entriesJson.length} chars to Redis key 'audit:entries'`);
        await client.set('audit:entries', entriesJson);
        
        // Also cache in memory for immediate access
        auditEntriesCache.set(entry.id, entry);
        
        console.log(`✅ Audit entry saved to Redis: ${entry.id}`);
        return; // Success, exit function
      } catch (error) {
        attempts++;
        console.error(`❌ Error saving audit entry to Redis (attempt ${attempts}/${maxAttempts}): ${error}`);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
        }
        
        // If it's the last attempt, fall through to file storage
        if (attempts >= maxAttempts) {
          console.error(`❌ Failed to save to Redis after ${maxAttempts} attempts, falling back to file storage`);
          break;
        }
        
        // Reset client and try again
        redis = null;
        client = getRedisClient();
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      console.warn('❌ Redis client not available. KV_REST_API_URL or UPSTASH_REDIS_REST_URL not configured.');
      break; // Exit loop, fall through to file storage
    }
  }
  
  // Fallback to file storage
  try {
    console.log(`Attempting to save audit entry to file storage: ${entry.id}`);
    saveAuditEntry(entry);
    // Also cache in memory
    auditEntriesCache.set(entry.id, entry);
    console.log(`✅ Audit entry saved to file: ${entry.id}`);
  } catch (error) {
    console.error(`❌ Error saving audit entry to file: ${error}`);
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
    }
    // Still cache in memory even if file save fails
    auditEntriesCache.set(entry.id, entry);
  }
}

export async function getAuditEntriesFromKV(): Promise<AuditEntry[]> {
  console.log('[KV] getAuditEntriesFromKV called');
  
  // Try Redis with retry logic (up to 3 attempts)
  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    if (client) {
      try {
        console.log(`[KV] Attempting to get audit entries from Redis (attempt ${attempts + 1}/${maxAttempts})`);
        const entriesData = await client.get('audit:entries');
        console.log(`[KV] Redis response type:`, typeof entriesData, entriesData ? `Found ${typeof entriesData === 'string' ? entriesData.length : 'object'}` : 'null');
        
        if (entriesData) {
          // Handle both string and already parsed object
          let entries: AuditEntry[];
          if (typeof entriesData === 'string') {
            try {
              entries = JSON.parse(entriesData) as AuditEntry[];
            } catch (parseError) {
              console.error(`[KV] JSON parse error:`, parseError);
              console.error(`[KV] Raw data:`, entriesData);
              throw parseError;
            }
          } else {
            // Already parsed by Redis client
            entries = entriesData as AuditEntry[];
          }
          console.log(`✅ Audit entries retrieved from Redis: ${entries.length} entries`);
          // Update in-memory cache
          entries.forEach(entry => auditEntriesCache.set(entry.id, entry));
          return entries;
        } else {
          console.log(`❌ No audit entries found in Redis (key exists but is null/empty), trying file storage`);
          break; // Not found, exit loop and try file storage
        }
      } catch (error) {
        attempts++;
        console.error(`❌ Error getting audit entries from Redis (attempt ${attempts}/${maxAttempts}): ${error}`);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
        }
        
        // If it's the last attempt, fall through to file storage
        if (attempts >= maxAttempts) {
          console.error(`❌ Failed to get from Redis after ${maxAttempts} attempts, falling back to file storage`);
          break;
        }
        
        // Reset client and try again
        redis = null;
        client = getRedisClient();
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      console.warn('❌ Redis client not available. KV_REST_API_URL or UPSTASH_REDIS_REST_URL not configured.');
      break; // Exit loop, fall through to file storage
    }
  }
  
  // Don't fallback to file storage - it's read-only on Vercel and causes confusion
  // If Redis is empty, return empty array
  console.log(`⚠️ No audit entries found in Redis, returning empty array (file storage fallback disabled)`);
  
  // Return in-memory cache as last resort (if any)
  const cachedEntries = Array.from(auditEntriesCache.values());
  if (cachedEntries.length > 0) {
    console.log(`⚠️ Returning ${cachedEntries.length} entries from in-memory cache`);
    return cachedEntries;
  }
  
  return [];
}

// ===== ANALYTICS STORAGE =====

export async function saveAnalyticsEntry(entry: Omit<AnalyticsEntry, 'id' | 'timestamp'>): Promise<AnalyticsEntry> {
  console.log('[KV] saveAnalyticsEntry called');
  const newEntry: AnalyticsEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
  };
  console.log('[KV] Generated new analytics entry ID:', newEntry.id);

  // Try Redis with retry logic (up to 3 attempts)
  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    if (client) {
      try {
        console.log(`[KV] Attempting to save analytics entry to Redis (attempt ${attempts + 1}/${maxAttempts}): ${newEntry.id}`);
        
        // Get existing entries
        const existingEntriesData = await client.get('analytics:entries');
        console.log(`[KV] Existing entries from Redis:`, existingEntriesData ? `Found ${typeof existingEntriesData === 'string' ? existingEntriesData.length : 'object'}` : 'null');
        let existingEntries: AnalyticsEntry[];
        if (existingEntriesData) {
          if (typeof existingEntriesData === 'string') {
            try {
              existingEntries = JSON.parse(existingEntriesData);
            } catch (parseError) {
              console.error(`[KV] JSON parse error when reading existing analytics entries:`, parseError);
              console.error(`[KV] Raw data:`, existingEntriesData);
              existingEntries = []; // Start fresh if parse fails
            }
          } else {
            existingEntries = existingEntriesData as AnalyticsEntry[];
          }
        } else {
          existingEntries = [];
        }
        console.log(`[KV] Parsed existing entries: ${existingEntries.length} entries`);
        
        // Check if entry already exists (by sessionId), update or add
        const existingIndex = existingEntries.findIndex(e => e.sessionId === newEntry.sessionId);
        if (existingIndex >= 0) {
          console.log(`[KV] Entry already exists at index ${existingIndex}, updating...`);
          existingEntries[existingIndex] = newEntry;
        } else {
          // Add new entry
          existingEntries.push(newEntry);
        }
        console.log(`[KV] Total entries after adding/updating: ${existingEntries.length}`);
        
        // Save back to Redis (no TTL, keep forever for admin dashboard)
        const entriesJson = JSON.stringify(existingEntries);
        console.log(`[KV] Saving ${entriesJson.length} chars to Redis key 'analytics:entries'`);
        await client.set('analytics:entries', entriesJson);
        console.log(`[KV] ✅ Successfully saved to Redis key 'analytics:entries'`);
        
        // Also cache in memory for immediate access
        analyticsCache.set(newEntry.id, newEntry);
        
        console.log(`✅ Analytics entry saved to Redis: ${newEntry.id}`);
        return newEntry; // Success, exit function
      } catch (error) {
        attempts++;
        console.error(`❌ Error saving analytics entry to Redis (attempt ${attempts}/${maxAttempts}): ${error}`);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
        }
        
        // If it's the last attempt, fall through to file storage
        if (attempts >= maxAttempts) {
          console.error(`❌ Failed to save to Redis after ${maxAttempts} attempts, falling back to file storage`);
          break;
        }
        
        // Reset client and try again
        redis = null;
        client = getRedisClient();
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      console.warn('❌ Redis client not available. KV_REST_API_URL or UPSTASH_REDIS_REST_URL not configured.');
      break; // Exit loop, fall through to file storage
    }
  }
  
  // Fallback to file storage (silently fail - this is expected on Vercel)
  try {
    const { saveAnalyticsEntry: saveToFile } = await import('./analytics');
    const savedEntry = saveToFile(entry);
    analyticsCache.set(savedEntry.id, savedEntry);
    return savedEntry;
  } catch (error) {
    // Silently fail - this is expected on Vercel's read-only filesystem
    analyticsCache.set(newEntry.id, newEntry);
    return newEntry;
  }
}

export async function getAnalyticsEntries(): Promise<AnalyticsEntry[]> {
  console.log('[KV] getAnalyticsEntries called');
  
  // Try Redis with retry logic (up to 3 attempts)
  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    if (client) {
      try {
        console.log(`[KV] Attempting to get analytics entries from Redis (attempt ${attempts + 1}/${maxAttempts})`);
        const entriesData = await client.get('analytics:entries');
        console.log(`[KV] Redis response type:`, typeof entriesData, entriesData ? `Found ${typeof entriesData === 'string' ? entriesData.length : 'object'}` : 'null');
        
        if (entriesData) {
          // Handle both string and already parsed object
          let entries: AnalyticsEntry[];
          if (typeof entriesData === 'string') {
            try {
              entries = JSON.parse(entriesData) as AnalyticsEntry[];
            } catch (parseError) {
              console.error(`[KV] JSON parse error:`, parseError);
              console.error(`[KV] Raw data:`, entriesData);
              throw parseError;
            }
          } else {
            // Already parsed by Redis client
            entries = entriesData as AnalyticsEntry[];
          }
          console.log(`✅ Analytics entries retrieved from Redis: ${entries.length} entries`);
          // Update in-memory cache
          entries.forEach(entry => analyticsCache.set(entry.id, entry));
          return entries;
        } else {
          console.log(`❌ No analytics entries found in Redis (key exists but is null/empty), trying file storage`);
          break; // Not found, exit loop and try file storage
        }
      } catch (error) {
        attempts++;
        console.error(`❌ Error getting analytics entries from Redis (attempt ${attempts}/${maxAttempts}): ${error}`);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
        }
        
        // If it's the last attempt, fall through to file storage
        if (attempts >= maxAttempts) {
          console.error(`❌ Failed to get from Redis after ${maxAttempts} attempts, falling back to file storage`);
          break;
        }
        
        // Reset client and try again
        redis = null;
        client = getRedisClient();
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      console.warn('❌ Redis client not available. KV_REST_API_URL or UPSTASH_REDIS_REST_URL not configured.');
      break; // Exit loop, fall through to file storage
    }
  }
  
  // Don't fallback to file storage - it's read-only on Vercel and causes confusion
  // If Redis is empty, return empty array
  console.log(`⚠️ No analytics entries found in Redis, returning empty array (file storage fallback disabled)`);
  
  // Return in-memory cache as last resort (if any)
  const cachedEntries = Array.from(analyticsCache.values());
  if (cachedEntries.length > 0) {
    console.log(`⚠️ Returning ${cachedEntries.length} entries from in-memory cache`);
    return cachedEntries;
  }
  
  return [];
}

export async function updateAnalyticsEntry(sessionId: string, updates: Partial<AnalyticsEntry>): Promise<boolean> {
  console.log('[KV] updateAnalyticsEntry called for sessionId:', sessionId);
  
  // Try Redis with retry logic (up to 3 attempts)
  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    if (client) {
      try {
        console.log(`[KV] Attempting to update analytics entry in Redis (attempt ${attempts + 1}/${maxAttempts}): ${sessionId}`);
        
        // Get existing entries
        const existingEntriesData = await client.get('analytics:entries');
        let existingEntries: AnalyticsEntry[];
        if (existingEntriesData) {
          if (typeof existingEntriesData === 'string') {
            existingEntries = JSON.parse(existingEntriesData);
          } else {
            existingEntries = existingEntriesData as AnalyticsEntry[];
          }
        } else {
          existingEntries = [];
        }
        
        // Find and update entry
        const index = existingEntries.findIndex(e => e.sessionId === sessionId);
        if (index === -1) {
          console.log(`[KV] Entry not found for sessionId: ${sessionId}`);
          return false;
        }
        
        existingEntries[index] = { ...existingEntries[index], ...updates };
        
        // Save back to Redis
        const entriesJson = JSON.stringify(existingEntries);
        await client.set('analytics:entries', entriesJson);
        
        // Update cache
        analyticsCache.set(existingEntries[index].id, existingEntries[index]);
        
        console.log(`✅ Analytics entry updated in Redis: ${sessionId}`);
        return true;
      } catch (error) {
        attempts++;
        console.error(`❌ Error updating analytics entry in Redis (attempt ${attempts}/${maxAttempts}): ${error}`);
        
        if (attempts >= maxAttempts) {
          break;
        }
        
        redis = null;
        client = getRedisClient();
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      break;
    }
  }
  
  // Fallback to file storage
  try {
    const { updateAnalyticsEntry: updateInFile } = await import('./analytics');
    return updateInFile(sessionId, updates);
  } catch (error) {
    console.error(`❌ Error updating analytics entry in file: ${error}`);
    return false;
  }
}

// ===== ADMIN API KEYS =====

export interface ApiKeyStored {
  id: string;
  provider: string; // pl. "openai", "gemini", "google-places"
  label: string;    // emberbarát név, pl. "Production OpenAI kulcs"
  key: string;      // a tényleges API kulcs (Redis-ben tárolva)
  createdAt: string;
  updatedAt: string;
}

export async function getApiKeys(): Promise<ApiKeyStored[]> {
  console.log('[KV] getApiKeys called');

  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    if (client) {
      try {
        const data = await client.get('admin:apiKeys');
        if (!data) {
          console.log('[KV] No admin:apiKeys found in Redis, returning empty array');
          return [];
        }

        let entries: ApiKeyStored[];
        if (typeof data === 'string') {
          entries = JSON.parse(data) as ApiKeyStored[];
        } else {
          entries = data as ApiKeyStored[];
        }

        console.log(`[KV] ✅ Loaded ${entries.length} API keys from Redis`);
        return entries;
      } catch (error) {
        attempts++;
        console.error(`❌ Error getting API keys from Redis (attempt ${attempts}/${maxAttempts}):`, error);

        if (attempts >= maxAttempts) {
          break;
        }

        redis = null;
        client = getRedisClient();
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      break;
    }
  }

  console.log('⚠️ Returning empty API key list (Redis not available or empty)');
  return [];
}

export async function saveApiKey(entry: Omit<ApiKeyStored, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<ApiKeyStored> {
  console.log('[KV] saveApiKey called for provider:', entry.provider);

  const now = new Date().toISOString();
  const newEntry: ApiKeyStored = {
    id: entry.id ?? Date.now().toString() + Math.random().toString(36).substr(2, 9),
    provider: entry.provider,
    label: entry.label,
    key: entry.key,
    createdAt: entry.id ? now : now,
    updatedAt: now,
  };

  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    if (client) {
      try {
        const existingData = await client.get('admin:apiKeys');
        let entries: ApiKeyStored[] = [];

        if (existingData) {
          if (typeof existingData === 'string') {
            try {
              entries = JSON.parse(existingData) as ApiKeyStored[];
            } catch (parseError) {
              console.error('[KV] JSON parse error when reading admin:apiKeys:', parseError);
              entries = [];
            }
          } else {
            entries = existingData as ApiKeyStored[];
          }
        }

        const index = entries.findIndex(e => e.id === newEntry.id);
        if (index >= 0) {
          // update
          entries[index] = { ...entries[index], ...newEntry, updatedAt: now };
        } else {
          // create
          entries.push(newEntry);
        }

        const json = JSON.stringify(entries);
        await client.set('admin:apiKeys', json);
        console.log('[KV] ✅ API key saved to Redis');
        return newEntry;
      } catch (error) {
        attempts++;
        console.error(`❌ Error saving API key to Redis (attempt ${attempts}/${maxAttempts}):`, error);

        if (attempts >= maxAttempts) {
          break;
        }

        redis = null;
        client = getRedisClient();
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      break;
    }
  }

  console.warn('⚠️ Could not save API key to Redis, returning entry without persistence');
  return newEntry;
}

export async function deleteApiKey(id: string): Promise<boolean> {
  console.log('[KV] deleteApiKey called for id:', id);

  let client = getRedisClient();
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    if (client) {
      try {
        const existingData = await client.get('admin:apiKeys');
        if (!existingData) {
          console.log('[KV] No admin:apiKeys found, nothing to delete');
          return false;
        }

        let entries: ApiKeyStored[];
        if (typeof existingData === 'string') {
          entries = JSON.parse(existingData) as ApiKeyStored[];
        } else {
          entries = existingData as ApiKeyStored[];
        }

        const filtered = entries.filter(e => e.id !== id);
        const changed = filtered.length !== entries.length;

        if (changed) {
          await client.set('admin:apiKeys', JSON.stringify(filtered));
          console.log('[KV] ✅ API key deleted from Redis');
          return true;
        }

        console.log('[KV] API key not found, nothing deleted');
        return false;
      } catch (error) {
        attempts++;
        console.error(`❌ Error deleting API key from Redis (attempt ${attempts}/${maxAttempts}):`, error);

        if (attempts >= maxAttempts) {
          break;
        }

        redis = null;
        client = getRedisClient();
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    } else {
      break;
    }
  }

  console.warn('⚠️ Could not delete API key from Redis');
  return false;
}
