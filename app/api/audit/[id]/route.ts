import { NextRequest, NextResponse } from 'next/server';
import { getAuditResult, getAuditEntryById } from '@/lib/kv';

// In-memory cache for recent audits (works across serverless invocations)
// This is a temporary solution until Vercel KV is set up
export const auditCache = new Map<string, any>();

// Clean up old entries (older than 30 days - same as Redis TTL)
setInterval(() => {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  for (const [id, data] of auditCache.entries()) {
    if (data.timestamp && new Date(data.timestamp).getTime() < thirtyDaysAgo) {
      auditCache.delete(id);
    }
  }
}, 24 * 60 * 60 * 1000); // Clean up once per day

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      );
    }

    // Try in-memory cache first (for recent audits in the same serverless invocation)
    // NOTE: This only works within the same serverless invocation, not across different invocations
    const cached = auditCache.get(id);
    if (cached) {
      // If cached result doesn't have email, try to get it from storage
      if (!cached.email) {
        console.log(`Cached result missing email, fetching from storage: ${id}`);
        // Fall through to get from storage
      } else {
        console.log(`✅ Audit result retrieved from in-memory cache: ${id}`);
        // Still try to refresh from Redis/KV in the background to ensure it's still there
        getAuditResult(id).catch(err => {
          console.warn(`Background refresh from Redis/KV failed (non-critical): ${id}`, err);
        });
        return NextResponse.json(cached);
      }
    } else {
      console.log(`In-memory cache miss (expected for different serverless invocations): ${id}`);
    }

    // Try to get from Redis/KV storage FIRST
    console.log(`[AUDIT GET] Attempting to retrieve audit from Redis/KV: ${id}`);
    let auditResult: any = null;
    
    try {
      auditResult = await getAuditResult(id);
      if (auditResult) {
        console.log(`[AUDIT GET] ✅ Audit result retrieved from Redis/KV: ${id}`);
      } else {
        console.log(`[AUDIT GET] ❌ Audit not found in Redis/KV (null returned), trying file storage: ${id}`);
      }
    } catch (redisError) {
      console.error(`[AUDIT GET] ❌ Error getting from Redis/KV: ${redisError}`);
      if (redisError instanceof Error) {
        console.error(`[AUDIT GET] Error details: ${redisError.message}`);
      }
      // Continue to file storage fallback
      auditResult = null;
    }
    
    // ALWAYS try file storage as fallback (even if Redis/KV seems to work)
    // This ensures we can retrieve audits even if Redis/KV is inconsistent
    if (!auditResult) {
      try {
        console.log(`[AUDIT GET] Attempting to get audit from file storage via getAuditEntryById: ${id}`);
        const { getAuditEntryById } = await import('@/lib/data');
        const auditEntry = getAuditEntryById(id);
        if (auditEntry) {
          console.log(`[AUDIT GET] ✅ Audit result retrieved from file storage: ${id}`);
          // Convert AuditEntry to AuditResult format
          auditResult = {
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
        } else {
          console.warn(`[AUDIT GET] ❌ Audit not found in file storage: ${id}`);
          // Try to list all audit entries to see what IDs exist
          try {
            const { getAuditEntries } = await import('@/lib/data');
            const allEntries = getAuditEntries();
            console.log(`[AUDIT GET] Available audit entries in file storage: ${allEntries.length} total`);
            if (allEntries.length > 0) {
              console.log(`[AUDIT GET] First 10 audit IDs:`, allEntries.slice(0, 10).map(e => e.id));
              console.log(`[AUDIT GET] Looking for ID: ${id}`);
              const found = allEntries.find(e => e.id === id);
              if (found) {
                console.log(`[AUDIT GET] ✅ Found audit entry with matching ID!`);
                auditResult = {
                  id: found.id,
                  email: found.email,
                  hotelName: found.hotelName,
                  hotelPlaceId: found.hotelPlaceId,
                  trustScore: found.trustScore,
                  aiVisibility: found.aiVisibility,
                  unansweredReviews: found.unansweredReviews,
                  totalReviews: found.totalReviews,
                  answeredReviews: found.answeredReviews,
                  sampleReply: found.sampleReply || '',
                  criticalIssues: found.criticalIssues,
                  recommendations: found.recommendations,
                  revenueLoss: found.revenueLoss,
                  createdAt: found.createdAt,
                  locale: found.locale,
                };
              } else {
                console.warn(`[AUDIT GET] ❌ ID ${id} not found in ${allEntries.length} entries`);
              }
            }
          } catch (listError) {
            console.error(`[AUDIT GET] Error listing audit entries:`, listError);
          }
        }
      } catch (fileError) {
        console.error(`[AUDIT GET] ❌ Error reading from file storage: ${fileError}`);
        if (fileError instanceof Error) {
          console.error(`[AUDIT GET] Error details: ${fileError.message}`);
          console.error(`[AUDIT GET] Stack: ${fileError.stack}`);
        }
      }
    }

    if (!auditResult) {
      console.error(`Audit not found in any storage: ${id}`);
      console.error(`Redis/KV available: ${process.env.KV_REST_API_URL ? 'Yes' : 'No'}`);
      console.error(`Upstash Redis available: ${process.env.UPSTASH_REDIS_REST_URL ? 'Yes' : 'No'}`);
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Format the result for the frontend (same structure as the audit API response)
    const formattedResult = {
      email: auditResult.email, // Include email for waitlist subscription
      hotel: {
        name: auditResult.hotelName,
        placeId: auditResult.hotelPlaceId,
      },
      analysis: {
        trustScore: auditResult.trustScore,
        aiVisibility: auditResult.aiVisibility,
        unansweredReviews: auditResult.unansweredReviews,
        totalReviews: auditResult.totalReviews,
        answeredReviews: auditResult.answeredReviews,
        sampleReply: auditResult.sampleReply,
        criticalIssues: auditResult.criticalIssues,
        recommendations: auditResult.recommendations,
        revenueLoss: auditResult.revenueLoss,
      },
      timestamp: auditResult.createdAt,
    };

    // Cache it for 30 days (same as Redis TTL)
    auditCache.set(id, formattedResult);

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error('Error fetching audit result:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
