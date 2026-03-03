/**
 * URL Utility Functions for API Services
 */

/**
 * Ensure URL has https:// protocol prefix
 * Handles protocol-relative URLs (//example.com) by prepending https:
 * @param url - URL string that may or may not have a protocol
 * @returns URL with https:// protocol
 */
export function ensureProtocol(url: string): string {
  if (!url) return url;
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  return url;
}
