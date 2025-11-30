// app/watch/[mediatype]/[id]/page.tsx

import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import WatchPageClient from '@/components/pages/WatchPageClient';

// Types
interface WatchPageProps {
  params: Promise<{ mediatype: string; id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

// ✅ Force dynamic rendering since we rely on searchParams
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        images: [
            {
                url: `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`,
                width: 1280,
                height: 720,
                alt: title,
            }
        ]
      },
    };
  } catch (error) {
    return {
      title: 'Watch | Atto4',
      description: 'Stream movies and TV shows online',
    };
  }
}

// ✅ Fetch Media Data helper
async function getMediaData(mediatype: string, id: number) {
  try {
    if (mediatype === 'movie') {
      return await tmdbApi.getMovieDetails(id);
    } else if (mediatype === 'tv') {
      return await tmdbApi.getTVShowDetails(id);
    }
    return null;
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
  
  // Validate mediatype strictly
  if (mediatype !== 'movie' && mediatype !== 'tv') {
    notFound();
  }

  const mediaData = await getMediaData(mediatype, mediaId);
  
  if (!mediaData) {
    notFound();
  }

  const seasonNum = mediatype === 'tv' ? parseInt(season || '1', 10) : undefined;
  const episodeNum = mediatype === 'tv' ? parseInt(episode || '1', 10) : undefined;

  const title = mediaData.title ?? mediaData.name ?? '';

  return (
    <WatchPageClient
      mediaType={mediatype as 'movie' | 'tv'} // Type assertion safe due to check above
      mediaId={mediaId}
      season={seasonNum}
      episode={episodeNum}
      title={title}
      mediaData={mediaData}
    />
  );
}
