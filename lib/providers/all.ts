// lib/providers/all.ts

// Import your scrapers here
import { vidlinkScraper } from './sources/vidlink';
// import { vidrockScraper } from './sources/vidrock';

// We remove the explicit return type annotation ": Array<Sourcerer>" 
// to let TypeScript infer the type from the objects themselves. 
// This avoids the "Sourcerer is not exported" error entirely.

export function gatherAllSources() {
  return [
    vidlinkScraper
    // vidrockScraper,
    // Add the rest here
  ];
}
