import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getRedisClient } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Nincs jogosultság' },
        { status: 401 }
      );
    }

    const client = getRedisClient();
    
    if (!client) {
      return NextResponse.json(
        { error: 'Redis client nem elérhető' },
        { status: 500 }
      );
    }

    const deletedKeys: string[] = [];
    const errors: string[] = [];

    // Delete all waitlist entries (both the entries array and individual keys)
    try {
      console.log('[CLEAR DATA] Getting all waitlist:* keys...');
      const waitlistKeys = await client.keys('waitlist:*');
      console.log(`[CLEAR DATA] Found ${waitlistKeys.length} waitlist:* keys:`, waitlistKeys);
      
      if (waitlistKeys.length > 0) {
        // Delete each key individually
        for (const key of waitlistKeys) {
          try {
            const result = await client.del(key);
            console.log(`[CLEAR DATA] Deleted ${key}, result:`, result);
            deletedKeys.push(key);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[CLEAR DATA] Error deleting ${key}:`, error);
            errors.push(`${key} - ${errorMsg}`);
          }
        }
        console.log(`✅ Deleted ${waitlistKeys.length} waitlist keys from Redis`);
      } else {
        console.log('[CLEAR DATA] No waitlist:* keys found');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Error getting/deleting waitlist entries:', error);
      errors.push(`waitlist:* keys - ${errorMsg}`);
    }

    // Delete all audit entries (both the entries array and individual keys)
    try {
      console.log('[CLEAR DATA] Getting all audit:* keys...');
      const auditKeys = await client.keys('audit:*');
      console.log(`[CLEAR DATA] Found ${auditKeys.length} audit:* keys:`, auditKeys);
      
      if (auditKeys.length > 0) {
        // Delete each key individually
        for (const key of auditKeys) {
          try {
            const result = await client.del(key);
            console.log(`[CLEAR DATA] Deleted ${key}, result:`, result);
            deletedKeys.push(key);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[CLEAR DATA] Error deleting ${key}:`, error);
            errors.push(`${key} - ${errorMsg}`);
          }
        }
        console.log(`✅ Deleted ${auditKeys.length} audit keys from Redis`);
      } else {
        console.log('[CLEAR DATA] No audit:* keys found');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Error getting/deleting audit entries:', error);
      errors.push(`audit:* keys - ${errorMsg}`);
    }

    // Delete all analytics entries (both the entries array and individual keys)
    try {
      console.log('[CLEAR DATA] Getting all analytics:* keys...');
      const analyticsKeys = await client.keys('analytics:*');
      console.log(`[CLEAR DATA] Found ${analyticsKeys.length} analytics:* keys:`, analyticsKeys);
      
      if (analyticsKeys.length > 0) {
        // Delete each key individually
        for (const key of analyticsKeys) {
          try {
            const result = await client.del(key);
            console.log(`[CLEAR DATA] Deleted ${key}, result:`, result);
            deletedKeys.push(key);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[CLEAR DATA] Error deleting ${key}:`, error);
            errors.push(`${key} - ${errorMsg}`);
          }
        }
        console.log(`✅ Deleted ${analyticsKeys.length} analytics keys from Redis`);
      } else {
        console.log('[CLEAR DATA] No analytics:* keys found');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Error getting/deleting analytics entries:', error);
      errors.push(`analytics:* keys - ${errorMsg}`);
    }

    // CRITICAL: Also clear in-memory caches
    try {
      const { clearAllCaches } = await import('@/lib/kv');
      clearAllCaches();
      console.log('[CLEAR DATA] ✅ All in-memory caches cleared');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[CLEAR DATA] ❌ Could not clear in-memory caches:', error);
      errors.push(`In-memory caches - ${errorMsg}`);
    }

    // CRITICAL: Also clear file storage (even if read-only, we try)
    // The data might be coming from file storage fallback
    let fileStorageCleared = false;
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const dataDir = path.join(process.cwd(), 'data');
      console.log('[CLEAR DATA] Attempting to clear file storage in:', dataDir);
      
      if (!fs.existsSync(dataDir)) {
        console.log('[CLEAR DATA] Data directory does not exist, creating...');
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Clear waitlist.json
      const waitlistPath = path.join(dataDir, 'waitlist.json');
      console.log('[CLEAR DATA] Clearing waitlist.json at:', waitlistPath);
      fs.writeFileSync(waitlistPath, JSON.stringify([], null, 2), 'utf-8');
      console.log('✅ Waitlist.json cleared');
      deletedKeys.push('waitlist.json (file)');

      // Clear audit.json
      const auditPath = path.join(dataDir, 'audit.json');
      console.log('[CLEAR DATA] Clearing audit.json at:', auditPath);
      fs.writeFileSync(auditPath, JSON.stringify([], null, 2), 'utf-8');
      console.log('✅ Audit.json cleared');
      deletedKeys.push('audit.json (file)');
      
      // Clear analytics.json
      const analyticsPath = path.join(dataDir, 'analytics.json');
      if (fs.existsSync(analyticsPath)) {
        console.log('[CLEAR DATA] Clearing analytics.json at:', analyticsPath);
        fs.writeFileSync(analyticsPath, JSON.stringify([], null, 2), 'utf-8');
        console.log('✅ Analytics.json cleared');
        deletedKeys.push('analytics.json (file)');
      }
      
      fileStorageCleared = true;
      console.log('✅ File storage successfully cleared');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Could not clear file storage (read-only filesystem?):', error);
      console.warn('⚠️ Error details:', errorMsg);
      if (error instanceof Error && 'code' in error) {
        console.warn('⚠️ Error code:', (error as any).code);
      }
      errors.push(`File storage - ${errorMsg}`);
      // This is expected on Vercel, but we still try
    }


    return NextResponse.json(
      { 
        success: true, 
        message: errors.length > 0 
          ? `Adatok törölve, de ${errors.length} hiba történt` 
          : 'Minden adat sikeresen törölve',
        deleted: {
          keys: deletedKeys.length,
          waitlist: deletedKeys.includes('waitlist:entries'),
          audit: deletedKeys.includes('audit:entries'),
          analytics: deletedKeys.includes('analytics:entries'),
          auditResults: deletedKeys.filter(k => k.startsWith('audit:') && k !== 'audit:entries').length,
        },
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Clear data API error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az adatok törlése során', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
