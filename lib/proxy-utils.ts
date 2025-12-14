// lib/proxy-utils.ts

const PROXY_BASE = "https://atto4-proxy.workers.dev";

/**
 * Wraps a target URL with your proxy and required headers
 */
export const createProxyUrl = (targetUrl: string, headers: Record<string, string> = {}) => {
  const url = new URL(PROXY_BASE);
  url.searchParams.set("url", targetUrl);
  url.searchParams.set("headers", JSON.stringify(headers));
  return url.toString();
};

/**
 * 1. Fetches the m3u8 text via proxy
 * 2. Rewrites all internal segment/variant URLs to go through the proxy
 * 3. Returns a local Blob URL (blob:http://localhost...) that hls.js can play
 */
export async function proxifyM3U8(originalUrl: string, headers: Record<string, string>) {
  // 1. Fetch the main playlist text
  const proxyUrl = createProxyUrl(originalUrl, headers);
  const response = await fetch(proxyUrl);
  
  if (!response.ok) throw new Error("Failed to fetch playlist");
  
  let manifestText = await response.text();
  const baseUrl = new URL(originalUrl); // Used to resolve relative paths

  // 2. Regex to find all URIs in the m3u8 (lines not starting with #)
  manifestText = manifestText.replace(/^(?!#).+$/gm, (line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return line;

    // Resolve relative URLs (e.g., "seg-1.ts" -> "https://vidlink.../seg-1.ts")
    const absoluteUrl = new URL(trimmedLine, baseUrl.href).href;
    
    // Wrap in your proxy
    return createProxyUrl(absoluteUrl, headers);
  });

  // 3. Create a Blob
  const blob = new Blob([manifestText], { type: "application/vnd.apple.mpegurl" });
  return URL.createObjectURL(blob);
}
