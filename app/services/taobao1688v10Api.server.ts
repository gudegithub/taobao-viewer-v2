/**
 * Taobao 1688 API v10 Service
 * RapidAPI: https://rapidapi.com/belchiorarkad-FqvHs2EDOtP/api/taobao-1688-api
 */

import { RapidApiService } from './rapidApi.server';
import type { CommonTaobaoItemDto } from '../types/common.dto';

/**
 * Taobao 1688 v10 API Response Interface
 */
export interface Taobao1688V10ItemResponse {
  success: boolean;
  data: {
    num_iid: number;
    title: string;
    price: number;
    num: number;
    detail_url: string;
    pic_url: string;
    item_imgs: Array<{ url: string }>;
    post_fee: number;
    sales: number;
    seller_info: {
      title: string;
      shop_name: string;
      zhuy: string;
      user_num_id: number;
      nick: string;
      seller_logo: string;
    };
    skus: {
      sku: Array<{
        price: number;
        properties: string;
        properties_name: string;
        quantity: number;
        sku_id: number;
        display_price: number;
        send_discount_money: number;
        cur_price: number;
        cur_display_price: number;
        cur_send_discount_money: number;
      }>;
    };
    props_img: { [key: string]: string };
    multi_language_info: {
      sku_properties: Array<{
        sku_id: number;
        properties: Array<{
          prop_name: string;
          prop_id: number;
          value_id: number;
          value_desc: string;
          value_name: string;
        }>;
      }>;
    };
    [key: string]: any;
  } | string;
  code: number;
}

/**
 * Convert Taobao 1688 v10 API response to Common DTO
 */
export function convertV10ToCommon(
  response: Taobao1688V10ItemResponse
): CommonTaobaoItemDto {
  if (!response.success) {
    throw new Error(
      typeof response.data === 'string'
        ? response.data
        : 'Failed to fetch item data'
    );
  }

  if (typeof response.data === 'string') {
    throw new Error(response.data);
  }

  const { data } = response;

  // Convert SKUs with detailed property information
  const skus: any[] = [];
  if (data.skus?.sku && data.skus.sku.length > 0) {
    for (const sku of data.skus.sku) {
      // Parse properties from properties_name string
      const propPairs = sku.properties_name.split(';');
      const properties: any[] = [];

      for (const pair of propPairs) {
        const match = pair.match(/\d+:(\d+):([^:]+):(.+)/);
        if (match) {
          const [, valueId, propName, valueName] = match;
          properties.push({
            propertyId: propName,
            propertyName: propName,
            valueId,
            value: valueName,
          });
        }
      }

      skus.push({
        skuId: sku.sku_id.toString(),
        price: sku.cur_price,
        originalPrice: sku.display_price,
        stock: sku.quantity,
        properties,
      });
    }
  }

  // Calculate total stock from all SKUs
  const totalStock =
    skus.length > 0
      ? skus.reduce((sum, sku) => sum + (sku.stock || 0), 0)
      : data.num || 0;

  // Find min and max prices
  const prices = skus.length > 0 ? skus.map((s) => s.price) : [data.price];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    success: true,
    code: 200,
    data: {
      itemId: data.num_iid.toString(),
      title: data.title,
      url: data.detail_url,
      merchantName: data.seller_info?.shop_name || '',
      merchantId: data.seller_info?.user_num_id?.toString() || '',
      mainImageUrl: data.pic_url,
      images: data.item_imgs && data.item_imgs.length > 0 ? data.item_imgs : [{ url: data.pic_url }],
      description: '',
      minOrderQuantity: 1,
      totalStock,
      price: minPrice,
      originalPrice: maxPrice,
      skus,
      brand: '',
      categoryId: '',
      categoryName: '',
    },
  };
}

export class Taobao1688V10ApiService {
  constructor(private rapidApiService: RapidApiService) {}

  /** Fetch item detail */
  public async fetchItemDetail(
    id: string,
    site: 'taobao' | '1688' = 'taobao'
  ): Promise<CommonTaobaoItemDto> {
    console.log('Taobao 1688 v10 API: Fetching item detail for ID:', id);

    const response =
      await this.rapidApiService.request<Taobao1688V10ItemResponse>({
        method: 'get',
        path: `/v10/detail?itemId=${id}&site=${site}`,
        host: 'taobao-1688-api1.p.rapidapi.com',
      });

    console.log('Taobao 1688 v10 API: Success');
    return convertV10ToCommon(response);
  }

  /** Fetch seller rating (not supported) */
  public async fetchSellerRating(sellerId: string): Promise<any> {
    // This API does not support seller rating endpoint
    return null;
  }
}
