// app/watch/[mediatype]/[id]/page.tsx

import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import WatchPageClient from '@/components/pages/WatchPageClient';

interface WatchPageProps {
  params: Promise<{ mediatype: string; id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

// ✅ This page uses dynamic params, so it's dynamically rendered
export const dynamic = 'force-dynamic'; // Required for searchParams
export const revalidate = 0; // Don't cache watch pages

// ✅ Generate Metadata
export async function generateMetadata({ params, searchParams }: WatchPageProps) {
  const { mediatype, id } = await params;
  const { season, episode } = await searchParams;
  
  const mediaId = parseInt(id, 10);
  
  try {
    let data = null;
    if (mediatype === 'movie') {
      data = await tmdbApi.getMovieDetails(mediaId);
    } else if (mediatype === 'tv') {
      data = await tmdbApi.getTVShowDetails(mediaId);
    }

    if (!data) {
      return {
        title: 'Watch | Atto4',
        description: 'Stream movies and TV shows online',
      };
    }

    const title = data.title ?? data.name ?? '';
    const seasonEp = mediatype === 'tv' && season && episode 
      ? ` - S${season}E${episode}` 
      : '';

    return {
      title: `Watch ${title}${seasonEp} | Atto4`,
      description: data.overview || `Watch ${title} online now`,
      openGraph: {
        title: `Watch ${title}`,
        description: data.overview,
        type: 'video.other',
        url: `https://atto4.pro/watch/${mediatype}/${id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Watch | Atto4',
      description: 'Stream movies and TV shows online',
    };
  }
}

// ✅ Fetch Media Data on Server
async function getMediaData(mediatype: string, id: number) {
  try {
    console.log(`📥 Fetching watch page data for ${mediatype} ${id}`);

    let data = null;
    if (mediatype === 'movie') {
      data = await tmdbApi.getMovieDetails(id);
    } else if (mediatype === 'tv') {
      data = await tmdbApi.getTVShowDetails(id);
    }

    if (!data) {
      console.error(`❌ Media not found: ${mediatype} ${id}`);
      return null;
    }

    console.log(`✅ Fetched: ${data.title ?? data.name}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch media data:`, error);
    return null;
  }
}

// ✅ Main Watch Page Component
export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { mediatype, id } = await params;
  const { season, episode } = await searchParams;
  
  const mediaId = parseInt(id, 10);
  
  // Validate mediatype
  if (mediatype !== 'movie' && mediatype !== 'tv') {
    notFound();
  }

  // Fetch media data
  const mediaData = await getMediaData(mediatype, mediaId);
  
  if (!mediaData) {
    notFound();
  }

  // Parse season and episode for TV shows
  const seasonNum = mediatype === 'tv' ? parseInt(season || '1', 10) : undefined;
  const episodeNum = mediatype === 'tv' ? parseInt(episode || '1', 10) : undefined;

  const title = mediaData.title ?? mediaData.name ?? '';

  return (
    <WatchPageClient
      mediaType={mediatype}
      mediaId={mediaId}
      season={seasonNum}
      episode={episodeNum}
      title={title}
      mediaData={mediaData}
    />
  );
}
