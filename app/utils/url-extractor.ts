/**
 * Taobaoまたは1688のURLから商品IDを抽出するユーティリティ
 */

export type ExtractedItem = {
  id: string;
  site: 'taobao' | '1688';
};

/**
 * Taobaoまたは1688のURLから商品IDを抽出
 */
export function extractItemId(url: string): ExtractedItem | null {
  try {
    const urlObj = new URL(url);

    // Taobao: https://item.taobao.com/item.htm?id=123456789
    if (urlObj.hostname.includes('taobao.com')) {
      const id = urlObj.searchParams.get('id');
      if (id) {
        return { id, site: 'taobao' };
      }
    }

    // 1688: https://detail.1688.com/offer/123456789.html
    if (urlObj.hostname.includes('1688.com')) {
      const match = urlObj.pathname.match(/\/offer\/(\d+)\.html/);
      if (match && match[1]) {
        return { id: match[1], site: '1688' };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
