/**
 * Taobao DataHub API Service
 * RapidAPI: https://rapidapi.com/ecommdatahub/api/taobao-datahub
 */

import { RapidApiService } from './rapidApi.server';
import { ensureProtocol } from './urlUtils.server';
import type { CommonTaobaoItemDto } from '../types/common.dto';

/**
 * Taobao DataHub API Response Interface
 */
export interface DataHubItemDetailResponse {
  result: {
    status: {
      data: string | {
        item_id: string;
        title: string;
        detail_url: string;
        pic_url: string;
        price: string;
        original_price?: string;
        stock?: number;
        min_order_quantity?: number;
        seller_id?: string;
        seller_name?: string;
        images?: Array<{ url: string }>;
        description?: string;
        skus?: Array<{
          sku_id: string;
          price: string;
          stock: number;
          properties?: string;
        }>;
        [key: string]: any;
      };
      code: number;
      msg?: {
        [key: string]: string;
      };
    };
  };
}

/**
 * Convert DataHub API response to Common DTO
 */
export function convertDataHubToCommon(
  response: DataHubItemDetailResponse
): CommonTaobaoItemDto {
  // Check API response structure
  const status = response.result?.status;
  if (!status) {
    throw new Error('Invalid DataHub response: status is missing');
  }

  // Check for error response
  if (typeof status.data === 'string' && status.data === 'error') {
    const errorMsg = status.msg
      ? Object.values(status.msg).join(', ')
      : 'Failed to fetch item data';
    throw new Error(`DataHub API Error (${status.code}): ${errorMsg}`);
  }

  // status.data should be the actual item data object
  if (typeof status.data !== 'object' || !status.data) {
    throw new Error('Invalid DataHub response: item data is missing');
  }

  const data = status.data;

  // Convert SKUs
  const skus = (data.skus || []).map((sku) => ({
    skuId: sku.sku_id,
    price: parseFloat(sku.price),
    originalPrice: parseFloat(sku.price),
    stock: sku.stock,
    properties: [],
  }));

  // Calculate total stock
  const totalStock = skus.reduce((sum, sku) => sum + sku.stock, 0) || data.stock || 0;

  // Process images
  const images = data.images
    ? data.images.map((img) => ({ url: ensureProtocol(img.url) }))
    : [{ url: ensureProtocol(data.pic_url) }];

  return {
    success: true,
    code: status.code,
    data: {
      itemId: data.item_id,
      title: data.title,
      url: data.detail_url,
      merchantName: data.seller_name || '',
      merchantId: data.seller_id || '',
      mainImageUrl: ensureProtocol(data.pic_url),
      images,
      description: data.description || '',
      minOrderQuantity: data.min_order_quantity || 1,
      totalStock,
      price: parseFloat(data.price),
      originalPrice: parseFloat(data.original_price || data.price),
      skus,
      brand: '',
      categoryId: '',
      categoryName: '',
    },
  };
}

export class TaobaoDataHubApiService {
  constructor(private rapidApiService: RapidApiService) {}

  /** Fetch item detail */
  public async fetchItemDetail(
    id: string,
    site: 'taobao' | '1688' = 'taobao'
  ): Promise<CommonTaobaoItemDto> {
    console.log('DataHub API: Fetching item detail for ID:', id);

    // Try using itemId parameter instead of itemIdStr
    const response =
      await this.rapidApiService.request<DataHubItemDetailResponse>({
        method: 'get',
        path: `/item_detail?itemId=${id}`,
        host: 'taobao-datahub.p.rapidapi.com',
      });

    console.log('DataHub API Response:', JSON.stringify(response, null, 2));
    return convertDataHubToCommon(response);
  }

  /** Fetch seller rating (not supported by DataHub API) */
  public async fetchSellerRating(sellerId: string): Promise<any> {
    // DataHub API does not support seller rating endpoint
    return null;
  }
}
