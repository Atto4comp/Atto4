// lib/types/originals.ts

export type UserRole = 'regular' | 'creator' | 'admin';

export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;              // 'regular' | 'creator' | 'admin'
  bio?: string;
  specialties?: string[];      // ['Drama', 'Shorts', 'Thriller']
  links?: { label: string; url: string }[];
  creatorSlug?: string;        // for /creator/[slug]
  joinedAt: number;            // Date.now()
}

export type ScriptStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_production'
  | 'released';

export interface OriginalScriptDoc {
  id: string;
  title: string;
  logline: string;
  genre: string;
  writerId: string;            // users/{uid}
  writerName: string;
  pagesEstimate?: number;
  scriptFilePath: string;      // storage path: scripts/{uid}/{scriptId}.pdf
  notesForProducer?: string;
  adminNotes?: string;
  status: ScriptStatus;
  createdAt: number;
  updatedAt: number;
}

export type ProjectStatus = 'pre' | 'shooting' | 'editing' | 'released';

export interface OriginalProjectDoc {
  id: string;
  scriptId: string;
  writerId: string;
  producerId: string;          // your uid for now
  title: string;
  logline: string;
  tagline?: string;
  genre: string;
  status: ProjectStatus;
  videoMediaId?: string;       // link to your existing movies/episodes collection
  posterUrl?: string;
  bannerUrl?: string;
  scores: {
    writing: number;           // 0–10
    display: number;           // 0–10
    cinematography: number;    // 0–10
    overall: number;           // derived or manual
  };
  publicRanking: number;       // for ordering on the Originals page
  featured: boolean;
  releasedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface OriginalRatingDoc {
  id: string;                  // `${projectId}_${userId}`
  projectId: string;
  userId: string;
  writingScore: number;        // 1–10
  displayScore: number;        // 1–10
  cinematographyScore: number; // 1–10
  createdAt: number;
  updatedAt: number;
}
