import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';
import { getApiKeys, getRedisClient } from '@/lib/kv';

// API kulcs ellenőrzése
async function validateApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                 request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return false;
  }

  // Check environment variable first
  const envApiKey = process.env.AI_BLOG_API_KEY?.trim();
  if (envApiKey && apiKey === envApiKey) {
    return true;
  }

  // Check admin API keys from Redis
  try {
    const apiKeys = await getApiKeys();
    const blogApiKey = apiKeys.find(k => k.provider === 'blog-api' || k.label.toLowerCase().includes('blog'));
    if (blogApiKey && apiKey === blogApiKey.key) {
      return true;
    }
  } catch (error) {
    console.error('[BLOG POST] Error checking API keys:', error);
  }

  return false;
}

interface BlogPostData {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  locale?: string;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  status?: string;
}

// POST: Új poszt fogadása
export async function POST(request: NextRequest) {
  try {
    // API kulcs ellenőrzése
    if (!(await validateApiKey(request))) {
      return NextResponse.json(
        { error: 'Érvénytelen API kulcs' },
        { status: 401 }
      );
    }

    const postData = await request.json() as BlogPostData;
    
    // Validáció
    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: 'Hiányzó kötelező mezők: title, content' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const postSlug = postData.slug || postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const locale = postData.locale || 'hu';
    const publishedAt = postData.publishedAt || new Date().toISOString();
    const date = new Date(publishedAt).toISOString().split('T')[0];

    // Frontmatter összeállítása
    const frontmatter = {
      title: postData.title,
      excerpt: postData.excerpt || '',
      date: date,
      publishedAt: publishedAt,
      slug: postSlug,
      category: postData.category || 'általános',
      categories: postData.tags || [],
      tags: postData.tags || [],
      featuredImage: postData.featuredImage,
      metaTitle: postData.metaTitle || postData.title,
      metaDescription: postData.metaDescription || postData.excerpt,
      focusKeyword: postData.focusKeyword,
      locale: locale,
      status: postData.status || 'PUBLISHED'
    };

    // Markdown fájl létrehozása gray-matter-rel
    const markdownContent = matter.stringify(postData.content, frontmatter);

    // Save to Redis (Vercel has read-only filesystem)
    const client = getRedisClient();
    if (client) {
      const key = `blog:post:${locale}:${postSlug}`;
      await client.set(key, markdownContent);
      
      // Also save to list for easy retrieval
      const listKey = `blog:posts:${locale}`;
      const existingList = await client.get<string[]>(listKey) || [];
      if (!existingList.includes(postSlug)) {
        existingList.push(postSlug);
        await client.set(listKey, JSON.stringify(existingList));
      }

      console.log(`[BLOG POST] ✅ Saved blog post to Redis: ${key}`);
    } else {
      console.warn('[BLOG POST] ⚠️ Redis not available, post not persisted');
    }

    // Visszatérési URL
    const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hoteltrust.at'}/${locale}/blog/${postSlug}`;

    return NextResponse.json({
      success: true,
      slug: postSlug,
      url: postUrl,
      message: 'Poszt sikeresen publikálva'
    }, { status: 201 });

  } catch (error: any) {
    console.error('[BLOG POST] API hiba:', error);
    return NextResponse.json(
      { error: error.message || 'Hiba történt a poszt mentésekor' },
      { status: 500 }
    );
  }
}

// GET: Posztok listázása
export async function GET(request: NextRequest) {
  try {
    // API kulcs ellenőrzése
    if (!(await validateApiKey(request))) {
      return NextResponse.json(
        { error: 'Érvénytelen API kulcs' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'hu';
    const slug = searchParams.get('slug');
    
    const client = getRedisClient();
    if (!client) {
      return NextResponse.json({
        success: true,
        posts: []
      });
    }

    if (slug) {
      // Return specific post
      const key = `blog:post:${locale}:${slug}`;
      const markdownContent = await client.get<string>(key);
      
      if (!markdownContent) {
        return NextResponse.json(
          { error: 'Poszt nem található' },
          { status: 404 }
        );
      }

      const { data, content } = matter(markdownContent);
      
      return NextResponse.json({
        success: true,
        post: {
          id: data.slug,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          content: content,
          featuredImage: data.featuredImage,
          category: data.category,
          tags: data.tags || [],
          locale: data.locale || locale,
          publishedAt: data.publishedAt || data.date,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hoteltrust.at'}/${locale}/blog/${data.slug}`
        }
      });
    }

    // Return all posts
    const listKey = `blog:posts:${locale}`;
    const slugs = await client.get<string[]>(listKey) || [];
    
    const posts = await Promise.all(
      slugs.map(async (postSlug) => {
        const key = `blog:post:${locale}:${postSlug}`;
        const markdownContent = await client.get<string>(key);
        if (!markdownContent) return null;
        
        const { data, content } = matter(markdownContent);
        return {
          id: data.slug,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          content: content,
          featuredImage: data.featuredImage,
          category: data.category,
          tags: data.tags || [],
          locale: data.locale || locale,
          publishedAt: data.publishedAt || data.date,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hoteltrust.at'}/${locale}/blog/${data.slug}`
        };
      })
    );

    const validPosts = posts.filter(p => p !== null);

    return NextResponse.json({
      success: true,
      posts: validPosts.sort((a, b) => {
        const dateA = new Date(a?.publishedAt || 0).getTime();
        const dateB = new Date(b?.publishedAt || 0).getTime();
        return dateB - dateA;
      })
    });
  } catch (error: any) {
    console.error('[BLOG POST] GET API hiba:', error);
    return NextResponse.json(
      { error: error.message || 'Hiba történt a posztok lekérésekor' },
      { status: 500 }
    );
  }
}
